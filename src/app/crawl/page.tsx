"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useApify } from '@/contexts/ApifyContext'
import { prepareApifyInput } from '@/lib/apifyInput'

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
			const input = prepareApifyInput(domain, limit, scope);

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
										<SelectItem value="0">Entire site</SelectItem>
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
