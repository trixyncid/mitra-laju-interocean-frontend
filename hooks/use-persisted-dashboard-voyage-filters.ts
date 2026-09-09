"use client"

import { useCallback, useEffect, useState } from "react"

import type { VoyageStatus } from "@/app/dashboard/dashboard-types"
import type { ShipmentType } from "@/lib/permissions"

const STORAGE_KEY = "mli:dashboard:shipments-by-voyage"

export type DashboardShipmentTypeFilter = ShipmentType | "all"

type PersistedVoyageFilters = {
  voyageStatus: VoyageStatus
  shipmentType: DashboardShipmentTypeFilter
}

const DEFAULT_FILTERS: PersistedVoyageFilters = {
  voyageStatus: "ongoing",
  shipmentType: "all",
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null
}

function parseVoyageStatus(value: unknown): VoyageStatus {
  if (value === "draft" || value === "backup" || value === "ongoing") {
    return value
  }
  return DEFAULT_FILTERS.voyageStatus
}

function parseShipmentType(value: unknown): DashboardShipmentTypeFilter {
  if (
    value === "all" ||
    value === "EXPORT" ||
    value === "IMPORT" ||
    value === "DOMESTIC"
  ) {
    return value
  }
  return DEFAULT_FILTERS.shipmentType
}

function readStoredFilters(): PersistedVoyageFilters {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULT_FILTERS
    const parsed: unknown = JSON.parse(raw)
    if (!isRecord(parsed)) return DEFAULT_FILTERS
    return {
      voyageStatus: parseVoyageStatus(parsed.voyageStatus),
      shipmentType: parseShipmentType(parsed.shipmentType),
    }
  } catch {
    return DEFAULT_FILTERS
  }
}

function writeStoredFilters(filters: PersistedVoyageFilters) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(filters))
  } catch {
    // Ignore quota / private-mode failures.
  }
}

export function usePersistedDashboardVoyageFilters() {
  const [filters, setFilters] = useState<PersistedVoyageFilters>(DEFAULT_FILTERS)
  const [isRestored, setIsRestored] = useState(false)

  useEffect(() => {
    setFilters(readStoredFilters())
    setIsRestored(true)
  }, [])

  const commit = useCallback(
    (updater: (current: PersistedVoyageFilters) => PersistedVoyageFilters) => {
      setFilters((current) => {
        const next = updater(current)
        writeStoredFilters(next)
        return next
      })
    },
    []
  )

  const setVoyageStatus = useCallback(
    (voyageStatus: VoyageStatus) => {
      commit((current) => ({ ...current, voyageStatus }))
    },
    [commit]
  )

  const setShipmentType = useCallback(
    (shipmentType: DashboardShipmentTypeFilter) => {
      commit((current) => ({ ...current, shipmentType }))
    },
    [commit]
  )

  return {
    voyageStatus: filters.voyageStatus,
    shipmentType: filters.shipmentType,
    setVoyageStatus,
    setShipmentType,
    isRestored,
  }
}
