# Development Guide

This guide documents the architecture, build pipeline, React SSR/hydration workflow, conventions, and operational safeguards for `personal-website`.

## Development Setup

### Prerequisites

- Node.js 20.19+ or 22.12+ (required by Vite 8)
- npm

### Installation

```bash
git clone https://github.com/haicuong/personal-website.git
cd personal-website
npm install
```

### Commands

| Command | Purpose |
| :--- | :--- |
| `npm run dev` | Generate project and blog posts + JSON metadata, then start the Vite dev server at `http://localhost:5173` |
| `npm run build` | Run the full 6-step production build pipeline into `dist/` |
| `npm run preview` | Serve the production `dist/` output locally via `vite preview` |
| `npm run lint:css` | Run `stylelint "src/**/*.css" --max-warnings 0` |
| `npx tsc` | Run strict TypeScript type-checking (`noEmit: true`) across `src/` |

---

## Architecture Overview

`personal-website` is a **React 19 + Vite Multi-Page Application (`appType: "mpa"`)** with build-time static prerendering (`react-dom/server` `renderToString`) and client-side hydration (`react-dom/client` `hydrateRoot`).

- **No Client-Side Router**: Every route corresponds to an actual HTML entry point (`index.html`, `blog/index.html`, `projects/index.html`, `404.html`, `blog/posts/<slug>/index.html`, `projects/posts/<slug>/index.html`). Navigation uses standard `<a href="...">` links.
- **No Redundant Client Fetching**: Listing pages (`/`, `/blog/`, `/projects/`) and post pages (`/blog/posts/<slug>/`, `/projects/posts/<slug>/`) receive their initial props from an inline `<script id="__PAGE_DATA__" type="application/json">` payload generated at build time (or injected by Vite in development) rather than fetching `/blogs.json` or `/projects.json` in the browser.

### Source vs. Generated Artifacts

| Path | Classification | Purpose & Rules |
| :--- | :--- | :--- |
| `blog/content/*.md`, `projects/content/*.md` | **Source (Tracked)** | Authoritative Markdown content with YAML frontmatter. Edit these files to add or update posts/projects. |
| `index.html`, `blog/index.html`, `projects/index.html`, `404.html` | **Source (Tracked)** | HTML entry shells containing `<div id="root" data-page="..."></div>` and `<script type="module" src="/src/scripts/main.tsx"></script>`. |
| `blog/templates/blog-template.html`, `projects/templates/project-template.html` | **Source (Tracked)** | HTML templates used by `build-content.ts` to emit individual post pages. |
| `src/**/*` | **Source (Tracked)** | React components, pages, hooks, shared utilities, build scripts, and CSS. |
| `public/blogs.json`, `public/projects.json` | **Generated (Git-ignored)** | Sorted metadata arrays emitted by `build-blog.ts` and `build-projects.ts`. Consumed by `build-pages.ts` and Vite dev server. **Never edit manually.** |
| `blog/posts/<slug>/index.html`, `projects/posts/<slug>/index.html` | **Generated (Git-ignored)** | Prerendered static HTML entry points for individual articles (`data-ssr="true"`), discovered by Vite during `vite build` and `vite`. **Never edit manually.** |
| `dist-ssr/pages.json` | **Generated (Git-ignored)** | Intermediate build manifest produced by `build-pages.ts` containing `ssrHtml` and `pageData` for `home`, `blog-index`, `projects-index`, and `404`. **Never edit manually.** |
| `dist/` | **Generated (Git-ignored)** | Final bundled production output emitted by `vite build` for static hosting deployment. **Never edit manually.** |

---

## Build Pipeline & Execution Order

`npm run build` runs 6 steps sequentially:

```text
1. tsx src/scripts/modules/build-projects.ts
   └─> Compiles projects/content/*.md -> projects/posts/<slug>/index.html + public/projects.json
2. tsx src/scripts/modules/build-blog.ts
   └─> Compiles blog/content/*.md     -> blog/posts/<slug>/index.html + public/blogs.json
3. tsx src/scripts/modules/build-pages.ts
   └─> Reads public/projects.json + public/blogs.json -> prerenders dist-ssr/pages.json
4. npm run lint:css
   └─> Runs stylelint "src/**/*.css" --max-warnings 0
5. tsc
   └─> Runs strict TypeScript compiler checks across src/
6. vite build
   └─> Injects theme script + dist-ssr/pages.json markup/data and bundles all MPA entry points into dist/
```

