import React from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { useRouter } from 'next/navigation'

interface PageTableProps {
  data: any[]
  onDecision: (id: string, fieldType: string, value: string) => void
  fields: Record<string, string[]>
  visibleColumns: string[]
  setVisibleColumns: (columns: string[]) => void
  visibleFields: string[]
  toggleFieldVisibility: (fieldType: string) => void
  onSelectPage: (page: any) => void
  selectedPage: any
  selectedRows: Set<string>
  setSelectedRows: (rows: Set<string>) => void
  activeView: string
  setActiveView: (view: string) => void
  domain: string
}

export function PageTable({
  data,
  onDecision,
  fields,
  visibleColumns,
  setVisibleColumns,
  visibleFields,
  toggleFieldVisibility,
  onSelectPage,
  selectedPage,
  selectedRows,
  setSelectedRows,
  activeView,
  setActiveView,
  domain
}: PageTableProps) {
  const router = useRouter()

  const handleRowClick = (page: any) => {
    onSelectPage(page);
  };

  const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>, id: string) => {
    event.stopPropagation()
    const newSelectedRows = new Set(selectedRows)
    if (event.target.checked) {
      newSelectedRows.add(id)
    } else {
      newSelectedRows.delete(id)
    }
    setSelectedRows(newSelectedRows)
  }

  return (
    <div className="w-full overflow-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[40px]">
              <Checkbox
                checked={selectedRows.size === data.length}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setSelectedRows(new Set(data.map(page => page.id)))
                  } else {
                    setSelectedRows(new Set())
                  }
                }}
              />
            </TableHead>
            {visibleColumns.map((column) => (
              <TableHead key={column}>{column}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((page) => (
            <TableRow
              key={page.id}
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => handleRowClick(page)}
            >
              <TableCell className="w-[40px]" onClick={(e) => e.stopPropagation()}>
                <Checkbox
                  checked={selectedRows.has(page.id)}
                  onCheckedChange={(checked) => {
                    const newSelectedRows = new Set(selectedRows)
                    if (checked) {
                      newSelectedRows.add(page.id)
                    } else {
                      newSelectedRows.delete(page.id)
                    }
                    setSelectedRows(newSelectedRows)
                  }}
                />
              </TableCell>
              {visibleColumns.map((column) => (
                <TableCell key={column}>{page[column]}</TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}