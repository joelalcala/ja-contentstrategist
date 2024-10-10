import { Suspense } from 'react'
import AuditClient from './AuditClient'
import { getCrawlRuns } from '@/lib/supabaseClient' // Assuming you have this function

export default async function AuditPage() {
  let initialRunId = ''
  try {
    const runs = await getCrawlRuns()
    initialRunId = runs[0]?.run_id || '' // Get the most recent run ID
  } catch (error) {
    console.error('Error fetching initial run ID:', error)
  }
  
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AuditClient initialRunId={initialRunId} />
    </Suspense>
  )
}