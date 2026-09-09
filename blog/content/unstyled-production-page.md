---
title: "How I Debugged an Unstyled Production Page (404 CSS)"
date: "2026-09-09"
description: "Step by step how I debug my page when it's suddenly unstyled"
tags: ["Technical Note", "Debug", "Vercel"]
coverImage: "/images/blog/unstyled-production-page/cover.jpg"
---

# How I Debugged an Unstyled Production Page

Two days ago, I pushed new code to my personal site project. Shortly after,
I opened `haicuong.me` and refreshed repeatedly with `Ctrl+R`. After about
five refreshes, the page suddenly rendered as raw, unstyled HTML — and
stayed that way no matter how many more times I refreshed.

Opening DevTools (F12), the console showed errors: the page couldn't fetch
its renamed script and CSS files.

![404 errors for hashed CSS/JS files](/images/blog/unstyled-production-page/404-errors.jpg)

## Debugging Steps

1. **Checked the local build first.** Ran `npm run build`, which completed
   with no errors, then `npm run preview` to serve the production build
   locally. The page rendered correctly — confirming the build itself was
   fine.

2. **Checked Vercel's build log.** It completed successfully, matching my
   local build output.

3. **Checked Cloudflare.** Temporarily unproxied my domain to rule out
   Cloudflare-side caching or routing issues. The page was still broken.

4. **Tested other access points.** Opened the site on my phone — worked
   fine. Opened it in an incognito browser window — also worked fine.
   This confirmed the issue was isolated to my one browser, on my one
   machine, at that moment — not a server, DNS, or CDN problem.

(Illustration purpose only)
![Side-by-side incognito vs. regular browser showing the difference](/images/blog/unstyled-production-page/incognito-vs-regular-browser.png)

5. **Found the fix: hard refresh.** `Ctrl+Shift+R` forces the browser to
   bypass its cache for that load and refetch every resource fresh from
   the server, rather than relying on cached copies. After a hard refresh,
   the page rendered correctly again.

## What Was Actually Happening

This turned out to be a rare case of the browser failing to properly
revalidate a cached page, despite being correctly configured to do so.

You can check whether your own page is configured for revalidation via:
`F12 → Network → refresh the page → select your page (usually the first
entry in the Name column) → Headers → Response Headers → Cache-Control`.
If you see `must-revalidate`, your configuration is correct.

![Cache-Control header showing must-revalidate](/images/blog/unstyled-production-page/cache-control-header.png)

Vite generates asset filenames using a content hash — a hash derived from
the file's own content, so the filename only changes when the content
changes (e.g. `main-OLDHASH.css` → `main-NEWHASH.css`). This allows assets
to be cached aggressively (long `max-age`) with no risk of staleness,
since a genuinely new version always gets a new filename, while an
unchanged file keeps its old filename and can be served from cache safely.

The problem: my browser served a **stale cached `index.html`** instead of
re-checking with the server, even though `must-revalidate` was correctly
set. That stale HTML still referenced the *old* hashed filenames — files
that had already been deleted from the server, since my new deployment
replaced them with differently-hashed versions. The browser requested
files that no longer existed, resulting in the 404s in the console.

A hard refresh bypasses this entirely: it ignores the cache outright and
refetches everything, including a fresh `index.html` pointing to the
correct, current hashed filenames.

## Why This Is Rare

This isn't a normal failure mode — `must-revalidate` is a strong signal,
and browsers honor it reliably the overwhelming majority of the time.
What made this surface was refreshing repeatedly, in quick succession, in
the same tab, in the narrow window shortly after a fresh deploy went live
— a pattern real visitors essentially never produce. A typical visitor
loads a page once and browses; they don't rapid-fire refresh a tab
immediately after a new deployment. This is very unlikely to affect a
normal user, and mostly shows up during active development/testing.