Why this order is required:
1. `build-projects.ts` and `build-blog.ts` must run first so `projects/posts/*/index.html`, `blog/posts/*/index.html`, `public/projects.json`, and `public/blogs.json` exist on disk.
2. `build-pages.ts` depends on `public/projects.json` and `public/blogs.json` to prerender the project and blog cards into `dist-ssr/pages.json`.
3. `vite build` discovers `projects/posts/*/index.html` and `blog/posts/*/index.html` via `globSync(["**/index.html", "404.html"])` and reads `dist-ssr/pages.json` inside the `injectPrerenderedPages()` plugin.

---

## React Modules & Responsibilities

### Shared Components (`src/components/`)

- `Layout.tsx` — Renders `<SiteHeader activeSection={activeSection} />`, `<main className={mainClassName}>{children}</main>`, and `<SiteFooter />`.
- `SiteHeader.tsx` — Sticky top navigation bar (`Home`, `Projects`, `Blog`) and the theme toggle button (`#theme`). Uses the explicit `activeSection` prop (`"home" | "projects" | "blog" | "none"`) rather than reading `window.location` so server rendering and client hydration always produce identical classes.
- `SiteFooter.tsx` — Footer with author contact and social links (`<address>`).
- `ProjectCard.tsx` & `BlogCard.tsx` — Render project and blog summary cards with formatted dates (`formatDisplayDate`) and colored tag pills (`<TagList />`).
- `TagList.tsx` — Renders tag pills using hex color mappings from `src/scripts/tags-render.ts`.
- `GiscusComments.tsx` — Renders `<div ref={containerRef} className="giscus mt-8" />` during SSR and initial hydration, then dynamically appends `<script src="https://giscus.app/client.js" ...>` inside a client `useEffect`.

### Page Components (`src/pages/`)

| Page Component | `data-page` ID | Props (`#__PAGE_DATA__`) | `activeSection` |
| :--- | :--- | :--- | :--- |
| `HomePage.tsx` | `home` | `{ projects: ProjectMetadata[]; blogs: BlogMetadata[] }` | `"home"` |
| `BlogIndexPage.tsx` | `blog-index` | `{ blogs: BlogMetadata[] }` | `"blog"` |
| `ProjectsIndexPage.tsx` | `projects-index` | `{ projects: ProjectMetadata[] }` | `"projects"` |
| `NotFoundPage.tsx` | `404` | None (`null` in manifest) | `"none"` |
| `BlogPostPage.tsx` | `blog-post` | `{ post: BlogPostPageData }` | `"blog"` |
| `ProjectPostPage.tsx` | `project-post` | `{ project: ProjectPostPageData }` | `"projects"` |

### Hooks & Shared Utilities

- `src/hooks/use-theme.ts` — Manages the 3-state theme cycle (`"system" | "dark" | "light"`). Initializes state to `null` during SSR/initial render so server and client markup match, then syncs with `localStorage.getItem("theme")` inside `useEffect`.
- `src/scripts/date-format.ts`:
  - `formatDisplayDate(dateStr, fallback)` — Deterministic UTC-parsed `M/D/YYYY` formatter so Node build scripts and browser hydration never diverge across locales/timezones.
  - `serializePageData(data)` — Serializes JSON for `<script id="__PAGE_DATA__" type="application/json">`, escaping `<` as `\u003c` to prevent premature `</script>` tag termination when Markdown code blocks contain HTML/script tags.
- `src/scripts/tags-render.ts` — Exports `tagsHexColorMap`, `getTagHexColor(tag)`, and `renderTags(tags)`.
- `src/scripts/types.ts` — Shared TypeScript interfaces for frontmatter, metadata, post page data, `StaticPageId`, `PageId`, `PrerenderedPagesManifest`, and `BuildContentOptions`.

---

## Prerendering, `transformIndexHtml`, and Client Hydration

### 1. Individual Blog & Project Posts (`build-content.ts`, `build-blog.ts`, `build-projects.ts`)

1. `buildContent()` parses each `.md` file in `blog/content/` or `projects/content/` using `gray-matter`, converts Markdown to HTML with `marked` and `shiki`, and invokes the generator's `renderPage()` callback.
2. `renderPage()` constructs a `BlogPostPageData` or `ProjectPostPageData` object (including pre-formatted `createdDateFormatted` / `lastEditedDateFormatted` and `contentHtml`) and calls `renderToString(createElement(BlogPostPage, { post }))` or `renderToString(createElement(ProjectPostPage, { project }))`.
3. `buildContent()` injects `{{SSR_HTML}}` into `<div id="root" data-page="blog-post|project-post" data-ssr="true">{{SSR_HTML}}</div>` and `{{PAGE_DATA}}` into `<script id="__PAGE_DATA__" type="application/json">{{PAGE_DATA}}</script>` inside `blog/templates/blog-template.html` or `projects/templates/project-template.html`, writing `blog/posts/<slug>/index.html` and `projects/posts/<slug>/index.html`.

