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
      title: pageData.title,
      content_type: pageData.content_type,
      body: pageData.body,
      h1_1: pageData.h1_1,
      h2_1: pageData.h2_1,
      h2_2: pageData.h2_2,
      description: pageData.description,
      lang: pageData.lang,
      og_image: pageData.og_image,
      author: pageData.author,
      publication_date: pageData.publication_date,
      jsonLd: pageData.jsonLd,
    });

  if (error) {
    throw error;
  }
}
