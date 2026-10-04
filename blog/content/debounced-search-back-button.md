---
title: "Fixing the Back Button in a Debounced React Search Box"
date: "2026-10-04"
description: "How a debounced search input that mirrors its query into the URL broke Back and Forward in my movie browser, and how I kept React state and the URL in sync."
tags: ["Technical Note", "Debug", "React", "React Router"]
coverImage: "/images/blog/debounced-search-back-button/cover.webp"
---

**TL;DR.** A debounced search input that mirrors its query into `?q=` broke the browser's Back and Forward buttons in my movie browser. The cause was the same value living in three places without a rule about which one is authoritative. The fix was an effect with two branches and a ref that records the last URL value the hook has already handled. The same investigation also exposed a document title bug and a duplicate history entry on the home link.

## Background

The project is a [movie browser](/projects/posts/movie-browser/) built with React, TypeScript and React Router. The search box is debounced by 400 ms, and the settled query is written to the URL as `?q=...` so that results can be shared and survive a refresh. My `useDebounce` hook returns the debounced value together with an `immediateUpdate` function that skips the wait.

While splitting up an oversized `App` component, I discovered that Back and Forward did not behave correctly.

## One value, three copies

The search query exists in three places:

| Name          | Meaning                      | Changes when             |
| ------------- | ---------------------------- | ------------------------ |
| `searchState` | the draft in the input       | every keystroke          |
| `searchQuery` | the debounced draft          | typing pauses for 400 ms |
| `urlQuery`    | the committed query in `?q=` | navigation happens       |

Only the URL is stored in the browser history, so synchronization has to work in both directions: from the draft to the URL after the debounce, and from the URL back to the draft when the user navigates.

## Attempt 1: write the URL from an effect

My first version lived directly in `App`:

```tsx
const [searchParams, setSearchParams] = useSearchParams();
const [searchState, setSearchState] = useState(
  () => searchParams.get("q") ?? "",
);
const [searchQuery, immediateUpdate] = useDebounce(searchState, 400);

useEffect(() => {
  setSearchParams(searchQuery ? { q: searchQuery } : {});
}, [searchQuery, setSearchParams]);

function onHome() {
  setSearchState("");
  setSearchParams(searchQuery ? { q: searchQuery } : {});
  immediateUpdate("");
}
```

`onHome` was redundant. Once `immediateUpdate("")` changes the debounced value, the effect already writes the URL, so the explicit `setSearchParams` call only produced a second navigation.

## Attempts 2 and 3: skip writes that change nothing

Right-clicking the Back button showed several identical entries in the history list.

![Back button history showing repeated entries](/images/blog/debounced-search-back-button/history-duplicates.webp)

Each unconditional `setSearchParams` call navigates, even to the URL the user is already on. In development, StrictMode re-runs effects once on mount, which made the duplicates easier to trigger. I added a guard so the effect writes only when the URL differs from the debounced query:

```tsx
useEffect(() => {
  const currentQuery = searchParams.get("q") ?? "";
  if (currentQuery === searchQuery) return;

  setSearchParams(searchQuery ? { q: searchQuery } : {}, { replace: true });
}, [searchParams, searchQuery, setSearchParams]);

function onHome() {
  setSearchState("");
  immediateUpdate("");
}
```

Duplicates dropped from three entries per navigation to two, but the Back button still did not work. I then moved the logic into a `useSearchQuery` hook without changing its behavior, which confirmed the problem was in the logic itself.

## Root cause

When the user presses Back, the URL changes to the previous query, but the debounced value still holds the later one. The effect sees a mismatch and does the only thing it knows: it writes the stale debounced value back into the URL. That pushes a new entry, which discards the forward history, so Back appears to do nothing.

The effect could not tell two situations apart:

1. The URL changed because the hook just wrote it.
2. The URL changed because the user navigated.

## The fix: two branches and a note

After several failed attempts of my own, I asked GitHub Copilot. It proposed a hook with two branches and a ref, `lastUrlQuery`, which records the last URL value the hook has accounted for:

```tsx
const urlQuery = searchParams.get("q") ?? "";
const lastUrlQuery = useRef(urlQuery);

useEffect(() => {
  // Branch 1: the URL changed outside the hook (Back, Forward, ...).
  if (urlQuery !== lastUrlQuery.current) {
    lastUrlQuery.current = urlQuery;

    if (searchState !== urlQuery) {
      setSearchState(urlQuery);
    }

    if (searchQuery !== urlQuery) {
      immediateUpdate(urlQuery);
    }

    return;
  }

  // Branch 2: the debounced value changed; commit it to the URL.
  if (urlQuery === searchQuery) return;

  lastUrlQuery.current = searchQuery;

  setSearchParams(searchQuery ? { q: searchQuery } : {}, {
    replace: true,
  });
}, [urlQuery, searchQuery, searchState, setSearchParams, immediateUpdate]);
```

