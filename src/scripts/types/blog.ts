export interface PostMetadata {
  slug: string;
  url: string;
  title: string;
  date: string;
  description: string;
  tags: string[];
  coverImage: string;
}

export interface FrontmatterData {
  title?: string;
  date?: string;
  description?: string;
  tags?: string[];
  coverImage?: string;
}
