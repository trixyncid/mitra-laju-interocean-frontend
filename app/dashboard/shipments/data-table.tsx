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
import { IconFileSpreadsheet } from "@tabler/icons-react"
import { toast } from "sonner"
import type { Shipment } from "@/app/dashboard/shipments/columns"
import { DataTablePagination } from "@/components/data-table-pagination"
import {
  AppliedTableFilters,
  DataTableToolbar,
} from "@/components/data-table-toolbar"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import {
  SHIPMENT_LIFECYCLE_OPTIONS,
  SHIPMENT_TYPE_FILTER_OPTIONS,
} from "@/lib/data-table-filters"
import { glassControl, tableCellClass, tableHeaderCell, tableHeaderRow, tableRowClass, tableShell } from "@/lib/design"
import { cn } from "@/lib/utils"
import { shipmentsService } from "@/services/shipments.service"

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
  const [isExporting, setIsExporting] = useState(false)
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

  async function handleExportExcel() {
    if (isExporting) return
    if (totalRows === 0) {
      toast.error("No shipments to export for the current filters.")
      return
    }

    setIsExporting(true)
    try {
      const { rowCount } = await shipmentsService.exportExcel({
        search: applied.search || undefined,
        lifecycleStatus: (applied.lifecycleStatus ?? "all") as
          | "all"
          | "DRAFT"
          | "BACKUP"
          | "ONGOING"
          | "FINISHED",
        shipmentType: (applied.shipmentType ?? "all") as
          | "all"
          | "EXPORT"
          | "IMPORT"
          | "DOMESTIC",
      })

      const exportedCount = rowCount ?? totalRows
      toast.success(`Exported ${exportedCount} shipments.`)
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to export shipments."
      )
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div>
      <DataTableToolbar
        searchPlaceholder="Search by order number and customer code..."
        filters={{
          lifecycleStatus: {
            id: "lifecycleStatus",
            label: "Status",
            options: SHIPMENT_LIFECYCLE_OPTIONS,
            getValue: () => undefined,
          },
          shipmentType: {
            id: "shipmentType",
            label: "Shipment Type",
            options: SHIPMENT_TYPE_FILTER_OPTIONS,
            getValue: () => undefined,
          },
        }}
        applied={applied}
        onApply={onApply}
        extra={
          <div className="flex flex-wrap items-center gap-2">
            <label
              className={cn(
                glassControl,
                "flex h-11 cursor-pointer items-center gap-2 border px-3 text-sm whitespace-nowrap"
              )}
            >
              <Checkbox
                checked={showModifiedBy}
                onCheckedChange={(checked) => setShowModifiedBy(checked === true)}
                aria-label="Show modified columns"
              />
              Modified
            </label>
            <Button
              type="button"
              variant="outline"
              className="h-11"
              disabled={isExporting}
              onClick={() => void handleExportExcel()}
            >
              <IconFileSpreadsheet className="size-4" />
              {isExporting
                ? "Exporting..."
                : totalRows > 0
                  ? `Export Excel (${totalRows})`
                  : "Export Excel"}
            </Button>
          </div>
        }
      />

      <div className={tableShell}>
        <Table className="min-w-max">
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
                    <TableCell
                      key={cell.id}
                      className={cn(
                        tableCellClass,
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
