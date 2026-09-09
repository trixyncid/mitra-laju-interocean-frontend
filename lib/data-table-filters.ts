import type { TableDateRange } from "@/components/ui/date-range-picker"

export type FilterOption = {
  label: string
  value: string
}

export type TableFilterConfig<TData> = {
  status?: {
    id: string
    label?: string
    options: FilterOption[]
    getValue: (row: TData) => unknown
  }
  lifecycleStatus?: {
    id: string
    label?: string
    options: FilterOption[]
    getValue: (row: TData) => unknown
  }
  date?: {
    id: string
    label: string
    getValue: (row: TData) => string | null | undefined
  }
}

export const ACTIVE_STATUS_OPTIONS: FilterOption[] = [
  { value: "all", label: "All" },
  { value: "true", label: "Active" },
  { value: "false", label: "Inactive" },
]

export const SHIPMENT_LIFECYCLE_OPTIONS: FilterOption[] = [
  { value: "all", label: "All" },
  { value: "DRAFT", label: "Draft" },
  { value: "BACKUP", label: "Backup" },
  { value: "ONGOING", label: "Ongoing" },
  { value: "FINISHED", label: "Finished" },
]

export const PAYMENT_STATUS_OPTIONS: FilterOption[] = [
  { value: "all", label: "All" },
  { value: "PAID", label: "Paid" },
  { value: "UNPAID", label: "Unpaid" },
]

export function matchesStatusFilter(value: unknown, filter: string): boolean {
  if (!filter || filter === "all") return true
  if (typeof value === "boolean") return String(value) === filter
  return String(value ?? "").toLowerCase() === filter.toLowerCase()
}

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

function endOfDay(date: Date) {
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    23,
    59,
    59,
    999
  )
}

export function isDateInRange(
  iso: string | null | undefined,
  range?: TableDateRange | null
): boolean {
  if (!range?.from && !range?.to) return true
  if (!iso) return false

  const parsed = new Date(iso)
  if (Number.isNaN(parsed.getTime())) return false

  if (range.from) {
    const from = startOfDay(new Date(`${range.from}T12:00:00`))
    if (parsed < from) return false
  }

  if (range.to) {
    const to = endOfDay(new Date(`${range.to}T12:00:00`))
    if (parsed > to) return false
  }

  return true
}

export function applyTableFilters<TData>(
  data: TData[],
  filters: TableFilterConfig<TData> | undefined,
  status: string,
  dateRange?: TableDateRange | null
): TData[] {
  if (!filters) return data

  const range = dateRange ?? {}

  return data.filter((row) => {
    if (filters.status && !matchesStatusFilter(filters.status.getValue(row), status)) {
      return false
    }
    if (filters.date && !isDateInRange(filters.date.getValue(row), range)) {
      return false
    }
    return true
  })
}

export function hasDateRange(range?: TableDateRange | null) {
  return Boolean(range?.from || range?.to)
}
