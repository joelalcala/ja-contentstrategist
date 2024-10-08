import { ApifyClient } from 'apify-client';
import { supabase } from './supabaseClient';

// Initialize the ApifyClient with your API token
const client = new ApifyClient({
  token: 'apify_api_2BdtIsD8YJeGNNGxlZR2BKz5vEOtfY1bEjWg',
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
  title: string;
  description: string;
  type: string;
  path: string;
  ogMetadata: Record<string, string>;
  jsonLd: any;
  bodyContent: string;
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
    const { data: crawlRun, error: insertError } = await supabase
      .from('Crawl-Run')
      .insert({
        domain: url,
        type: 'web-scraper',
        pagecount: 0,
        apify: 'pending'
      })
      .select()
      .single();

    if (insertError) {
      throw new Error(`Failed to insert Crawl-Run: ${insertError.message}`);
    }

    // Run the Actor and wait for it to finish
    const run = await client.actor("apify/web-scraper").call({
      startUrls: [{ url }],
      maxPagesPerCrawl: maxPages,
      pageFunction: async ({ request, page, log }) => {
        processedPages++;
        const progress = (processedPages / maxPages) * 100;
        log.info(`Scraping ${request.url} (${processedPages}/${maxPages})`);
        onProgress?.(`Scraping ${request.url}`, progress);
        
        const title = await page.title();
        const description = await page.$eval('meta[name="description"]', (el: Element) => (el as HTMLMetaElement).getAttribute('content')).catch(() => '');
        
        // Extract Open Graph metadata
        const ogMetadata = await page.$$eval('meta[property^="og:"]', (els: Element[]) => 
          els.reduce((acc: Record<string, string>, el) => {
            const property = (el as HTMLMetaElement).getAttribute('property');
            const content = (el as HTMLMetaElement).getAttribute('content');
            if (property && content) {
              acc[property] = content;
            }
            return acc;
          }, {})
        );

        // Extract JSON-LD
        const jsonLd = await page.evaluate(() => {
          const el = document.querySelector('script[type="application/ld+json"]');
          return el ? JSON.parse(el.textContent || '') : null;
        });

        // Use Readability to extract the main content
        const bodyContent = await page.evaluate(() => {
          return document.body.innerText;
        });

        // Determine the page type (you may want to implement a more sophisticated logic here)
        const type = request.url === url ? 'landing' : 'article';

        const pageData = {
          url: request.url,
          title,
          description,
          type,
          path: new URL(request.url).pathname,
          ogMetadata,
          jsonLd,
          bodyContent,
        };

        // Insert the page data into Supabase
        const { error: pageInsertError } = await supabase
          .from('Pages')
          .insert({
            crawl_run_id: crawlRun.id,
            ...pageData
          });

        if (pageInsertError) {
          console.error(`Failed to insert page data: ${pageInsertError.message}`);
        }

        return pageData;
      },
    });

    onProgress?.("Crawl finished, fetching results...", 100)

    // Fetch and return the results
    const { items } = await client.dataset(run.defaultDatasetId).listItems();

    // Update the Crawl-Run record
    const { error: updateError } = await supabase
      .from('Crawl-Run')
      .update({
        pagecount: items.length,
        apify: run.id
      })
      .eq('id', crawlRun.id);

    if (updateError) {
      console.error(`Failed to update Crawl-Run: ${updateError.message}`);
    }

    return items as CrawlResult[];
  } finally {
    ongoingCrawls.delete(url);
  }
}

export function isCrawlInProgress(url: string): boolean {
  return ongoingCrawls.has(url);
}