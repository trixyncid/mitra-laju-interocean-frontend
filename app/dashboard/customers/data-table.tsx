"use client"

import { useState } from "react"

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  useReactTable,
  type FilterFn,
} from "@tanstack/react-table"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { DataTablePagination } from "@/components/data-table-pagination"

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
}

export function DataTable<TData, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
    const [globalFilter, setGlobalFilter] = useState<string>("")

    const customerSearchFilter: FilterFn<TData> = (row, columnId, value) => {
        const search = value.toLowerCase();
        const name = (row.getValue("customerName") as string)?.toLowerCase() ?? "";
        const code = (row.getValue("customerCode") as string)?.toLowerCase() ?? "";
        return name.includes(search) || code.includes(search);
    }

    const table = useReactTable({
        data,
        columns,
        globalFilterFn: customerSearchFilter,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        state: {
            globalFilter
        },
        onGlobalFilterChange: setGlobalFilter,
    })

  return (
    <div>
        <div className="flex items-center py-4">
            <Input
                placeholder="Search by customer name or code..."
                value={globalFilter ?? ""}
                onChange={(event) =>
                    setGlobalFilter(event.target.value)
                }
                className="max-w-sm"
            />
        </div>

        <div className="overflow-hidden rounded-md border mb-3">
            <Table>
                <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => {
                        return (
                        <TableHead key={header.id}>
                            {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                                )}
                        </TableHead>
                        )
                    })}
                    </TableRow>
                ))}
                </TableHeader>
                <TableBody>
                {table.getRowModel().rows?.length ? (
                    table.getRowModel().rows.map((row) => (
                    <TableRow
                        key={row.id}
                        data-state={row.getIsSelected() && "selected"}
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

        <DataTablePagination table={table} />
    </div>
  )
}