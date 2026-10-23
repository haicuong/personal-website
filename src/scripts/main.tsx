import { StrictMode, type ReactElement } from "react";
import { createRoot, hydrateRoot } from "react-dom/client";
import { BlogIndexPage, type BlogIndexPageProps } from "../pages/BlogIndexPage";
import { BlogPostPage, type BlogPostPageProps } from "../pages/BlogPostPage";
import { HomePage, type HomePageProps } from "../pages/HomePage";
import { NotFoundPage } from "../pages/NotFoundPage";
import {
  ProjectPostPage,
  type ProjectPostPageProps,
} from "../pages/ProjectPostPage";
import {
  ProjectsIndexPage,
  type ProjectsIndexPageProps,
} from "../pages/ProjectsIndexPage";
import type {
  BaseMetadata,
  BlogMetadata,
  BlogPostPageData,
  PageId,
  ProjectMetadata,
  ProjectPostPageData,
} from "./types";
import { MotionConfig } from "motion/react";

// Fix Safari UI touch :active pseudo-class states
document.addEventListener("touchstart", () => {}, { passive: true });

const VALID_PAGE_IDS: ReadonlySet<PageId> = new Set<PageId>([
  "home",
  "blog-index",
  "projects-index",
  "404",
  "blog-post",
  "project-post",
]);

