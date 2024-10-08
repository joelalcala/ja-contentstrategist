"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const CrawlPage: React.FC = () => {
    const [domain, setDomain] = useState("")
    const [scope, setScope] = useState("entire")
    const [limit, setLimit] = useState("100")
    const [isCrawling, setIsCrawling] = useState(false)
    const router = useRouter()

    const handleCrawl = async () => {
        setIsCrawling(true)
        // Simulate a delay before redirecting
        await new Promise(resolve => setTimeout(resolve, 1000))
        // Redirect to the results page
        router.push(`/crawl-results?domain=${encodeURIComponent(domain)}&scope=${scope}&limit=${limit}`)
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
                                        <SelectItem value="50">50 pages</SelectItem>
                                        <SelectItem value="100">100 pages</SelectItem>
                                        <SelectItem value="500">500 pages</SelectItem>
                                        <SelectItem value="Entire site">Entire site</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            
                            <Button onClick={handleCrawl} disabled={isCrawling || !domain} className="w-full">
                                {isCrawling ? "Redirecting..." : "Start Crawl"}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

export default CrawlPage