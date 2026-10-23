---
title: "Personal Website: My Digital Garden & Portfolio"
date: "2026-09-03"
description: "A personal portfolio and digital garden showcasing my software engineering projects, technical notes and controversial psychology through opposing lenses."
techStack: ["React", "TypeScript", "TailwindCSS", "Vite", "MPA"]
repoUrl: "https://github.com/haicuong/personal-website"
liveUrl: "https://haicuong.me"
coverImage: "/images/projects/personal-website/cover.webp"
---

## ✨ Features

- **Markdown-Driven Content** — Posts and projects are written in Markdown with YAML frontmatter; build scripts turn them into static article pages and JSON metadata
- **Prerendered Pages** — Every page, including the project and blog cards on the home and listing pages, is rendered to HTML at build time, so the content and links are there before any JavaScript runs
- **Reusable React Components** — Header, footer, cards, tags, and page layouts are React components shared by the build scripts and the browser
- **Syntax Highlighting** — Code blocks are highlighted at build time with Shiki, with separate light and dark colors
- **Post Comments** — Blog and project posts include Giscus-powered comments, loaded after the page hydrates
- **Light/Dark Theme** — System, dark, and light modes, saved in the browser and applied before the first paint
- **Responsive Design** — Mobile-first with Tailwind CSS v4
- **Quality Checks** — Strict TypeScript and Stylelint (zero warnings) run on every build

## 🧩 How It Works

```text
Markdown        -> build-projects.ts / build-blog.ts -> article pages + projects.json / blogs.json
JSON metadata   -> build-pages.ts (renderToString)  -> dist-ssr/pages.json
HTML shells     -> vite build (injectPrerenderedPages) -> dist/
Browser         -> main.tsx -> hydrateRoot()
```

Every URL is its own HTML entry in a Vite multi-page app, so navigation uses ordinary links and there is no client-side router. React renders each page once at build time, and the output is plain static files. In the browser, React hydrates the existing HTML using the same data, embedded in the page as JSON, to attach the interactive parts such as the theme toggle and comments. No server runtime is involved.

## 🔍 Things I Worked Through

- **Moving to React without becoming an SPA.** The site started with Vanilla TypeScript, Web Components for the header and footer, and cards fetched from JSON in the browser. I moved it to React while keeping the MPA, the URLs, and the Markdown pipeline. The full story is in [Migrating My Personal Website from Vanilla TypeScript to React Without Losing the MPA](/blog/posts/migrating-personal-website-to-react/).
- **Hydration parity.** The browser has to render exactly what the build rendered. The active navigation link comes from a prop instead of `window.location`, dates are formatted in UTC, and the theme button renders without an icon until it reads `localStorage` after hydration.
- **Theme and code blocks.** Shiki's `light-dark()` colors followed the OS setting instead of the site's theme toggle. Setting `color-scheme` from the `.dark` class on `<html>` keeps code blocks in sync with the selected theme.

## 🛠 Tech Stack

- **UI:** React 19, TypeScript, Tailwind CSS v4
- **Build:** Vite (Multi-Page App / MPA), `tsx` build scripts
- **Content:** Markdown with YAML frontmatter (`gray-matter`, `marked`, `shiki`)
- **Comments:** Giscus
- **Hosting:** Vercel (static files only, no server runtime)

## 🚀 Quick Start

### Installation

```bash
git clone https://github.com/haicuong/personal-website.git
cd personal-website
npm install
```

### Local Development

```bash
npm run dev          # Generate posts and metadata, then start the dev server (http://localhost:5173)
npm run build        # Production build
npm run preview      # Preview the production build
```

## 📝 Adding Content

### Blog Post

Create a file in `blog/content/` (e.g., `my-post.md`):

```yaml
---
title: "My Blog Post"
date: "2026-01-15"
lastEditedDate: "2026-01-20"
description: "A short summary"
tags: ["Technical Note", "React"]
coverImage: "/images/blog/my-post/cover.webp"
---

Your post content here...
```

### Project

Create a file in `projects/content/` (e.g., `my-project.md`):

```yaml
---
title: "My Project"
date: "2026-01-15"
description: "What this project does"
techStack: ["React", "TypeScript", "TailwindCSS"]
repoUrl: "https://github.com/user/repo"
liveUrl: "https://project.example.com"
coverImage: "/images/projects/my-project/cover.webp"
---

Your project description here...
```

Run `npm run dev` or `npm run build` to generate the page and refresh the cards.

## 📁 Project Structure

```text
├── index.html                 # Home page shell
├── 404.html                   # 404 page shell
├── blog/
│   ├── index.html             # Blog index shell
│   ├── content/               # Markdown source files
│   ├── posts/                 # Generated pages (Git-ignored)
│   └── templates/             # Post page template
├── projects/
│   ├── index.html             # Projects index shell
│   ├── content/               # Markdown source files
│   ├── posts/                 # Generated pages (Git-ignored)
│   └── templates/             # Project page template
├── public/                    # Static assets & generated metadata
│   ├── blogs.json
│   ├── projects.json
│   └── images/
├── src/
│   ├── components/            # Shared React components
│   ├── pages/                 # React page components
│   ├── hooks/                 # Theme hook
│   ├── scripts/               # Client entry, utilities, build scripts
│   └── styles/                # Tailwind CSS
├── vite.config.ts
└── tsconfig.json
```

## 🔄 Build Process

1. Generate project pages and `projects.json` from `projects/content/`
2. Generate blog pages and `blogs.json` from `blog/content/`
3. Prerender the home, listing, and 404 pages with their cards into `dist-ssr/pages.json`
4. Lint CSS (Stylelint, zero warnings)
5. Type-check TypeScript
6. Bundle with Vite → `dist/`

Generated files are Git-ignored and recreated on each build.

## 🛠 For Developers

For the rendering and hydration flow, build pipeline details, and conventions, see [DEVELOPMENT.md](https://github.com/haicuong/personal-website/blob/main/DEVELOPMENT.md).

## 🚀 Deployment

Built output is in `dist/`. Deploy to:
- Vercel
- GitHub Pages
- Netlify
- Any static host

No server-side runtime required.

## 📖 License

Personal portfolio — see repository for details.
