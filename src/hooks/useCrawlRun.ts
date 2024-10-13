import { useState, useEffect } from 'react';
import { useApify } from '@/contexts/ApifyContext';
import { SupabaseApi } from '@/lib/api/supabase/supabaseApi';
import { ApifyCrawlResult, CrawlPage } from '@/lib/api/types';

export function useCrawlRun(runId: string) {
  const apifyApi = useApify();
  const supabaseApi = new SupabaseApi();
  const [crawlRun, setCrawlRun] = useState<ApifyCrawlResult | null>(null);
  const [pages, setPages] = useState<CrawlPage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchCrawlRunData = async () => {
    console.log("Fetching crawl run data for runId:", runId);
    setIsRefreshing(true);
    setIsLoading(true);
    try {
      console.log("Fetching crawl status from Apify...");
      const { data: run, error: runError } = await apifyApi.getCrawlStatus(runId);
      console.log("Apify crawl status response:", run);

      if (runError) throw new Error(runError);
      setCrawlRun(run);

      if (run && run.defaultDatasetId) {
        console.log("Fetching crawl results from Apify dataset...");
        const { data: crawlResults, error: resultsError } = await apifyApi.getCrawlResults(run.defaultDatasetId);
        
        if (resultsError) throw new Error(resultsError);

        console.log("Crawl results fetched successfully. Count:", crawlResults?.length);

        if (crawlResults && Array.isArray(crawlResults) && crawlResults.length > 0) {
          console.log("Processing crawl results...");
          const processedPages = crawlResults.map(result => ({
            url: result.url,
            title: result.pageTitle || null,
            content_type: result.contentType || null,
            body: result.body || null,
            custom_fields: {}, // Initialize as empty object
            run_id: runId,
          }));

          console.log("Processed pages:", processedPages);

          console.log("Storing crawl results in Supabase...");
          const { data: storedPages, error: storeError } = await supabaseApi.insertCrawlPages(processedPages);

          if (storeError) throw new Error(storeError);

          console.log("Crawl results stored successfully. Count:", storedPages?.length);
          setPages(storedPages || []);
        } else {
          console.log("No valid crawl results to process.");
          setPages([]);
        }
      } else {
        console.log("Fetching crawl pages from Supabase...");
        const { data: crawlPages, error: pagesError } = await supabaseApi.getCrawlPages(runId);

        if (pagesError) throw new Error(pagesError);
      
        console.log("Crawl pages fetched from Supabase successfully. Count:", crawlPages?.length);
        setPages(crawlPages || []);
      }
    } catch (error) {
      console.error('Error in fetchCrawlRunData:', error);
      setPages([]);
      setCrawlRun(null);
    } finally {
      setIsRefreshing(false);
      setIsLoading(false);
      console.log("Finished fetching crawl run data. Pages count:", pages.length);
    }
  };

  useEffect(() => {
    if (apifyApi) {
      fetchCrawlRunData();
    }
  }, [apifyApi, runId]);

  return { crawlRun, pages, isLoading, isRefreshing, fetchCrawlRunData };
}
