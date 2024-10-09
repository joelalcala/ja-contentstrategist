import React from "react"
import { Button } from "@/components/ui/button"
import { ExternalLink } from "lucide-react"

interface PreviewTabProps {
  page: {
    url: string;
    title: string;
  }
}

export function PreviewTab({ page }: PreviewTabProps) {
  return (
    <div className="h-full flex flex-col items-center justify-center">
      <p className="mb-4 text-center">
        This page cannot be displayed in an iframe due to security restrictions.
      </p>
      <Button
        onClick={() => window.open(page.url, '_blank', 'noopener,noreferrer')}
      >
        Open Page in New Tab <ExternalLink className="ml-2 h-4 w-4" />
      </Button>
    </div>
  )
}