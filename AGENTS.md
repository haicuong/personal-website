# Agent Instructions

## Architecture

- React 19 + Vite multi-page app (`appType: "mpa"`, `@vitejs/plugin-react`); each `**/index.html` and `404.html` (excluding `blog/templates/**` and `projects/templates/**`) is an entry point.
- Source content: `blog/content/*.md` and `projects/content/*.md`.
- Shared content generator: `src/scripts/modules/build-content.ts`, invoked by `src/scripts/modules/build-blog.ts` and `src/scripts/modules/build-projects.ts`.
- Static page prerenderer: `src/scripts/modules/build-pages.ts` renders `HomePage`, `BlogIndexPage`, `ProjectsIndexPage`, and `NotFoundPage` (with all project and blog cards) via `renderToString` into `dist-ssr/pages.json`.
- Vite HTML plugins in `vite.config.ts`:
  - `injectThemeScript()`: injects synchronous `<head>` theme initialization script.
  - `injectPrerenderedPages()`: injects `dist-ssr/pages.json` markup (`data-ssr="true"`) and `#__PAGE_DATA__` into production HTML builds, and injects `#__PAGE_DATA__` in development mode without modifying tracked HTML source files.
- Client entry point: `src/scripts/main.tsx` dispatches by `#root`'s `data-page` attribute (`home`, `blog-index`, `projects-index`, `404`, `blog-post`, `project-post`), validates `script#__PAGE_DATA__`, calls `hydrateRoot()` when `data-ssr="true"`, and calls `createRoot().render()` on empty dev shells.
- Shared React components: `src/components/` (`Layout.tsx`, `SiteHeader.tsx`, `SiteFooter.tsx`, `BlogCard.tsx`, `ProjectCard.tsx`, `TagList.tsx`, `GiscusComments.tsx`).
- React page components: `src/pages/` (`HomePage.tsx`, `BlogIndexPage.tsx`, `ProjectsIndexPage.tsx`, `BlogPostPage.tsx`, `ProjectPostPage.tsx`, `NotFoundPage.tsx`).
- Hooks & shared utilities: `src/hooks/use-theme.ts` (3-state theme hook, pre-paint inline script generator, and instant DOM toggling with `.no-transitions`), `src/scripts/date-format.ts`, `src/scripts/tags-render.ts`, `src/scripts/types.ts`.

## Build Order

`npm run build` must run in this order:

1. Generate projects: `tsx src/scripts/modules/build-projects.ts` -> `projects/posts/` and `public/projects.json`.
2. Generate blog: `tsx src/scripts/modules/build-blog.ts` -> `blog/posts/` and `public/blogs.json`.
3. Prerender static pages: `tsx src/scripts/modules/build-pages.ts` -> `dist-ssr/pages.json`.
4. Run CSS lint: `npm run lint:css`.
5. Run TypeScript checking: `tsc`.
6. Bundle with Vite: `vite build`.

## Hard Constraints

- NEVER edit generated files: `blog/posts/*`, `projects/posts/*`, `public/blogs.json`, `public/projects.json`, `dist-ssr/pages.json`, `dist/*`, or any generated `*.json`.
- Edit source Markdown only for blog/project content: `blog/content/` and `projects/content/`.
- Do not overwrite tracked HTML entry shells (`index.html`, `blog/index.html`, `projects/index.html`, `404.html`) with build-time prerendered markup; prerendered markup for those shells is injected by `injectPrerenderedPages()` during `vite build`.
- CSS must pass `npm run lint:css` with zero warnings.
- Keep browser-only globals (`window`, `document`, `localStorage`, `fetch`) out of module initialization and React render bodies so components can execute safely inside Node `renderToString()`. Access browser APIs only inside `useEffect`, event handlers, or client-only `src/scripts/main.tsx`.
- Asset URLs must be root-relative, for example `/images/pic.png`.
- Preserve strict TypeScript checks (`verbatimModuleSyntax`, `erasableSyntaxOnly`, `noUnusedLocals`, `noUnusedParameters`, `jsx: "react-jsx"`) and existing public interfaces.

## Commands

- `npm run dev`: generate project and blog content before starting the Vite development server at `http://localhost:5173`.
- `npm run build`: generate content, prerender static pages, lint CSS, type-check, and bundle.
- `npm run preview`: preview the production build.
- `npm run lint:css`: run Stylelint with zero warnings allowed.

## File Mapping

- `index.html`: home page shell (`data-page="home"`).
- `blog/index.html`: blog index shell (`data-page="blog-index"`).
- `projects/index.html`: project index shell (`data-page="projects-index"`).
- `404.html`: not-found page shell (`data-page="404"`).
- `blog/templates/blog-template.html`: blog post page template (`data-page="blog-post" data-ssr="true"`).
- `projects/templates/project-template.html`: project page template (`data-page="project-post" data-ssr="true"`).
- Blog and project post comments use `<GiscusComments />` (`src/components/GiscusComments.tsx`), mounted client-side after hydration on `BlogPostPage` and `ProjectPostPage`.
- `src/styles/main.css`: Tailwind CSS v4 imports and shared styles.
- `src/scripts/types.ts`: metadata, frontmatter, page-data, and build interfaces.
- `public/images/blog/`: blog assets.
- `public/images/projects/`: project assets.

## Content Rules

- Add blog posts as Markdown files in `blog/content/` and projects as Markdown files in `projects/content/`.
- Blog frontmatter fields: `title`, `date`, optional `lastEditedDate`, `description`, `tags`, and `coverImage`.
- Project frontmatter fields: `title`, `date`, `description`, `techStack`, `repoUrl`, `liveUrl`, and `coverImage`.
- Use ISO dates (`YYYY-MM-DD`) and root-relative image paths such as `/images/blog/post/cover.webp`.
- `lastEditedDate` is optional and falls back to `date` when omitted.
- Run `npm run dev` or `npm run build` after adding content so the generated page and metadata are refreshed.
- Supported Shiki languages: `javascript`, `typescript`, `html`, `css`, `json`, `bash`, `yaml`, `markdown`, and `tsx`. Unknown code-block languages fall back to plain text highlighting.
- Slugs use kebab-case and map to `/blog/posts/<slug>/` or `/projects/posts/<slug>/`.
- Add pages as `your-page/index.html` with `/src/styles/main.css` and `/src/scripts/main.tsx` (and register the page ID in `src/scripts/types.ts`, `src/scripts/main.tsx`, `src/scripts/modules/build-pages.ts`, and `vite.config.ts`).

## Generator & Cleanup Details

- Blog metadata uses `date` as the `lastEditedDate` when `lastEditedDate` is omitted.
- Dates displayed in cards and post headers are formatted deterministically in UTC via `formatDisplayDate()` (`src/scripts/date-format.ts`), and embedded `#__PAGE_DATA__` payloads are escaped via `serializePageData()`.
- `buildContent()` validates `outputDir` against the strict allowlist (`blog/posts`, `projects/posts`) and removes obsolete generated post folders whose slugs no longer exist in `contentDir`.
- Generated metadata in `public/blogs.json` and `public/projects.json` is sorted newest-first by `date`.
- Theme mechanism: `src/hooks/use-theme.ts` defines `getThemeInitScript()` for pre-paint inline `<head>` script injection in `vite.config.ts`, and `applyThemeToDocument()` for instant synchronous `.dark` class updates with `.no-transitions` class suppression.
