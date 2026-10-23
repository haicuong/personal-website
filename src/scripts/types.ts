export interface BaseMetadata {
  slug: string;
  url: string;
  title: string;
  date: string;
  description: string;
  coverImage: string;
}

export interface BaseFrontmatterData {
  title?: string;
  date?: string;
  description?: string;
  coverImage?: string;
}

export interface BlogMetadata extends BaseMetadata {
  lastEditedDate: string;
  tags: string[];
}

export interface BlogFrontmatterData extends BaseFrontmatterData {
  lastEditedDate?: string;
  tags?: string[];
}

export interface ProjectMetadata extends BaseMetadata {
  techStack: string[];
  repoUrl: string;
  liveUrl: string;
}

export interface ProjectFrontmatterData extends BaseFrontmatterData {
  techStack?: string[];
  repoUrl?: string;
  liveUrl?: string;
}

export interface BlogPostPageData extends BlogMetadata {
  createdDateFormatted: string;
  lastEditedDateFormatted: string;
  contentHtml: string;
}

export interface ProjectPostPageData extends ProjectMetadata {
  createdDateFormatted: string;
  contentHtml: string;
}

export type StaticPageId = "home" | "blog-index" | "projects-index" | "404";

export type PageId = StaticPageId | "blog-post" | "project-post";

export interface PrerenderedPageEntry {
  ssrHtml: string;
  pageData: unknown;
}

export type PrerenderedPagesManifest = Record<
  StaticPageId,
  PrerenderedPageEntry
>;

export interface BuildContentOptions<
  TFrontmatter extends BaseFrontmatterData,
  TMetadata extends BaseMetadata,
> {
  contentDir: string;
  templatePath: string;
  outputDir: string;
  indexJsonPath: string;
  toMetaData: (slug: string, data: TFrontmatter) => TMetadata;
  templateValues?: (data: TFrontmatter) => Record<string, string>;
  renderPage?: (
    slug: string,
    data: TFrontmatter,
    metadata: TMetadata,
    contentHtml: string,
  ) => PrerenderedPageEntry;
}
