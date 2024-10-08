import React from "react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Settings, Plus } from "lucide-react"
import { FileTree } from "./FileTree"
import { buildFolderTree } from "@/lib/utils"

interface LeftPanelProps {
  pages: any[]
  sites: any[]
  selectedSite: any
  setSelectedSite: (site: any) => void
  selectedPath: string
  setSelectedPath: (path: string) => void
  onNewCrawl: () => void
  onShowSiteSettings: () => void
}

export function LeftPanel({
  pages,
  sites,
  selectedSite,
  setSelectedSite,
  selectedPath,
  setSelectedPath,
  onNewCrawl,
  onShowSiteSettings
}: LeftPanelProps) {
  const folderTree = buildFolderTree(pages)

  // Mock crawl progress data
  const totalPages = 1000
  const crawledPages = 750
  const foundPages = 800

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b">
        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span>Found: {foundPages}</span>
            <span>Crawled: {crawledPages}</span>
          </div>
          <Progress value={(crawledPages / totalPages) * 100} className="w-full h-1" />
        </div>
      </div>
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="p-4">
            <FileTree
              tree={folderTree}
              selectedPath={selectedPath}
              setSelectedPath={setSelectedPath}
              pages={pages}
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
            <SelectItem value="new-crawl" className="text-primary font-medium">
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