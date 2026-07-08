"use client"

import { useMemo, useState } from "react"
import {
  ColumnDef,
  ColumnFiltersState,
  FilterFn,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { DataTablePagination } from "@/components/data-table-pagination"
import {
  AppliedTableFilters,
  DataTableToolbar,
} from "@/components/data-table-toolbar"
import {
  applyTableFilters,
  type TableFilterConfig,
} from "@/lib/data-table-filters"
import {
  tableCellClass,
  tableHeaderCell,
  tableHeaderRow,
  tableRowClass,
} from "@/lib/design"

type EntityDataTableProps<TData, TValue> = {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  searchPlaceholder?: string
  searchColumn?: string
  globalFilterFn?: FilterFn<TData>
  showSearch?: boolean
  filters?: TableFilterConfig<TData>
}

const initialFilters: AppliedTableFilters = {
  search: "",
  status: "all",
  dateRange: {},
}

export function EntityDataTable<TData, TValue>({
  columns,
  data,
  searchPlaceholder = "Search...",
  searchColumn,
  globalFilterFn,
  showSearch = true,
  filters,
}: EntityDataTableProps<TData, TValue>) {
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [globalFilter, setGlobalFilter] = useState("")
  const [sorting, setSorting] = useState<SortingState>([])
  const [applied, setApplied] = useState<AppliedTableFilters>(initialFilters)
  const dateRange = applied.dateRange ?? {}

  const filteredData = useMemo(
    () =>
      applyTableFilters(
        data,
        filters,
        applied.status ?? "all",
        dateRange
      ),
    [data, filters, applied.status, dateRange]
  )

  const table = useReactTable({
    data: filteredData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn,
    state: {
      sorting,
      columnFilters,
      ...(searchColumn ? {} : { globalFilter }),
    },
  })

  const handleApply = (next: AppliedTableFilters) => {
    setApplied(next)

    if (searchColumn) {
      const column = table.getColumn(searchColumn)
      column?.setFilterValue(next.search ? next.search : undefined)
      return
    }

    setGlobalFilter(next.search)
  }

  const showToolbar = showSearch || Boolean(filters)

  return (
    <div>
      {showToolbar ? (
        <DataTableToolbar
          searchPlaceholder={searchPlaceholder}
          showSearch={showSearch}
          filters={filters}
          applied={{
            search: applied.search ?? "",
            status: applied.status ?? "all",
            dateRange,
          }}
          onApply={handleApply}
        />
      ) : null}

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
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className={tableRowClass}
                >
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
        <DataTablePagination table={table} />
      </div>
    </div>
  )
}
