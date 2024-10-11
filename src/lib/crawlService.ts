import { runCrawl } from './apifyClient';

export async function startCrawl(domain: string): Promise<string> {
  try {
    const runId = await runCrawl({ url: domain, scope: 'entire' });
    return runId;
  } catch (error) {
    console.error('Error in startCrawl:', error);
    throw error;
  }
}