"use client"

import { Fragment, useMemo, useState } from "react"
import { IconChevronDown } from "@tabler/icons-react"
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
  groupShipments,
  ShipmentGroupMenu,
  ShipmentSortMenu,
  VesselGroupExtras,
  type ShipmentGroupBy,
} from "@/components/shipments/shipment-grouping"
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
  groupBy: ShipmentGroupBy
  onGroupByChange: (groupBy: ShipmentGroupBy) => void
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
  groupBy,
  onGroupByChange,
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

  const [collapsed, setCollapsed] = useState<Set<string>>(() => new Set())
  const rows = table.getRowModel().rows
  const visibleColumnCount = Math.max(table.getVisibleLeafColumns().length, 1)
  // Groups cover the current page; the server sorts by the grouped field so
  // each group's shipments sit together.
  const rowByShipment = new Map(rows.map((row) => [row.original, row]))
  const groups = groupShipments(rows.map((row) => row.original), groupBy).map((group) => ({
    ...group,
    rows: group.shipments.map((shipment) => rowByShipment.get(shipment)!),
  }))

  const changeGroupBy = (next: ShipmentGroupBy) => {
    setCollapsed(new Set())
    onGroupByChange(next)
  }
  const toggleGroup = (key: string) =>
    setCollapsed((current) => {
      const next = new Set(current)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })

  const renderRow = (row: (typeof rows)[number]) => (
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
  )

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
            <ShipmentSortMenu
              value={applied.sort}
              onChange={(sort) => onApply({ ...applied, sort })}
              className="h-10 px-4 text-sm"
            />
            <ShipmentGroupMenu value={groupBy} onChange={changeGroupBy} className="h-10 px-4 text-sm" />
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
            {rows.length && groupBy === "none" ? (
              rows.map(renderRow)
            ) : rows.length ? (
              groups.map((group) => {
                const isCollapsed = collapsed.has(group.key)
                return (
                  <Fragment key={group.key}>
                    <TableRow className="border-0 hover:bg-transparent">
                      <TableCell colSpan={visibleColumnCount} className="p-0 pt-2">
                        <div className="sticky left-0 flex max-w-[min(100%,calc(100vw-4rem))] items-center gap-2">
                        <button
                          type="button"
                          onClick={() => toggleGroup(group.key)}
                          aria-expanded={!isCollapsed}
                          className="flex min-w-0 cursor-pointer items-center gap-2 rounded-lg bg-muted/70 px-3 py-2 text-left hover:bg-muted"
                        >
                          <IconChevronDown
                            className={cn(
                              "size-4 shrink-0 text-muted-foreground transition-transform",
                              isCollapsed && "-rotate-90"
                            )}
                          />
                          {group.hint ? (
                            <span
                              className="shrink-0 rounded bg-secondary px-1.5 py-0.5 text-[11px] font-semibold text-secondary-foreground"
                              title={group.label}
                            >
                              {group.hint}
                            </span>
                          ) : null}
                          <span className="min-w-0 truncate text-xs font-semibold text-foreground" title={group.label}>
                            {group.label}
                          </span>
                          <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
                            · {group.rows.length} on this page
                          </span>
                        </button>
                        {groupBy === "vessel" ? <VesselGroupExtras group={group} /> : null}
                        </div>
                      </TableCell>
                    </TableRow>
                    {isCollapsed ? null : group.rows.map(renderRow)}
                  </Fragment>
                )
              })
            ) : (
              <TableRow className="hover:bg-transparent">
                <TableCell
                  colSpan={visibleColumnCount}
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
