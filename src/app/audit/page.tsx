"use client"

import { useSearchParams } from 'next/navigation'

export default function AuditPage() {
    const searchParams = useSearchParams()
    const domain = searchParams.get('domain')
    const scope = searchParams.get('scope')
    const limit = searchParams.get('limit')

    return (
        <div className="min-h-screen p-8">
            <h1 className="text-3xl font-bold mb-4">Audit Results</h1>
            <p>Domain: {domain}</p>
            <p>Scope: {scope}</p>
            <p>Limit: {limit}</p>
            {/* Add your audit content here */}
        </div>
    )
}