import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { marked } from "marked";
import { createHighlighter } from "shiki";
import { serializePageData } from "../date-format";
import type {
  BaseMetadata,
  BaseFrontmatterData,
  BuildContentOptions,
} from "../types";

//MODULE, DO NOT EXPORT

const ALLOWED_OUTPUT_DIRS = new Set(["blog/posts", "projects/posts"]);

function resolveValidatedOutputDir(repoRoot: string, outputDir: string) {
  const normalizedOutputRel = path.posix.normalize(
    outputDir
      .trim()
      .replace(/\\/g, "/")
      .replace(/^\/+|\/+$/g, ""),
  );

  if (!ALLOWED_OUTPUT_DIRS.has(normalizedOutputRel)) {
    throw new Error(
      `Refusing to write or clean disallowed outputDir: "${outputDir}"`,
    );
  }

  const resolvedOutputDir = path.resolve(repoRoot, normalizedOutputRel);
  const relativeFromRoot = path
    .relative(repoRoot, resolvedOutputDir)
    .replace(/\\/g, "/");

  if (
    relativeFromRoot !== normalizedOutputRel ||
    relativeFromRoot.startsWith("..") ||
    path.isAbsolute(relativeFromRoot)
  ) {
    throw new Error(
      `Invalid resolved output directory path: "${resolvedOutputDir}"`,
    );
  }

  return { normalizedOutputRel, resolvedOutputDir };
}

function cleanObsoletePostDirectories(
  outputPostsDir: string,
  normalizedOutputRel: string,
  activeSlugs: ReadonlySet<string>,
) {
  if (!fs.existsSync(outputPostsDir)) return;

  const entries = fs.readdirSync(outputPostsDir, { withFileTypes: true });
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    if (activeSlugs.has(entry.name)) continue;

    if (
      entry.name.includes("..") ||
      entry.name.includes("/") ||
      entry.name.includes("\\")
    ) {
      throw new Error(`Unsafe directory name encountered: "${entry.name}"`);
    }

    const obsoleteDir = path.resolve(outputPostsDir, entry.name);
    if (path.dirname(obsoleteDir) !== outputPostsDir) {
      throw new Error(
        `Refusing to remove directory outside ${outputPostsDir}: "${obsoleteDir}"`,
      );
    }

    const subEntries = fs.readdirSync(obsoleteDir);
    if (subEntries.length > 0) {
      throw new Error(
        `Build aborted: Found an unexpected nested directory structure at "${obsoleteDir}". ` +
          `The project is designed for flat markdown structures only. Please manually review and fix this layout.`,
      );
    }

    fs.rmSync(obsoleteDir, { recursive: true, force: true });
    console.log(
      `Removed obsolete generated post directory: ${normalizedOutputRel}/${entry.name}`,
    );
  }
}

export async function buildContent<
  TFrontmatter extends BaseFrontmatterData,
  TMetadata extends BaseMetadata,
>(options: BuildContentOptions<TFrontmatter, TMetadata>): Promise<void> {
  const repoRoot = path.resolve(process.cwd());
  const { normalizedOutputRel, resolvedOutputDir: OUTPUT_POSTS_DIR } =
    resolveValidatedOutputDir(repoRoot, options.outputDir);

  const CONTENT_DIR = path.resolve(repoRoot, options.contentDir);
  const TEMPLATE_PATH = path.resolve(repoRoot, options.templatePath);
  const INDEX_JSON_PATH = path.resolve(repoRoot, options.indexJsonPath);

  if (!fs.existsSync(TEMPLATE_PATH)) {
    throw new Error(`Template not found at: ${TEMPLATE_PATH}`);
  }

  if (!fs.existsSync(CONTENT_DIR) || !fs.statSync(CONTENT_DIR).isDirectory()) {
    throw new Error(
      `Content directory is missing or unreadable: ${CONTENT_DIR}`,
    );
  }

  const files = fs
    .readdirSync(CONTENT_DIR)
    .filter((file) => file.endsWith(".md"));

  if (files.length === 0) {
    throw new Error(
      `No valid Markdown files found in ${CONTENT_DIR}; aborting build.`,
    );
  }

  const activeSlugs = new Set(
    files.map((file) => file.replace(/\.md$/, "")).filter(Boolean),
  );

  cleanObsoletePostDirectories(
    OUTPUT_POSTS_DIR,
    normalizedOutputRel,
    activeSlugs,
  );

  const template = fs.readFileSync(TEMPLATE_PATH, "utf-8");

  const highlighter = await createHighlighter({
    themes: ["github-dark", "github-light"],
    langs: [
      "javascript",
      "typescript",
      "html",
      "css",
      "json",
      "bash",
      "yaml",
      "markdown",
      "tsx",
    ],
  });

  marked.use({
    renderer: {
      code({ text, lang }: { text: string; lang?: string }): string {
        const loadedLangs = highlighter.getLoadedLanguages();
        const validLang = lang && loadedLangs.includes(lang) ? lang : "text";
        return highlighter.codeToHtml(text, {
          lang: validLang,
          themes: {
            light: "github-light",
            dark: "github-dark",
          },
          defaultColor: false,
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

  const metadataList: TMetadata[] = [];

  for (const file of files) {
    const slug = file.replace(/\.md$/, "");
    const rawContent = fs.readFileSync(path.join(CONTENT_DIR, file), "utf-8");

    const parsed = matter(rawContent);
    const data = parsed.data as TFrontmatter;

    const htmlContent = await marked.parse(parsed.content);
    const metadata = options.toMetaData(slug, data);

    let finalHtml = template
      .replaceAll("{{COVER_IMAGE_URL}}", () => data.coverImage || "")
      .replaceAll("{{TITLE}}", () => data.title || "Untitled Post")
      .replaceAll("{{DESCRIPTION}}", () => data.description || "")
      .replaceAll("{{CONTENT}}", () => htmlContent)
      .replaceAll("{{CREATED_DATE}}", () => data.date || "");

    const templateValues = options.templateValues?.(data) || {};

    for (const [key, value] of Object.entries(templateValues)) {
      finalHtml = finalHtml.replaceAll(`{{${key}}}`, () => value);
    }

    if (options.renderPage) {
      const { ssrHtml, pageData } = options.renderPage(
        slug,
        data,
        metadata,
        htmlContent,
      );
      finalHtml = finalHtml
        .replaceAll("{{SSR_HTML}}", () => ssrHtml)
        .replaceAll("{{PAGE_DATA}}", () => serializePageData(pageData));
    }

    const postDir = path.join(OUTPUT_POSTS_DIR, slug);
    fs.mkdirSync(postDir, { recursive: true });
    fs.writeFileSync(path.join(postDir, "index.html"), finalHtml);

    metadataList.push(metadata);
  }

  //Default sort by date, for recent posts
  metadataList.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );

  fs.mkdirSync(path.dirname(INDEX_JSON_PATH), { recursive: true });
  fs.writeFileSync(INDEX_JSON_PATH, JSON.stringify(metadataList, null, 2));

  console.log(
    `Successfully compiled ${metadataList.length} post(s) and generated ${options.indexJsonPath}`,
  );

  highlighter.dispose();
}
