export interface CrawlRun {
  created_at?: string;
  domain: string;
  type?: string;
  max_page_count?: number;
  run_id: string;
  dataset_id?: string;
  status?: string;
}

export interface CrawlPage {
  url: string;
  created_at?: string;
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
