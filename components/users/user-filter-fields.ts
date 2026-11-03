import type { ColumnFilterField } from "@/components/column-filter/types"

/** Excel-style filters on the team table and cards. */
export const USER_FILTER_FIELDS: Record<string, ColumnFilterField> = {
  role: { label: "Role", kind: "list" },
  status: { label: "Status", kind: "list" },
  createdAt: { label: "Created", kind: "date" },
  updatedAt: { label: "Updated", kind: "date" },
}

export const USER_SORT_LABELS: Record<string, string> = {
  name: "Name",
  email: "Email",
  role: "Role",
  createdAt: "Created",
  updatedAt: "Updated",
}

/** The cards have no column headers: one pill per column. */
export const USER_FILTER_BAR = [
  { field: "role", sortKey: "role", label: "Role" },
  { field: "status", label: "Status" },
  { sortKey: "name", label: "Name" },
  { field: "createdAt", sortKey: "createdAt", label: "Created" },
  { field: "updatedAt", sortKey: "updatedAt", label: "Updated" },
]