function isPageId(value: string | undefined): value is PageId {
  return typeof value === "string" && VALID_PAGE_IDS.has(value as PageId);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isStringArray(value: unknown): value is string[] {
  return (
    Array.isArray(value) && value.every((item) => typeof item === "string")
  );
}

function isBaseMetadata(value: unknown): value is BaseMetadata {
  return (
    isRecord(value) &&
    typeof value.slug === "string" &&
    typeof value.url === "string" &&
    typeof value.title === "string" &&
    typeof value.date === "string" &&
    typeof value.description === "string" &&
    typeof value.coverImage === "string"
  );
}

function isBlogMetadata(value: unknown): value is BlogMetadata {
  return (
    isBaseMetadata(value) &&
    typeof (value as unknown as Record<string, unknown>).lastEditedDate ===
      "string" &&
    isStringArray((value as unknown as Record<string, unknown>).tags)
  );
}

function isProjectMetadata(value: unknown): value is ProjectMetadata {
  return (
    isBaseMetadata(value) &&
    isStringArray((value as unknown as Record<string, unknown>).techStack) &&
    typeof (value as unknown as Record<string, unknown>).repoUrl === "string" &&
    typeof (value as unknown as Record<string, unknown>).liveUrl === "string"
  );
}

function isBlogPostPageData(value: unknown): value is BlogPostPageData {
  return (
    isBlogMetadata(value) &&
    typeof (value as unknown as Record<string, unknown>).contentHtml ===
      "string"
  );
}

function isProjectPostPageData(value: unknown): value is ProjectPostPageData {
  return (
    isProjectMetadata(value) &&
    typeof (value as unknown as Record<string, unknown>).contentHtml ===
      "string"
  );
}

function isHomePageProps(value: unknown): value is HomePageProps {
  return (
    isRecord(value) &&
    Array.isArray(value.projects) &&
    value.projects.every(isProjectMetadata) &&
    Array.isArray(value.blogs) &&
    value.blogs.every(isBlogMetadata)
  );
}

function isBlogIndexPageProps(value: unknown): value is BlogIndexPageProps {
  return (
    isRecord(value) &&
    Array.isArray(value.blogs) &&
    value.blogs.every(isBlogMetadata)
  );
}

function isProjectsIndexPageProps(
  value: unknown,
): value is ProjectsIndexPageProps {
  return (
    isRecord(value) &&
    Array.isArray(value.projects) &&
    value.projects.every(isProjectMetadata)
  );
}

function isBlogPostPageProps(value: unknown): value is BlogPostPageProps {
  return isRecord(value) && isBlogPostPageData(value.post);
}

function isProjectPostPageProps(value: unknown): value is ProjectPostPageProps {
  return isRecord(value) && isProjectPostPageData(value.project);
}

function readPageData(pageId: Exclude<PageId, "404">): unknown {
  const scriptElement = document.querySelector<HTMLScriptElement>(
    "script#__PAGE_DATA__",
  );
  if (!scriptElement) {
    throw new Error(
      `Missing <script id="__PAGE_DATA__" type="application/json"> for page "${pageId}".`,
    );
  }

  const rawJson = scriptElement.textContent?.trim();
  if (!rawJson) {
    throw new Error(`Empty #__PAGE_DATA__ JSON payload for page "${pageId}".`);
  }

  try {
    return JSON.parse(rawJson) as unknown;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(
      `Invalid JSON in #__PAGE_DATA__ for page "${pageId}": ${message}`,
    );
  }
}

function resolvePageElement(pageId: PageId): ReactElement {
  switch (pageId) {
    case "home": {
      const payload = readPageData(pageId);
      if (!isHomePageProps(payload)) {
        throw new Error(
          'Invalid #__PAGE_DATA__ payload for page "home": expected { projects: ProjectMetadata[], blogs: BlogMetadata[] }.',
        );
      }
      return <HomePage projects={payload.projects} blogs={payload.blogs} />;
    }
    case "blog-index": {
      const payload = readPageData(pageId);
      if (!isBlogIndexPageProps(payload)) {
        throw new Error(
          'Invalid #__PAGE_DATA__ payload for page "blog-index": expected { blogs: BlogMetadata[] }.',
        );
      }
      return <BlogIndexPage blogs={payload.blogs} />;
    }
    case "projects-index": {
      const payload = readPageData(pageId);
      if (!isProjectsIndexPageProps(payload)) {
        throw new Error(
          'Invalid #__PAGE_DATA__ payload for page "projects-index": expected { projects: ProjectMetadata[] }.',
        );
      }
      return <ProjectsIndexPage projects={payload.projects} />;
    }
    case "404": {
      return <NotFoundPage />;
    }
    case "blog-post": {
      const payload = readPageData(pageId);
      if (!isBlogPostPageProps(payload)) {
        throw new Error(
          'Invalid #__PAGE_DATA__ payload for page "blog-post": expected { post: BlogPostPageData }.',
        );
      }
      return <BlogPostPage post={payload.post} />;
    }
    case "project-post": {
      const payload = readPageData(pageId);
      if (!isProjectPostPageProps(payload)) {
        throw new Error(
          'Invalid #__PAGE_DATA__ payload for page "project-post": expected { project: ProjectPostPageData }.',
        );
      }
      return <ProjectPostPage project={payload.project} />;
    }
  }
}

function bootstrap() {
  const rootElement = document.getElementById("root");
  if (!rootElement) {
    throw new Error('Missing React mount element "#root".');
  }

  const rawPageId = rootElement.dataset.page;
  if (!isPageId(rawPageId)) {
    throw new Error(
      `Unknown or missing data-page attribute on "#root": ${rawPageId ? `"${rawPageId}"` : "(missing)"}.`,
    );
  }

  const pageElement = (
    <StrictMode>
      <MotionConfig
        reducedMotion="user"
        transition={{ duration: 0.3, ease: "easeInOut" }}
      >
        {resolvePageElement(rawPageId)}
      </MotionConfig>
    </StrictMode>
  );

  const isSsr = rootElement.dataset.ssr === "true";
  const hasPrerenderedMarkup = rootElement.firstElementChild !== null;

  if (isSsr) {
    if (!hasPrerenderedMarkup) {
      throw new Error(
        `Root "#root" for page "${rawPageId}" has data-ssr="true" but contains no prerendered HTML elements.`,
      );
    }
    hydrateRoot(rootElement, pageElement);
    return;
  }

  if (hasPrerenderedMarkup) {
    throw new Error(
      `Root "#root" for page "${rawPageId}" contains existing HTML elements without data-ssr="true". Refusing to call createRoot() on non-empty root.`,
    );
  }

  createRoot(rootElement).render(pageElement);
}

bootstrap();
