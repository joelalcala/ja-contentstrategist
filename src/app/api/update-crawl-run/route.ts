import { NextResponse } from 'next/server'
import { updateCrawlRun } from '../../../lib/supabaseClient'

export async function POST(request: Request) {
  const { crawlRunId, totalPages, status } = await request.json()

  try {
    await updateCrawlRun(crawlRunId, totalPages, status)
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}