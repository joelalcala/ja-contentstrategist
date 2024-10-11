export interface Page {
  id: string;
  url: string;
  title: string;
  path: string;
  type: string;
  fields: Record<string, any>;
  description: string;
  metaDescription: string;
}

export interface CrawlResult {
  url: string;
  pageTitle: string;
  h1: string;
  first_h2: string;
  random_text_from_the_page: string;
  metaDescription: string;
  canonicalUrl: string;
  ogMetadata: Record<string, string>;
  jsonLd?: any;
  processedRequestCount: number;
}

export interface CrawlOptions {
  url: string;
  maxPages?: number;
  scope: string;
}