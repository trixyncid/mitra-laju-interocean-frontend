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

import { VendorInvoiceExportActions } from "@/app/dashboard/vendor-invoices/vendor-invoice-export-actions"
import { DataTablePagination } from "@/components/data-table-pagination"
import {
  type AppliedTableFilters,
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
import { ActiveColumnFilters } from "@/components/column-filter/column-filter"
import {
  tableCellClass,
  tableHeaderCell,
  tableHeaderRow,
  tableRowClass,
  tableShell,
  stickyActionCell,
  stickyActionHeaderCell,
} from "@/lib/design"
import { cn } from "@/lib/utils"
import { isActionColumn } from "@/lib/data-table"
import type { VendorInvoiceBreakdownListItem } from "@/services/vendor-invoice.service"

interface BreakdownDataTableProps {
  columns: ColumnDef<VendorInvoiceBreakdownListItem, unknown>[]
  data: VendorInvoiceBreakdownListItem[]
  page: number
  pageSize: number
  totalPages: number
  totalRows: number
  applied: AppliedTableFilters
  onApply: (next: AppliedTableFilters) => void
  onPageChange: (page: number) => void
  onPageSizeChange: (pageSize: number) => void
}

export function BreakdownDataTable({
  columns,
  data,
  page,
  pageSize,
  totalPages,
  totalRows,
  applied,
  onApply,
  onPageChange,
  onPageSizeChange,
}: BreakdownDataTableProps) {
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
    getRowId: (row) => row.id,
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
        searchPlaceholder="Search description, container, vendor, invoice, vessel..."
        applied={applied}
        onApply={onApply}
        extra={<VendorInvoiceExportActions />}
      />

      <ActiveColumnFilters />

      <div className={tableShell}>
        <Table>
          <TableHeader className="[&_tr]:border-0">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className={tableHeaderRow}>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className={cn(
                      tableHeaderCell,
                      isActionColumn(header.column.id) && stickyActionHeaderCell
                    )}
                  >
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
                    <TableCell
                      key={cell.id}
                      className={cn(
                        tableCellClass,
                        isActionColumn(cell.column.id) && stickyActionCell,
                        (
                          cell.column.columnDef.meta as
                            | { cellClassName?: string }
                            | undefined
                        )?.cellClassName
                      )}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow className="hover:bg-transparent">
                <TableCell
                  colSpan={Math.max(table.getVisibleLeafColumns().length, 1)}
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
