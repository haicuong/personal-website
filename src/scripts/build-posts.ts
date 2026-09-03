import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { marked } from "marked";
import { createHighlighter } from "shiki";
import type { PostMetadata, BlogFrontmatterData } from "./types/blog-types";

//MODULE, DO NOT EXPORT

const CONTENT_DIR = path.resolve("blog/content");
const TEMPLATE_PATH = path.resolve("blog/templates/post-template.html");
const OUTPUT_POSTS_DIR = path.resolve("blog/posts");
const INDEX_JSON_PATH = path.resolve("public/posts.json");

async function buildPosts(): Promise<void> {
  const highlighter = await createHighlighter({
    themes: ["github-dark"],
    langs: ["javascript", "typescript", "html", "css", "json", "bash"],
  });

  marked.use({
    renderer: {
      code({ text, lang }: { text: string; lang?: string }): string {
        const loadedLangs = highlighter.getLoadedLanguages();
        const validLang = lang && loadedLangs.includes(lang) ? lang : "text";
        return highlighter.codeToHtml(text, {
          lang: validLang,
          theme: "github-dark",
        });
      },
    },
  });

  if (!fs.existsSync(TEMPLATE_PATH)) {
    console.error(`Template not found at: ${TEMPLATE_PATH}`);
    return;
  }

  const template = fs.readFileSync(TEMPLATE_PATH, "utf-8");

  if (!fs.existsSync(CONTENT_DIR)) {
    console.log("No blog/content directory found. Creating it...");
    fs.mkdirSync(CONTENT_DIR, { recursive: true });
  }

  const files = fs
    .readdirSync(CONTENT_DIR)
    .filter((file) => file.endsWith(".md"));
  const metadataList: PostMetadata[] = [];

  for (const file of files) {
    const slug = file.replace(/\.md$/, "");
    const rawContent = fs.readFileSync(path.join(CONTENT_DIR, file), "utf-8");

    const parsed = matter(rawContent);
    const data = parsed.data as BlogFrontmatterData;

    const htmlContent = await marked.parse(parsed.content);

    const finalHtml = template
      .replaceAll("{{COVER_IMAGE_URL}}", data.coverImage || "")
      .replaceAll("{{TITLE}}", data.title || "Untitled Post")
      .replaceAll("{{DESCRIPTION}}", data.description || "")
      .replaceAll("{{CONTENT}}", htmlContent);

    const postDir = path.join(OUTPUT_POSTS_DIR, slug);
    fs.mkdirSync(postDir, { recursive: true });
    fs.writeFileSync(path.join(postDir, "index.html"), finalHtml);

    metadataList.push({
      slug,
      url: `/blog/posts/${slug}/`,
      title: data.title || slug,
      date: data.date || "",
      description: data.description || "",
      tags: data.tags || [],
      coverImage: data.coverImage || "",
    });
  }

  metadataList.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );

  fs.mkdirSync(path.dirname(INDEX_JSON_PATH), { recursive: true });
  fs.writeFileSync(INDEX_JSON_PATH, JSON.stringify(metadataList, null, 2));

  console.log(
    `Successfully compiled ${metadataList.length} post(s) and generated public/posts.json`,
  );

  highlighter.dispose();
}

buildPosts().catch(console.error);
