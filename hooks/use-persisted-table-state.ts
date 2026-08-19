"use client"

import { useCallback, useEffect, useState } from "react"

import type { AppliedTableFilters } from "@/components/data-table-toolbar"

const STORAGE_PREFIX = "mli:list-state:"

export const EMPTY_TABLE_FILTERS: AppliedTableFilters = {
  search: "",
  status: "all",
  dateRange: {},
}

type PersistedTableState = {
  applied: AppliedTableFilters
  page: number
  pageSize: number
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null
}

function parseDateRange(value: unknown): AppliedTableFilters["dateRange"] {
  if (!isRecord(value)) return {}
  return {
    from: typeof value.from === "string" ? value.from : undefined,
    to: typeof value.to === "string" ? value.to : undefined,
  }
}

function parseApplied(value: unknown): AppliedTableFilters {
  if (!isRecord(value)) return EMPTY_TABLE_FILTERS
  return {
    search: typeof value.search === "string" ? value.search : "",
    status: typeof value.status === "string" ? value.status : "all",
    dateRange: parseDateRange(value.dateRange),
  }
}

function parsePositiveInt(value: unknown, fallback: number) {
  return typeof value === "number" && Number.isInteger(value) && value > 0
    ? value
    : fallback
}

function readStoredState(
  storageKey: string,
  fallback: PersistedTableState
): PersistedTableState {
  try {
    const raw = sessionStorage.getItem(`${STORAGE_PREFIX}${storageKey}`)
    if (!raw) return fallback
    const parsed: unknown = JSON.parse(raw)
    if (!isRecord(parsed)) return fallback
    return {
      applied: parseApplied(parsed.applied),
      page: parsePositiveInt(parsed.page, fallback.page),
      pageSize: parsePositiveInt(parsed.pageSize, fallback.pageSize),
    }
  } catch {
    return fallback
  }
}

function writeStoredState(storageKey: string, state: PersistedTableState) {
  try {
    sessionStorage.setItem(
      `${STORAGE_PREFIX}${storageKey}`,
      JSON.stringify(state)
    )
  } catch {
    // Ignore quota / private-mode failures.
  }
}

export function usePersistedTableState(
  storageKey: string,
  defaultPageSize = 20
) {
  const [state, setState] = useState<PersistedTableState>({
    applied: EMPTY_TABLE_FILTERS,
    page: 1,
    pageSize: defaultPageSize,
  })
  const [isRestored, setIsRestored] = useState(false)

  useEffect(() => {
    setState(
      readStoredState(storageKey, {
        applied: EMPTY_TABLE_FILTERS,
        page: 1,
        pageSize: defaultPageSize,
      })
    )
    setIsRestored(true)
  }, [storageKey, defaultPageSize])

  const commit = useCallback(
    (updater: (current: PersistedTableState) => PersistedTableState) => {
      setState((current) => {
        const next = updater(current)
        writeStoredState(storageKey, next)
        return next
      })
    },
    [storageKey]
  )

  const setApplied = useCallback(
    (applied: AppliedTableFilters) => {
      commit((current) => ({ ...current, applied, page: 1 }))
    },
    [commit]
  )

  const setPage = useCallback(
    (page: number) => {
      commit((current) => ({ ...current, page }))
    },
    [commit]
  )

  const setPageSize = useCallback(
    (pageSize: number) => {
      commit((current) => ({ ...current, pageSize, page: 1 }))
    },
    [commit]
  )

  return {
    applied: state.applied,
    page: state.page,
    pageSize: state.pageSize,
    setApplied,
    setPage,
    setPageSize,
    isRestored,
  }
}
