"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ApifyClient } from 'apify-client'

const client = new ApifyClient({
	token: process.env.NEXT_PUBLIC_APIFY_TOKEN || '',
})

if (!process.env.NEXT_PUBLIC_APIFY_TOKEN) {
	console.error('NEXT_PUBLIC_APIFY_TOKEN is not set')
}

export default function Crawl() {
	const [isCrawling, setIsCrawling] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const [domain, setDomain] = useState("")
	const [scope, setScope] = useState("entire")
	const [limit, setLimit] = useState("10")  // Changed default to "10"
	const router = useRouter()

	const handleCrawl = async () => {
		if (isCrawling) {
			setError('A crawl is already in progress')
			return
		}

		setIsCrawling(true)
		setError(null)

		try {
			const input = {
				runMode: "DEVELOPMENT",
				startUrls: [{ url: domain }],
				keepUrlFragments: false,
				linkSelector: "a[href]",
				globs: [{ glob: `${domain}/*` }],
				pseudoUrls: [],
				excludes: [{ glob: "/**/*.{png,jpg,jpeg,pdf}" }],
				pageFunction: `
					async function pageFunction(context) {
						const $ = context.jQuery;
						const pageTitle = $('title').first().text();
						const h1 = $('h1').first().text();
						const first_h2 = $('h2').first().text();
						const random_text_from_the_page = $('p').first().text();

						context.log.info(\`URL: \${context.request.url}, TITLE: \${pageTitle}\`);

						// Safely access processedRequestCount
						const processedRequestCount = context.crawler && context.crawler.processedRequestCount ? context.crawler.processedRequestCount : 0;

						return {
							url: context.request.url,
							pageTitle,
							h1,
							first_h2,
							random_text_from_the_page,
							processedRequestCount
						};
					}
				`,
				injectJQuery: true,
				proxyConfiguration: { useApifyProxy: true },
				maxRequestRetries: 3,
				maxPagesPerCrawl: limit === "Entire site" ? 0 : parseInt(limit),
				maxConcurrency: 10,
				pageLoadTimeoutSecs: 120, // Increase timeout to 2 minutes
			}

			console.log('Starting Apify actor run with input:', input)

			// Start the actor run without waiting for it to finish
			const run = await client.actor("moJRLRc85AitArpNN").call(input, { waitSecs: 0 })

			console.log('Apify actor run started with ID:', run.id)

			// Redirect immediately after starting the run
			router.push(`/audit?runId=${run.id}`)

		} catch (err: unknown) {
			console.error('Error starting crawl:', err)
			setError(`Failed to start crawl: ${err instanceof Error ? err.message : 'Unknown error'}`)
			setIsCrawling(false)
		}
	}

	return (
		<div className="min-h-screen flex items-center justify-center bg-gray-100">
			<div className="w-full max-w-3xl p-4">
				<Card>
					<CardHeader>
						<CardTitle className="text-2xl font-bold text-center">Website Crawler</CardTitle>
					</CardHeader>
					<CardContent className="space-y-6">
						<div className="space-y-4">
							<div className="flex space-x-2">
								<div className="flex-grow">
									<Label htmlFor="domain">Domain to crawl</Label>
									<Input
										id="domain"
										placeholder="https://example.com"
										value={domain}
										onChange={(e) => setDomain(e.target.value)}
									/>
								</div>
								<div>
									<Label htmlFor="scope">Scope</Label>
									<Select value={scope} onValueChange={setScope}>
										<SelectTrigger id="scope">
											<SelectValue placeholder="Select scope" />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="entire">Entire domain</SelectItem>
											<SelectItem value="subdomain">Subdomain only</SelectItem>
										</SelectContent>
									</Select>
								</div>
							</div>
							
							<div>
								<Label htmlFor="limit">Page limit</Label>
								<Select value={limit} onValueChange={setLimit}>
									<SelectTrigger id="limit">
										<SelectValue placeholder="Select a limit" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="10">10 pages</SelectItem>
										<SelectItem value="50">50 pages</SelectItem>
										<SelectItem value="100">100 pages</SelectItem>
										<SelectItem value="500">500 pages</SelectItem>
										<SelectItem value="Entire site">Entire site</SelectItem>
									</SelectContent>
								</Select>
							</div>
							
							<Button onClick={handleCrawl} disabled={isCrawling || !domain} className="w-full">
								{isCrawling ? "Starting Crawl..." : "Start Crawl"}
							</Button>
							{error && <div className="text-red-500">{error}</div>}
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	)
}