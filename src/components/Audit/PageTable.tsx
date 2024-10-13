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
  pages: any[]
  visibleColumns: string[]
  visibleFields: string[]
  selectedRows: Set<string>
  setSelectedRows: (rows: Set<string>) => void
  activeFilters: string
}

export function PageTable({
  pages,
  visibleColumns,
  visibleFields,
  selectedRows,
  setSelectedRows,
  activeFilters
}: PageTableProps) {
  console.log("Pages received in PageTable:", pages);
  console.log("Visible columns:", visibleColumns);
  console.log("Visible fields:", visibleFields);

  if (!pages || pages.length === 0) {
    return <div>No pages to display</div>;
  }

  return (
    <div className="w-full overflow-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[40px]">
              <Checkbox
                checked={selectedRows.size === pages.length}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setSelectedRows(new Set(pages.map(page => page.id)))
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
          {pages.map((page) => (
            <TableRow
              key={page.id}
              className="cursor-pointer hover:bg-muted/50"
            >
              <TableCell className="w-[40px]">
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
                <TableCell key={`${page.id}-${column}`}>
                  {page[column as keyof CrawlPage] || page.custom_fields?.[column] || ''}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
