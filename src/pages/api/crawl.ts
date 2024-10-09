import type { NextApiRequest, NextApiResponse } from 'next'
// Import your crawling function

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { url, limitTo10Pages } = req.body;

    try {
      // Modify your crawling function to accept the limitTo10Pages parameter
      const results = await crawlWebsite(url, limitTo10Pages);
      res.status(200).json(results);
    } catch (error) {
      res.status(500).json({ error: 'An error occurred while crawling' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

// Modify your crawling function to limit pages if necessary
async function crawlWebsite(url: string, limitTo10Pages: boolean) {
  // Your existing crawling logic...
  // If limitTo10Pages is true, stop crawling after 10 pages
  // Return the crawl results
}