I did not want to adopt code I could not explain, so I traced it step by step:

1. **Mount at the home page.** All three values and the ref are empty. Both branches exit at their guards.
2. **Typing.** `searchState` changes on each keystroke and the effect runs, but the URL, the debounced value and the ref are all still empty, so both branches exit.
3. **The debounce settles.** `searchQuery` changes, so branch 2 runs. It updates the ref and then writes the URL.
4. **The URL change re-runs the effect.** `urlQuery` now equals the ref, and the debounced value equals the URL, so everything settles.
5. **The user presses Back.** `urlQuery` changes while the ref still holds the old value, so branch 1 runs. It copies the URL into the draft and the debounced value, and stops.

Two details make this work:

- **The ref is updated before the URL is written.** The URL change that follows then matches the ref, so it is not mistaken for a user navigation.
- **Branch 1 ends with `return`.** Inside one effect run, the values come from that render. Calling a setter does not change `searchQuery` until the next render. Without the `return`, the code would fall through to branch 2 and compare the new URL with the stale debounced value, which would undo the Back navigation.

## A related bug: the page title

The history list showed another oddity. The previous entry appeared with the current page's title even though its URL was correct. I was rendering the `<title>` from state (the draft and debounced value), and state updates one render before the URL does. The title therefore changed while the old URL was still current, and the old entry received the new title.


![Two history entries showing the same title](/images/blog/debounced-search-back-button/duplicate-title.webp)

The fix was to derive the title from the URL's query, so it changes only after navigation:

```tsx
{urlQuery && (
  <title>{`Search results for "${urlQuery}" | Movie Browser`}</title>
)}
```

## Another duplicate: the home link

Testing exposed one more duplicate. The home control used a link to `/` and also called `onHome`, so one click triggered two navigations to the same URL. I then realized `onHome` was no longer needed. A plain link to `/` with an empty search string changes the URL, branch 1 resets the draft and the debounced value, and the hook stays in sync without any special handling.

## The simplified hook

Because branch 1 only runs when the URL has changed, the draft and debounced value should follow it unconditionally, so the comparisons inside it are unnecessary. Setting a state to the value it already holds is effectively a no-op in React. Removing the conditions also removed `searchState` from the dependency array, so the effect no longer runs on every keystroke:

```tsx
import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router";
import useDebounce from "@/hooks/useDebounce";

export default function useSearchQuery() {
  const [searchParams, setSearchParams] = useSearchParams();
  const urlQuery = searchParams.get("q") ?? "";

  const [searchState, setSearchState] = useState(urlQuery);
  const [searchQuery, immediateUpdate] = useDebounce(searchState, 400);

  const lastUrlQuery = useRef(urlQuery);

  useEffect(() => {
    // URL changed externally
    if (urlQuery !== lastUrlQuery.current) {
      lastUrlQuery.current = urlQuery;
      setSearchState(urlQuery);
      immediateUpdate(urlQuery);
      return;
    }

    if (urlQuery === searchQuery) return;

    // Debounced input changed
    lastUrlQuery.current = searchQuery;

    setSearchParams(searchQuery ? { q: searchQuery } : {});
  }, [urlQuery, searchQuery, setSearchParams, immediateUpdate]);

  return { searchState, setSearchState, searchQuery, urlQuery };
}
```

With this version, typing and then pressing Back returns to the previous URL, Back and Forward both work, and the input follows the URL. The `replace: true`'s also removed since every valid navigate should push a history entry.

## Trade-offs and limitations

- **Effect-driven synchronization.** The hook keeps two copies of one value aligned inside an effect. It works, but it relies on a ref and on the order of operations. React's guidance on [avoiding unnecessary effects](https://react.dev/learn/you-might-not-need-an-effect) suggests a design where the URL is the only committed state and the input is a draft that resets when it changes. I may revisit this.
- **Dependence on `immediateUpdate`.** The hook assumes that `immediateUpdate` cancels any pending debounce timer.

## Takeaways

1. Decide which copy of a value is authoritative before writing any synchronization code.
2. Separate changes your code caused from changes that happened to it. A small ref recording what you last handled can do that.
3. Write effects so that running them twice is harmless. StrictMode checks this on mount.
4. Derive anything that describes the page, such as its title, from the same source as the URL.
5. After a fix, look for code it made redundant. In my case, that was `onHome`.