"use client"

import Link from "next/link"
import { useEffect, useMemo, type ReactNode } from "react"
import { IconArrowRight } from "@tabler/icons-react"

import type {
  DashboardVoyageGroup,
  VoyageStatus,
} from "@/app/dashboard/dashboard-types"
import { ContainerSummaryTags } from "@/components/ui/container-summary-tags"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { ShipmentTypeTag } from "@/components/ui/shipment-type-tag"
import { WarningChip } from "@/components/ui/status-chip"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useDashboardShipmentsByVoyage } from "@/hooks/use-dashboard-shipments-by-voyage"
import {
  usePersistedDashboardVoyageFilters,
  type DashboardShipmentTypeFilter,
} from "@/hooks/use-persisted-dashboard-voyage-filters"
import { usePermissions } from "@/hooks/use-permissions"
import {
  brandLink,
  brandText,
  glassPanel,
  glassTabsTrigger,
  secondaryText,
  tableCellClass,
  tableHeaderCell,
  tableHeaderRow,
  tableRowClass,
  tableShell,
} from "@/lib/design"
import { formatCalendarDate } from "@/lib/date-input"
import type { ShipmentType } from "@/lib/permissions"
import { formatShipmentType, SHIPMENT_TYPE_OPTIONS } from "@/lib/shipment-types"
import { cn } from "@/lib/utils"

const VOYAGE_STATUS_OPTIONS: {
  value: VoyageStatus
  label: string
  description: string
  empty: string
}[] = [
  {
    value: "draft",
    label: "Draft",
    description: "Draft shipments linked to a vessel voyage.",
    empty: "No draft vessel voyages found.",
  },
  {
    value: "backup",
    label: "Backup",
    description: "Backup shipments linked to a vessel voyage.",
    empty: "No backup vessel voyages found.",
  },
  {
    value: "ongoing",
    label: "Ongoing",
    description: "Active voyage operations currently in progress.",
    empty: "No ongoing vessel voyages right now.",
  },
]

const TYPE_CHIP_IDLE =
  "border-[rgba(214,227,255,0.55)] bg-[rgba(247,249,251,0.55)] text-muted-foreground hover:border-[rgba(214,227,255,0.85)] hover:bg-[rgba(247,249,251,0.9)] hover:text-foreground"

const TYPE_CHIP_ACTIVE: Record<DashboardShipmentTypeFilter, string> = {
  all: "border-[var(--mli-primary-container)]/35 bg-[var(--mli-primary-container)] text-primary-foreground hover:bg-[var(--mli-primary-container)] hover:text-primary-foreground",
  EXPORT:
    "border-[var(--mli-export-container)]/50 bg-[var(--mli-export-container)] text-[var(--mli-on-export-container)] hover:bg-[var(--mli-export-container)] hover:text-[var(--mli-on-export-container)]",
  IMPORT:
    "border-[var(--mli-import-container)]/50 bg-[var(--mli-import-container)] text-[var(--mli-on-import-container)] hover:bg-[var(--mli-import-container)] hover:text-[var(--mli-on-import-container)]",
  DOMESTIC:
    "border-[var(--mli-domestic-container)]/50 bg-[var(--mli-domestic-container)] text-[var(--mli-on-domestic-container)] hover:bg-[var(--mli-domestic-container)] hover:text-[var(--mli-on-domestic-container)]",
}

function formatDateTime(value: string | null) {
  return formatCalendarDate(value, "—")
}

function displayValue(value: string | null | undefined) {
  const trimmed = value?.trim()
  return trimmed ? trimmed : "—"
}

function LabeledStack({
  items,
  labelClassName,
}: {
  items: { label: string; value: string | null | undefined }[]
  labelClassName?: string
}) {
  return (
    <div className="flex min-w-0 max-w-[16rem] flex-col gap-0.5">
      {items.map((item) => (
        <div key={item.label} className="flex min-w-0 items-baseline gap-1.5">
          <span
            className={cn(
              "w-14 shrink-0 text-[10px] font-medium tracking-wide text-muted-foreground uppercase",
              labelClassName
            )}
          >
            {item.label}
          </span>
          <span className={cn(secondaryText, "truncate")} title={displayValue(item.value)}>
            {displayValue(item.value)}
          </span>
        </div>
      ))}
    </div>
  )
}

