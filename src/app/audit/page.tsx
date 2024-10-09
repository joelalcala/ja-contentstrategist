import { Suspense } from 'react'
import { getCrawlRunWithPages, getCrawlRuns, getApifyDatasetId } from '@/lib/supabaseClient'
import AuditClient from './AuditClient'
import { ApifyClient } from 'apify-client';

const apifyClient = new ApifyClient({
  token: process.env.APIFY_API_TOKEN,
});

export default async function AuditPage({
  searchParams
}: {
  searchParams: { runId: string }
}) {
  const runId = searchParams.runId
  let initialCrawlRun = null
  let initialPages = []
  let initialCrawlRuns = []

  console.log('Fetching data for runId:', runId)

  if (runId) {
    try {
      const result = await getCrawlRunWithPages(runId)
      console.log('Fetched crawl run:', result.crawlRun)
      initialCrawlRun = result.crawlRun

      // Fetch Apify dataset ID
      let datasetId = await getApifyDatasetId(runId)
      console.log('Dataset ID from Supabase:', datasetId)
      
      if (!datasetId) {
        console.log('Dataset ID not found in Supabase, fetching from Apify...')
        // If datasetId is not in Supabase, try to fetch it from Apify
        const run = await apifyClient.run(runId).get()
        datasetId = run.defaultDatasetId
        console.log('Dataset ID fetched from Apify:', datasetId)
      }
      
      if (datasetId) {
        console.log('Fetching data from Apify dataset:', datasetId)
        // Fetch data from Apify dataset
        const { items } = await apifyClient.dataset(datasetId).listItems();
        console.log('Fetched items from Apify:', items.length)
        initialPages = items.map((item: any, index) => ({
          id: index,
          title: item.title || 'No Title',
          type: 'page',
          path: item.url ? new URL(item.url).pathname : '/',
          description: item.h1 || '',
          fields: {},
          url: item.url || '',
          ...item
        }));
        console.log('Processed initialPages:', initialPages.length)
      } else {
        console.warn('No Apify dataset ID found for this run');
      }

      console.log('Fetched pages:', initialPages.length)
    } catch (error) {
      console.error('Error fetching crawl run data:', error)
      if (error instanceof Error) {
        console.error('Error message:', error.message)
        console.error('Error stack:', error.stack)
      }
    }
  }

  try {
    initialCrawlRuns = await getCrawlRuns()
    console.log('Fetched crawl runs:', initialCrawlRuns.length)
  } catch (error) {
    console.error('Error fetching crawl runs:', error)
    if (error instanceof Error) {
      console.error('Error message:', error.message)
      console.error('Error stack:', error.stack)
    }
  }

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AuditClient
        initialCrawlRun={initialCrawlRun}
        initialPages={initialPages}
        initialCrawlRuns={initialCrawlRuns}
      />
    </Suspense>
  )
}