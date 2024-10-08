import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface SimilarPagesTabProps {
  similarPages: any[]
}

export function SimilarPagesTab({ similarPages }: SimilarPagesTabProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Similar Pages</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {similarPages.map((similarPage) => (
            <div key={similarPage.id} className="flex items-center space-x-2">
              <div>
                <p className="font-medium text-xs">{similarPage.title}</p>
                <p className="text-xs text-gray-500">{similarPage.path}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}