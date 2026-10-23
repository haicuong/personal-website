---
title: "Migrating My Personal Website from Vanilla TypeScript to React Without Losing the MPA"
date: "2026-10-23"
description: "How I moved my portfolio from Vanilla TypeScript and Web Components to React while keeping Vite's multi-page setup, my URLs, static hosting, and HTML that already contains the content."
tags: ["Technical Note", "React", "TypeScript", "Vite", "MPA"]
coverImage: "/images/projects/personal-website/cover.webp"
---

**TL;DR.** I moved this site from Vanilla TypeScript and Web Components to React 19, but kept it as a Vite multi-page app. React renders every page once at build time with `renderToString()`, the HTML is written into the static files, and the browser hydrates it with the same data embedded in the page. There is no SPA, no client-side router and no server at runtime. The cost is a longer build pipeline, an intermediate build artifact, and a strict rule that the browser must render exactly what the build rendered.

## Background

The site started as a [Vanilla TypeScript and Vite MPA](/projects/posts/personal-website/). Every URL was a real HTML file:

- Blog posts and projects were written in Markdown. `build-blog.ts` and `build-projects.ts` turned them into static pages under `blog/posts/<slug>/` and `projects/posts/<slug>/`, and wrote the metadata to `public/blogs.json` and `public/projects.json`.
- The header and footer were Web Components (`<site-header>`, `<site-footer>`) defined in `components.ts`.
- The cards on `/`, `/blog/` and `/projects/` were not in the HTML at all. The pages shipped a `Loading...` placeholder, and `card-render.ts` fetched the JSON and filled the container with template strings:

```typescript
async function loadCards<T>(
  url: string,
  renderCard: (data: T) => string,
  containerHTML: HTMLElement,
) {
  const response = await fetch(url);
  const items = (await response.json()) as T[];
  containerHTML.innerHTML = items.map(renderCard).join("");
}
```

This worked, but the card markup lived in template strings, and the metadata was already known at build time. The browser was downloading a JSON file just to build HTML I could have generated before deploying.

## What I wanted to keep

I wanted React components for the header, footer, cards and pages, but not at the cost of what already worked:

1. The same URLs, including `/blog/posts/<slug>/` and `/projects/posts/<slug>/`.
2. Static hosting on Vercel, with no server runtime.
3. The Markdown pipeline and the JSON schemas.
4. HTML that contains the content and links before any JavaScript runs.

## Why not a React SPA

The usual React setup is one `index.html`, a client-side router and everything rendered in the browser. For this site, that would have meant:

- An empty `<div id="root">` on every page until the bundle loads, which is worse than what I had. Even the old version had the article content in the HTML.
- Rewrites on the host so every path serves the same `index.html`, plus a router to map paths back to pages that already exist as files.
- Per-page `<title>` and `<meta name="description">` managed in JavaScript instead of in the HTML.

The site is a set of documents. Navigation between them is ordinary links, and a full page load per navigation is fine. So I kept `appType: "mpa"` in Vite and used React only to render each page.

## Build-time rendering, not SSR

I use `renderToString()` from `react-dom/server`, which people usually associate with server-side rendering. The difference is when it runs:

|                  | Runtime SSR                  | What this site does                  |
| ---------------- | ---------------------------- | ------------------------------------ |
| When HTML is made | on every request             | once, during `npm run build`         |
| Where it runs    | a Node server in production  | my machine or the CI build           |
| Output           | a response                   | static files in `dist/`              |
| Data             | can change per request       | fixed at build time                  |

Nothing renders React on a server after deployment. If I add a post, I rebuild and redeploy, exactly like before the migration.

## The build pipeline

The build script in `package.json` now has one more step:

```json
"build": "tsx src/scripts/modules/build-projects.ts && tsx src/scripts/modules/build-blog.ts && tsx src/scripts/modules/build-pages.ts && npm run lint:css && tsc && vite build"
```

