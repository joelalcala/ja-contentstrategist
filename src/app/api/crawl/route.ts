import { NextResponse } from 'next/server';
import ApifyApi from '@/lib/api/apify/apifyApi';

const apifyApi = new ApifyApi();

export async function POST(request: Request) {
  try {
    const input = await request.json();
    const result = await apifyApi.startCrawl(input);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to start crawl' }, { status: 500 });
  }
}
