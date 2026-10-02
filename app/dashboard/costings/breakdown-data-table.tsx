"use client"

import { useEffect, useMemo, useState } from "react"
import {
  type ColumnDef,
  type RowSelectionState,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
} from "@tanstack/react-table"

import { AssignBreakdownsToShipmentForm } from "@/components/forms/assign-breakdowns-shipment-form"
import { CostingExportActions } from "@/app/dashboard/costings/costing-export-actions"
import { DataTablePagination } from "@/components/data-table-pagination"
import {
  type AppliedTableFilters,
  DataTableToolbar,
} from "@/components/data-table-toolbar"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { CostingWriteGate } from "@/components/write-gates"
import {
  PAYMENT_STATUS_OPTIONS,
  type TableFilterConfig,
} from "@/lib/data-table-filters"
import {
  tableCellClass,
  tableHeaderCell,
  tableHeaderRow,
  tableRowClass,
  tableShell,
} from "@/lib/design"
import { cn } from "@/lib/utils"
import type { CostingBreakdownListItem } from "@/services/costing.service"

const ASSIGNMENT_OPTIONS = [
  { value: "all", label: "All" },
  { value: "linked", label: "Linked" },
  { value: "unlinked", label: "Unassigned" },
]

const breakdownFilters: TableFilterConfig<CostingBreakdownListItem> = {
  status: {
    id: "status",
    label: "Payment status",
    options: PAYMENT_STATUS_OPTIONS,
    getValue: (row) => row.costing.status,
  },
  lifecycleStatus: {
    id: "assigned",
    label: "Shipment",
    options: ASSIGNMENT_OPTIONS,
    getValue: (row) => (row.shipmentId ? "linked" : "unlinked"),
  },
  vendor: {
    id: "vendorId",
    label: "Vendor",
  },
  date: {
    id: "vendorInvoiceDate",
    label: "Invoice date",
    mode: "single",
    getValue: (row) => row.costing.vendorInvoiceDate,
  },
  paymentDate: {
    id: "paymentDate",
    label: "Payment date",
    getValue: (row) => row.costing.paymentDate,
  },
}

interface BreakdownDataTableProps {
  columns: ColumnDef<CostingBreakdownListItem, unknown>[]
  data: CostingBreakdownListItem[]
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
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})

  const pagination = useMemo(
    () => ({ pageIndex: Math.max(page - 1, 0), pageSize }),
    [page, pageSize]
  )

  useEffect(() => {
    setRowSelection({})
  }, [page, pageSize, applied])

  const selectionColumn = useMemo<ColumnDef<CostingBreakdownListItem>>(
    () => ({
      id: "select",
      enableSorting: false,
      enableHiding: false,
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected()
              ? true
              : table.getIsSomePageRowsSelected()
                ? "indeterminate"
                : false
          }
          onCheckedChange={(checked) =>
            table.toggleAllPageRowsSelected(checked === true)
          }
          aria-label="Select all breakdowns on this page"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(checked) => row.toggleSelected(checked === true)}
          aria-label={`Select ${row.original.productDescription}`}
        />
      ),
      meta: { cellClassName: "w-12" },
    }),
    []
  )

  const tableColumns = useMemo(
    () => [selectionColumn, ...columns],
    [selectionColumn, columns]
  )

  const table = useReactTable({
    data,
    columns: tableColumns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getRowId: (row) => row.id,
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
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
      rowSelection,
    },
  })

  const selectedRows = table.getSelectedRowModel().rows.map((row) => row.original)
  const selectedAssignments = selectedRows.map((row) => ({
    costingId: row.costingId,
    breakdownId: row.id,
  }))

  return (
    <div>
      <DataTableToolbar
        searchPlaceholder="Search description, vendor, invoice, vessel, shipment..."
        filters={breakdownFilters}
        applied={applied}
        onApply={onApply}
        extra={
          <div className="flex flex-wrap items-center gap-2">
            <CostingExportActions />
            {selectedAssignments.length > 0 ? (
              <CostingWriteGate>
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="h-11"
                    onClick={() => setRowSelection({})}
                  >
                    Clear selection
                  </Button>
                  <AssignBreakdownsToShipmentForm
                    items={selectedAssignments}
                    onAssigned={() => setRowSelection({})}
                    trigger={
                      <Button type="button" className="h-11">
                        Assign to shipment ({selectedAssignments.length})
                      </Button>
                    }
                  />
                </div>
              </CostingWriteGate>
            ) : null}
          </div>
        }
      />

      <div className={tableShell}>
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
                <TableRow
                  key={row.id}
                  className={cn(
                    tableRowClass,
                    row.getIsSelected() && "bg-[rgba(214,227,255,0.22)]"
                  )}
                  data-state={row.getIsSelected() ? "selected" : undefined}
                >
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