```text
projects/content/*.md -> build-projects.ts -> projects/posts/<slug>/index.html + public/projects.json
blog/content/*.md     -> build-blog.ts     -> blog/posts/<slug>/index.html + public/blogs.json
both JSON files       -> build-pages.ts    -> dist-ssr/pages.json
HTML shells + pages.json -> vite build     -> dist/
```

Post pages are rendered inside the content generators, because each post already has its own generated HTML file. `build-blog.ts` calls `renderToString(createElement(BlogPostPage, { post }))` and writes the result into the post template.

The home, blog index, projects index and 404 pages are different. Their HTML files are tracked source files, and I did not want a build step to overwrite them. That is what `build-pages.ts` and `dist-ssr/pages.json` are for.

## Rendering the listing pages

`build-pages.ts` runs after both generators, so both JSON files are guaranteed to exist. It reads them, renders the four pages with the real data, and saves the HTML together with the data used to render it:

```typescript
const projects = readJsonArray<ProjectMetadata>(projectsJsonPath, "projects");
const blogs = readJsonArray<BlogMetadata>(blogsJsonPath, "blogs");

const homeHtml = renderToString(
  createElement(HomePage, { projects, blogs }),
);

const manifest: PrerenderedPagesManifest = {
  home: {
    ssrHtml: homeHtml,
    pageData: { projects, blogs },
  },
  // "blog-index", "projects-index", "404"
};

fs.writeFileSync(outputManifestPath, JSON.stringify(manifest, null, 2));
```

The pages receive the metadata as props. There is no `useEffect` that fetches cards and no loading state:

```tsx
<div id="blogs-container" className="flex gap-4 my-4 mx-2 overflow-auto">
  {blogs.map((blog) => (
    <BlogCard key={blog.slug} data={blog} />
  ))}
</div>
```

`dist-ssr/pages.json` is an intermediate artifact. It is Git-ignored, never deployed, and only exists so `vite build` can pick up the rendered HTML.

## Getting the HTML into the pages

The tracked shells stay minimal:

```html
<div id="root" data-page="home"></div>
```

I already had a Vite plugin that used the `transformIndexHtml` hook to inject the theme script into `<head>`, so a second plugin was a natural fit. `injectPrerenderedPages()` maps the HTML file to a page ID, then, in a production build, replaces the empty root with the rendered HTML and adds the matching data:

```typescript
if (!ctx.server) {
  const manifest = loadValidatedManifest(repoRoot);
  const entry = manifest[pageId];
  const dataScript = `<script id="__PAGE_DATA__" type="application/json">${serializePageData(entry.pageData)}</script>`;

  return html.replace(
    targetMount,
    () =>
      `<div id="root" data-page="${pageId}" data-ssr="true">${entry.ssrHtml}</div>\n    ${dataScript}`,
  );
}
```

The source file is never modified. Only the copy in `dist/` contains the cards. In development, the plugin injects only the data and leaves the root empty, so the dev server renders the page in the browser.

`serializePageData()` replaces every `<` in the JSON with `\u003c`. Post pages embed the full article HTML in this payload, and Markdown can contain raw HTML, so a literal `</script>` anywhere in an article would otherwise close the data script early. Escaping `<` rules that out regardless of the content.

## Hydrating instead of rendering again

The browser entry, `main.tsx`, reads `data-page` to pick the page component, parses `#__PAGE_DATA__`, checks its shape with type guards, and then chooses between two React APIs:

```tsx
const isSsr = rootElement.dataset.ssr === "true";
const hasPrerenderedMarkup = rootElement.firstElementChild !== null;

if (isSsr) {
  if (!hasPrerenderedMarkup) {
    throw new Error(/* data-ssr="true" but no prerendered HTML */);
  }
  hydrateRoot(rootElement, pageElement);
  return;
}

if (hasPrerenderedMarkup) {
  throw new Error(/* refusing to call createRoot() on a non-empty root */);
}

createRoot(rootElement).render(pageElement);
```

- `hydrateRoot()` assumes the HTML is already correct. React walks the existing DOM, attaches event handlers and runs effects, without recreating the nodes. This is the production path for every page.
- `createRoot()` builds the DOM from nothing. It is only used for the empty shells on the dev server.

