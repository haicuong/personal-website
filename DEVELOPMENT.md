# Development Guide

This guide covers development conventions, build system details, and contribution guidelines for the personal website project.

## Development Setup

### Prerequisites
- Node.js 18+ (for TypeScript/Vite)
- npm or yarn

### Installation

```bash
git clone https://github.com/haicuong/personal-website.git
cd personal-website
npm install
```

### Commands

| Command            | Purpose                                                                  |
| ------------------ | ------------------------------------------------------------------------ |
| `npm run dev`      | Start Vite dev server on `http://localhost:5173`                         |
| `npm run build`    | Full production build: generate content → lint CSS → type-check → bundle |
| `npm run preview`  | Preview production build locally                                         |
| `npm run lint:css` | Lint CSS with Stylelint (zero warnings)                                  |

## Build Pipeline

```
npm run build:
  1. tsx build-projects.ts     → Generate projects/posts/ + projects.json
  2. tsx build-blog.ts          → Generate blog/posts/ + blogs.json
  3. npm run lint:css           → Stylelint check (zero warnings)
  4. tsc                         → TypeScript type checking
  5. vite build                  → Vite bundling and optimization
```

Content generation uses a shared `buildContent()` function that:
- Parses Markdown with YAML frontmatter (gray-matter)
- Converts Markdown to HTML (marked)
- Applies syntax highlighting (Shiki)
- Generates individual post/project HTML pages from template
- Creates metadata JSON files (`blogs.json`, `projects.json`)

## TypeScript Configuration

- **Target:** ES2023 with DOM library
- **Module resolution:** `bundler`
- **Include:** `src/` directory
- **Output:** Browser + Vite client types

## Styling System

### Framework & Plugins

- **Tailwind CSS v4** via `@tailwindcss/vite` plugin
- **Typography:** `@tailwindcss/typography` for Markdown content styling
- **CSS file:** `src/styles/main.css`

### CSS Organization

- Tailwind imports at top
- Base layers: `body`, `main`, `site-header`, `site-footer`
- Dark mode support via CSS `prefers-color-scheme`
- All base styles use Tailwind utilities or semantic selectors

### Linting

- **Tool:** Stylelint with `stylelint-config-standard`
- **Policy:** Zero warnings (enforced on build)
- **Before committing:** Run `npm run lint:css`

## Web Components

### Definition & Registration

**Location:** `src/scripts/components.ts`

Components are defined as ES6 classes and auto-registered via `customElements.define()`:

```typescript
class SiteHeader extends HTMLElement { ... }
customElements.define('site-header', SiteHeader);
```

### Available Components

- `<site-header>` — Navigation header (Home, Projects, Blog links)
- `<site-footer>` — Footer with contact/social information

### Usage

- Imported globally via `src/scripts/main.ts` on all pages
- Available immediately on every page
- Do NOT re-import or re-register in individual pages

### Patterns

```html
<site-header></site-header>
<main>Content</main>
<site-footer></site-footer>
```

## File Organization

### Directory Structure

```
src/
  assets/          — Images, fonts, static files
  scripts/
    main.ts        — Loaded on all pages (imports components)
    components.ts  — Web Component definitions
    cardRender.ts  — Client-side JSON loading and card rendering
    types.ts       — TypeScript interfaces
    modules/
      build-blog.ts       — Blog content generator
      build-projects.ts   — Project content generator
      build-content.ts    — Shared build logic
  styles/
    main.css       — Tailwind imports + base layers
blog/
  content/         — Markdown source (*.md)
  posts/           — Generated HTML (Git-ignored)
  templates/
    post-template.html  — HTML template for posts
projects/
  content/         — Markdown source (*.md)
  posts/           — Generated HTML (Git-ignored)
public/
  blogs.json       — Generated blog metadata (Git-ignored)
  projects.json    — Generated project metadata (Git-ignored)
  images/          — Blog and project images
```

### Naming Conventions

- **HTML files:** Semantic names (e.g., `index.html`, `about.html`)
- **TypeScript/JavaScript:** kebab-case (e.g., `card-render.ts`, `build-content.ts`)
- **CSS files:** Tailwind utilities preferred; custom classes use kebab-case if needed
- **Markdown slugs:** kebab-case (e.g., `hello-world.md` → `/blog/posts/hello-world/`)

## Content Generation Details

### Shared Build Logic

**File:** `src/scripts/modules/build-content.ts`

The `buildContent()` function:
1. Scans content directory for `*.md` files
2. Parses YAML frontmatter and Markdown body
3. Converts Markdown to HTML using `marked` with Shiki syntax highlighting
4. Generates individual post HTML from template
5. Collects metadata into JSON file

### Blog Generation

**File:** `src/scripts/modules/build-blog.ts`

```typescript
buildContent<BlogFrontmatterData, BlogMetadata>({
  contentDir: "blog/content",
  templatePath: "blog/templates/post-template.html",
  outputDir: "blog/posts",
  indexJsonPath: "public/blogs.json",
  toMetaData: (slug, data) => ({
    slug,
    url: `/blog/posts/${slug}/`,
    title: data.title || slug,
    date: data.date || "",
    description: data.description || "",
    tags: data.tags || [],
    coverImage: data.coverImage || "",
  }),
})
```

**Metadata fields:**
- `slug` — URL-friendly identifier
- `url` — Full post URL path
- `title` — Post title
- `date` — Publication date (YYYY-MM-DD)
- `description` — Short summary
- `tags` — Array of tag strings
- `coverImage` — Path to cover image

**YAML frontmatter example:**

```yaml
---
title: "My Blog Post"
date: "2026-01-15"
description: "A concise summary"
tags: ["typescript", "web-dev"]
coverImage: "images/blog/my-post/cover.jpg"
---
```

