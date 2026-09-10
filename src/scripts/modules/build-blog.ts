import { buildContent } from "./build-content";
import type { BlogFrontmatterData, BlogMetadata } from "../types";
import { renderTags } from "../tags-render";

buildContent<BlogFrontmatterData, BlogMetadata>({
  contentDir: "blog/content",
  templatePath: "blog/templates/blog-template.html",
  outputDir: "blog/posts",
  indexJsonPath: "public/blogs.json",
  toMetaData: (slug: string, data: BlogFrontmatterData) => {
    return {
      slug,
      url: `/blog/posts/${slug}/`,
      title: data.title || slug,
      date: data.date || "",
      lastEditedDate: data.lastEditedDate || data.date || "",
      description: data.description || "",
      tags: data.tags || [],
      coverImage: data.coverImage || "",
    };
  },
  templateValues: (data: BlogFrontmatterData) => ({
    TAGS: data.tags ? renderTags(data.tags) : "No tag found",
    LAST_EDITED_DATE: data.lastEditedDate
      ? new Date(data.lastEditedDate).toLocaleDateString()
      : data.date
        ? new Date(data.date).toLocaleDateString()
        : "",
  }),
}).catch(console.error);
