import React, { useState, useRef, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { DetailsTab } from "./RightPanelTabs/DetailsTab"
import { PreviewTab } from "./RightPanelTabs/PreviewTab"
import { SimilarPagesTab } from "./RightPanelTabs/SimilarPagesTab"
import { CommentsSection } from "./RightPanelSections/CommentsSection"

export interface Page {
  id: number;
  title: string;
  type: string;
  path: string;
  description: string;
  fields: Record<string, string>;
  ogImage: string;
}

interface RightPanelProps {
  page: Page
  fields: Record<string, string[]>
  visibleFields: string[]
  onDecision: (fieldType: string, value: string) => void
  onAddField: () => void
  toggleFieldVisibility: (fieldType: string) => void
  setWidth: (width: number) => void
  pages: Page[]
}

export function RightPanel({
  page,
  fields,
  visibleFields,
  onDecision,
  onAddField,
  toggleFieldVisibility,
  setWidth,
  pages
}: RightPanelProps) {
  const resizeRef = useRef<HTMLDivElement>(null)
  const [isResizing, setIsResizing] = useState(false)

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return
      const newWidth = document.body.clientWidth - e.clientX
      setWidth(Math.max(300, Math.min(600, newWidth)))
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
  }, [isResizing, setWidth])

  const startResizing = () => {
    setIsResizing(true)
  }

  if (!page) {
    return null
  }

  const similarPages = pages
    .filter(p => p.id !== page.id && p.type === page.type)
    .slice(0, 5)

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-2">
        <SheetTitle className="text-lg">{page.title}</SheetTitle>
      </div>
      <SheetDescription className="mb-4 text-sm">{page.description}</SheetDescription>
      <div className="flex-1 overflow-auto">
        <Tabs defaultValue="details">
          <TabsList className="w-full">
            <TabsTrigger value="details" className="flex-1 text-xs">Details</TabsTrigger>
            <TabsTrigger value="preview" className="flex-1 text-xs">Preview</TabsTrigger>
            <TabsTrigger value="similar" className="flex-1 text-xs">Similar Pages</TabsTrigger>
          </TabsList>
          <TabsContent value="details">
            <DetailsTab
              page={page}
              fields={fields}
              visibleFields={visibleFields}
              onDecision={onDecision}
              onAddField={onAddField}
              toggleFieldVisibility={toggleFieldVisibility}
            />
          </TabsContent>
          <TabsContent value="preview">
            <PreviewTab page={page} />
          </TabsContent>
          <TabsContent value="similar">
            <SimilarPagesTab similarPages={similarPages} />
          </TabsContent>
        </Tabs>
      </div>
      <CommentsSection />
      <div
        ref={resizeRef}
        className="absolute left-0 top-0 bottom-0 w-1 bg-gray-200 hover:bg-gray-300 cursor-col-resize"
        onMouseDown={startResizing}
      />
    </div>
  )
}