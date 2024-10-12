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
  title?: string;
  content_type?: string;
  body?: string;
  custom_fields?: Record<string, any>;
  page_id?: string;
  run_id: string;
}
