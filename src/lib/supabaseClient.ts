import { createClient } from '@supabase/supabase-js'
import { CrawlResult } from './types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export interface CrawlRun {
  run_id: string;
  domain: string;
  type: string;
  max_page_count: number;
  dataset_id: string | null;
  status: string;
}

export async function getCrawlRun(run_id: string): Promise<CrawlRun | null> {
  const { data, error } = await supabase
    .from('Crawl-Run')
    .select('*')
    .eq('run_id', run_id)
    .single();

  if (error) {
    console.error('Error fetching crawl run:', error);
    return null;
  }

  return data as CrawlRun;
}

export async function insertCrawlRun(crawlRun: Omit<CrawlRun, 'id'>): Promise<CrawlRun> {
  const { data, error } = await supabase
    .from('Crawl-Run')
    .insert(crawlRun)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function updateCrawlRun(run_id: string, pageCount: number, status: string) {
  const { error } = await supabase
    .from('Crawl-Run')
    .update({ max_page_count: pageCount, status })
    .eq('run_id', run_id);

  if (error) {
    throw error;
  }
}

export async function insertPageData(run_id: string, pageData: CrawlResult): Promise<void> {
  const { error } = await supabase
    .from('Crawl-Pages')
    .insert({
      run_id,
      url: pageData.url,
      title: pageData.pageTitle,
      content_type: null,
      body: pageData.random_text_from_the_page,
      custom_fields: JSON.stringify({
        h1: pageData.h1,
        first_h2: pageData.first_h2,
        metaDescription: pageData.metaDescription,
        canonicalUrl: pageData.canonicalUrl,
        ogMetadata: pageData.ogMetadata,
        jsonLd: pageData.jsonLd,
      })
    });

  if (error) {
    throw error;
  }
}