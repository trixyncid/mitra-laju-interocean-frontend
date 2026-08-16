"use client"

import ContainerLookupActionCell from "@/components/action-cell/container-lookup-action-cell"
import { localDate } from "@/lib/utils"
import { ColumnDef } from "@tanstack/react-table"
import { StatusChip } from "@/components/ui/status-chip"
import { primaryText, secondaryText } from "@/lib/design"
import {
  actionColumn,
  dateSort,
  sortDescFirst,
  sortHeader,
  textSort,
} from "@/lib/data-table"
import type { ContainerLookupKind } from "@/services/container-lookups.service"

export type ContainerLookup = {
  id?: string
  name: string
  isActive: boolean
  updatedBy?: { name?: string } | string
  updatedAt?: string
}

export function createContainerLookupColumns(
  kind: ContainerLookupKind
): ColumnDef<ContainerLookup>[] {
  const nameHeader = kind === "size" ? "Size" : "Type"

  return [
    {
      accessorKey: "name",
      header: ({ column }) => sortHeader(column, nameHeader),
      ...textSort,
      cell: ({ row }) => <span className={primaryText}>{row.original.name}</span>,
    },
    {
      id: "updatedBy",
      accessorFn: (row) => (row.updatedBy as { name?: string } | undefined)?.name ?? "",
      header: ({ column }) => sortHeader(column, "Modified By"),
      ...textSort,
      cell: ({ row }) => (
        <span className={secondaryText}>
          {(row.original.updatedBy as { name: string } | undefined)?.name}
        </span>
      ),
    },
    {
      accessorKey: "updatedAt",
      header: ({ column }) => sortHeader(column, "Modified At"),
      ...dateSort,
      cell: ({ row }) => (
        <span className={secondaryText}>{localDate(row.original.updatedAt as string)}</span>
      ),
    },
    {
      accessorKey: "isActive",
      header: ({ column }) => sortHeader(column, "Status"),
      ...sortDescFirst,
      cell: ({ row }) => <StatusChip active={row.original.isActive} />,
    },
    {
      ...actionColumn,
      header: "Action",
      cell: ({ row }) => <ContainerLookupActionCell kind={kind} row={row} />,
    },
  ]
}
