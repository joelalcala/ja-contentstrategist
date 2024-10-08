import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface Page {
  id: number;
  title: string;
  type: string;
  path: string;
  description: string;
  fields: Record<string, string>;
  ogImage: string;
}

interface PreviewTabProps {
  page: Page
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