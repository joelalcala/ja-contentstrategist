export interface Page {
  url: string;
  title: string | null;
  content_type: string | null;
  body: string | null;
  custom_fields?: Record<string, any>;
  page_id?: string;
  run_id: string;
  h1_1: string | null;
  h2_1: string | null;
  h2_2: string | null;
  jsonLd: any | null;
  lang: string | null;
  description: string | null;
  og_image: string | null;
  author: string | null;
  publication_date: string | null;
}

export interface CrawlResult {
  url: string;
  title: string | null;
  h1_1: string | null;
  h2_1: string | null;
  h2_2: string | null;
  description: string | null;
  lang: string | null;
  og_image: string | null;
  author: string | null;
  publication_date: string | null;
  content_type: string | null;
  body: string | null;
  jsonLd: any | null;
}

export interface CrawlOptions {
  url: string;
  maxPages?: number;
  scope: string;
}
