import { EnqueueStrategy } from 'crawlee';

export function prepareApifyInput(domain: string, limit: string, scope: string) {
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
      glob = `[${url.protocol}//${url.hostname}]/**`;
      break;
  }

  return {
    startUrls: [{ url: domain }],
    keepUrlFragments: false,
    linkSelector: "a[href]",
    maxRequestsPerCrawl: limit === "0" ? undefined : parseInt(limit),
    maxConcurrency: 10,
    pageLoadTimeoutSecs: 60,
    proxyConfiguration: { useApifyProxy: true },
    debugLog: false,
    ignoreSslErrors: false,
    useChrome: false,
    additionalMimeTypes: [],
    globs: [glob], // Use globs instead of pseudoUrls
    pageFunction: `async function pageFunction({ request, log, $ }) {
      log.info(\`Processing \${request.url}...\`);
      
      const pageData = {
        url: request.url,
        pageTitle: $('title').first().text().trim(),
        h1: $('h1').first().text().trim(),
        first_h2: $('h2').first().text().trim(),
        random_text_from_the_page: $('p').first().text().trim(),
        metaDescription: $('meta[name="description"]').attr('content') || '',
        canonicalUrl: $('link[rel="canonical"]').attr('href') || '',
        ogMetadata: {},
        jsonLd: undefined,
      };

      $('meta[property^="og:"]').each((_, el) => {
        const property = $(el).attr('property');
        const content = $(el).attr('content');
        if (property && content) {
          pageData.ogMetadata[property] = content;
        }
      });

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