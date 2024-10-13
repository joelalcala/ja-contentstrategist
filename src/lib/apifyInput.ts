export interface ApifyInput {
  startUrls: { url: string }[];
  keepUrlFragments: boolean;
  linkSelector: string;
  maxRequestsPerCrawl?: number;
  maxConcurrency: number;
  pageLoadTimeoutSecs: number;
  proxyConfiguration: { useApifyProxy: boolean };
  debugLog: boolean;
  ignoreSslErrors: boolean;
  useChrome: boolean;
  additionalMimeTypes: string[];
  globs: string[];
  pageFunction: string;
  maxPagesPerCrawl?: number;
}

export function prepareApifyInput(domain: string, limit: string, scope: string): ApifyInput {
  const url = new URL(domain);

  let glob: string;
  switch (scope) {
    case 'all':
      glob = '**';
      break;
    case 'subdomain':
      glob = `${url.protocol}//${url.hostname}/**`;
      break;
    case 'entire':
    default:
      glob = `${url.protocol}//${url.hostname}]/**`;
      break;
  }

  const maxPages = limit === "0" ? undefined : parseInt(limit);

  return {
    startUrls: [{ url: domain }],
    keepUrlFragments: false,
    linkSelector: "a[href]",
    maxRequestsPerCrawl: maxPages,
    maxPagesPerCrawl: maxPages,
    maxConcurrency: 10,
    pageLoadTimeoutSecs: 60,
    proxyConfiguration: { useApifyProxy: true },
    debugLog: false,
    ignoreSslErrors: false,
    useChrome: false,
    additionalMimeTypes: [],
    globs: [glob],
    pageFunction: `async function pageFunction({ request, log, $, context }) {
      log.info(\`Processing \${request.url}...\`);
      
      const pageData = {
        url: request.url,
        title: $('title').first().text().trim() || null,
        h1_1: $('h1').first().text().trim() || null,
        h2_1: $('h2').eq(0).text().trim() || null,
        h2_2: $('h2').eq(1).text().trim() || null,
        description: $('meta[name="description"]').attr('content') || null,
        lang: $('html').attr('lang') || null,
        og_image: $('meta[property="og:image"]').attr('content') || null,
        author: $('meta[name="author"]').attr('content') || null,
        publication_date: $('meta[name="publication_date"]').attr('content') || null,
        content_type: $('meta[property="og:type"]').attr('content') || 'page',
        body: $('body').text().trim() || null,
        jsonLd: null,
      };

      // Extract JSON-LD
      const jsonLdScript = $('script[type="application/ld+json"]');
      if (jsonLdScript.length) {
        try {
          pageData.jsonLd = JSON.parse(jsonLdScript.html());
        } catch (e) {
          log.warning(\`Failed to parse JSON-LD: \${e}\`);
        }
      }

      return pageData;
    }`,
  };
}
