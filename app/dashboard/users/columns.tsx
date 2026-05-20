"use client"

import UserActionCell from "@/components/action-cell/user-action-cell"
import { RoleChip } from "@/components/ui/role-chip"
import { StatusChip } from "@/components/ui/status-chip"
import { localDate } from "@/lib/utils"
import { ColumnDef } from "@tanstack/react-table"
import { primaryText, secondaryText } from "@/lib/design"

import type { UserRole } from "@/lib/permissions"

export type { UserRole }

export type User = {
  id: string
  name: string
  email: string
  emailVerified: boolean
  image: string | null
  role: UserRole | string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export const columns: ColumnDef<User>[] = [
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => <span className={primaryText}>{row.original.name}</span>,
  },
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => <span className={secondaryText}>{row.original.email}</span>,
  },
  {
    accessorKey: "role",
    header: "Role",
    cell: ({ row }) => <RoleChip role={row.original.role} />,
  },
  {
    accessorKey: "isActive",
    header: "Status",
    cell: ({ row }) => <StatusChip active={row.original.isActive !== false} />,
  },
  {
    accessorKey: "createdAt",
    header: "Created",
    cell: ({ row }) => <span className={secondaryText}>{localDate(row.original.createdAt)}</span>,
  },
  {
    accessorKey: "updatedAt",
    header: "Updated",
    cell: ({ row }) => <span className={secondaryText}>{localDate(row.original.updatedAt)}</span>,
  },
  {
    id: "actions",
    header: "Action",
    cell: ({ row }) => <UserActionCell row={row} />,
  },
]
