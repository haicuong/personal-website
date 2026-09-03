export interface PostMetadata {
  slug: string;
  url: string;
  title: string;
  date: string;
  description: string;
  tags: string[];
  coverImage: string;
}

export interface BlogFrontmatterData {
  title?: string;
  date?: string;
  description?: string;
  tags?: string[];
  coverImage?: string;
}