Because the page component receives the same `projects` and `blogs` arrays that `build-pages.ts` used, hydration produces the same tree, and the browser never requests `/blogs.json` or `/projects.json`. The JSON files are still generated, since the build reads them and I did not have a separate reason to remove them.

## Things that had to match

Hydration only works if the first render in the browser matches the HTML from the build. A few parts of the old code broke that rule:

- **The active nav link.** The old header read `window.location.pathname`. That does not exist in Node, so the React `SiteHeader` takes an `activeSection` prop instead, and each page passes its own section.
- **Dates.** The old cards used `new Date(data.date).toLocaleDateString()`, which depends on the timezone of whoever runs it. The build runs in one timezone and visitors are in others. Initially `formatDisplayDate()` used `timeZone: "UTC"`, but because different locales format dates differently, that still risked hydration mismatches across visitors. The proper fix is a shared `<FormattedDate />` component: it renders the raw ISO date (like `2026-10-04`) inside `<time dateTime="YYYY-MM-DD">` during SSR and initial hydration so the server and client HTML match identically everywhere, then formats for the visitor's browser locale in `useEffect` after hydration while preserving the calendar day.
- **The theme icon and its entrance animation.** The saved theme lives in `localStorage`, which the build cannot read. `useTheme()` starts with `null`, so the button renders without an icon on both sides, avoiding a hydration mismatch. The real value is read in `useEffect` after hydration. The `.dark` class itself is still set by the inline `<head>` script before the first paint, so the colors are right from the start. Only the icon appears a moment later.

  However, pairing this hydration pattern with animated icons (`lucide-react` and Framer Motion) introduced an animation trap: `<AnimatePresence initial={false}>` only suppresses animations for children present on its *very first mount*. Because `theme` resolves on the second render (post-hydration), Framer Motion treats the resolved icon as a newly inserted child in an already-mounted container and triggers its entrance slide animation on every page reload. The fix was tracking user clicks with a ref (`hasInteractedRef`): passing `initial={false}` directly to the icon component on mount ensures it renders statically on first load and reloads, while enabling `initial={{ y: "-150%", ... }}` only when the visitor actually clicks the toggle. Furthermore, centering the icon required `absolute inset-0 m-auto` rather than CSS translate transforms (`-translate-x-1/2 -translate-y-1/2`), which would otherwise be overwritten by Framer Motion's inline `transform: translateY(...)`.

## How I staged it

I did the migration with an AI coding agent, in four milestones, and reviewed the plan and the diff after each one before committing:

| Milestone | Commit    | Scope                                                         |
| --------- | --------- | ------------------------------------------------------------- |
| 1         | `f4cad83` | React dependencies, shared components, theme hook             |
| 2         | `3a0f898` | Page components, post page rendering, `build-pages.ts`        |
| 3         | `251bc48` | `main.tsx`, hydration, removing the Web Components            |
| 4         | `f1895ef` | Documentation and a final audit                               |

After each milestone I ran `npm run lint:css`, `npx tsc` and `npm run build`. The review step mattered more than I expected:

- **The first plan kept fetching cards.** It prerendered only the page shell and fetched the JSON for the cards after hydration, with build-time cards marked as a later improvement. Milestone 1 even added a `use-cards.ts` hook for it. That would have been the old behavior with more steps. I changed the requirement before Milestone 2: cards must be in the HTML, and the browser must hydrate with the same data. Milestone 2 deleted the hook.
- **A dead theme button between milestones.** After Milestone 2, post pages had a React-rendered header, but they still loaded the old `main.ts`, so nothing attached a click handler to the button. A `console.log` I had added to `useTheme()` only appeared when post pages were generated, because it was running in Node during `renderToString()`, not in the browser. Effects never run there, so `theme` was always `null`. Milestone 3 fixed it by actually hydrating those pages.
- **Root persistence I did not need.** The first `main.tsx` stored the React root on the DOM element as `rootElement.__reactRoot__`, to survive the entry module being re-executed during HMR. I questioned it, and checking the modules served by the dev server showed that `main.tsx` has no `import.meta.hot.accept()`, so Vite does a full reload when it changes. Component edits go through Fast Refresh without re-running `main.tsx`. The guard could never run, so it was removed, and each page load now creates exactly one root.
- **A layout change from the wrapper.** `<div id="root">` now sits between `<body>` and `<main>`. The body is a flex column, but the new div was a plain block, so on tall screens the short listing pages no longer pushed the footer to the bottom. `#root { @apply flex flex-1 flex-col; }` fixed it.
- **Code blocks ignored the theme toggle.** This existed before the migration, but I only noticed it during the audit. The CSS had `color-scheme: light dark`, so Shiki's `light-dark()` colors followed the OS instead of the `.dark` class. Choosing dark mode on a light OS gave a dark page with light code blocks. It was fixed in a follow-up by setting `color-scheme: light` on `:root` and `color-scheme: dark` on `:root.dark`.

