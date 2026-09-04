# Nguyen Hai Cuong's Digital Garden & Portfolio

A personal portfolio and digital garden showcasing software engineering projects and technical notes.

**🌐 Live Website:** [haicuong.me](https://haicuong.me)

## 🛠 Tech Stack

- **Framework:** Vite (Multi-Page App / MPA)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4
- **Content:** Markdown with YAML frontmatter
- **Hosting:** GitHub Pages / Vercel

## ✨ Features

- **Markdown-Driven Content** — Write posts and projects in Markdown; auto-generates static pages
- **Blog & Projects** — Two separate sections with metadata-driven card layouts
- **Web Components** — Reusable header and footer on all pages
- **Dark Mode** — Automatic light/dark mode with `prefers-color-scheme`
- **Responsive Design** — Mobile-first with Tailwind CSS
- **Production-Ready** — Built with Vite, typed with TypeScript, linted with Stylelint

## 🚀 Quick Start

### Installation

```bash
git clone https://github.com/haicuong/personal-website.git
cd personal-website
npm install
```

### Local Development

```bash
npm run dev          # Start dev server (http://localhost:5173)
npm run build        # Production build
npm run preview      # Preview production build
```

## 📝 Adding Content

### Blog Post

Create a file in `blog/content/` (e.g., `my-post.md`):

```yaml
---
title: "My Blog Post"
date: "2026-01-15"
description: "A short summary"
tags: ["typescript", "web-dev"]
coverImage: "images/blog/my-post/cover.jpg"
---

Your post content here...
```

Run `npm run dev` or `npm run build` to generate the post page automatically.

### Project

Create a file in `projects/content/` (e.g., `my-project.md`):

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

Your project description here...
```

Run the build command to generate the project page.

## 📁 Project Structure

```
├── index.html                 # Home page
├── blog/                      # Blog section
│   ├── index.html
│   ├── content/              # Markdown source files
│   ├── posts/                # Generated pages (Git-ignored)
│   └── templates/
├── projects/                  # Projects section
│   ├── index.html
│   ├── content/              # Markdown source files
│   └── posts/                # Generated pages (Git-ignored)
├── public/                    # Static assets & generated metadata
│   ├── blogs.json
│   ├── projects.json
│   └── images/
├── src/                       # TypeScript source
│   ├── scripts/
│   ├── styles/
│   └── assets/
├── 404.html
├── vite.config.ts
└── tsconfig.json
```

## 🔄 Build Process

1. Generate blog and project pages from Markdown
2. Lint CSS (Stylelint, zero warnings)
3. Type-check TypeScript
4. Bundle with Vite → `dist/`

Generated files are Git-ignored and recreated on each build.

## 🎨 Styling

Uses **Tailwind CSS v4** with utility-first approach:

- Add styles directly in HTML using Tailwind classes
- Dark mode via `dark:` prefix (e.g., `dark:bg-gray-900`)
- Responsive with `md:`, `lg:`, etc. prefixes
- Run `npm run lint:css` before committing (no warnings allowed)

## 🛠 For Developers

For detailed development conventions, TypeScript setup, Web Components patterns, build system details, and common issues, see [DEVELOPMENT.md](DEVELOPMENT.md).

## 🚀 Deployment

Built output is in `dist/`. Deploy to:
- GitHub Pages
- Vercel
- Netlify
- Any static host

No server-side runtime required.

## 📖 License

Personal portfolio — see repository for details.
