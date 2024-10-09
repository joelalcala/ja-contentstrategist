import { Suspense } from 'react'
import AuditClient from './AuditClient'

export default async function AuditPage({
  searchParams
}: {
  searchParams: { runId: string }
}) {
  const runId = searchParams.runId

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AuditClient initialRunId={runId} />
    </Suspense>
  )
}