## What I verified

In headless Edge with an `en-US` locale, against both `npm run dev` and `npm run preview`, on all nine routes at the time:

- No console errors and no hydration mismatch warnings.
- No requests to `/blogs.json` or `/projects.json`.
- In the production preview, the cards were in the HTML: three project cards and two blog cards on `/`, with no `Loading...` placeholders.
- The theme toggle cycled `system → dark → light → system`, kept the choice after a reload, and loaded statically without re-triggering entrance animations on page reload.

For the follow-up, I also checked the computed colors of a Shiki code block for each combination of OS preference and saved theme.

What I did not measure is loading speed. Having the cards in the initial HTML should help, since there is no extra request before they appear, but I have no benchmark to support a number. The trade-off in the other direction is also real: every page now loads the React bundle, about 74 kB gzipped in the current build.

## Trade-offs and what I would do differently

- **Hydration parity is now a rule for every component.** Anything that reads the browser during render, or produces different output on different machines, will break hydration. It is easy to forget, and the build does not catch it. Only a browser does.
- **Dates across locales was a subtle bug.** Initially, `formatDisplayDate()` fixed the timezone, but still used the runtime's default locale. My build ran in `en-US` and formatted `2026-10-04` as `10/4/2026`, while a browser using `vi-VN` formatted it as `4/10/2026`. In browser testing with `vi-VN`, React threw hydration error #418 (text mismatch) on `/` and `/blog/` and fell back to client rendering. I fixed it with a shared `<FormattedDate />` component: rendering the deterministic ISO date in `<time dateTime="YYYY-MM-DD">` during SSR and hydration, then localizing via `useEffect` with `Intl.DateTimeFormat` (using `timeZone: "UTC"` for calendar dates so negative timezones never shift the day).
- **An extra artifact in the pipeline.** `dist-ssr/pages.json` is one more generated file, and `vite build` now fails if it is missing. Rendering directly inside the Vite plugin would remove it, but would also move React rendering into the Vite config.
- **Duplicate data in every page.** Each page contains its data twice: once as HTML and once as JSON for hydration. For a handful of cards that is small. For post pages, the whole article HTML is repeated in the payload. A page with no interactive parts would not need that.
- **JavaScript for small interactions.** The only interactive parts are the theme toggle and the comments, but every page loads React to hydrate the full tree. A partial hydration approach would ship less JavaScript, but would add more machinery than this site needs right now.
- **Planning in milestones worked, but the plan needed reading.** The first version of the architecture had a weaker design for the cards, and the root persistence code looked reasonable until I asked why it was there. Next time I would write down the non-negotiable requirements, like "cards must be in the HTML", before the first plan instead of after it.

## Takeaways

1. "React" does not have to mean "SPA". If the pages are documents, keep the MPA and use React for rendering.
2. Build-time rendering with `renderToString()` gives you static files. You do not need an SSR server for content that only changes when you deploy.
3. Pass the same data to the build and to hydration. If the browser has to fetch it again, the prerendered HTML was only half the job.
4. Anything that depends on the machine, like `window`, `localStorage`, timezones and locales, is a hydration bug waiting to happen.
5. Review every milestone. Most of the problems above were caught while reading a diff or questioning a design, not by the build.
