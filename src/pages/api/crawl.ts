import { NextApiRequest, NextApiResponse } from 'next';
import ApifyApi from '@/lib/api/apify/apifyApi';

const apifyApi = new ApifyApi();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      const input = req.body;
      const result = await apifyApi.startCrawl(input);
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ error: 'Failed to start crawl' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
