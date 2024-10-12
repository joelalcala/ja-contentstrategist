"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ApifyCrawlInput } from '@/lib/api/apify/types'
import { useApify } from '@/contexts/ApifyContext'

export default function Crawl() {
	const [isCrawling, setIsCrawling] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const [domain, setDomain] = useState("")
	const [scope, setScope] = useState("entire")
	const [limit, setLimit] = useState("10")
	const router = useRouter()
	const apifyApi = useApify();
	const [isApiReady, setIsApiReady] = useState(false)

	useEffect(() => {
		if (apifyApi) {
			setIsApiReady(true)
		}
	}, [apifyApi])

	const handleCrawl = async () => {
		if (!isApiReady) {
			setError('ApifyApi is not initialized');
			return;
		}

		setError('')
		setIsCrawling(true)

		try {
			const input: ApifyCrawlInput = {
				startUrls: [{ url: domain }],
				keepUrlFragments: false,
				globs: scope === "entire" ? [{ glob: `${domain}/*` }] : 
					   scope === "subdomain" ? [{ glob: `${domain}/**` }] :
					   [{ glob: "**" }],
				pseudoUrls: [],
				excludes: [{ glob: "/**/*.{png,jpg,jpeg,pdf}" }],
				linkSelector: "a[href]",
				pageFunction: `async function pageFunction(context) {
					const { $, request, log } = context;
					const pageTitle = $('title').first().text();
					const h1 = $('h1').first().text();
					const first_h2 = $('h2').first().text();
					const metaDescription = $('meta[name="description"]').attr('content');
					const canonicalUrl = $('link[rel="canonical"]').attr('href');
					const ogMetadata = {};
					$('meta[property^="og:"]').each((_, el) => {
						const property = $(el).attr('property');
						const content = $(el).attr('content');
						if (property && content) {
							ogMetadata[property] = content;
						}
					});
					const jsonLd = $('script[type="application/ld+json"]').map((_, el) => {
						try {
							return JSON.parse($(el).html());
						} catch (e) {
							return null;
						}
					}).get().filter(Boolean);
					const random_text_from_the_page = $('p').text().substring(0, 200);
					
					return {
						url: request.url,
						pageTitle,
						h1,
						first_h2,
						metaDescription,
						canonicalUrl,
						ogMetadata,
						jsonLd,
						random_text_from_the_page,
					};
				}`,
				proxyConfiguration: { useApifyProxy: true },
				proxyRotation: "RECOMMENDED",
				initialCookies: [],
				additionalMimeTypes: [],
				forceResponseEncoding: false,
				ignoreSslErrors: false,
				preNavigationHooks: `[]`,
				postNavigationHooks: `[]`,
				maxRequestRetries: 3,
				maxPagesPerCrawl: limit === "Entire site" ? 0 : parseInt(limit),
				maxResultsPerCrawl: 0,
				maxCrawlingDepth: 0,
				maxConcurrency: 10,
				pageLoadTimeoutSecs: 60,
				pageFunctionTimeoutSecs: 60,
				debugLog: false,
				customData: {},
			};

			const response = await fetch('/api/crawl', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(input),
			});

			if (!response.ok) {
				throw new Error('Failed to start crawl');
			}

			const result = await response.json();

			if (result.error) {
				throw new Error(result.error);
			}

			if (result.data) {
				router.push(`/audit/${encodeURIComponent(domain)}/${result.data.id}`);
			} else {
				throw new Error('No data returned from API');
			}
		} catch (err: any) {
			setError('Failed to start crawl: ' + err.message)
		} finally {
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
											<SelectItem value="all">All links</SelectItem>
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
							
							<Button 
								onClick={handleCrawl} 
								disabled={isCrawling || !domain || !isApiReady} 
								className="w-full"
							>
								{isCrawling ? "Starting Crawl..." : isApiReady ? "Start Crawl" : "Initializing..."}
							</Button>
							{error && <div className="text-red-500">{error}</div>}
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	)
}
