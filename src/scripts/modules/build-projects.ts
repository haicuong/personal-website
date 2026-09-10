import { buildContent } from "./build-content";
import type { ProjectFrontmatterData, ProjectMetadata } from "../types";
import { renderTags } from "../tags-render";

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
}).catch(console.error);