### 2. Static Listing & 404 Pages (`build-pages.ts` + `injectPrerenderedPages()` in `vite.config.ts`)

1. During `npm run build`, `build-pages.ts` reads `public/projects.json` and `public/blogs.json`, renders `HomePage`, `BlogIndexPage`, `ProjectsIndexPage`, and `NotFoundPage` with `renderToString()`, and writes `dist-ssr/pages.json`.
2. In `vite.config.ts`, the `injectPrerenderedPages()` plugin hooks into `transformIndexHtml` for the four static entry shells (`index.html` → `home`, `blog/index.html` → `blog-index`, `projects/index.html` → `projects-index`, `404.html` → `404`):
   - **Production Build (`!ctx.server`)**: Validates `dist-ssr/pages.json` and replaces `<div id="root" data-page="${pageId}"></div>` in memory with:
     ```html
     <div id="root" data-page="${pageId}" data-ssr="true">${entry.ssrHtml}</div>
     <script id="__PAGE_DATA__" type="application/json">${serializePageData(entry.pageData)}</script>
     ```
     Tracked source HTML files on disk are never modified.
   - **Development Server (`ctx.server`)**: Reads `public/projects.json` and `public/blogs.json` on request and appends `<script id="__PAGE_DATA__" type="application/json">` after the empty `<div id="root" data-page="${pageId}"></div>` shell (without adding `data-ssr="true"`).

### 3. Client Entry Dispatcher (`src/scripts/main.tsx`)

When `/src/scripts/main.tsx` executes in the browser:

1. Validates `#root` and `rootElement.dataset.page` (`home`, `blog-index`, `projects-index`, `404`, `blog-post`, `project-post`).
2. For all pages except `404`, reads and parses `script#__PAGE_DATA__` and validates the payload shape with runtime type guards (`isHomePageProps`, `isBlogIndexPageProps`, `isProjectsIndexPageProps`, `isBlogPostPageProps`, `isProjectPostPageProps`).
3. Distinguishes hydration from client mounting using the explicit `data-ssr="true"` attribute:
   - **`rootElement.dataset.ssr === "true"`**: Verifies `rootElement.firstElementChild !== null` and calls `hydrateRoot(rootElement, pageElement)`. Used for **all 9 routes in production** and **generated post routes in development**.
   - **`rootElement.dataset.ssr !== "true"`**: Verifies `rootElement.firstElementChild === null` and calls `createRoot(rootElement).render(pageElement)`. Used for the **4 source HTML shells in `npm run dev`**.

### 4. HMR Behavior in Development

- **Component Updates**: `@vitejs/plugin-react` wraps component modules (`src/components/*.tsx`, `src/pages/*.tsx`) with React Fast Refresh (`$RefreshReg$` and `import.meta.hot.accept()`). Editing components updates the live React tree in place without reloading the page or re-running `main.tsx`.
- **Entry Updates**: `src/scripts/main.tsx` exports no React components and has no `import.meta.hot.accept()` boundary. Editing `main.tsx` (or non-component modules imported by it) triggers a full browser page reload, initializing a single fresh root on reload.

---

## Safeguards for Stale Generated-Post Cleanup

When Markdown files are renamed or deleted from `blog/content/` or `projects/content/`, `buildContent()` in `src/scripts/modules/build-content.ts` cleans up obsolete post directories before generating current posts. To prevent accidental deletion of source files:

1. **Strict Allowlist (`resolveValidatedOutputDir`)**:
   - Normalizes `options.outputDir` and verifies it is an exact match in `ALLOWED_OUTPUT_DIRS = new Set(["blog/posts", "projects/posts"])`.
   - Verifies `path.relative(repoRoot, resolvedOutputDir)` matches the normalized path and does not traverse outside `repoRoot`.
2. **Non-Empty Content Guard**:
   - Aborts immediately if `CONTENT_DIR` does not exist or contains zero `.md` files, preventing an empty directory from wiping all generated posts.
