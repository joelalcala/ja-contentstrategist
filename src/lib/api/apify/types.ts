import { ActorRun } from 'apify-client';

export interface ApifyCrawlInput {
  startUrls: { url: string }[];
  keepUrlFragments: boolean;
  globs: { glob: string }[];
  pseudoUrls: { purl: string }[];
  excludes: { glob: string }[];
  linkSelector: string;
  pageFunction: string;
  proxyConfiguration: { useApifyProxy: boolean };
  proxyRotation: string;
  initialCookies: { name: string; value: string; domain: string }[];
  additionalMimeTypes: string[];
  forceResponseEncoding: boolean;
  ignoreSslErrors: boolean;
  preNavigationHooks: string;
  postNavigationHooks: string;
  maxRequestRetries: number;
  maxPagesPerCrawl: number;
  maxResultsPerCrawl: number;
  maxCrawlingDepth: number;
  maxConcurrency: number;
  pageLoadTimeoutSecs: number;
  pageFunctionTimeoutSecs: number;
  debugLog: boolean;
  customData: Record<string, any>;
}

export interface ApifyCrawlResult extends ActorRun {
  defaultDatasetId: string;
}
