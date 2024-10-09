import { createClient } from '@supabase/supabase-js'
import { CrawlResult } from './apifyClient';

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

export async function insertCrawlRun(crawlRun: Omit<CrawlRun, 'dataset_id'>): Promise<CrawlRun> {
  console.log(`Attempting to insert Crawl-Run for domain: ${crawlRun.domain}`);

  const { data, error } = await supabase
    .from('Crawl-Run')
    .insert(crawlRun)
    .select()
    .single();

  if (error) {
    console.error(`Failed to insert Crawl-Run: ${error.message}`);
    throw new Error(`Failed to insert Crawl-Run: ${error.message}`);
  }

  console.log('Crawl-Run inserted successfully:', data);
  return data;
}

export async function updateCrawlRun(run_id: string, max_page_count: number, status: string) {
  const { error } = await supabase
    .from('Crawl-Run')
    .update({ max_page_count, status })
    .eq('run_id', run_id)

  if (error) {
    throw error
  }
}

export async function insertPageData(run_id: string, pageData: CrawlResult): Promise<void> {
  console.log(`Attempting to insert page data for Crawl-Run id: ${run_id}`);

  const { error } = await supabase
    .from('Crawl-Pages')
    .insert({
      run_id,
      url: pageData.url,
      title: pageData.title,
      content_type: pageData.contentType,
      body: pageData.bodyContent,
      custom_fields: JSON.stringify({
        h1: pageData.h1,
        metaDescription: pageData.metaDescription,
        canonicalUrl: pageData.canonicalUrl,
        ogMetadata: pageData.ogMetadata,
        jsonLd: pageData.jsonLd,
      })
    });

  if (error) {
    console.error(`Failed to insert page data: ${error.message}`);
    throw new Error(`Failed to insert page data: ${error.message}`);
  }

  console.log('Page data inserted successfully');
}

export async function getCrawlRun(run_id: string): Promise<CrawlRun | null> {
  console.log(`Attempting to fetch Crawl-Run with run_id: ${run_id}`);

  const { data, error } = await supabase
    .from('Crawl-Run')
    .select('*')
    .eq('run_id', run_id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      console.log(`No Crawl-Run found with run_id: ${run_id}`);
      return null;
    }
    console.error(`Error fetching Crawl-Run: ${error.message}`);
    throw new Error(`Error fetching Crawl-Run: ${error.message}`);
  }

  console.log('Crawl-Run fetched successfully:', data);
  return data;
}

export async function checkExistingCrawl(domain: string) {
  const { data, error } = await supabase
    .from('Crawl-Run')
    .select('run_id, status')
    .eq('domain', domain)
    .order('created_at', { ascending: false })
    .limit(1)

  if (error) {
    throw error
  }

  return data[0] || null
}

export async function getCrawlRunData(run_id: string) {
  const { data, error } = await supabase
    .from('Crawl-Run')
    .select('*')
    .eq('run_id', run_id)
    .single()

  if (error) {
    throw error
  }

  return data
}

export async function getPageData(run_id: string) {
  const { data, error } = await supabase
    .from('Crawl-Pages')
    .select('*')
    .eq('run_id', run_id)

  if (error) {
    throw error
  }

  return data
}

export async function getCrawlRuns(): Promise<CrawlRun[]> {
  const { data, error } = await supabase
    .from('Crawl-Run')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    throw error
  }

  return data
}

export async function getCrawlRunWithPages(run_id: string): Promise<{ crawlRun: CrawlRun, pages: any[] }> {
  const { data: crawlRun, error: crawlRunError } = await supabase
    .from('Crawl-Run')
    .select('*')
    .eq('run_id', run_id)
    .single();

  if (crawlRunError) throw crawlRunError;

  const { data: pages, error: pagesError } = await supabase
    .from('Crawl-Pages')
    .select('*')
    .eq('run_id', run_id);

  if (pagesError) throw pagesError;

  return { crawlRun, pages };
}

export async function updateCrawlRunStatus(run_id: string, status: string) {
  const { error } = await supabase
    .from('Crawl-Run')
    .update({ status })
    .eq('run_id', run_id);

  if (error) throw error;
}