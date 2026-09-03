# Agent Instructions for Personal Website

This is a personal portfolio & digital garden showcasing projects and technical notes. See [README.md](README.md) for project overview.

## Quick Start Commands

- **Local development:** `npm run dev` — Start Vite dev server on `http://localhost:5173`
- **Build & deploy:** `npm run build` — Runs CSS linting, TypeScript check, and Vite build (output: `dist/`)
- **Preview production build:** `npm run preview`
- **CSS linting:** `npm run lint:css` — Stylelint (zero warnings allowed)

## Architecture

**Multi-Page App (MPA)** using Vite's `appType: "mpa"` mode.

### Page Structure

- **`index.html`** — Home page with featured projects and about section
- **`blog/index.html`** — Blog index (dynamically renders posts from `src/content/posts/`)
- **`projects/index.html`** — Portfolio showcase
- **`404.html`** — Error page

### Key Components

**Web Components** (`src/scripts/components.ts`):

- `<site-header>` — Navigation header (Home, Projects, Blog links)
- `<site-footer>` — Footer with contact info

Imported in every page via `<script type="module" src="/src/scripts/main.ts"></script>`. All pages share the same component definitions.

### Styling

- **Framework:** Tailwind CSS v4 (via `@tailwindcss/vite` plugin)
- **Typography:** Tailwind Typography plugin for Markdown content
- **CSS file:** `src/styles/main.css` — Base layers (body, main, site-header, site-footer) + dark mode support
- **CSS Linting:** Stylelint with strict config (zero warnings on build)

**Dark mode:** Handled via CSS `prefers-color-scheme` and Tailwind's dark variant. Tailwind classes use `dark:` prefix for dark mode styles.

## Development Conventions

### TypeScript & Linting

- **Strict mode:** `noUnusedLocals`, `noUnusedParameters`, `erasableSyntaxOnly` enabled
- **Target:** ES2023 with DOM lib
- **Module resolution:** `bundler` (Vite/TypeScript 5+ convention)
- **TSConfig:** `src/` is included; output configured for browser + Vite client types

### File Organization

```
src/
  assets/         — Images, fonts, static files
  content/posts/  — Markdown blog posts (hello-world.md)
  scripts/        — TypeScript entry points
    main.ts       — Imported by all pages (loads components)
    components.ts — Web Components definitions
  styles/
    main.css      — Tailwind imports + base layers + dark mode
public/           — Static assets (favicon.svg, profile-picture.jpg)
```

### Naming & Patterns

- **Web Components:** Use custom element names with hyphens (e.g., `<site-header>`, `<site-footer>`)
- **Classes:** Use Tailwind utility classes; avoid custom CSS classes (except necessary base layers)
- **HTML:** Semantic HTML5 with ARIA-appropriate roles where needed

### Responsive Design

Tailwind breakpoints: `md:` prefix for medium screens and above. Mobile-first approach in all pages.

### Ignored Paths

Per `.gitignore`: `node_modules/`, `dist/`, `*.local`, `.vscode/*` (but `!.vscode/extensions.json`), `.DS_Store`, `.idea/`, editor backup files.

## Content Management

### Blog Posts

Store Markdown files in `src/content/posts/` (e.g., `hello-world.md`). Currently, blog rendering logic is incomplete — posts are not yet dynamically loaded into `blog/index.html`. When implementing blog rendering:

- Parse Markdown files from `src/content/posts/`
- Extract frontmatter (title, date, tags, etc.)
- Render to HTML and inject into `blog/index.html`

### Assets

- Profile picture: `public/profile-picture.jpg`
- Favicon: `public/favicon.svg` (responsive, respects color scheme)

## Common Tasks

### Add a New Page

1. Create `your-page/index.html` in root (or subdirectory)
2. Import the CSS and scripts:
   ```html
   <link rel="stylesheet" href="/src/styles/main.css" />
   <script type="module" src="/src/scripts/main.ts"></script>
   ```
3. Use `<site-header>` and `<site-footer>` components
4. Vite will automatically add it to the build output

### Add a Web Component

1. Define the class in `src/scripts/components.ts`
2. Call `customElements.define('component-name', ComponentClass)`
3. Already imported on all pages, so use it immediately: `<component-name></component-name>`

### Style a Page / Component

- Use Tailwind utility classes directly in HTML
- If necessary, add base layer styles in `src/styles/main.css`
- Run `npm run lint:css` before committing to ensure zero warnings

### Build & Deploy

- GitHub Pages or Vercel: Point to `dist/` folder after `npm run build`
- Build steps: CSS lint → TypeScript check → Vite bundle
- If any step fails, the build stops

## Potential Pitfalls

1. **CSS Linting:** Stylelint is strict (zero warnings). Run `npm run lint:css` locally before pushing.
2. **Unused variables/imports:** TypeScript strict mode flags these. Remove or suppress with `// @ts-expect-error` if necessary.
3. **Asset paths:** Use root-relative paths (`/path/to/asset`) in HTML. Vite will resolve them correctly.
4. **Component imports:** Web Components defined in `components.ts` are auto-registered globally on all pages. Do not re-import or re-define.
5. **Markdown not yet rendered:** Blog post rendering to HTML is incomplete. Plan implementation before adding many blog posts.

## Questions or Extensions?

For codebase questions, refer to [README.md](README.md) or examine the source files. For styling conventions, check `src/styles/main.css` and existing HTML pages for patterns.
