import fs from "node:fs";
import path from "node:path";
import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { BlogIndexPage } from "../../pages/BlogIndexPage";
import { HomePage } from "../../pages/HomePage";
import { NotFoundPage } from "../../pages/NotFoundPage";
import { ProjectsIndexPage } from "../../pages/ProjectsIndexPage";
import type {
  BlogMetadata,
  PrerenderedPagesManifest,
  ProjectMetadata,
} from "../types";

const repoRoot = path.resolve(process.cwd());
const projectsJsonPath = path.resolve(repoRoot, "public/projects.json");
const blogsJsonPath = path.resolve(repoRoot, "public/blogs.json");
const outputManifestPath = path.resolve(repoRoot, "dist-ssr/pages.json");

function readJsonArray<T>(filePath: string, label: string): T[] {
  if (!fs.existsSync(filePath)) {
    throw new Error(
      `Missing required ${label} metadata file at ${filePath}. Run build-projects.ts and build-blog.ts first.`,
    );
  }

  const raw = fs.readFileSync(filePath, "utf-8");
  const parsed: unknown = JSON.parse(raw);

  if (!Array.isArray(parsed)) {
    throw new Error(
      `Expected ${label} metadata at ${filePath} to be a JSON array.`,
    );
  }

  return parsed as T[];
}

function buildPages(): void {
  const projects = readJsonArray<ProjectMetadata>(projectsJsonPath, "projects");
  const blogs = readJsonArray<BlogMetadata>(blogsJsonPath, "blogs");

  const homeHtml = renderToString(
    createElement(HomePage, { projects, blogs }),
  );
  const blogIndexHtml = renderToString(
    createElement(BlogIndexPage, { blogs }),
  );
  const projectsIndexHtml = renderToString(
    createElement(ProjectsIndexPage, { projects }),
  );
  const notFoundHtml = renderToString(createElement(NotFoundPage));

  if (
    !homeHtml.trim() ||
    !blogIndexHtml.trim() ||
    !projectsIndexHtml.trim() ||
    !notFoundHtml.trim()
  ) {
    throw new Error("Prerendered static page output must not be empty.");
  }

  const manifest: PrerenderedPagesManifest = {
    home: {
      ssrHtml: homeHtml,
      pageData: { projects, blogs },
    },
    "blog-index": {
      ssrHtml: blogIndexHtml,
      pageData: { blogs },
    },
    "projects-index": {
      ssrHtml: projectsIndexHtml,
      pageData: { projects },
    },
    "404": {
      ssrHtml: notFoundHtml,
      pageData: null,
    },
  };

  fs.mkdirSync(path.dirname(outputManifestPath), { recursive: true });
  fs.writeFileSync(outputManifestPath, JSON.stringify(manifest, null, 2));

  console.log(
    `Successfully prerendered 4 static page(s) (${projects.length} project card(s), ${blogs.length} blog card(s)) to dist-ssr/pages.json`,
  );
}

buildPages();

