export interface ProjectMetadata {
  slug: string;
  url: string;
  title: string;
  date: string;
  description: string;
  techStack: string[];
  repoUrl: string;
  liveUrl: string;
  coverImage: string;
}

export interface ProjectFrontmatterData {
  title?: string;
  date?: string;
  description?: string;
  techStack?: string[];
  repoUrl?: string;
  liveUrl?: string;
  coverImage?: string;
}
