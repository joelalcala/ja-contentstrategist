'use client'

import React, { useState, useRef, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { LeftPanel } from "@/components/audit/LeftPanel"
import { RightPanel } from "@/components/audit/RightPanel"
import { PageTable } from '@/components/audit/PageTable'
import { AddFieldModal } from '@/components/audit/AddFieldModal'
import { FiltersDialog } from '@/components/audit/FiltersDialog'
import { Search, Filter, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { ApifyClient } from 'apify-client'

const apifyClient = new ApifyClient({
  token: process.env.NEXT_PUBLIC_APIFY_API_TOKEN,
});

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

interface CrawlRun {
  id: string;
  status: string;
  startedAt: string;
  finishedAt: string;
  actorTaskId: string;
  buildId: string;
  exitCode: number;
  defaultDatasetId: string;
  defaultKeyValueStoreId: string;
  defaultRequestQueueId: string;
  // Add any other relevant fields from Apify's run object
}

interface Page {
  id: string;
  url: string;
  title: string;
  path: string;
  type: string;
  fields: Record<string, any>;
  // Add any other relevant fields from your Apify dataset items
}

interface AuditClientProps {
  initialRunId: string;
}

export default function AuditClient({ initialRunId }: AuditClientProps) {
  const router = useRouter()
  const [leftPanelWidth, setLeftPanelWidth] = useState(256)
  const [rightPanelWidth, setRightPanelWidth] = useState(480)
  const [pages, setPages] = useState<Page[]>([])
  const [selectedPage, setSelectedPage] = useState<Page | null>(null)
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
  const [selectedRows, setSelectedRows] = useState(new Set<string>())
  const [activeView, setActiveView] = useState("default")
  const [isFiltersOpen, setIsFiltersOpen] = useState(false)
  const [crawlRun, setCrawlRun] = useState<CrawlRun | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const fetchCrawlRunData = async (runId: string) => {
    setIsRefreshing(true);
    setIsLoading(true);
    try {
      const run = await apifyClient.run(runId).get();
      setCrawlRun(run);

      const { items } = await apifyClient.dataset(run.defaultDatasetId).listItems();
      const processedPages = items.map((item: any, index) => ({
        id: index.toString(),
        url: item.url,
        title: item.pageTitle || item.title || 'No Title',
        path: item.url ? new URL(item.url).pathname : '/',
        type: 'page',
        fields: {},
        // Add any other relevant fields from your Apify dataset items
      }));
      setPages(processedPages);
    } catch (error) {
      console.error('Error fetching crawl run data:', error);
    } finally {
      setIsRefreshing(false);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCrawlRunData(initialRunId);
  }, [initialRunId]);

  const handleNewCrawl = () => {
    router.push('/crawl')
  }

  const handleDecision = (id: string, fieldType: string, value: string) => {
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

  const handleSelectPage = (page: Page) => {
    setSelectedPage(page)
    setIsRightPanelOpen(true)
  }

  const startResizing = () => {
    setIsResizing(true)
  }

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

  const TableLoadingSkeleton = () => (
    <div className="space-y-4">
      <div className="flex space-x-4">
        <Skeleton className="h-8 w-8" />
        <Skeleton className="h-8 w-1/4" />
        <Skeleton className="h-8 w-1/4" />
        <Skeleton className="h-8 w-1/4" />
        <Skeleton className="h-8 w-1/4" />
      </div>
      {[...Array(10)].map((_, index) => (
        <div key={index} className="flex space-x-4">
          <Skeleton className="h-6 w-6" />
          <Skeleton className="h-6 w-1/4" />
          <Skeleton className="h-6 w-1/4" />
          <Skeleton className="h-6 w-1/4" />
          <Skeleton className="h-6 w-1/4" />
        </div>
      ))}
    </div>
  )

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <div className="flex flex-1 overflow-hidden">
        <div style={{ width: `${leftPanelWidth}px` }} className="bg-white border-r flex-shrink-0">
          {isLoading ? (
            <div className="p-4">
              <Skeleton className="h-4 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2 mb-2" />
              <Skeleton className="h-4 w-2/3 mb-2" />
              <Skeleton className="h-4 w-1/2 mb-2" />
            </div>
          ) : (
            <LeftPanel
              pages={pages}
              selectedPath={selectedPath}
              setSelectedPath={setSelectedPath}
              onNewCrawl={handleNewCrawl}
              onShowSiteSettings={() => setShowSiteSettings(true)}
              crawledPages={pages.length}
              maxPages={crawlRun?.defaultDatasetId ? pages.length : 0}
              crawlStatus={crawlRun?.status || ''}
            />
          )}
        </div>
        <div
          ref={leftResizeRef}
          className="w-1 bg-gray-200 hover:bg-gray-300 cursor-col-resize"
          onMouseDown={startResizing}
        />
        <main className="flex-1 flex overflow-hidden">
          <div className="flex-1 p-4 overflow-auto">
            <div className="space-y-2 mb-4">
              <div className="flex justify-between items-center">
                {isLoading ? (
                  <Skeleton className="h-8 w-1/3" />
                ) : (
                  <h2 className="text-2xl font-bold">
                    {crawlRun?.actorTaskId}{selectedPath !== '/' && ` / ${formatPath(selectedPath)}`}
                  </h2>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fetchCrawlRunData(initialRunId)}
                  disabled={isRefreshing}
                  className="h-7 text-xs"
                >
                  <RefreshCw className={`w-3 h-3 mr-1 ${isRefreshing ? 'animate-spin' : ''}`} />
                  Refresh Status
                </Button>
              </div>
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
            {isLoading ? (
              <TableLoadingSkeleton />
            ) : (
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
                domain={crawlRun?.actorTaskId || ''}
              />
            )}
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