function RouteCell({
  departure,
  destination,
}: {
  departure: string | null
  destination: string | null
}) {
  if (!departure && !destination) {
    return <WarningChip>Unavailable</WarningChip>
  }

  return (
    <span className={cn(secondaryText, "flex flex-row items-center gap-x-1")}>
      {departure ?? "—"}
      <IconArrowRight className="size-4 shrink-0" />
      {destination ?? "—"}
    </span>
  )
}

function CustomerCell({
  name,
  code,
  shipper,
  type,
}: {
  name: string
  code: string
  shipper: string | null
  type: string
}) {
  const customer = name ? `${name} (${code})` : "—"

  return (
    <div className="flex min-w-0 max-w-[18rem] flex-col gap-0.5">
      <span className={cn(secondaryText, "inline-flex min-w-0 items-center gap-1.5")}>
        <span className="truncate">{customer}</span>
        {type ? (
          <ShipmentTypeTag type={type} className="shrink-0 px-2 py-0.5 text-xs" />
        ) : null}
      </span>
      <span className="truncate text-xs text-muted-foreground">
        {displayValue(shipper)}
      </span>
    </div>
  )
}

function OrderCell({
  id,
  orderNumber,
  canReadShipments,
}: {
  id: string
  orderNumber: string
  canReadShipments: boolean
}) {
  const label: ReactNode = canReadShipments ? (
    <Link href={`/dashboard/shipments/${id}`} className={brandLink}>
      {orderNumber}
    </Link>
  ) : (
    orderNumber
  )

  return <div className="font-semibold text-foreground">{label}</div>
}

function shipmentTypeFilterOptions(allowed: ShipmentType[] | "all") {
  const typeOptions =
    allowed === "all"
      ? SHIPMENT_TYPE_OPTIONS
      : SHIPMENT_TYPE_OPTIONS.filter((option) => allowed.includes(option.value))

  return [{ value: "all" as const, label: "All" }, ...typeOptions]
}

function filterVoyagesByShipmentType(
  voyages: DashboardVoyageGroup[] | undefined,
  shipmentType: DashboardShipmentTypeFilter
) {
  if (!voyages) return voyages
  if (shipmentType === "all") return voyages

  return voyages
    .map((voyage) => ({
      ...voyage,
      shipments: voyage.shipments.filter(
        (shipment) => shipment.shipmentType === shipmentType
      ),
    }))
    .filter((voyage) => voyage.shipments.length > 0)
}

function countShipmentsByType(voyages: DashboardVoyageGroup[] | undefined) {
  const counts: Record<DashboardShipmentTypeFilter, number> = {
    all: 0,
    EXPORT: 0,
    IMPORT: 0,
    DOMESTIC: 0,
  }

  if (!voyages) return counts

  for (const voyage of voyages) {
    for (const shipment of voyage.shipments) {
      counts.all += 1
      if (
        shipment.shipmentType === "EXPORT" ||
        shipment.shipmentType === "IMPORT" ||
        shipment.shipmentType === "DOMESTIC"
      ) {
        counts[shipment.shipmentType] += 1
      }
    }
  }

  return counts
}

function summarizeVoyages(voyages: DashboardVoyageGroup[] | undefined) {
  if (!voyages?.length) {
    return { voyageCount: 0, shipmentCount: 0 }
  }

  return {
    voyageCount: voyages.length,
    shipmentCount: voyages.reduce(
      (total, voyage) => total + voyage.shipments.length,
      0
    ),
  }
}

function TypeFilterChip({
  active,
  label,
  count,
  tone,
  onClick,
  ariaLabel,
}: {
  active: boolean
  label: string
  count?: number
  tone: DashboardShipmentTypeFilter
  onClick: () => void
  ariaLabel: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      aria-label={ariaLabel}
      className={cn(
        "inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-md border px-2.5 text-xs font-medium transition-[color,background-color,border-color,box-shadow] duration-150",
        "focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/20",
        active ? TYPE_CHIP_ACTIVE[tone] : TYPE_CHIP_IDLE
      )}
    >
      <span>{label}</span>
      {typeof count === "number" ? (
        <span
          className={cn(
            "rounded px-1 py-px text-[10px] font-semibold tabular-nums",
            active ? "bg-black/10 text-inherit" : "bg-[rgba(214,227,255,0.55)] text-muted-foreground"
          )}
        >
          {count}
        </span>
      ) : null}
    </button>
  )
}

