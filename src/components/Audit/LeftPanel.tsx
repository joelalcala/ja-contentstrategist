import React from "react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Settings, Plus } from "lucide-react"
import { FileTree } from "./FileTree"
import { buildFolderTree } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"  // Add this import

interface LeftPanelProps {
  pages: Array<{ path: string }>
  sites: Array<{ id: number; name: string; domain: string }>
  selectedSite: { id: number; name: string; domain: string }
  setSelectedSite: (site: { id: number; name: string; domain: string }) => void
  selectedPath: string
  setSelectedPath: (path: string) => void
  onNewCrawl: () => void
  onShowSiteSettings: () => void
  crawledPages: number
  maxPages: number
  crawlStatus: string
  isCrawlButtonDisabled: boolean
}

export function LeftPanel({
  pages,
  sites,
  selectedSite,
  setSelectedSite,
  selectedPath,
  setSelectedPath,
  onNewCrawl,
  onShowSiteSettings,
  crawledPages,
  maxPages,
  crawlStatus,
  isCrawlButtonDisabled,
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
        <Button 
          onClick={onNewCrawl} 
          disabled={isCrawlButtonDisabled}
          className="mt-2 w-full"
        >
          New Crawl
        </Button>
      </div>
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="p-4">
            <FileTree
              tree={folderTree}
              selectedPath={selectedPath}
              setSelectedPath={setSelectedPath}
            />
          </div>
        </ScrollArea>
      </div>
      <div className="p-4 border-t space-y-4">
        <Button variant="outline" className="w-full mb-2 text-xs" onClick={onShowSiteSettings}>
          <Settings className="w-3 h-3 mr-2" />
          Site Settings
        </Button>
        <Select
          value={selectedSite.id.toString()}
          onValueChange={(value) => {
            if (value === "new-crawl") {
              onNewCrawl()
            } else {
              const site = sites.find(s => s.id.toString() === value)
              if (site) {
                setSelectedSite(site)
              }
            }
          }}
        >
          <SelectTrigger className="w-full text-xs">
            <SelectValue>{selectedSite.domain}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            {sites.map((site) => (
              <SelectItem key={site.id} value={site.id.toString()}>
                {site.domain}
              </SelectItem>
            ))}
            <SelectItem value="new-crawl" className="text-primary font-medium" disabled={isCrawlButtonDisabled}>
              <div className="flex items-center">
                <Plus className="w-3 h-3 mr-2" />
                Run New Crawl
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}