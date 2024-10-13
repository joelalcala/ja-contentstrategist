export interface ApiResponse<T> {
  data: T | null;
  error?: string;
}


export interface CrawlPage {
  page_id: string;
  url: string;
  title: string | null;
  content_type: string | null;
  body: string | null;
  custom_fields: Record<string, any> | null;
  run_id: string;
  created_at: string;
}