export function DashboardShipmentsByVoyage() {
  const {
    voyageStatus,
    shipmentType,
    setVoyageStatus,
    setShipmentType,
    isRestored,
  } = usePersistedDashboardVoyageFilters()
  const { canRead, allowedShipmentTypes } = usePermissions()
  const canReadShipments = canRead("shipments")
  const { data, isLoading, error } = useDashboardShipmentsByVoyage(
    voyageStatus,
    { enabled: isRestored }
  )
  const typeOptions = useMemo(
    () => shipmentTypeFilterOptions(allowedShipmentTypes),
    [allowedShipmentTypes]
  )
  const showTypeFilter = typeOptions.length > 2
  const typeCounts = useMemo(() => countShipmentsByType(data), [data])
  const filteredData = useMemo(
    () => filterVoyagesByShipmentType(data, shipmentType),
    [data, shipmentType]
  )
  const selectedStatus = VOYAGE_STATUS_OPTIONS.find(
    (option) => option.value === voyageStatus
  )
  const typeLabel =
    shipmentType === "all" ? null : formatShipmentType(shipmentType)
  const { voyageCount, shipmentCount } = summarizeVoyages(filteredData)

  useEffect(() => {
    if (!isRestored) return
    if (shipmentType === "all") return
    if (allowedShipmentTypes === "all") return
    if (!allowedShipmentTypes.includes(shipmentType)) {
      setShipmentType("all")
    }
  }, [allowedShipmentTypes, isRestored, setShipmentType, shipmentType])

  return (
    <Card
      className={cn(
        glassPanel,
        "relative min-w-0 gap-0 overflow-hidden p-5 shadow-none lg:p-7"
      )}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[rgba(255,255,255,0.65)] to-transparent"
      />

      <CardHeader className="gap-5 pb-0">
        <div className="space-y-1">
          <p className="mb-1 text-[11px] font-semibold tracking-[0.1em] text-muted-foreground uppercase">
            Operations
          </p>
          <CardTitle className="text-lg">Shipments by Vessel Voyage</CardTitle>
          <CardDescription className="max-w-2xl">
            {selectedStatus?.description}
          </CardDescription>
        </div>

        <Tabs
          value={voyageStatus}
          onValueChange={(value) => {
            if (value === "draft" || value === "backup" || value === "ongoing") {
              setVoyageStatus(value)
            }
          }}
          className="gap-0"
        >
          <TabsList
            className="h-auto w-full min-w-0 justify-start gap-1 overflow-x-auto rounded-md border border-[rgba(214,227,255,0.45)] bg-[rgba(232,238,246,0.55)] p-1 backdrop-blur-xl sm:w-fit"
            aria-label="Voyage status"
          >
            {VOYAGE_STATUS_OPTIONS.map((option) => (
              <TabsTrigger
                key={option.value}
                value={option.value}
                className={cn(glassTabsTrigger, "min-w-[5.5rem] px-5")}
              >
                {option.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </CardHeader>

      <CardContent className="space-y-4 pt-4">
        {showTypeFilter ? (
          <div className="flex flex-col gap-3 border-b border-[rgba(214,227,255,0.35)] pb-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">
              {!isRestored || isLoading ? (
                <span>Loading voyages…</span>
              ) : error ? (
                <span>Unable to load summary</span>
              ) : filteredData?.length ? (
                <>
                  <span className="font-medium text-foreground">
                    {voyageCount} voyage{voyageCount === 1 ? "" : "s"}
                  </span>
                  <span className="mx-1.5 text-[rgba(214,227,255,0.9)]">·</span>
                  <span>
                    {shipmentCount} shipment{shipmentCount === 1 ? "" : "s"}
                    {typeLabel ? (
                      <>
                        {" "}
                        <span className="text-foreground/80">({typeLabel})</span>
                      </>
                    ) : null}
                  </span>
                </>
              ) : (
                <span>No matching voyages</span>
              )}
            </p>

            <div
              className="flex flex-wrap items-center gap-1.5"
              role="group"
              aria-label="Filter by shipment type"
            >
              <span className="mr-1 text-[10px] font-semibold tracking-[0.12em] text-muted-foreground uppercase">
                Type
              </span>
              {typeOptions.map((option) => (
                <TypeFilterChip
                  key={option.value}
                  label={option.label}
                  tone={option.value}
                  count={typeCounts[option.value]}
                  active={shipmentType === option.value}
                  onClick={() => setShipmentType(option.value)}
                  ariaLabel={
                    option.value === "all"
                      ? "Show all shipment types"
                      : `Show ${option.label.toLowerCase()} shipments`
                  }
                />
              ))}
            </div>
          </div>
        ) : null}

        {!isRestored || isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <Skeleton
                key={index}
                className="h-28 rounded-lg bg-[rgba(214,227,255,0.35)]"
              />
            ))}
          </div>
        ) : error ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            {error.message || "Unable to load voyage shipments."}
          </p>
        ) : !filteredData?.length ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            {shipmentType === "all"
              ? selectedStatus?.empty
              : `No ${typeLabel?.toLowerCase() ?? "matching"} shipments found for ${selectedStatus?.label.toLowerCase() ?? "these"} voyages.`}
          </p>
        ) : (
          filteredData.map((voyage) => (
            <div
              key={voyage.vesselId}
              className={cn(tableShell, "overflow-x-auto rounded-lg")}
            >
              <div className="flex flex-col gap-1 border-b border-[rgba(214,227,255,0.35)] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className={cn("font-semibold", brandText)}>
                    {voyage.vesselName} / {voyage.voyageNumber}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    ETD {formatDateTime(voyage.etd)}
                  </p>
                </div>
                <p className="text-sm text-muted-foreground">
                  {voyage.shipments.length} shipment
                  {voyage.shipments.length === 1 ? "" : "s"}
                </p>
              </div>
              <Table>
                <TableHeader>
                  <TableRow className={tableHeaderRow}>
                    <TableHead className={tableHeaderCell}>Order Number</TableHead>
                    <TableHead className={tableHeaderCell}>Customer</TableHead>
                    <TableHead className={tableHeaderCell}>Route</TableHead>
                    <TableHead className={tableHeaderCell}>Booking / BL</TableHead>
                    <TableHead className={tableHeaderCell}>Book To</TableHead>
                    <TableHead className={cn(tableHeaderCell, "min-w-[10rem]")}>
                      Remarks
                    </TableHead>
                    <TableHead className={cn(tableHeaderCell, "min-w-[12rem]")}>
                      Containers
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {voyage.shipments.map((shipment) => (
                    <TableRow key={shipment.id} className={tableRowClass}>
                      <TableCell className={tableCellClass}>
                        <OrderCell
                          id={shipment.id}
                          orderNumber={shipment.orderNumber}
                          canReadShipments={canReadShipments}
                        />
                      </TableCell>
                      <TableCell className={tableCellClass}>
                        <CustomerCell
                          name={shipment.customerName}
                          code={shipment.customerCode}
                          shipper={shipment.customerShipper}
                          type={shipment.shipmentType}
                        />
                      </TableCell>
                      <TableCell className={tableCellClass}>
                        <RouteCell
                          departure={shipment.portDeparture}
                          destination={shipment.portDestination}
                        />
                      </TableCell>
                      <TableCell className={tableCellClass}>
                        <LabeledStack
                          items={[
                            { label: "Booking", value: shipment.bookingNumber },
                            { label: "BL", value: shipment.blNumber },
                          ]}
                        />
                      </TableCell>
                      <TableCell className={tableCellClass}>
                        <LabeledStack
                          labelClassName="w-16"
                          items={[
                            { label: "Trucking", value: shipment.truckingBookTo },
                            { label: "Freight", value: shipment.freightBookTo },
                          ]}
                        />
                      </TableCell>
                      <TableCell
                        className={cn(
                          tableCellClass,
                          "min-w-[10rem] max-w-[16rem] whitespace-normal"
                        )}
                      >
                        {shipment.remarks?.trim() ? (
                          <span
                            className={cn(secondaryText, "line-clamp-2")}
                            title={shipment.remarks}
                          >
                            {shipment.remarks}
                          </span>
                        ) : (
                          <span className={secondaryText}>—</span>
                        )}
                      </TableCell>
                      <TableCell
                        className={cn(
                          tableCellClass,
                          "min-w-[12rem] max-w-[18rem] whitespace-normal"
                        )}
                      >
                        <ContainerSummaryTags containers={shipment.containers ?? []} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}
