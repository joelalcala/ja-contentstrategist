import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface PreviewTabProps {
  page: any
}

export function PreviewTab({ page }: PreviewTabProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Page Preview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="border rounded-lg overflow-hidden">
          <iframe
            src={`https://example.com${page.path}`}
            className="w-full h-[400px]"
            title={`Preview of ${page.title}`}
          />
        </div>
      </CardContent>
    </Card>
  )
}