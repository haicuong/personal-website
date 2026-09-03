import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { marked } from "marked";
import { createHighlighter } from "shiki";
import type {
  ProjectMetadata,
  ProjectFrontmatterData,
} from "./types/projects-types";

//MODULE, DO NOT EXPORT

const CONTENT_DIR = path.resolve("projects/content");
//TODO: create project template
const TEMPLATE_PATH = path.resolve("blog/templates/post-template.html");
const OUTPUT_POSTS_DIR = path.resolve("projects/posts");
const INDEX_JSON_PATH = path.resolve("public/projects.json");

async function buildProjects(): Promise<void> {
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
      link({ href, title, text }) {
        const isExternal =
          href.startsWith("http://") || href.startsWith("https://");

        const titleAttribute = title ? `title="${title}"` : "";
        const securityAttributes = isExternal
          ? 'target="_blank" rel="noopener noreferrer"'
          : "";

        return `<a href="${href}" ${titleAttribute} ${securityAttributes}>${text}</a>`;
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
  const metadataList: ProjectMetadata[] = [];

  for (const file of files) {
    const slug = file.replace(/\.md$/, "");
    const rawContent = fs.readFileSync(path.join(CONTENT_DIR, file), "utf-8");

    const parsed = matter(rawContent);
    const data = parsed.data as ProjectFrontmatterData;

    const htmlContent = await marked.parse(parsed.content);

    const finalHtml = template
      .replaceAll("{{COVER_IMAGE_URL}}", data.coverImage || "")
      .replaceAll("{{TITLE}}", data.title || "Untitled Project")
      .replaceAll("{{DESCRIPTION}}", data.description || "")
      .replaceAll("{{CONTENT}}", htmlContent);

    const postDir = path.join(OUTPUT_POSTS_DIR, slug);
    fs.mkdirSync(postDir, { recursive: true });
    fs.writeFileSync(path.join(postDir, "index.html"), finalHtml);

    metadataList.push({
      slug,
      url: `/projects/posts/${slug}/`,
      title: data.title || slug,
      date: data.date || "",
      description: data.description || "",
      techStack: data.techStack || [],
      repoUrl: data.repoUrl || "",
      liveUrl: data.liveUrl || "",
      coverImage: data.coverImage || "",
    });
  }

  metadataList.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );

  fs.mkdirSync(path.dirname(INDEX_JSON_PATH), { recursive: true });
  fs.writeFileSync(INDEX_JSON_PATH, JSON.stringify(metadataList, null, 2));

  console.log(
    `Successfully compiled ${metadataList.length} project(s) and generated public/projects.json`,
  );

  highlighter.dispose();
}

buildProjects().catch(console.error);