### Project Generation

**File:** `src/scripts/modules/build-projects.ts`

Similar to blogs, but with extended metadata:

```typescript
buildContent<ProjectFrontmatterData, ProjectMetadata>({
  // ... same structure
  toMetaData: (slug, data) => ({
    slug,
    url: `/projects/posts/${slug}/`,
    title: data.title || slug,
    date: data.date || "",
    description: data.description || "",
    techStack: data.techStack || [],
    repoUrl: data.repoUrl || "",
    liveUrl: data.liveUrl || "",
    coverImage: data.coverImage || "",
  }),
})
```

**Additional metadata fields:**
- `techStack` — Array of technology names
- `repoUrl` — GitHub/repository URL
- `liveUrl` — Live project URL

**YAML frontmatter example:**

```yaml
---
title: "My Project"
date: "2026-01-15"
description: "What this project does"
techStack: ["react", "typescript", "tailwindcss"]
repoUrl: "https://github.com/user/repo"
liveUrl: "https://project.example.com"
coverImage: "images/projects/my-project/cover.jpg"
---
```

### Supported Code Languages

Syntax highlighting via Shiki supports:
- `javascript`
- `typescript`
- `html`
- `css`
- `json`
- `bash`

Unsupported languages will render without highlighting. Add new languages by modifying `build-content.ts`.

## Vite Configuration

**File:** `vite.config.ts`

```typescript
export default defineConfig({
  appType: "mpa",                 // Multi-Page App mode
  build: {
    rollupOptions: {
      input: htmlEntries,         // All index.html + 404.html
    },
  },
  plugins: [tailwindcss()],       // Tailwind CSS v4 plugin
});
```

### Entry Points

Vite automatically discovers:
- All `**/index.html` files
- `404.html`

Entry names are generated from file paths (e.g., `blog_index` for `blog/index.html`).

### Adding a New Page

1. Create `your-page/index.html` in the root or subdirectory
2. Import CSS and scripts:
   ```html
   <link rel="stylesheet" href="/src/styles/main.css" />
   <script type="module" src="/src/scripts/main.ts"></script>
   ```
3. Use Web Components as needed:
   ```html
   <site-header></site-header>
   <main>Content</main>
   <site-footer></site-footer>
   ```
4. Vite's glob pattern automatically includes it in the build

## Client-Side Card Rendering

**File:** `src/scripts/card-render.ts`

Loads and renders blog/project cards dynamically:

```typescript
loadCards<T>(
  url: string,                    // Path to JSON (e.g., "/blogs.json")
  renderCard: (data: T) => string,  // Function to render card HTML
  containerHTML: HTMLElement      // Target container
): Promise<void>
```

Tech stack tag badge colors are defined in `src/scripts/card-render.ts`.

## TypeScript Types

**File:** `src/scripts/types.ts`

Core interfaces:

```typescript
// Blog
interface BlogFrontmatterData {
  title?: string;
  date?: string;
  description?: string;
  tags?: string[];
  coverImage?: string;
}

interface BlogMetadata extends BlogFrontmatterData {
  slug: string;
  url: string;
}

// Project
interface ProjectFrontmatterData {
  title?: string;
  date?: string;
  description?: string;
  techStack?: string[];
  repoUrl?: string;
  liveUrl?: string;
  coverImage?: string;
}

interface ProjectMetadata extends ProjectFrontmatterData {
  slug: string;
  url: string;
}
```

## Common Issues & Solutions

### CSS Warnings on Build

**Issue:** Build fails with "CSS warnings" error
- **Cause:** Stylelint found issues
- **Fix:** Run `npm run lint:css` and fix warnings, or update `.stylelintrc.json`

### Unused Variables

**Issue:** TypeScript build fails with "unused local" or "unused parameter" errors
- **Cause:** Strict mode enabled
- **Fix:** Remove unused variables, or suppress with `// @ts-expect-error` if necessary

### Generated Files Overwritten

**Issue:** Manual changes to `blog/posts/`, `projects/posts/`, or `*.json` files disappear after build
- **Cause:** These are generated files, ignored by Git
- **Fix:** Always edit source files in `blog/content/` or `projects/content/`, then run build

### Asset Paths Not Resolving

**Issue:** Images/fonts don't load in built output
- **Cause:** Relative paths instead of root-relative
- **Fix:** Use `/path/to/asset` instead of `../path/to/asset`

### Component Not Appearing

**Issue:** Web Component doesn't render
- **Cause:** Not imported or defined
- **Fix:** Ensure `<script type="module" src="/src/scripts/main.ts"></script>` is in HTML

## Dependencies

### Runtime
- `tailwindcss` — Utility-first CSS framework
- `@tailwindcss/vite` — Vite plugin for Tailwind
- `@tailwindcss/typography` — Typography plugin for Markdown
- `glob` — File globbing utility

### Development
- `vite` — Build tool
- `typescript` — Type checking
- `tsx` — TypeScript executor for build scripts
- `gray-matter` — YAML frontmatter parsing
- `marked` — Markdown parser
- `shiki` — Syntax highlighter
- `stylelint` — CSS linter
- `@types/node` — Node.js types

## Contributing

1. Fork and clone the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Make changes following conventions in this guide
4. Run `npm run build` to verify (CSS lint, TypeScript check, Vite build)
5. Commit and push: `git add . && git commit -m "Your message" && git push`
6. Open a pull request

## Resources

- [Vite Documentation](https://vitejs.dev/)
- [Tailwind CSS Documentation](https://tailwindcss.com/)
- [TypeScript Documentation](https://www.typescriptlang.org/)
- [Web Components MDN](https://developer.mozilla.org/en-US/docs/Web/API/Web_components)
- [Markdown Syntax](https://www.markdownguide.org/)
