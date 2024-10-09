import { EnqueueStrategy } from 'crawlee';

export function prepareApifyInput(domain: string, limit: string, scope: string) {
  const url = new URL(domain);
  const hostname = url.hostname;

  let strategy: string;
  switch (scope) {
    case 'all':
      strategy = 'all';
      break;
    case 'subdomain':
      strategy = 'same-subdomain';
      break;
    case 'entire':
    default:
      strategy = 'same-hostname';
      break;
  }

  return {
    runMode: "DEVELOPMENT",
    startUrls: [{ url: domain }],
    keepUrlFragments: false,
    linkSelector: "a[href]",
    maxRequestsPerCrawl: limit === "Entire site" ? 0 : parseInt(limit),
    maxConcurrency: 10,
    pageLoadTimeoutSecs: 120,
    injectJQuery: true, // Ensure jQuery is injected
    pageFunction: `async function pageFunction(context) {
      const { request, log, jQuery: $ } = context;
      
      log.info(\`Processing \${request.url}...\`);
      
      const pageData = {};

      try {
        pageData.url = request.url;
        pageData.pageTitle = $('title').first().text().trim();
        pageData.h1 = $('h1').first().text().trim();
        pageData.first_h2 = $('h2').first().text().trim();
        pageData.random_text_from_the_page = $('p').first().text().trim();

        // Extract meta description
        pageData.metaDescription = $('meta[name="description"]').attr('content') || '';

        // Extract canonical URL
        pageData.canonicalUrl = $('link[rel="canonical"]').attr('href') || '';

        // Extract Open Graph metadata
        pageData.ogMetadata = {};
        $('meta[property^="og:"]').each((_, el) => {
          const property = $(el).attr('property');
          const content = $(el).attr('content');
          if (property && content) {
            pageData.ogMetadata[property] = content;
          }
        });

        // Extract JSON-LD
        const jsonLdScript = $('script[type="application/ld+json"]');
        if (jsonLdScript.length) {
          try {
            pageData.jsonLd = JSON.parse(jsonLdScript.html());
          } catch (e) {
            log.warning(\`Failed to parse JSON-LD: \${e}\`);
          }
        }

        // Enqueue links
        await context.enqueueLinks({
          strategy: '${strategy}',
          transformRequestFunction: (req) => {
            req.url = req.url.replace(/\\/$/, '').replace(/^(https?:\\/\\/)\www\\./, '$1');
            return req;
          },
        });

      } catch (error) {
        log.error(\`Error processing \${request.url}: \${error}\`);
      }

      return pageData;
    }`,
  };
}