"use client"

import React, { useState, useRef, useEffect, useMemo } from "react"
import { useSearchParams } from "next/navigation"
import { ApifyClient } from 'apify-client'
import { LeftPanel } from "@/components/audit/LeftPanel"
import { RightPanel } from "@/components/audit/RightPanel"
import { PageTable } from '@/components/audit/PageTable'
import { AddFieldModal } from '@/components/audit/AddFieldModal'
import { FiltersDialog } from '@/components/audit/FiltersDialog'
import { Search, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { Progress } from "@/components/ui/progress"
import { Dialog, DialogContent } from "@/components/ui/dialog"

const client = new ApifyClient({
  token: process.env.NEXT_PUBLIC_APIFY_TOKEN || '',
})

// Initial fields
const initialFields = {
  Status: ["Needs review", "Keep as is", "Rewrite", "Merge", "Delete"],
}

// Mock data for sites (you may want to replace this with real data later)
const mockSites = [
  { id: 1, name: "Main Website", domain: "www.example.com" },
  { id: 2, name: "Blog", domain: "blog.example.com" },
  { id: 3, name: "Support", domain: "support.example.com" },
]

export default function AuditPage() {
  const searchParams = useSearchParams()
  const [leftPanelWidth, setLeftPanelWidth] = useState(256)
  const [rightPanelWidth, setRightPanelWidth] = useState(480)
  const [pages, setPages] = useState<any[]>([])
  const [selectedPage, setSelectedPage] = useState(null)
  const [fields, setFields] = useState(initialFields)
  const [visibleColumns, setVisibleColumns] = useState(["title", "path", "type"])
  const [visibleFields, setVisibleFields] = useState(Object.keys(initialFields))
  const [isAddFieldOpen, setIsAddFieldOpen] = useState(false)
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const leftResizeRef = useRef(null)
  const [isResizing, setIsResizing] = useState(false)
  const [activeFilters, setActiveFilters] = useState({})
  const [selectedSite, setSelectedSite] = useState(mockSites[0])
  const [selectedPath, setSelectedPath] = useState("/")
  const [showSiteSettings, setShowSiteSettings] = useState(false)
  const [showNewCrawl, setShowNewCrawl] = useState(false)
  const [selectedRows, setSelectedRows] = useState(new Set<number>())
  const [activeView, setActiveView] = useState("default")
  const [isFiltersOpen, setIsFiltersOpen] = useState(false)
  const [crawlStatus, setCrawlStatus] = useState('')
  const [crawlProgress, setCrawlProgress] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [isCrawlButtonDisabled, setIsCrawlButtonDisabled] = useState(false)

  const handleNewCrawl = () => {
    setShowNewCrawl(true)
  }

  const handleDecision = (id: number, fieldType: string, value: string) => {
    setPages(pages.map(page =>
      page.id === id ? { ...page, fields: { ...page.fields, [fieldType]: value } } : page
    ))
  }

  const addField = (fieldType: string, options: string[]) => {
    setFields({ ...fields, [fieldType]: options })
    setVisibleFields([...visibleFields, fieldType])
  }

  const toggleFieldVisibility = (fieldType: string) => {
    setVisibleFields(prev =>
      prev.includes(fieldType)
        ? prev.filter(d => d !== fieldType)
        : [...prev, fieldType]
    )
  }

  const handleSelectPage = (page: any) => {
    setSelectedPage(page)
    setIsRightPanelOpen(true)
  }

  const startResizing = () => {
    setIsResizing(true)
  }

  useEffect(() => {
    const fetchData = async () => {
      const runId = searchParams?.get('runId')
      if (runId) {
        try {
          const run = await client.run(runId).get()
          const { items, total } = await client.dataset(run.defaultDatasetId).listItems()
          console.log('Apify dataset:', items)
          
          const processedPages = items.map((item: any, index) => ({
            id: index,
            title: item.pageTitle || 'No Title',
            type: 'page',
            path: item.url ? new URL(item.url).pathname : '/',
            description: item.h1 || '',
            fields: {},
            url: item.url || '',
            ...item
          }))
          
          setPages(processedPages)
          setTotalPages(total)
          setCrawlStatus(run.status)
          setCrawlProgress(Math.round((run.finishedAt ? total : run.progressTotal) / total * 100))
        } catch (error) {
          console.error('Error fetching Apify data:', error)
        }
      }
    }

    fetchData()
  }, [searchParams])

  const filteredPages = useMemo(() => {
    console.log('Filtering pages. Total pages:', pages.length);
    console.log('Search query:', searchQuery);
    console.log('Active filters:', activeFilters);
    console.log('Selected path:', selectedPath);

    const filtered = pages.filter(page => {
      const matchesSearch = 
        (page.title?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false) ||
        (page.path?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false) ||
        (page.type?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);

      const matchesActiveFilters = Object.entries(activeFilters).every(([key, values]) => {
        if (!values || values === "all") return true;
        if (key === 'type') {
          return values === page.type;
        }
        if (key === 'urlContains') {
          return page.path?.includes(values) ?? false;
        }
        return values === page.fields?.[key];
      });

      const matchesPath = selectedPath === "/" || (page.path?.startsWith(selectedPath) ?? false);

      return matchesSearch && matchesActiveFilters && matchesPath;
    });

    console.log('Filtered pages:', filtered);
    return filtered;
  }, [pages, searchQuery, activeFilters, selectedPath])

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return
      const newWidth = e.clientX
      setLeftPanelWidth(Math.max(200, Math.min(400, newWidth)))
    }

    const handleMouseUp = () => {
      setIsResizing(false)
    }

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isResizing])

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <div className="bg-white p-4 border-b">
        <h2 className="text-lg font-semibold mb-2">Crawl Progress</h2>
        <div className="flex items-center space-x-4">
          <Progress value={crawlProgress} className="w-64" />
          <span>{crawlProgress.toFixed(2)}%</span>
          <span>Status: {crawlStatus}</span>
        </div>
      </div>
      <div className="flex flex-1 overflow-hidden">
        <div style={{ width: `${leftPanelWidth}px` }} className="bg-white border-r flex-shrink-0">
          <LeftPanel
            pages={pages}
            sites={mockSites}
            selectedSite={selectedSite}
            setSelectedSite={setSelectedSite}
            selectedPath={selectedPath}
            setSelectedPath={setSelectedPath}
            onNewCrawl={handleNewCrawl}
            onShowSiteSettings={() => setShowSiteSettings(true)}
            crawlProgress={crawlProgress}
            totalPages={totalPages}
            isCrawling={crawlStatus === 'RUNNING'}
            isCrawlButtonDisabled={isCrawlButtonDisabled}
          />
        </div>
        <div
          ref={leftResizeRef}
          className="w-1 bg-gray-200 hover:bg-gray-300 cursor-col-resize"
          onMouseDown={startResizing}
        />
        <main className="flex-1 flex overflow-hidden">
          <div className="flex-1 p-4 overflow-auto">
            <div className="space-y-2 mb-4">
              <div className="flex items-center space-x-2">
                <div className="relative w-48">
                  <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 h-3 w-3" />
                  <Input
                    type="text"
                    placeholder="Search pages..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8 pr-4 py-1 w-full h-7 text-xs"
                  />
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsFiltersOpen(true)}
                  className="h-7 text-xs"
                >
                  <Filter className="w-3 h-3 mr-1" />
                  Filters
                </Button>
              </div>
            </div>
            <PageTable
              data={filteredPages}
              onDecision={handleDecision}
              fields={fields}
              visibleColumns={visibleColumns}
              setVisibleColumns={setVisibleColumns}
              visibleFields={visibleFields}
              toggleFieldVisibility={toggleFieldVisibility}
              onSelectPage={handleSelectPage}
              selectedPage={selectedPage}
              selectedRows={selectedRows}
              setSelectedRows={setSelectedRows}
              activeView={activeView}
              setActiveView={setActiveView}
              domain={selectedSite.domain}
            />
          </div>
        </main>
      </div>
      <Sheet open={isRightPanelOpen} onOpenChange={setIsRightPanelOpen}>
        <SheetContent side="right" className="w-full sm:max-w-xl" style={{ maxWidth: `${rightPanelWidth}px` }}>
          {selectedPage && (
            <RightPanel
              page={selectedPage}
              fields={fields}
              visibleFields={visibleFields}
              onDecision={(fieldType, value) => handleDecision(selectedPage.id, fieldType, value)}
              onAddField={() => setIsAddFieldOpen(true)}
              onClose={() => setIsRightPanelOpen(false)}
              toggleFieldVisibility={toggleFieldVisibility}
              width={rightPanelWidth}
              setWidth={setRightPanelWidth}
              pages={pages}
            />
          )}
        </SheetContent>
      </Sheet>
      <AddFieldModal
        isOpen={isAddFieldOpen}
        onClose={() => setIsAddFieldOpen(false)}
        onAddField={addField}
      />
      {showSiteSettings && (
        <Dialog open={showSiteSettings} onOpenChange={setShowSiteSettings}>
          <DialogContent>
            {/* Site settings dialog content */}
          </DialogContent>
        </Dialog>
      )}
      {showNewCrawl && (
        <Dialog open={showNewCrawl} onOpenChange={setShowNewCrawl}>
          <DialogContent>
            {/* New crawl dialog content */}
          </DialogContent>
        </Dialog>
      )}
      <FiltersDialog
        isOpen={isFiltersOpen}
        onClose={() => setIsFiltersOpen(false)}
        fields={fields}
        activeFilters={activeFilters}
        setActiveFilters={setActiveFilters}
      />
    </div>
  )
}