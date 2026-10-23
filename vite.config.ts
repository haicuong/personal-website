import fs from "node:fs";
import path, { resolve } from "node:path";
import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { globSync } from "glob";
import { getThemeInitScript } from "./src/hooks/use-theme.ts";
import type {
  PrerenderedPagesManifest,
  StaticPageId,
} from "./src/scripts/types.ts";

const THEME_SCRIPT = getThemeInitScript();

const PAGE_ENTRY_MAP: Readonly<Record<string, StaticPageId>> = {
  "index.html": "home",
  "blog/index.html": "blog-index",
  "projects/index.html": "projects-index",
  "404.html": "404",
};

function serializePageData(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

function loadValidatedManifest(repoRoot: string): PrerenderedPagesManifest {
  const manifestPath = resolve(repoRoot, "dist-ssr/pages.json");
  if (!fs.existsSync(manifestPath)) {
    throw new Error(
      `Missing prerendered pages artifact at ${manifestPath}. Run build-pages.ts before vite build.`,
    );
  }

  const parsed: unknown = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));
  if (!parsed || typeof parsed !== "object") {
    throw new Error(`Invalid prerendered pages artifact at ${manifestPath}.`);
  }

  const manifest = parsed as Partial<PrerenderedPagesManifest>;
  const requiredPages: StaticPageId[] = [
    "home",
    "blog-index",
    "projects-index",
    "404",
  ];

  for (const pageId of requiredPages) {
    const entry = manifest[pageId];
    if (
      !entry ||
      typeof entry.ssrHtml !== "string" ||
      !entry.ssrHtml.trim()
    ) {
      throw new Error(
        `Prerendered pages artifact is missing valid ssrHtml for page "${pageId}".`,
      );
    }
  }

  return manifest as PrerenderedPagesManifest;
}

function loadDevPageData(repoRoot: string, pageId: StaticPageId): unknown {
  if (pageId === "404") return null;

  const projectsPath = resolve(repoRoot, "public/projects.json");
  const blogsPath = resolve(repoRoot, "public/blogs.json");

  if (pageId === "projects-index") {
    const projects: unknown = JSON.parse(fs.readFileSync(projectsPath, "utf-8"));
    return { projects };
  }

  if (pageId === "blog-index") {
    const blogs: unknown = JSON.parse(fs.readFileSync(blogsPath, "utf-8"));
    return { blogs };
  }

  const projects: unknown = JSON.parse(fs.readFileSync(projectsPath, "utf-8"));
  const blogs: unknown = JSON.parse(fs.readFileSync(blogsPath, "utf-8"));
  return { projects, blogs };
}

function injectThemeScript(): Plugin {
  return {
    name: "inject-theme-script",
    transformIndexHtml(html) {
      return html.replace("<head>", `<head>${THEME_SCRIPT}`);
    },
  };
}

function injectPrerenderedPages(): Plugin {
  const repoRoot = import.meta.dirname;

  return {
    name: "inject-prerendered-pages",
    transformIndexHtml(html, ctx) {
      const relativeFile = path
        .relative(repoRoot, ctx.filename)
        .replace(/\\/g, "/");
      const pageId = PAGE_ENTRY_MAP[relativeFile];

      if (!pageId) {
        return html;
      }

      const targetMount = `<div id="root" data-page="${pageId}"></div>`;

      if (!html.includes(targetMount)) {
        throw new Error(
          `Expected mount element ${targetMount} was not found in ${relativeFile}.`,
        );
      }

      if (html.includes('id="__PAGE_DATA__"')) {
        throw new Error(
          `Duplicate __PAGE_DATA__ script detected in ${relativeFile}.`,
        );
      }

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

      const pageData = loadDevPageData(repoRoot, pageId);
      const dataScript = `<script id="__PAGE_DATA__" type="application/json">${serializePageData(pageData)}</script>`;

      return html.replace(
        targetMount,
        () => `${targetMount}\n    ${dataScript}`,
      );
    },
  };
}

const htmlEntries = globSync(["**/index.html", "404.html"], {
  ignore: [
    "node_modules/**",
    "dist/**",
    "packages/**",
    "blog/templates/**",
    "projects/templates/**",
  ],
}).reduce(
  (acc, file) => {
    const normalized = file.replace(/\\/g, "/");
    const name =
      normalized === "404.html"
        ? "404"
        : normalized.replace(/\/index\.html$/, "").replace(/\//g, "_") ||
          "main";
    acc[name] = resolve(import.meta.dirname, file);
    return acc;
  },
  {} as Record<string, string>,
);

export default defineConfig({
  appType: "mpa",
  build: {
    rollupOptions: {
      input: htmlEntries,
    },
  },
  plugins: [react(), tailwindcss(), injectThemeScript(), injectPrerenderedPages()],
});
