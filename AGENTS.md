# Agent Instructions

## Architecture

- Vite multi-page app (`appType: "mpa"`); each `**/index.html` and `404.html` is an entry point.
- Source content: `blog/content/*.md` and `projects/content/*.md`.
- Shared generator: `src/scripts/modules/build-content.ts`.
- Generators: `build-blog.ts` and `build-projects.ts`.
- Client rendering: `src/scripts/card-render.ts`; shared entry point: `src/scripts/main.ts`.
- Shared Web Components: `src/scripts/components.ts`.

## Build Order

`npm run build` must run in this order:

1. Generate projects: `tsx build-projects.ts` -> `projects/posts/` and `public/projects.json`.
2. Generate blog: `tsx build-blog.ts` -> `blog/posts/` and `public/blogs.json`.
3. Run CSS lint: `npm run lint:css`.
4. Run TypeScript checking: `tsc`.
5. Bundle with Vite: `vite build`.

## Hard Constraints

- NEVER edit generated files: `blog/posts/*`, `projects/posts/*`, `public/blogs.json`, `public/projects.json`, or generated `*.json`.
- Edit source Markdown only for blog/project content: `blog/content/` and `projects/content/`.
- CSS must pass `npm run lint:css` with zero warnings.
- `<site-header>` and `<site-footer>` are globally registered in `src/scripts/components.ts`. Do not re-register or re-import them in page files.
- Asset URLs must be root-relative, for example `/images/pic.png`.
- Preserve strict TypeScript checks and existing public interfaces.

## Commands

- `npm run dev`: start Vite at `http://localhost:5173`.
- `npm run build`: generate content, lint CSS, type-check, and bundle.
- `npm run preview`: preview the production build.
- `npm run lint:css`: run Stylelint with zero warnings allowed.

## File Mapping

- `index.html`: home page.
- `blog/index.html`: blog index; loads `public/blogs.json`.
- `projects/index.html`: project index; loads `public/projects.json`.
- `blog/templates/post-template.html`: generated post/project page template.
- `src/styles/main.css`: Tailwind CSS v4 imports and shared styles.
- `src/scripts/types.ts`: metadata and frontmatter interfaces.
- `public/images/blog/`: blog assets.
- `public/images/projects/`: project assets.

## Content Rules

- Markdown frontmatter supplies title, date, description, cover image, and tags or project links/tech stack.
- Supported Shiki languages: `javascript`, `typescript`, `html`, `css`, `json`, `bash`.
- Slugs use kebab-case and map to `/blog/posts/<slug>/` or `/projects/posts/<slug>/`.
- Add pages as `your-page/index.html` with `/src/styles/main.css` and `/src/scripts/main.ts`; Vite discovers them automatically.