3. **Scoped Child Directory Removal (`cleanObsoletePostDirectories`)**:
   - Only inspects direct child directories of `OUTPUT_POSTS_DIR` whose names are not in `activeSlugs`.
   - Rejects directory names containing `..`, `/`, or `\`, and verifies `path.dirname(obsoleteDir) === outputPostsDir`.
   - Aborts the build with a diagnostic error if an obsolete directory contains unexpected nested files/subdirectories (`subEntries.length > 0`).

---

## Theme Initialization & 3-State Toggle

1. **FOUC Prevention (`injectThemeScript()` in `vite.config.ts`)**:
   - Injects a synchronous inline `<script>` immediately after `<head>` on every HTML page.
   - Reads `localStorage.getItem('theme')` and sets `document.documentElement.classList.toggle('dark', isDark)` before stylesheets or body markup paint.
2. **3-State Cycle (`src/hooks/use-theme.ts` & `src/components/SiteHeader.tsx`)**:
   - Cycles `"system"` → `"dark"` → `"light"` → `"system"` and persists the plain string under `localStorage.getItem("theme")`.
   - Updates `document.documentElement.classList.toggle("dark", isDark)` and renders `/icon/system-theme.webp`, `/icon/dark-theme.webp`, or `/icon/light-theme.webp` inside `<button id="theme">`.
   - During Node `renderToString` and the initial client hydration pass, `theme` is `null` so server and client DOM match without hydration warnings; `useEffect` immediately populates the current theme on mount.

---

## Giscus Comments Integration

Blog and project post pages render `<GiscusComments />` (`src/components/GiscusComments.tsx`) below `<article>`:

- **SSR-Safe**: Renders only `<div ref={containerRef} className="giscus mt-8" />` during server rendering and initial hydration.
- **Client Injection**: Inside `useEffect`, checks `if (!container || container.childElementCount > 0) return;` (preventing duplicate scripts under React `StrictMode`) and appends `<script src="https://giscus.app/client.js" ...>` configured with:
  - `data-repo="haicuong/personal-website"`
  - `data-repo-id="R_kgDOUJUoUQ"`
  - `data-category="Comments"`
  - `data-category-id="DIC_kwDOUJUoUc4DFUH2"`
  - `data-mapping="pathname"`
  - `data-theme="preferred_color_scheme"`
  - `data-loading="lazy"`

---

## Content & Syntax Highlighting Rules

### Supported Shiki Languages (`src/scripts/modules/build-content.ts`)

Shiki is configured with dual themes (`github-light` and `github-dark`, `defaultColor: false`) and preloads **9 languages**:

- `javascript`
- `typescript`
- `html`
- `css`
- `json`
- `bash`
- `yaml`
- `markdown`
- `tsx`

Code blocks with an unrecognized language identifier fall back to `"text"` (plain text highlighting).

### External Links in Markdown

`buildContent()` configures a custom `marked` link renderer that automatically adds `target="_blank" rel="noopener noreferrer"` to external `http://` and `https://` links while keeping internal root-relative links untouched.

---

## TypeScript & Styling Conventions

- **TypeScript (`tsconfig.json`)**:
  - `"jsx": "react-jsx"`
  - `"verbatimModuleSyntax": true` (always use `import type` for type-only imports)
  - `"erasableSyntaxOnly": true`
  - `"noUnusedLocals": true`, `"noUnusedParameters": true`, `"noFallthroughCasesInSwitch": true`
- **CSS (`src/styles/main.css` & `.stylelintrc.json`)**:
  - Uses Tailwind CSS v4 (`@import "tailwindcss";`, `@plugin "@tailwindcss/typography";`, `@custom-variant dark (&:where(.dark, .dark *));`).
  - Must pass `npm run lint:css` with zero warnings.

---

## Known Deferred Issues

The following items are documented for tracking and intentionally excluded from the initial React migration commits:

1. **Pre-Existing — Broken Movie Browser Link on Homepage**:
   - In `src/pages/HomePage.tsx` (ported 1:1 from the original `index.html`), the inline "Movie Browser" link in the "About & Focus" section points to `/projects/movie-browser/` instead of `/projects/posts/movie-browser/`.
2. **Pre-Existing — Shiki `light-dark()` vs. Manual Theme Override**:
   - In `src/styles/main.css`, `:root { color-scheme: light dark; }` causes `.shiki` `light-dark(...)` colors to follow the OS `prefers-color-scheme` rather than the manual `.dark` class on `<html>` when the user overrides the system theme.
3. **Pre-Existing — Legacy `site-header` / `site-footer` Selectors & `#root` Flex Wrapper in `src/styles/main.css`**:
   - `src/styles/main.css` still defines base rules for the removed `site-header` and `site-footer` custom element tags (though `SiteHeader.tsx` and `SiteFooter.tsx` apply those utility classes directly on `<header>` and `<footer>`). Additionally, because `<div id="root">` now wraps `<header>`, `<main>`, and `<footer>` inside `<body>` (`flex flex-col min-h-dvh`), adding `#root { @apply flex flex-1 flex-col; }` (or `contents`) in `src/styles/main.css` is recommended in a follow-up styling cleanup so `<main>` (`flex-1`) stretches to fill tall viewports (>1050px) on shorter listing pages (`/blog/`, `/projects/`).
4. **Temporary Debug Log in `src/components/SiteHeader.tsx`**:
   - `SiteHeader.tsx` currently contains a `console.log("SiteHeader render", { activeSection, theme });` statement added during migration debugging.
