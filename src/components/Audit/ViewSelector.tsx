import React from 'react'
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Settings } from "lucide-react"

interface ViewSelectorProps {
  visibleColumns: string[]
  setVisibleColumns: (columns: string[]) => void
  fields: Record<string, string[]>
  visibleFields: string[]
  toggleFieldVisibility: (fieldType: string) => void
  activeView: string
  setActiveView: (view: string) => void
  table: {
    getAllColumns: () => Array<{
      id: string
      getIsVisible: () => boolean
      toggleVisibility: (value: boolean) => void
    }>
  }
}

type ViewType = 'default' | 'compact' | 'detailed';

const views: Record<ViewType, { columns: string[], fields: string[] }> = {
  default: {
    columns: ["title", "path", "type"],
    fields: [],  // This will be populated dynamically
  },
  compact: {
    columns: ["title", "type"],
    fields: ["Status"],
  },
  detailed: {
    columns: ["title", "path", "type"],
    fields: [],  // This will be populated dynamically
  },
}

export function ViewSelector({
  visibleColumns,
  setVisibleColumns,
  fields,
  visibleFields,
  toggleFieldVisibility,
  activeView,
  setActiveView,
  table
}: ViewSelectorProps) {
  // Dynamically set the fields for 'default' and 'detailed' views
  views.default.fields = Object.keys(fields);
  views.detailed.fields = Object.keys(fields);

  const handleViewChange = (view: ViewType) => {
    setActiveView(view)
    setVisibleColumns(views[view].columns)
    const newVisibleFields = views[view].fields
    Object.keys(fields).forEach((field) => {
      if (newVisibleFields.includes(field)) {
        if (!visibleFields.includes(field)) {
          toggleFieldVisibility(field)
        }
      } else {
        if (visibleFields.includes(field)) {
          toggleFieldVisibility(field)
        }
      }
    })
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <Settings className="mr-2 h-4 w-4" />
          View
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onSelect={() => handleViewChange("default")}>
          Default View
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => handleViewChange("compact")}>
          Compact View
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => handleViewChange("detailed")}>
          Detailed View
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {table.getAllColumns().map((column) => (
          <DropdownMenuCheckboxItem
            key={column.id}
            className="capitalize"
            checked={column.getIsVisible()}
            onCheckedChange={(value) => column.toggleVisibility(!!value)}
          >
            {column.id}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}