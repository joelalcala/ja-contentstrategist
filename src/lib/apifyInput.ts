export function prepareApifyInput(domain: string, limit: string) {
  return {
    runMode: "DEVELOPMENT",
    startUrls: [{ url: domain }],
    keepUrlFragments: false,
    linkSelector: "a[href]",
    globs: [{ glob: `${domain}/*` }],
    pseudoUrls: [],
    excludes: [{ glob: "/**/*.{png,jpg,jpeg,pdf}" }],
    pageFunction: `
      async function pageFunction(context) {
        const $ = context.jQuery;
        const pageTitle = $('title').first().text();
        const h1 = $('h1').first().text();
        const first_h2 = $('h2').first().text();
        const random_text_from_the_page = $('p').first().text();

        context.log.info(\`URL: \${context.request.url}, TITLE: \${pageTitle}\`);

        // Safely access processedRequestCount
        const processedRequestCount = context.crawler && context.crawler.processedRequestCount ? context.crawler.processedRequestCount : 0;

        return {
          url: context.request.url,
          pageTitle,
          h1,
          first_h2,
          random_text_from_the_page,
          processedRequestCount
        };
      }
    `,
    injectJQuery: true,
    proxyConfiguration: { useApifyProxy: true },
    maxRequestRetries: 3,
    maxPagesPerCrawl: limit === "Entire site" ? 0 : parseInt(limit),
    maxConcurrency: 10,
    pageLoadTimeoutSecs: 120, // Increase timeout to 2 minutes
  };
}