import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function Home() {
    return (
        <main className="flex min-h-screen flex-col items-center justify-between p-24">
            <h1 className="text-4xl font-bold mb-8">Content Strategist</h1>
            <Link href="/crawl">
                <Button>Go to Crawl Page</Button>
            </Link>
        </main>
    )
}