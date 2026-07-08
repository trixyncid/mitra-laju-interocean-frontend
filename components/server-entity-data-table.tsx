"use client"

import { useMemo, useState } from "react"
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
} from "@tanstack/react-table"

import { DataTablePagination } from "@/components/data-table-pagination"
import {
  type AppliedTableFilters,
  DataTableToolbar,
} from "@/components/data-table-toolbar"
import {
  tableCellClass,
  tableHeaderCell,
  tableHeaderRow,
  tableRowClass,
} from "@/lib/design"
import type { TableFilterConfig } from "@/lib/data-table-filters"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

type ServerEntityDataTableProps<TData, TValue> = {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  page: number
  pageSize: number
  totalPages: number
  totalRows: number
  onPageChange: (page: number) => void
  onPageSizeChange: (pageSize: number) => void
  searchPlaceholder: string
  filters?: TableFilterConfig<TData>
  applied: AppliedTableFilters
  onApply: (next: AppliedTableFilters) => void
}

export function ServerEntityDataTable<TData, TValue>({
  columns,
  data,
  page,
  pageSize,
  totalPages,
  totalRows,
  onPageChange,
  onPageSizeChange,
  searchPlaceholder,
  filters,
  applied,
  onApply,
}: ServerEntityDataTableProps<TData, TValue>) {
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
        searchPlaceholder={searchPlaceholder}
        filters={filters}
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
