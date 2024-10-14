"use client"

import React, { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { LeftPanel } from "@/components/audit/LeftPanel"
import { PageList } from '@/components/PageList'
import { PageDisplay } from '@/components/PageDisplay'
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useCrawlRun } from '@/hooks/useCrawlRun'
import { useFilteredPages } from '@/hooks/useFilteredPages'
import { Breadcrumbs } from '@/components/audit/Breadcrumbs'

export default function AuditPage({ params }: { params: { domain: string; runId: string } }) {
  const router = useRouter()
  const { crawlRun, pages, isLoading, isRefreshing, fetchCrawlRunData } = useCrawlRun(params.runId)
  const [selectedPage, setSelectedPage] = useState<CrawlPage | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeFilters, setActiveFilters] = useState({})
  const [selectedPath, setSelectedPath] = useState("/")
  const [pageTypes, setPageTypes] = useState(['all', 'page', 'article', 'event', 'contact'])
  const [selectedType, setSelectedType] = useState('all')

  const filteredPages = useFilteredPages({ pages, searchQuery, activeFilters, selectedPath })

  const getFilteredPagesByType = (type: string) => {
    if (type === 'all') {
      return filteredPages
    }
    return filteredPages.filter(page => page.content_type === type)
  }

  return (
    <div className="h-screen overflow-hidden">
      <div className="flex h-full">
        <LeftPanel
          pages={pages}
          selectedPath={selectedPath}
          setSelectedPath={setSelectedPath}
          crawledPages={pages.length}
          maxPages={crawlRun?.defaultDatasetId ? pages.length : 0}
          crawlStatus={crawlRun?.status || ''}
          domain={params.domain.replace(/^(https?:\/\/)?(www\.)?/, '')}
        />
        <div className="flex flex-col w-full">
          <header className="border-b">
            <div className="flex items-center p-4">
              <Breadcrumbs 
                domain={params.domain} 
                runId={params.runId} 
                actorTaskId={crawlRun?.actorTaskId}
              />
            </div>
          </header>
          <div className="flex-1 overflow-auto">
            <div className="h-full flex">
              <div className="w-1/3 border-r">
                <div className="p-4">
                  <form>
                    <div className="relative">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search pages"
                        className="pl-8"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                  </form>
                </div>
                <Tabs value={selectedType} onValueChange={setSelectedType} className="w-full">
                  <div className="flex items-center px-4 pb-4">
                    <TabsList>
                      {pageTypes.map((type) => (
                        <TabsTrigger key={type} value={type} className="capitalize">
                          {type}
                        </TabsTrigger>
                      ))}
                    </TabsList>
                  </div>
                  {pageTypes.map((type) => (
                    <TabsContent key={type} value={type} className="m-0">
                      <PageList
                        pages={getFilteredPagesByType(type)}
                        selectedPage={selectedPage}
                        onSelectPage={setSelectedPage}
                      />
                    </TabsContent>
                  ))}
                </Tabs>
              </div>
              <div className="w-2/3">
                <PageDisplay page={selectedPage} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
