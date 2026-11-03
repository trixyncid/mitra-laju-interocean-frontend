"use client"

import Link from "next/link"

import UserActionCell from "@/components/action-cell/user-action-cell"
import { ColumnFilterHeader } from "@/components/column-filter/column-filter"
import { PersonAvatar } from "@/components/admin/person-avatar"
import { RoleChip } from "@/components/ui/role-chip"
import { StatusChip } from "@/components/ui/status-chip"
import { localDate } from "@/lib/utils"
import { ColumnDef } from "@tanstack/react-table"
import { primaryText, secondaryText } from "@/lib/design"
import {
  actionColumn,
  dateSort,
  sortDescFirst,
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
    header: () => <ColumnFilterHeader sortKey="name" label="Name" />,
    ...textSort,
    cell: ({ row }) => (
      <span className="flex items-center gap-3">
        <PersonAvatar
          userId={row.original.id}
          name={row.original.name}
          hasImage={!!row.original.image}
          version={row.original.updatedAt}
          className="size-8"
          fallbackClassName="text-xs"
        />
        {canEditUsers ? (
          <Link
            href={`/dashboard/users/${row.original.id}`}
            className={`${primaryText} hover:underline`}
          >
            {row.original.name}
          </Link>
        ) : (
          <span className={primaryText}>{row.original.name}</span>
        )}
      </span>
    ),
  },
  {
    accessorKey: "email",
    header: () => <ColumnFilterHeader sortKey="email" label="Email" />,
    ...textSort,
    cell: ({ row }) => <span className={secondaryText}>{row.original.email}</span>,
  },
  {
    accessorKey: "role",
    header: () => <ColumnFilterHeader field="role" sortKey="role" label="Role" />,
    ...textSort,
    cell: ({ row }) => (
      <RoleChip role={row.original.roleRef?.name ?? row.original.role} />
    ),
  },
  {
    accessorKey: "isActive",
    header: () => <ColumnFilterHeader field="status" label="Status" />,
    ...sortDescFirst,
    cell: ({ row }) => <StatusChip active={row.original.isActive !== false} />,
  },
  {
    accessorKey: "createdAt",
    header: () => <ColumnFilterHeader field="createdAt" sortKey="createdAt" label="Created" />,
    ...dateSort,
    cell: ({ row }) => <span className={secondaryText}>{localDate(row.original.createdAt)}</span>,
  },
  {
    accessorKey: "updatedAt",
    header: () => <ColumnFilterHeader field="updatedAt" sortKey="updatedAt" label="Updated" />,
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
