import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Eye, EyeOff } from "lucide-react"

interface Page {
  id: number;
  title: string;
  type: string;
  path: string;
  description: string;
  fields: Record<string, string>;
  ogImage: string;
}

interface DetailsTabProps {
  page: Page
  fields: Record<string, string[]>
  visibleFields: string[]
  onDecision: (fieldType: string, value: string) => void
  onAddField: () => void
  toggleFieldVisibility: (fieldType: string) => void
}

export function DetailsTab({
  page,
  fields,
  visibleFields,
  onDecision,
  onAddField,
  toggleFieldVisibility
}: DetailsTabProps) {
  return (
    <div className="space-y-4">
      <Card className="p-4">
        <CardHeader className="p-0 pb-2">
          <CardTitle className="text-sm">Page Information</CardTitle>
        </CardHeader>
        <CardContent className="p-0 space-y-2">
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <Label className="font-semibold">Path</Label>
              <p>{page.path}</p>
            </div>
            <div>
              <Label className="font-semibold">Type</Label>
              <p>{page.type}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card className="p-4">
        <CardHeader className="p-0 pb-2 flex flex-row items-center justify-between">
          <CardTitle className="text-sm">Fields</CardTitle>
          <Button onClick={onAddField} size="sm" variant="outline" className="h-6 text-xs">
            <Plus className="w-3 h-3 mr-1" />
            Add
          </Button>
        </CardHeader>
        <CardContent className="p-0 space-y-2">
          {Object.entries(fields).map(([fieldType, options]) => (
            <div key={fieldType} className="flex items-center space-x-2">
              <Label className="w-24 text-xs">{fieldType}</Label>
              <Select
                value={page.fields[fieldType] || "not_set"}
                onValueChange={(value) => onDecision(fieldType, value)}
              >
                <SelectTrigger className="flex-grow h-7 text-xs">
                  <SelectValue placeholder="(Empty)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="not_set">
                    (Empty)
                  </SelectItem>
                  {options.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleFieldVisibility(fieldType)}
                className="h-7 w-7 p-0"
              >
                {visibleFields.includes(fieldType) ? (
                  <Eye className="h-3 w-3" />
                ) : (
                  <EyeOff className="h-3 w-3" />
                )}
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}