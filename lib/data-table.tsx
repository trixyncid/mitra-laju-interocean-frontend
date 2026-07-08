import type { Column } from "@tanstack/react-table"

import { DataTableColumnHeader } from "@/components/data-table-column-header"

export function sortHeader<TData, TValue>(
  column: Column<TData, TValue>,
  title: string,
  className?: string
) {
  return (
    <DataTableColumnHeader column={column} title={title} className={className} />
  )
}

/** Newest / largest first on first click. */
export const sortDescFirst = { sortDescFirst: true } as const

/** Text columns: A–Z first. */
export const sortAscFirst = { sortDescFirst: false } as const

export const actionColumn = {
  id: "actions",
  enableSorting: false,
} as const

export const textSort = {
  sortingFn: "alphanumeric",
  ...sortAscFirst,
} as const

export const dateSort = {
  sortingFn: "datetime",
  ...sortDescFirst,
} as const

export const numberSort = {
  sortingFn: "basic",
  ...sortDescFirst,
} as const
