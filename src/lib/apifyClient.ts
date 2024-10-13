import { ApifyClient } from 'apify-client';
import { insertCrawlRun, updateCrawlRun, insertPageData, getCrawlRun } from './supabaseClient';
import { prepareApifyInput, ApifyInput } from './apifyInput';
import { CrawlResult, CrawlOptions } from './types';

// Initialize the ApifyClient with your API token
const client = new ApifyClient({
  token: process.env.NEXT_PUBLIC_APIFY_TOKEN || '',
});

// Keep track of ongoing crawls
const ongoingCrawls = new Set<string>();

export async function runCrawl(options: CrawlOptions): Promise<string> {
  const { url, maxPages = 1000, scope } = options;

  try {
    const input: ApifyInput = prepareApifyInput(url, maxPages.toString(), scope);

    const run = await client.actor("apify/cheerio-scraper").call(input);

    const crawlRun = await insertCrawlRun({
      run_id: run.id,
      domain: url,
      type: 'cheerio-scraper',
      max_page_count: maxPages,
      status: 'running',
      dataset_id: run.defaultDatasetId,
    });

    handleCrawlResults(run.id, crawlRun.run_id);

    return crawlRun.run_id;
  } catch (error) {
    console.error('Error running crawl:', error);
    throw error;
  }
}

async function handleCrawlResults(apifyRunId: string, crawlRunId: string) {
  try {
    const run = await client.run(apifyRunId).waitForFinish();
    const { items } = await client.dataset(run.defaultDatasetId).listItems();

    await updateCrawlRun(crawlRunId, items.length, 'completed');

    for (const item of items) {
      const crawlResult: CrawlResult = {
        url: item.url,
        title: item.title,
        h1_1: item.h1_1,
        h2_1: item.h2_1,
        h2_2: item.h2_2,
        description: item.description,
        lang: item.lang,
        og_image: item.og_image,
        author: item.author,
        publication_date: item.publication_date,
        content_type: item.content_type,
        body: item.body,
        jsonLd: item.jsonLd,
      };
      await insertPageData(crawlRunId, crawlResult);
    }
  } catch (error) {
    console.error('Error handling crawl results:', error);
    await updateCrawlRun(crawlRunId, 0, 'failed');
  }
}

export async function getApifyDatasetItem(datasetId: string, url: string): Promise<CrawlResult | null> {
  try {
    const { items } = await client.dataset(datasetId).listItems({
      fields: ['url', 'title', 'h1_1', 'h2_1', 'h2_2', 'description', 'lang', 'og_image', 'author', 'publication_date', 'content_type', 'body', 'jsonLd'],
      limit: 1,
    });

    const item = items.find((i: any) => i.url === url);

    if (!item) {
      return null;
    }

    return item as CrawlResult;
  } catch (error) {
    console.error('Error fetching Apify dataset item:', error);
    throw error;
  }
}

export function isCrawlInProgress(url: string): boolean {
  return ongoingCrawls.has(url);
}
