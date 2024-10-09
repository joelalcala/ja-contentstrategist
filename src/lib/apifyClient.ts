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
  onProgress?: (message: string, progress: number) => void;
}

export interface CrawlResult {
  url: string;
  pageTitle: string;
  h1: string;
  first_h2: string;
  random_text_from_the_page: string;
  processedRequestCount: number;
}

export async function runCrawl(options: CrawlOptions): Promise<CrawlResult[]> {
  const { url, maxPages = 1000, onProgress } = options;

  if (ongoingCrawls.has(url)) {
    throw new Error("A crawl for this site is already in progress.");
  }

  ongoingCrawls.add(url);

  try {
    onProgress?.("Initializing crawler...", 0)

    let processedPages = 0;

    // Insert a new Crawl-Run record
    const crawlRun = await insertCrawlRun({
      run_id: '', // This will be set by Supabase
      domain: url,
      type: 'web-scraper',
      max_page_count: maxPages,
      status: 'running'
    });

    // Prepare the input for the Actor
    const input = prepareApifyInput(url, maxPages.toString());

    // Run the Actor and wait for it to finish
    const run = await client.actor("apify/web-scraper").call(input);

    onProgress?.("Crawl finished, fetching results...", 100)

    // Fetch and return the results
    const { items } = await client.dataset(run.defaultDatasetId).listItems();

    // Update the Crawl-Run record
    await updateCrawlRun(crawlRun.run_id, items.length, 'completed');

    // Insert page data into Supabase
    for (const item of items) {
      await insertPageData(crawlRun.run_id, item as CrawlResult);
    }

    return items as CrawlResult[];
  } finally {
    ongoingCrawls.delete(url);
  }
}

export async function getCrawlProgress(runId: string) {
  return getCrawlRun(runId);
}

export function isCrawlInProgress(url: string): boolean {
  return ongoingCrawls.has(url);
}