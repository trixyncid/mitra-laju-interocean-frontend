"use client"

import { useMemo, useState } from "react"
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
} from "@tanstack/react-table"
import type { Shipment } from "@/app/dashboard/shipments/columns"
import { DataTablePagination } from "@/components/data-table-pagination"
import {
  AppliedTableFilters,
  DataTableToolbar,
} from "@/components/data-table-toolbar"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  ACTIVE_STATUS_OPTIONS,
} from "@/lib/data-table-filters"
import { tableCellClass, tableHeaderCell, tableHeaderRow, tableRowClass } from "@/lib/design"

interface DataTableProps {
  columns: ColumnDef<Shipment>[]
  data: Shipment[]
  page: number
  pageSize: number
  totalPages: number
  totalRows: number
  onPageChange: (page: number) => void
  onPageSizeChange: (pageSize: number) => void
  applied: AppliedTableFilters
  onApply: (next: AppliedTableFilters) => void
}

const emptyFilter: AppliedTableFilters = {
  search: "",
  status: "all",
  dateRange: {},
}

export function DataTable({
  columns,
  data,
  page,
  pageSize,
  totalPages,
  totalRows,
  onPageChange,
  onPageSizeChange,
  applied = emptyFilter,
  onApply,
}: DataTableProps) {
  const [sorting, setSorting] = useState<SortingState>([])
  const pagination = useMemo(
    () => ({ pageIndex: Math.max(page - 1, 0), pageSize }),
    [page, pageSize]
  )

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualPagination: true,
    pageCount: totalPages,
    onSortingChange: setSorting,
    onPaginationChange: (updater) => {
      const next =
        typeof updater === "function" ? updater(pagination) : updater
      if (next.pageIndex !== pagination.pageIndex) {
        onPageChange(next.pageIndex + 1)
      }
      if (next.pageSize !== pagination.pageSize) {
        onPageSizeChange(next.pageSize)
      }
    },
    state: {
      sorting,
      pagination,
    },
  })

  return (
    <div>
      <DataTableToolbar
        searchPlaceholder="Search by order number and customer code..."
        filters={{
          status: {
            id: "status",
            label: "Status",
            options: ACTIVE_STATUS_OPTIONS,
            getValue: () => undefined,
          },
          date: {
            id: "updatedAt",
            label: "Modified",
            getValue: () => undefined,
          },
        }}
        applied={applied}
        onApply={onApply}
      />

      <div className="overflow-hidden rounded-md border border-border">
        <Table>
          <TableHeader className="[&_tr]:border-0">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className={tableHeaderRow}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className={tableHeaderCell}>
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
                <TableRow key={row.id} className={tableRowClass}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className={tableCellClass}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow className="hover:bg-transparent">
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center text-muted-foreground"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="pt-4">
        <DataTablePagination table={table} totalRows={totalRows} />
      </div>
    </div>
  )
}
