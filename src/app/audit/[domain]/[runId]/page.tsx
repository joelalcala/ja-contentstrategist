"use client"

import React, { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { LeftPanel } from "@/components/audit/LeftPanel"
import { PageTable } from '@/components/audit/PageTable'
import { AddFieldModal } from '@/components/audit/AddFieldModal'
import { FiltersDialog } from '@/components/audit/FiltersDialog'
import { Search, Loader2, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { TableLoadingSkeleton } from '@/components/audit/TableLoadingSkeleton';
import { TableActions } from '@/components/audit/TableActions';
import { useCrawlRun } from '@/hooks/useCrawlRun';
import { useFilteredPages } from '@/hooks/useFilteredPages';
import { Breadcrumbs } from '@/components/audit/Breadcrumbs';

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

export default function AuditPage({ params }: { params: { domain: string; runId: string } }) {
  const router = useRouter()
  const { crawlRun, pages, isLoading, isRefreshing, fetchCrawlRunData } = useCrawlRun(params.runId);
  const [leftPanelWidth, setLeftPanelWidth] = useState(256)
  const [rightPanelWidth, setRightPanelWidth] = useState(480)
  const [selectedPage, setSelectedPage] = useState<CrawlPage | null>(null)
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
  const [pageTypes, setPageTypes] = useState(['page', 'article', 'event', 'contact'])
  const [isNavigating, setIsNavigating] = useState(false)
  const [expandedNodes, setExpandedNodes] = useState<string[]>(['/']);

  const filteredPages = useFilteredPages({ pages, searchQuery, activeFilters, selectedPath });

  useEffect(() => {
    console.log("Pages state updated:", pages);
    console.log("Filtered pages:", filteredPages);
    // Add more detailed logging
    if (pages.length > 0) {
      console.log("Sample page data:", pages[0]);
    }
  }, [pages, filteredPages]);

  const startResizing = () => {
    setIsResizing(true)
  }

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

  const formatTitle = (path: string): string => {
    const pageType = selectedPath === 'all' ? 'Pages' : 'Pages';
    if (path === 'all' || path === '/') return pageType;
    return `${pageType} / ${formatPath(path)}`;
  }

  const handleSetSelectedPath = (path: string) => {
    console.log("Setting selected path:", path);
    setSelectedPath(path);
  };

  const handleFilterClick = () => {
    setIsFiltersOpen(true);
  };

  const handleExportClick = () => {
    // Implement export functionality here
    console.log('Export clicked');
  };

  const handleRefresh = () => {
    fetchCrawlRunData();
  };

  const handleNewCrawl = () => {
    router.push('/crawl');
  };

  const addField = (fieldType: string, options: string[]) => {
    setFields({ ...fields, [fieldType]: options });
    setVisibleFields([...visibleFields, fieldType]);
  };

  return (
    <div className="flex flex-col h-screen bg-muted/40">
      {isNavigating && (
        <div className="fixed inset-0 bg-background/80 flex items-center justify-center z-50">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      )}
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
              setSelectedPath={handleSetSelectedPath}
              onNewCrawl={handleNewCrawl}
              onShowSiteSettings={() => setShowSiteSettings(true)}
              crawledPages={pages.length}
              maxPages={crawlRun?.defaultDatasetId ? pages.length : 0}
              crawlStatus={crawlRun?.status || ''}
              domain={params.domain.replace(/^(https?:\/\/)?(www\.)?/, '')}
            />
          )}
        </div>
        <div
          ref={leftResizeRef}
          className="w-1 bg-gray-200 hover:bg-gray-300 cursor-col-resize"
          onMouseDown={startResizing}
        />
        <main className="flex-1 flex flex-col overflow-hidden">
          <header className="top-0 z-30 flex h-14 items-center gap-4 px-4 sm:px-6">
            <Breadcrumbs 
              domain={params.domain} 
              runId={params.runId} 
              actorTaskId={crawlRun?.actorTaskId}
            />
          </header>
          <div className="flex-1 overflow-auto p-4 sm:px-6">
            <Tabs defaultValue="page" className="space-y-4">
              <div className="flex items-center justify-between">
                <TabsList>
                  {pageTypes.map((type) => (
                    <TabsTrigger key={type} value={type} className="capitalize">
                      {type}
                    </TabsTrigger>
                  ))}
                </TabsList>
                <TableActions onFilterClick={handleFilterClick} onExportClick={handleExportClick} />
              </div>
              {pageTypes.map((type) => (
                <TabsContent key={type} value={type}>
                  <Card>
                    <CardHeader>
                      <CardTitle>{formatTitle(selectedPath)}</CardTitle>
                      <CardDescription>Manage your {type}s and view their content.</CardDescription>
                    </CardHeader> 
                    <CardContent>
                      {isLoading ? (
                        <TableLoadingSkeleton />
                      ) : (
                        <PageTable
                          pages={filteredPages}
                          visibleColumns={visibleColumns}
                          visibleFields={visibleFields}
                          selectedRows={selectedRows}
                          setSelectedRows={setSelectedRows}
                          activeFilters={activeFilters}
                        />
                      )}
                    </CardContent>
                    <CardFooter>
                      <div className="text-xs text-muted-foreground">
                        Showing <strong>1-{filteredPages.filter(page => page.content_type === type).length}</strong> of <strong>{pages.filter(page => page.content_type === type).length}</strong> {type}s
                      </div>
                    </CardFooter>
                  </Card>
                </TabsContent>
              ))}
            </Tabs>
          </div>
        </main>
      </div>
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
