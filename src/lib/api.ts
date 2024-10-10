import { ApifyClient } from 'apify-client';

const apifyClient = new ApifyClient({
  token: process.env.NEXT_PUBLIC_APIFY_API_TOKEN,
});

export async function getPageDetails(runId: string, pageId: string) {
  try {
    const run = await apifyClient.run(runId).get();
    if (!run || !run.defaultDatasetId) {
      throw new Error('Invalid run data');
    }

    const { items } = await apifyClient.dataset(run.defaultDatasetId).listItems();
    
    // Assuming pageId is actually the encoded URL of the page
    const page = items.find((item: any) => item.url === decodeURIComponent(pageId));

    if (!page) {
      throw new Error('Page not found');
    }

    return {
      id: encodeURIComponent(page.url), // Use encoded URL as ID
      title: page.pageTitle || page.title || 'No Title',
      url: page.url,
      description: page.description || '',
      metaDescription: page.metaDescription || '',
      type: page.type || 'page',
      fields: page.fields || {},
      // Add any other relevant fields from your Apify dataset items
    };
  } catch (error) {
    console.error('Error fetching page details:', error);
    throw error;
  }
}