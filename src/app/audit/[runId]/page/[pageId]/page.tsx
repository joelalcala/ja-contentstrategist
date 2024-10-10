'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import { ChevronLeft, ExternalLink } from "lucide-react"
import { getPageDetails } from '@/lib/api'

export default function PageDetails({ params }: { params: { runId: string, pageId: string } }) {
  const router = useRouter()
  const { runId, pageId } = params
  const [page, setPage] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchPageDetails() {
      try {
        const pageData = await getPageDetails(runId, pageId)
        setPage(pageData)
      } catch (error) {
        console.error('Error fetching page details:', error)
        // Handle error (e.g., show error message to user)
      } finally {
        setIsLoading(false)
      }
    }

    fetchPageDetails()
  }, [runId, pageId])

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (!page) {
    return <div>Page not found</div>
  }

  return (
    <div className="container mx-auto p-4">
      <Breadcrumb className="mb-4">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild><Link href="/">Dashboard</Link></BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild><Link href="/audit">Audit</Link></BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild><Link href={`/audit/${runId}`}>{runId}</Link></BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{page.title}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" size="icon" onClick={() => router.back()}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold">{page.title}</h1>
        <Button variant="outline" size="sm" className="ml-auto" onClick={() => window.open(page.url, '_blank')}>
          <ExternalLink className="mr-2 h-4 w-4" />
          Open Page
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Page Details</CardTitle>
            <CardDescription>Basic information about the page</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input id="title" value={page.title} readOnly />
              </div>
              <div>
                <Label htmlFor="url">URL</Label>
                <Input id="url" value={page.url} readOnly />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" value={page.description} readOnly />
              </div>
              <div>
                <Label htmlFor="metaDescription">Meta Description</Label>
                <Textarea id="metaDescription" value={page.metaDescription} readOnly />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Custom Fields</CardTitle>
            <CardDescription>Additional information and classifications</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(page.fields).map(([key, value]) => (
                <div key={key}>
                  <Label htmlFor={key}>{key}</Label>
                  <Input id={key} value={value as string} readOnly />
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" size="sm">Add Field</Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}