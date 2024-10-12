import { ApifyClient } from 'apify-client';
import { ApifyCrawlInput, ApifyCrawlResult } from './types';
import { ApiResponse } from '../types';

export default class ApifyApi {
  private client: ApifyClient;

  constructor() {
    this.client = new ApifyClient({
      token: process.env.NEXT_PUBLIC_APIFY_TOKEN,
    });
  }

  async startCrawl(input: ApifyCrawlInput): Promise<ApiResponse<ApifyCrawlResult>> {
    try {
      const run = await this.client.actor("apify/cheerio-scraper").call(input);
      return { data: run as ApifyCrawlResult };
    } catch (error: unknown) {
      if (error instanceof Error) {
        return { data: null, error: error.message };
      }
      return { data: null, error: 'An unknown error occurred' };
    }
  }

  async getCrawlStatus(runId: string): Promise<ApiResponse<ApifyCrawlResult>> {
    try {
      const run = await this.client.run(runId).get();
      return { data: run as ApifyCrawlResult };
    } catch (error: unknown) {
      if (error instanceof Error) {
        return { data: null, error: error.message };
      }
      return { data: null, error: 'An unknown error occurred' };
    }
  }

  async getCrawlResults(datasetId: string): Promise<ApiResponse<any[]>> {
    try {
      const { items } = await this.client.dataset(datasetId).listItems();
      return { data: items };
    } catch (error: unknown) {
      if (error instanceof Error) {
        return { data: null, error: error.message };
      }
      return { data: null, error: 'An unknown error occurred' };
    }
  }
}
