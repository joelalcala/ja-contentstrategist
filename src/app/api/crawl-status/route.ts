import { NextResponse } from 'next/server'

export async function GET() {
  // In a real implementation, you would check the actual crawl status
  // For now, we'll just return a mock response
  return NextResponse.json({ isCrawling: false })
}