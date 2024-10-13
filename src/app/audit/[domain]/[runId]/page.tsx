"use client"

import React, { useState, useRef, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useApify } from '@/contexts/ApifyContext'
import { LeftPanel } from "@/components/audit/LeftPanel"
import { PageTable } from '@/components/audit/PageTable'
import { AddFieldModal } from '@/components/audit/AddFieldModal'
import { FiltersDialog } from '@/components/audit/FiltersDialog'
import { Search, Filter, RefreshCw, File, ChevronLeft, ExternalLink, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { ApifyCrawlResult, CrawlPage } from '@/lib/api/types'
import { SupabaseApi } from '@/lib/api/supabase/supabaseApi'
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
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { CrawlRun } from '@/lib/supabaseClient';
import { TableLoadingSkeleton } from '@/components/audit/TableLoadingSkeleton';
import { TableActions } from '@/components/audit/TableActions';

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
  const apifyApi = useApify()
  const supabaseApi = new SupabaseApi()
  const [crawlRun, setCrawlRun] = useState<ApifyCrawlResult | null>(null)
  const [pages, setPages] = useState<CrawlPage[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
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

  useEffect(() => {
    console.log("Audit page mounted. Params:", params);
    if (apifyApi) {
      console.log("ApifyApi is available. Fetching crawl run data...");
      fetchCrawlRunData(params.runId)
    } else {
      console.log("ApifyApi is not available yet.");
    }
  }, [apifyApi, params.runId])

  const fetchCrawlRunData = async (runId: string) => {
    console.log("Fetching crawl run data for runId:", runId);
    setIsRefreshing(true);
    setIsLoading(true);
    try {
      console.log("Fetching crawl status from Apify...");
      const { data: run, error: runError } = await apifyApi.getCrawlStatus(runId);
      console.log("Apify crawl status response:", run);

      if (runError) throw new Error(runError);
      setCrawlRun(run);

      if (run && run.defaultDatasetId) {
        console.log("Fetching crawl results from Apify dataset...");
        const { data: crawlResults, error: resultsError } = await apifyApi.getCrawlResults(run.defaultDatasetId);
        
        if (resultsError) throw new Error(resultsError);

        console.log("Crawl results fetched successfully. Count:", crawlResults?.length);

        if (crawlResults && Array.isArray(crawlResults) && crawlResults.length > 0) {
          console.log("Processing crawl results...");
          const processedPages = crawlResults.map(result => ({
            url: result.url,
            title: result.pageTitle || null,
            content_type: result.contentType || null,
            body: result.body || null,
            custom_fields: {}, // Initialize as empty object
            run_id: runId,
          }));

          console.log("Processed pages:", processedPages);

          console.log("Storing crawl results in Supabase...");
          const { data: storedPages, error: storeError } = await supabaseApi.insertCrawlPages(processedPages);

          if (storeError) throw new Error(storeError);

          console.log("Crawl results stored successfully. Count:", storedPages?.length);
          setPages(storedPages || []);
        } else {
          console.log("No valid crawl results to process.");
          setPages([]);
        }
      } else {
        console.log("Fetching crawl pages from Supabase...");
        const { data: crawlPages, error: pagesError } = await supabaseApi.getCrawlPages(runId);

        if (pagesError) throw new Error(pagesError);
      
        console.log("Crawl pages fetched from Supabase successfully. Count:", crawlPages?.length);
        setPages(crawlPages || []);
      }
    } catch (error) {
      console.error('Error in fetchCrawlRunData:', error);
      setPages([]);
      setCrawlRun(null);
    } finally {
      setIsRefreshing(false);
      setIsLoading(false);
      console.log("Finished fetching crawl run data. Pages count:", pages.length);
    }
  };

  const handleRefresh = () => {
    fetchCrawlRunData(params.runId)
  }

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

  const handleSelectPage = (page: CrawlPage) => {
    setIsNavigating(true)
    router.push(`/audit/${params.domain}/${params.runId}/${encodeURIComponent(page.url)}`)
  }

  const startResizing = () => {
    setIsResizing(true)
  }

  const filteredPages = useMemo(() => {
    return pages.filter(page => {
      const matchesSearch = 
        (page.title?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false) ||
        (page.url?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false) ||
        (page.content_type?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);

      const matchesActiveFilters = Object.entries(activeFilters).every(([key, values]) => {
        if (!values || values === "all") return true;
        if (key === 'content_type') {
          return values === page.content_type;
        }
        if (key === 'urlContains') {
          return page.url?.includes(values as string) ?? false;
        }
        return values === page.custom_fields?.[key];
      });

      const matchesPath = selectedPath === "all" || selectedPath === "/" || 
        (page.url && new URL(page.url).pathname.startsWith(selectedPath));

      return matchesSearch && matchesActiveFilters && matchesPath;
    });
  }, [pages, searchQuery, activeFilters, selectedPath]);

  useEffect(() => {
    console.log("Pages state updated:", pages);
    console.log("Filtered pages:", filteredPages);
  }, [pages, filteredPages]);

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
          <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:px-6">
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link href="/">Dashboard</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link href="/audit">Audit</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>{crawlRun?.actorTaskId || 'Current Audit'}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
            <div className="relative ml-auto flex-1 md:grow-0">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[336px]"
              />
            </div>
            <Button onClick={handleRefresh} size="sm" variant="outline" className="h-8 gap-1" disabled={isRefreshing}>
              <RefreshCw className="h-3.5 w-3.5" />
              <span className="sr-only sm:not-sr-only">Refresh</span>
            </Button>
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