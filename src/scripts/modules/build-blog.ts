import { buildContent } from "./build-content";
import type { BlogFrontmatterData, BlogMetadata } from "../types";

buildContent<BlogFrontmatterData, BlogMetadata>({
  contentDir: "blog/content",
  templatePath: "blog/templates/post-template.html",
  outputDir: "blog/posts",
  indexJsonPath: "public/blogs.json",
  toMetaData: (slug: string, data: BlogFrontmatterData) => {
    return {
      slug,
      url: `/blog/posts/${slug}/`,
      title: data.title || slug,
      date: data.date || "",
      description: data.description || "",
      tags: data.tags || [],
      coverImage: data.coverImage || "",
    };
  },
}).catch(console.error);
