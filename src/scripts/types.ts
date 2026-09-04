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
  tags: string[];
}

export interface BlogFrontmatterData extends BaseFrontmatterData {
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

export interface BuildContentOptions<
  TFrontmatter extends BaseFrontmatterData,
  TMetadata extends BaseMetadata,
> {
  contentDir: string;
  templatePath: string;
  outputDir: string;
  indexJsonPath: string;
  toMetaData: (slug: string, data: TFrontmatter) => TMetadata;
}
