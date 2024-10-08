import React from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  Row,
} from "@tanstack/react-table"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { ArrowUpDown } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ViewSelector } from './ViewSelector'

interface Page {
  id: number;
  title: string;
  type: string;
  path: string;
  description: string;
  fields: Record<string, string>;
  ogImage: string;
}

interface PageTableProps {
  data: Page[]
  onDecision: (id: number, fieldType: string, value: string) => void
  fields: Record<string, string[]>
  visibleColumns: string[]
  setVisibleColumns: (columns: string[]) => void
  visibleFields: string[]
  toggleFieldVisibility: (fieldType: string) => void
  onSelectPage: (page: Page) => void
  selectedPage: Page | null
  selectedRows: Set<number>
  setSelectedRows: (rows: Set<number>) => void
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
  const columns: ColumnDef<Page>[] = [
    {
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
    },
    {
      accessorKey: 'title',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Title
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
    },
    {
      accessorKey: 'path',
      header: 'Path',
    },
    {
      accessorKey: 'type',
      header: 'Type',
    },
    ...Object.keys(fields).map((fieldType) => ({
      accessorKey: `fields.${fieldType}`,
      header: fieldType,
      cell: ({ row }: { row: Row<Page> }) => (
        <Select
          value={row.original.fields[fieldType] || "not_set"}
          onValueChange={(value) => onDecision(row.original.id, fieldType, value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="(Empty)" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="not_set">(Empty)</SelectItem>
            {fields[fieldType].map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ),
    })),
  ]

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">{domain}</h2>
        <ViewSelector
          visibleColumns={visibleColumns}
          setVisibleColumns={setVisibleColumns}
          fields={fields}
          visibleFields={visibleFields}
          toggleFieldVisibility={toggleFieldVisibility}
          activeView={activeView}
          setActiveView={setActiveView}
          table={table}
        />
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  onClick={() => onSelectPage(row.original)}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}