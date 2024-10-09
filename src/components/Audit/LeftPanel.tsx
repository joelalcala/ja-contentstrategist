import React from "react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Settings, Layers } from "lucide-react"
import { FileTree } from "./FileTree"
import { buildFolderTree } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"

interface LeftPanelProps {
  pages: Array<{ path: string }>
  selectedPath: string
  setSelectedPath: (path: string) => void
  onShowSiteSettings: () => void
  crawledPages: number
  maxPages: number
  crawlStatus: string
}

export function LeftPanel({
  pages,
  selectedPath,
  setSelectedPath,
  onShowSiteSettings,
  crawledPages,
  maxPages,
  crawlStatus,
}: LeftPanelProps) {
  const progress = maxPages > 0 ? Math.min((crawledPages / maxPages) * 100, 100) : 0;
  const folderTree = buildFolderTree(pages);

  const getBadgeVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case 'running':
        return 'default'
      case 'succeeded':
        return 'success'
      case 'failed':
        return 'destructive'
      default:
        return 'secondary'
    }
  }

  return (
    <div className="h-full flex flex-col">
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
              <span className="text-sm text-gray-500">({pages.length})</span>
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
        <Button variant="outline" className="w-full text-xs" onClick={onShowSiteSettings}>
          <Settings className="w-3 h-3 mr-2" />
          Site Settings
        </Button>
      </div>
    </div>
  )
}