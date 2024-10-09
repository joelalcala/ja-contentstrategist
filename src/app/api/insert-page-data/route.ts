import { NextResponse } from 'next/server'
import { insertPageData } from '../../../lib/supabaseClient'

export async function POST(request: Request) {
  const { crawlRunId, pageData } = await request.json()

  try {
    await insertPageData(crawlRunId, pageData)
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}