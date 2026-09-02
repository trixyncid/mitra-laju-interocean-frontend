"use client"

import Link from "next/link"

import UserActionCell from "@/components/action-cell/user-action-cell"
import { RoleChip } from "@/components/ui/role-chip"
import { StatusChip } from "@/components/ui/status-chip"
import { localDate } from "@/lib/utils"
import { ColumnDef } from "@tanstack/react-table"
import { primaryText, secondaryText } from "@/lib/design"
import {
  actionColumn,
  dateSort,
  sortDescFirst,
  sortHeader,
  textSort,
} from "@/lib/data-table"

import type { UserRole } from "@/lib/permissions"

export type { UserRole }

export type User = {
  id: string
  name: string
  email: string
  emailVerified: boolean
  image: string | null
  role: UserRole | string
  roleId?: string
  roleRef?: {
    id: string
    slug: string
    name: string
    isSystem: boolean
  }
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export function getUserColumns({
  canEditUsers,
  canDeleteUsers,
}: {
  canEditUsers: boolean
  canDeleteUsers: boolean
}): ColumnDef<User>[] {
  const columns: ColumnDef<User>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => sortHeader(column, "Name"),
    ...textSort,
    cell: ({ row }) =>
      canEditUsers ? (
        <Link
          href={`/dashboard/users/${row.original.id}`}
          className={`${primaryText} hover:underline`}
        >
          {row.original.name}
        </Link>
      ) : (
        <span className={primaryText}>{row.original.name}</span>
      ),
  },
  {
    accessorKey: "email",
    header: ({ column }) => sortHeader(column, "Email"),
    ...textSort,
    cell: ({ row }) => <span className={secondaryText}>{row.original.email}</span>,
  },
  {
    accessorKey: "role",
    header: ({ column }) => sortHeader(column, "Role"),
    ...textSort,
    cell: ({ row }) => (
      <RoleChip role={row.original.roleRef?.name ?? row.original.role} />
    ),
  },
  {
    accessorKey: "isActive",
    header: ({ column }) => sortHeader(column, "Status"),
    ...sortDescFirst,
    cell: ({ row }) => <StatusChip active={row.original.isActive !== false} />,
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => sortHeader(column, "Created"),
    ...dateSort,
    cell: ({ row }) => <span className={secondaryText}>{localDate(row.original.createdAt)}</span>,
  },
  {
    accessorKey: "updatedAt",
    header: ({ column }) => sortHeader(column, "Updated"),
    ...dateSort,
    cell: ({ row }) => <span className={secondaryText}>{localDate(row.original.updatedAt)}</span>,
  },
  ]

  if (canEditUsers || canDeleteUsers) {
    columns.push({
      ...actionColumn,
      header: "Action",
      cell: ({ row }) => (
        <UserActionCell
          row={row}
          canEditUsers={canEditUsers}
          canDeleteUsers={canDeleteUsers}
        />
      ),
    })
  }

  return columns
}
