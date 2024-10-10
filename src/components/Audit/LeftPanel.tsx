import React from "react"
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Layers } from "lucide-react"
import { FileTree } from "./FileTree"
import { buildFolderTree } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"

interface CrawlRun {
  id: string
  domain: string
  status: string
  crawled_pages: number
  max_page_count: number
}

interface LeftPanelProps {
  pages: Array<{ path: string }>
  crawlRuns: CrawlRun[]
  selectedCrawlRun: CrawlRun | null
  setSelectedCrawlRun: (crawlRun: CrawlRun | null) => void
  selectedPath: string
  setSelectedPath: (path: string) => void
  crawledPages: number
  maxPages: number
  crawlStatus: string
}

export function LeftPanel({
  pages,
  crawlRuns,
  selectedCrawlRun,
  setSelectedCrawlRun,
  selectedPath,
  setSelectedPath,
  crawledPages,
  maxPages,
  crawlStatus,
}: LeftPanelProps) {
  const progress = maxPages > 0 ? Math.min((crawledPages / maxPages) * 100, 100) : 0;
  const folderTree = buildFolderTree(pages);

  const getBadgeVariant = (status: string): "default" | "destructive" | "secondary" | "outline" => {
    switch (status.toLowerCase()) {
      case 'running':
        return 'default'
      case 'succeeded':
        return 'secondary'
      case 'failed':
        return 'destructive'
      default:
        return 'outline'
    }
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="p-4">
            <div
              className={`flex items-center py-1 px-2 cursor-pointer hover:bg-gray-100 mb-2 ${
                selectedPath === 'all' ? 'bg-blue-100' : ''
              }`}
              onClick={() => setSelectedPath('all')}
            >
              <Layers className="w-4 h-4 mr-2" />
              <span className="flex-grow text-sm">All pages</span>
              <Badge variant="secondary" className="ml-2">{pages.length}</Badge>
            </div>
            <FileTree
              tree={folderTree}
              selectedPath={selectedPath}
              setSelectedPath={setSelectedPath}
            />
          </div>
        </ScrollArea>
      </div>
      <div className="p-4 border-t">
        <h3 className="text-sm font-semibold mb-2">Crawl Progress</h3>
        <Progress value={progress} className="mb-2" />
        <div className="text-sm text-gray-600 mb-2">
          {crawledPages} / {maxPages || 'Unknown'} pages
        </div>
        <Badge variant={getBadgeVariant(crawlStatus)}>
          Status: {crawlStatus}
        </Badge>
      </div>
    </div>
  )
}