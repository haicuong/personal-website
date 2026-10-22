import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { ProjectPostPage } from "../../pages/ProjectPostPage";
import { formatDisplayDate } from "../date-format";
import { renderTags } from "../tags-render";
import type {
  ProjectFrontmatterData,
  ProjectMetadata,
  ProjectPostPageData,
} from "../types";
import { buildContent } from "./build-content";

buildContent<ProjectFrontmatterData, ProjectMetadata>({
  contentDir: "projects/content",
  templatePath: "projects/templates/project-template.html",
  outputDir: "projects/posts",
  indexJsonPath: "public/projects.json",
  toMetaData: (slug: string, data: ProjectFrontmatterData) => {
    return {
      slug,
      url: `/projects/posts/${slug}/`,
      title: data.title || slug,
      date: data.date || "",
      description: data.description || "",
      techStack: data.techStack || [],
      repoUrl: data.repoUrl || "",
      liveUrl: data.liveUrl || "",
      coverImage: data.coverImage || "",
    };
  },
  templateValues: (data: ProjectFrontmatterData) => ({
    LIVE_URL: data.liveUrl
      ? `<a href="${data.liveUrl}" target="_blank" rel="noopener noreferrer">${data.liveUrl.replace("https://", "")}</a>`
      : "Updating...",
    REPO_URL: data.repoUrl
      ? `<a href="${data.repoUrl}" target="_blank" rel="noopener noreferrer">${data.repoUrl.replace("https://github.com/", "@")}</a>`
      : "Updating...",
    TECHSTACKS: data.techStack ? renderTags(data.techStack) : "",
  }),
  renderPage: (
    _slug: string,
    data: ProjectFrontmatterData,
    metadata: ProjectMetadata,
    contentHtml: string,
  ) => {
    const project: ProjectPostPageData = {
      ...metadata,
      title: data.title || "Untitled Post",
      createdDateFormatted: formatDisplayDate(data.date, ""),
      contentHtml,
    };

    return {
      ssrHtml: renderToString(createElement(ProjectPostPage, { project })),
      pageData: { project },
    };
  },
}).catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
