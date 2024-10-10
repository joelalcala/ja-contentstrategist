'use client'

import React, { useState, useRef, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { LeftPanel } from "@/components/audit/LeftPanel"
import { PageTable } from '@/components/audit/PageTable'
import { AddFieldModal } from '@/components/audit/AddFieldModal'
import { FiltersDialog } from '@/components/audit/FiltersDialog'
import { Search, Filter, RefreshCw, File, ChevronLeft, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { ApifyClient } from 'apify-client'
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
}

interface Page {
  id: string;
  url: string;
  title: string;
  path: string;
  type: string;
  fields: Record<string, any>;
  description: string;
  metaDescription: string;
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
  const [pageTypes, setPageTypes] = useState(['page', 'article', 'event', 'contact'])

  const fetchCrawlRunData = async (runId: string) => {
    setIsRefreshing(true);
    setIsLoading(true);
    try {
      const run = await apifyClient.run(runId).get();
      console.log('Fetched run:', run); // Log the run object for debugging
      setCrawlRun(run);

      if (!run || !run.defaultDatasetId) {
        console.error('Run or defaultDatasetId is undefined:', run);
        throw new Error('Invalid run data');
      }

      const { items } = await apifyClient.dataset(run.defaultDatasetId).listItems();
      console.log('Fetched items:', items); // Log the items for debugging
      const processedPages = items.map((item: any, index) => ({
        id: index.toString(),
        url: item.url || '',
        title: item.pageTitle || item.title || 'No Title',
        path: item.url ? new URL(item.url).pathname : '/',
        type: 'page',
        description: item.description || '',
        metaDescription: item.metaDescription || '',
        fields: {},
      }));
      setPages(processedPages);
    } catch (error) {
      console.error('Error fetching crawl run data:', error);
      setPages([]); // Set pages to an empty array in case of error
      setCrawlRun(null); // Reset crawlRun in case of error
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
    router.push(`/audit/${initialRunId}/page/${encodeURIComponent(page.url)}`)
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

  const formatTitle = (path: string): string => {
    const pageType = selectedPath === 'all' ? 'Pages' : 'Pages';
    if (path === 'all' || path === '/') return pageType;
    return `${pageType} / ${formatPath(path)}`;
  }

  return (
    <div className="flex flex-col h-screen bg-muted/40">
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
                <div className="ml-auto flex items-center gap-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="h-8 gap-1">
                        <Filter className="h-3.5 w-3.5" />
                        <span className="sr-only sm:not-sr-only">Filter</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Filter by</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuCheckboxItem checked>Active</DropdownMenuCheckboxItem>
                      <DropdownMenuCheckboxItem>Draft</DropdownMenuCheckboxItem>
                      <DropdownMenuCheckboxItem>Archived</DropdownMenuCheckboxItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <Button size="sm" variant="outline" className="h-8 gap-1">
                    <File className="h-3.5 w-3.5" />
                    <span className="sr-only sm:not-sr-only">Export</span>
                  </Button>
                </div>
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
                          data={filteredPages.filter(page => page.type === type)}
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
                    </CardContent>
                    <CardFooter>
                      <div className="text-xs text-muted-foreground">
                        Showing <strong>1-{filteredPages.filter(page => page.type === type).length}</strong> of <strong>{pages.filter(page => page.type === type).length}</strong> {type}s
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