/**
 * TypeScript types and interfaces for GitHub Gist data
 * Shared across all layers for type safety
 */

export type Gist = {
  id: string;
  url: string;
  html_url: string;
  description: string | null;
  public: boolean;
  created_at: string;
  updated_at: string;
  files: Record<string, GistFile>;
  owner: GistOwner;
};

export type GistFile = {
  filename: string;
  type: string;
  language: string | null;
  raw_url: string;
  size: number;
  content?: string;
};

export type GistOwner = {
  login: string;
  id: number;
  avatar_url: string;
  html_url: string;
};

export type GistFilters = {
  username?: string;
  since?: string;
  per_page?: number;
  page?: number;
};

export type GistListResponse = Gist[];
export type GistDetailResponse = Gist;
