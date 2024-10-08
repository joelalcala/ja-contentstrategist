'use client';

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export function CrawlForm() {
  const [url, setUrl] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // Add your crawl logic here
    console.log('Crawling:', url)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        type="url"
        placeholder="Enter URL to crawl"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        required
      />
      <Button type="submit">Start Crawl</Button>
    </form>
  )
}