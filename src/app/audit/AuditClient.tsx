'use client'

import React, { useState, useRef, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { LeftPanel } from "@/components/audit/LeftPanel"
import { RightPanel } from "@/components/audit/RightPanel"
import { PageTable } from '@/components/audit/PageTable'
import { AddFieldModal } from '@/components/audit/AddFieldModal'
import { FiltersDialog } from '@/components/audit/FiltersDialog'
import { Search, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { updateCrawlRunStatus, getCrawlRunWithPages } from '@/lib/supabaseClient'
import { CrawlRun, Page } from '@/lib/supabaseClient'

const initialFields = {
  Status: ["Needs review", "Keep as is", "Rewrite", "Merge", "Delete"],
}

function formatPath(path: string): string {
  if (path === 'all') return 'All';
  if (path === '/') return '';
  return path
    .split('/')
    .filter(Boolean)
    .map(segment => segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' '))
    .join(' / ');
}

interface AuditClientProps {
  initialCrawlRun: CrawlRun | null
  initialPages: Page[]
  initialCrawlRuns: CrawlRun[]
}

export default function AuditClient({ initialCrawlRun, initialPages, initialCrawlRuns }: AuditClientProps) {
  console.log('AuditClient received initialCrawlRun:', initialCrawlRun)
  console.log('AuditClient received initialPages:', initialPages)
  console.log('AuditClient received initialCrawlRuns:', initialCrawlRuns)

  const router = useRouter()
  const [leftPanelWidth, setLeftPanelWidth] = useState(256)
  const [rightPanelWidth, setRightPanelWidth] = useState(480)
  const [pages, setPages] = useState(initialPages)
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
  const [selectedPath, setSelectedPath] = useState("/")
  const [showSiteSettings, setShowSiteSettings] = useState(false)
  const [showNewCrawl, setShowNewCrawl] = useState(false)
  const [selectedRows, setSelectedRows] = useState(new Set<number>())
  const [activeView, setActiveView] = useState("default")
  const [isFiltersOpen, setIsFiltersOpen] = useState(false)
  const [crawlStatus, setCrawlStatus] = useState(initialCrawlRun?.status || '')
  const [crawledPages, setCrawledPages] = useState(initialPages.length)
  const [maxPages, setMaxPages] = useState(initialCrawlRun?.max_page_count || 0)
  const [isCrawlButtonDisabled, setIsCrawlButtonDisabled] = useState(false)
  const [domain, setDomain] = useState(initialCrawlRun?.domain || "")
  const [crawlRuns, setCrawlRuns] = useState(initialCrawlRuns)
  const [selectedCrawlRun, setSelectedCrawlRun] = useState(initialCrawlRun)

  const handleNewCrawl = () => {
    router.push('/crawl')
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
    if (initialCrawlRun?.status === 'RUNNING') {
      const intervalId = setInterval(async () => {
        const updatedCrawlRun = await getCrawlRunWithPages(initialCrawlRun.id)
        if (updatedCrawlRun.crawlRun.status !== 'RUNNING') {
          clearInterval(intervalId)
          setCrawlStatus(updatedCrawlRun.crawlRun.status.toUpperCase())
          setIsCrawlButtonDisabled(false)
          setPages(updatedCrawlRun.pages)
          setCrawledPages(updatedCrawlRun.pages.length)
        }
      }, 5000) // Poll every 5 seconds

      return () => clearInterval(intervalId)
    }
  }, [initialCrawlRun])

  const filteredPages = useMemo(() => {
    return pages.filter(page => {
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

      const matchesPath = selectedPath === "all" || selectedPath === "/" || page.path.startsWith(selectedPath);

      return matchesSearch && matchesActiveFilters && matchesPath;
    });
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
      <div className="flex flex-1 overflow-hidden">
        <div style={{ width: `${leftPanelWidth}px` }} className="bg-white border-r flex-shrink-0">
          <LeftPanel
            pages={pages}
            crawlRuns={crawlRuns}
            selectedCrawlRun={selectedCrawlRun}
            setSelectedCrawlRun={setSelectedCrawlRun}
            selectedPath={selectedPath}
            setSelectedPath={setSelectedPath}
            onNewCrawl={handleNewCrawl}
            onShowSiteSettings={() => setShowSiteSettings(true)}
            crawledPages={crawledPages}
            maxPages={maxPages}
            crawlStatus={crawlStatus}
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
              <h2 className="text-2xl font-bold">
                {domain}{selectedPath !== '/' && ` / ${formatPath(selectedPath)}`}
              </h2>
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
              domain={domain}
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