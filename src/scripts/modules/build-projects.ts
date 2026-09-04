import { buildContent } from "./build-content";
import type { ProjectFrontmatterData, ProjectMetadata } from "../types";

buildContent<ProjectFrontmatterData, ProjectMetadata>({
  contentDir: "projects/content",
  templatePath: "blog/templates/post-template.html",
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
}).catch(console.error);
