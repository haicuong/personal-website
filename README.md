# Nguyen Hai Cuong's Digital Garden & Portfolio

A personal portfolio and digital garden showcasing software engineering projects and technical notes.

**🌐 Live Website:** [haicuong.me](https://haicuong.me)

## ✨ Features

- **React + Vite MPA with Static Prerendering** — Each route is a static HTML entry point prerendered at build time with React (`renderToString`) and hydrated on the client (`hydrateRoot`)
- **Markdown-Driven Content** — Write blog posts and project write-ups in Markdown (`blog/content/`, `projects/content/`); build scripts compile static HTML pages and JSON metadata
- **Prerendered Listing Cards** — Project and blog cards on `/`, `/blog/`, and `/projects/` are prerendered into production HTML at build time with zero client-side JSON re-fetching
- **Post Comments** — Blog and project articles include Giscus-powered comments mounted client-side after hydration
- **3-State Theme Toggle** — Cycles `system → dark → light → system`, persisted in `localStorage` with an inline `<head>` script to prevent flash of unstyled content (FOUC)
- **Responsive Design** — Styled with Tailwind CSS v4 and `@tailwindcss/typography`
- **Strict Quality Gates** — Enforced Stylelint (`--max-warnings 0`) and strict TypeScript checks on every build

## 🛠 Tech Stack

- **UI Library:** React 19 (`react`, `react-dom`)
- **Build Tool:** Vite 8 (`appType: "mpa"`, `@vitejs/plugin-react`)
- **Language:** TypeScript 6 (strict mode)
- **Styling:** Tailwind CSS v4 (`@tailwindcss/vite`, `@tailwindcss/typography`)
- **Content Pipeline:** `gray-matter`, `marked`, `shiki` (`tsx` build runners)
- **Hosting:** Static hosting (Vercel)

## 🚀 Quick Start

### Installation

```bash
git clone https://github.com/haicuong/personal-website.git
cd personal-website
npm install
```

### Commands

```bash
npm run dev          # Generate posts/metadata and start Vite dev server (http://localhost:5173)
npm run build        # Full production build (posts -> pages SSR -> CSS lint -> tsc -> Vite build)
npm run preview      # Preview production build from dist/
npm run lint:css     # Lint CSS with Stylelint (zero warnings allowed)
```

## 📝 Adding Content

### Blog Post

Create a Markdown file in `blog/content/` (e.g., `my-post.md`):

```yaml
---
title: "My Blog Post"
date: "2026-01-15"
lastEditedDate: "2026-01-20"
description: "A short summary"
tags: ["React", "TypeScript", "Technical Note"]
coverImage: "/images/blog/my-post/cover.webp"
---

Your post content here...
```

Run `npm run dev` or `npm run build` to generate `/blog/posts/my-post/` and update `public/blogs.json`.

### Project

Create a Markdown file in `projects/content/` (e.g., `my-project.md`):

```yaml
---
title: "My Project"
date: "2026-01-15"
description: "What this project does"
techStack: ["React", "TypeScript", "TailwindCSS", "Vite"]
repoUrl: "https://github.com/user/repo"
liveUrl: "https://project.example.com"
coverImage: "/images/projects/my-project/cover.webp"
---

Your project description here...
```

Run `npm run dev` or `npm run build` to generate `/projects/posts/my-project/` and update `public/projects.json`.

## 📁 Project Structure

```text
├── index.html                  # Homepage HTML shell (data-page="home")
├── 404.html                    # 404 HTML shell (data-page="404")
├── blog/
│   ├── index.html              # Blog index HTML shell (data-page="blog-index")
│   ├── content/                # Source blog Markdown files (*.md)
│   ├── posts/                  # Generated blog post HTML pages (Git-ignored)
│   └── templates/
│       └── blog-template.html  # Blog post HTML template
├── projects/
│   ├── index.html              # Projects index HTML shell (data-page="projects-index")
│   ├── content/                # Source project Markdown files (*.md)
│   ├── posts/                  # Generated project post HTML pages (Git-ignored)
│   └── templates/
│       └── project-template.html
├── public/
│   ├── blogs.json              # Generated blog metadata (Git-ignored)
│   ├── projects.json           # Generated project metadata (Git-ignored)
│   ├── icon/                   # Theme toggle icons
│   └── images/                 # Blog and project static assets
├── dist-ssr/
│   └── pages.json              # Intermediate prerendered static page manifest (Git-ignored)
├── src/
│   ├── components/             # Shared React components (Layout, SiteHeader, SiteFooter, cards, tags, Giscus)
│   ├── pages/                  # React page components (Home, BlogIndex, ProjectsIndex, BlogPost, ProjectPost, NotFound)
│   ├── hooks/                  # React hooks (use-theme.ts)
│   ├── scripts/
│   │   ├── main.tsx            # Client React entry point (hydrateRoot / createRoot dispatcher)
│   │   ├── date-format.ts      # Deterministic date formatting & JSON serialization helpers
│   │   ├── tags-render.ts      # Tag color map & tag HTML helper
│   │   ├── types.ts            # Shared TypeScript interfaces
│   │   └── modules/            # Node build scripts (build-content, build-projects, build-blog, build-pages)
│   └── styles/
│       └── main.css            # Tailwind CSS v4 imports and base styles
├── vite.config.ts              # Vite MPA config, theme script plugin, and prerender injection plugin
└── tsconfig.json               # Strict TypeScript configuration
```

## 🔄 Build Pipeline

`npm run build` executes in strict order:

1. `tsx src/scripts/modules/build-projects.ts` — Compiles `projects/content/*.md` into `projects/posts/<slug>/index.html` and `public/projects.json`
2. `tsx src/scripts/modules/build-blog.ts` — Compiles `blog/content/*.md` into `blog/posts/<slug>/index.html` and `public/blogs.json`
3. `tsx src/scripts/modules/build-pages.ts` — Prerenders `HomePage`, `BlogIndexPage`, `ProjectsIndexPage`, and `NotFoundPage` (with all cards) into `dist-ssr/pages.json`
4. `npm run lint:css` — Lints `src/**/*.css` with Stylelint (`--max-warnings 0`)
5. `tsc` — Type-checks all TypeScript and JSX modules
6. `vite build` — Injects prerendered HTML/data into the static shells and bundles all MPA entry points into `dist/`

## 🛠 Developer Documentation

For architecture details, SSR/hydration data flow, dev vs. production behavior, cleanup safeguards, and known issues, see [DEVELOPMENT.md](DEVELOPMENT.md). Agent-specific rules and constraints are defined in [AGENTS.md](AGENTS.md).

## 🚀 Deployment

The production build outputs static files to `dist/` and can be deployed to any static host (Vercel, GitHub Pages, Cloudflare Pages, Netlify) without a server runtime.
