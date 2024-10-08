import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronDown, ChevronRight, Folder, Home } from "lucide-react"

interface FileTreeProps {
  tree: Record<string, any>
  selectedPath: string
  setSelectedPath: (path: string) => void
  pages: any[]
  level?: number
}

export function FileTree({ tree, selectedPath, setSelectedPath, pages, level = 0 }: FileTreeProps) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({ "/": true })

  const toggleExpand = (path: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (path !== "/") {
      setExpanded(prev => ({
        ...prev,
        [path]: !prev[path]
      }))
    }
  }

  const handleFolderClick = (path: string) => {
    setSelectedPath(path)
  }

  const getPageCount = (path: string) => {
    return pages.filter(page => page.path.startsWith(path)).length
  }

  return (
    <div className="space-y-1">
      {Object.entries(tree).map(([path, node]) => {
        const hasSubfolders = Object.keys(node).length > 0
        const isExpanded = expanded[path]
        const isHome = path === "/"
        const pageCount = getPageCount(path)

        return (
          <div key={path} className="relative">
            {level > 0 && (
              <div
                className="absolute left-3 top-0 bottom-0 w-px bg-border"
                style={{ height: "100%", top: "-8px" }}
              />
            )}
            <div
              className={`flex items-center space-x-1 rounded-md py-1 px-2 cursor-pointer ${
                selectedPath === path ? 'bg-accent text-accent-foreground' : 'hover:bg-accent hover:text-accent-foreground'
              }`}
              style={{ paddingLeft: `${level * 12 + 4}px` }}
              onClick={() => handleFolderClick(path)}
            >
              {hasSubfolders && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="p-0 h-6 w-6"
                  onClick={(e) => toggleExpand(path, e)}
                >
                  {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                </Button>
              )}
              {!hasSubfolders && <div className="w-6" />}
              {isHome ? (
                <Home className="h-4 w-4 text-primary" />
              ) : (
                <Folder className="h-4 w-4 text-primary" />
              )}
              <span className="text-sm font-medium">{isHome ? "Home" : path.split('/').pop()}</span>
              <Badge variant="secondary" className="ml-auto text-xs">
                {pageCount}
              </Badge>
            </div>
            {hasSubfolders && isExpanded && (
              <FileTree
                tree={node}
                selectedPath={selectedPath}
                setSelectedPath={setSelectedPath}
                pages={pages}
                level={level + 1}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}