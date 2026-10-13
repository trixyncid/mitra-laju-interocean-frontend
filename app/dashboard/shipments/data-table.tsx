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
import { ActiveColumnFilters } from "@/components/column-filter/column-filter"
import { ShipmentExportButton } from "@/components/shipments/shipment-export-button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { glassControl, stickyActionCell, stickyActionHeaderCell, tableCellClass, tableHeaderCell, tableHeaderRow, tableRowClass, tableShell } from "@/lib/design"
import { cn } from "@/lib/utils"
import { isActionColumn } from "@/lib/data-table"

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
  lifecycleStatus: "all",
  shipmentType: "all",
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
  const [showModifiedBy, setShowModifiedBy] = useState(false)
  const pagination = useMemo(
    () => ({ pageIndex: Math.max(page - 1, 0), pageSize }),
    [page, pageSize]
  )
  const columnVisibility = useMemo(
    () => ({ updatedBy: showModifiedBy, updatedAt: showModifiedBy }),
    [showModifiedBy]
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
      columnVisibility,
    },
  })

  return (
    <div>
      <DataTableToolbar
        searchPlaceholder="Search customer, vessel, booking or BL..."
        applied={applied}
        onApply={onApply}
        extra={
          <div className="flex flex-wrap items-center gap-2">
            <label
              className={cn(
                glassControl,
                "flex h-10 cursor-pointer items-center gap-2 border px-3 text-sm whitespace-nowrap"
              )}
            >
              <Checkbox
                checked={showModifiedBy}
                onCheckedChange={(checked) => setShowModifiedBy(checked === true)}
                aria-label="Show modified columns"
              />
              Modified
            </label>
            <ShipmentExportButton applied={applied} totalRows={totalRows} />
          </div>
        }
      />

      <ActiveColumnFilters />

      <div className={tableShell}>
        <Table className="min-w-max">
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
