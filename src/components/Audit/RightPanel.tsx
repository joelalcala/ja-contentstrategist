import React, { useState, useRef, useEffect } from "react"
import { SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { DetailsTab } from "./RightPanelTabs/DetailsTab"
import { Button } from "@/components/ui/button"
import { ExternalLink } from "lucide-react"
import { CommentsSection } from "./RightPanelSections/CommentsSection"

export interface Page {
  id: number;
  title: string;
  type: string;
  path: string;
  description: string;
  metaDescription?: string;
  fields: Record<string, string>;
  url: string;
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

  return (
    <div className="h-full flex flex-col">
      <div className="mt-6 mb-4">
        <SheetTitle className="text-lg mb-2">{page.title}</SheetTitle>
        <div className="flex justify-between items-center">
          <SheetDescription className="text-sm flex-grow mr-2">
            {page.metaDescription || page.description}
          </SheetDescription>
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open(page.url, '_blank', 'noopener,noreferrer')}
          >
            Open Page <ExternalLink className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
      <div className="flex-1 overflow-auto">
        <DetailsTab
          page={page}
          fields={fields}
          visibleFields={visibleFields}
          onDecision={onDecision}
          onAddField={onAddField}
          toggleFieldVisibility={toggleFieldVisibility}
        />
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