import { ApifyClient } from 'apify-client';
import { insertCrawlRun, updateCrawlRun, insertPageData, getCrawlRun } from './supabaseClient';
import { prepareApifyInput } from './apifyInput';

// Initialize the ApifyClient with your API token
const client = new ApifyClient({
  token: process.env.NEXT_PUBLIC_APIFY_TOKEN || '',
});

// Keep track of ongoing crawls
const ongoingCrawls = new Set<string>();

export interface CrawlOptions {
  url: string;
  maxPages?: number;
  scope: string;
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
}

export async function runCrawl(options: CrawlOptions): Promise<string> {
  const { url, maxPages = 1000, scope } = options;

  if (ongoingCrawls.has(url)) {
    throw new Error("A crawl for this site is already in progress.");
  }

  ongoingCrawls.add(url);

  try {
    // Prepare the input for the Actor
    const input = prepareApifyInput(url, maxPages.toString(), scope);

    // Run the Actor and get the run ID
    const run = await client.actor("apify/cheerio-scraper").call(input);

    // Insert a new Crawl-Run record with the Apify run ID
    const crawlRun = await insertCrawlRun({
      run_id: run.id, // Use the Apify run ID here
      domain: url,
      type: 'cheerio-scraper',
      max_page_count: maxPages,
      status: 'running'
    });

    // Start a background process to handle the results
    handleCrawlResults(run.id, crawlRun.run_id);

    return crawlRun.run_id; // Return the Supabase Crawl-Run ID
  } finally {
    ongoingCrawls.delete(url);
  }
}

async function handleCrawlResults(apifyRunId: string, crawlRunId: string) {
  try {
    const run = await client.run(apifyRunId).waitForFinish();
    const { items } = await client.dataset(run.defaultDatasetId).listItems();

    // Update the Crawl-Run record
    await updateCrawlRun(crawlRunId, items.length, 'completed');

    // Insert page data into Supabase
    for (const item of items) {
      await insertPageData(crawlRunId, item as CrawlResult);
    }
  } catch (error) {
    console.error('Error handling crawl results:', error);
    await updateCrawlRun(crawlRunId, 0, 'failed');
  }
}

export async function getCrawlProgress(runId: string) {
  return getCrawlRun(runId);
}

export function isCrawlInProgress(url: string): boolean {
  return ongoingCrawls.has(url);
}