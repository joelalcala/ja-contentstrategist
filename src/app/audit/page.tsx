"use client"

import React, { useState, useRef, useEffect, useMemo } from "react"
import { LeftPanel } from "@/components/audit/LeftPanel"
import { RightPanel } from "@/components/audit/RightPanel"
import { ChevronDown, ChevronRight, Settings, Plus, X, Search, User, Folder, Home, FileIcon, Send, Eye, EyeOff, Filter, Settings as ConfigIcon, ArrowUpDown, ChevronsUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { PageTable } from '@/components/audit/PageTable'
import { AddFieldModal } from '@/components/audit/AddFieldModal'
import { FiltersDialog } from '@/components/audit/FiltersDialog'

// Include all the component definitions (DropdownFilter, LeftPanel, FileTree, FiltersDialog, PageTable, ViewSelector, RightPanel, AddFieldModal) here

// Mock data for pages
const mockPages = [
  { id: 1, title: "Home", type: "landing", path: "/", description: "Welcome to our website", fields: {}, ogImage: "https://example.com/og-home.jpg" },
  { id: 2, title: "About Us", type: "article", path: "/about", description: "Learn about our company", fields: {}, ogImage: "https://example.com/og-about.jpg" },
  { id: 3, title: "California News", type: "article", path: "/news/california", description: "Latest news from California", fields: {}, ogImage: "https://example.com/og-california.jpg" },
  { id: 4, title: "Annual Conference", type: "event", path: "/events/annual-conference", description: "Join our annual conference", fields: {}, ogImage: "https://example.com/og-conference.jpg" },
  { id: 5, title: "Contact", type: "form", path: "/contact", description: "Get in touch with us", fields: {}, ogImage: "https://example.com/og-contact.jpg" },
  { id: 6, title: "Products", type: "listing", path: "/products", description: "Browse our products", fields: {}, ogImage: "https://example.com/og-products.jpg" },
  { id: 7, title: "Product A", type: "product", path: "/products/a", description: "Details about Product A", fields: {}, ogImage: "https://example.com/og-product-a.jpg" },
  { id: 8, title: "Product B", type: "product", path: "/products/b", description: "Details about Product B", fields: {}, ogImage: "https://example.com/og-product-b.jpg" },
  { id: 9, title: "Blog", type: "listing", path: "/blog", description: "Our latest blog posts", fields: {}, ogImage: "https://example.com/og-blog.jpg" },
  { id: 10, title: "Privacy Policy", type: "legal", path: "/privacy", description: "Our privacy policy", fields: {}, ogImage: "https://example.com/og-privacy.jpg" },
  { id: 11, title: "Terms of Service", type: "legal", path: "/terms", description: "Our terms of service", fields: {}, ogImage: "https://example.com/og-terms.jpg" },
  { id: 12, title: "FAQ", type: "support", path: "/faq", description: "Frequently asked questions", fields: {}, ogImage: "https://example.com/og-faq.jpg" },
]

// Initial fields
const initialFields = {
  Status: ["Needs review", "Keep as is", "Rewrite", "Merge", "Delete"],
}

// Mock data for sites
const mockSites = [
  { id: 1, name: "Main Website", domain: "www.example.com" },
  { id: 2, name: "Blog", domain: "blog.example.com" },
  { id: 3, name: "Support", domain: "support.example.com" },
]

export default function AuditPage() {
  const [leftPanelWidth, setLeftPanelWidth] = useState(256)
  const [rightPanelWidth, setRightPanelWidth] = useState(480)
  const [pages, setPages] = useState(mockPages)
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
  const [selectedSite, setSelectedSite] = useState(mockSites[0])
  const [selectedPath, setSelectedPath] = useState("/")
  const [showSiteSettings, setShowSiteSettings] = useState(false)
  const [showNewCrawl, setShowNewCrawl] = useState(false)
  const [selectedRows, setSelectedRows] = useState(new Set())
  const [bulkAction, setBulkAction] = useState("")
  const [bulkFieldType, setBulkFieldType] = useState("")
  const [bulkFieldValue, setBulkFieldValue] = useState("")
  const [activeView, setActiveView] = useState("default")
  const [isFiltersOpen, setIsFiltersOpen] = useState(false)

  const handleNewCrawl = () => {
    setShowNewCrawl(true)
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

  const handleBulkAction = () => {
    if (bulkAction === "set" && bulkFieldType && bulkFieldValue) {
      setPages(pages.map(page =>
        selectedRows.has(page.id) ? { ...page, fields: { ...page.fields, [bulkFieldType]: bulkFieldValue } } : page
      ))
    } else if (bulkAction === "clear" && bulkFieldType) {
      setPages(pages.map(page =>
        selectedRows.has(page.id) ? { ...page, fields: { ...page.fields, [bulkFieldType]: undefined } } : page
      ))
    }
    setSelectedRows(new Set())
    setBulkAction("")
    setBulkFieldType("")
    setBulkFieldValue("")
  }

  const startResizing = () => {
    setIsResizing(true)
  }

  const filteredPages = useMemo(() => {
    return pages.filter(page => {
      const matchesSearch = 
        page.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        page.path.toLowerCase().includes(searchQuery.toLowerCase()) ||
        page.type.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesActiveFilters = Object.entries(activeFilters).every(([key, values]) => {
        if (!values || values === "all") return true
        if (key === 'type') {
          return values === page.type
        }
        if (key === 'urlContains') {
          return page.path.includes(values)
        }
        return values === page.fields[key]
      })

      const matchesPath = selectedPath === "/" || page.path.startsWith(selectedPath)

      return matchesSearch && matchesActiveFilters && matchesPath
    })
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
            sites={mockSites}
            selectedSite={selectedSite}
            setSelectedSite={setSelectedSite}
            selectedPath={selectedPath}
            setSelectedPath={setSelectedPath}
            onNewCrawl={handleNewCrawl}
            onShowSiteSettings={() => setShowSiteSettings(true)}
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
              {selectedRows.size > 0 && (
                <div className="flex items-center space-x-2">
                  {/* Bulk action UI components */}
                </div>
              )}
            </div>
            {Object.entries(activeFilters).some(([_, values]) => values && values !== "all") && (
              <div className="flex flex-wrap gap-1 mb-2">
                {/* Active filters display */}
              </div>
            )}
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
              domain={selectedSite.domain}
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