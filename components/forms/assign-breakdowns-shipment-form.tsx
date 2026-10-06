"use client"

import type { ReactNode } from "react"
import { useMemo, useState } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { IconLink } from "@tabler/icons-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { SearchableCombobox } from "@/components/searchable-combobox"
import { useShipmentSearch } from "@/hooks/use-entity-searches"
import { usePermissions } from "@/hooks/use-permissions"
import { costingService } from "@/services/costing.service"
import { costingKeys, shipmentKeys } from "@/lib/query-keys"

export type BreakdownShipmentAssignment = {
  costingId: string
  breakdownId: string
}

export function AssignBreakdownsToShipmentForm({
  costingId,
  breakdownIds,
  items,
  onAssigned,
  trigger,
  title = "Assign to shipment",
  description,
  initialShipmentId,
  initialShipmentLabel,
}: {
  costingId?: string
  breakdownIds?: string[]
  items?: BreakdownShipmentAssignment[]
  onAssigned?: () => void
  trigger?: ReactNode
  title?: string
  description?: string
  initialShipmentId?: string | null
  initialShipmentLabel?: string | null
}) {
  const [open, setOpen] = useState(false)
  const [pending, setPending] = useState(false)
  const [shipmentId, setShipmentId] = useState(
    initialShipmentId && initialShipmentId !== ""
      ? initialShipmentId
      : "-"
  )
  const [shipmentSearch, setShipmentSearch] = useState("")
  const { canWrite, canReadShipmentsForCosting } = usePermissions()
  const queryClient = useQueryClient()

  const assignments = useMemo<BreakdownShipmentAssignment[]>(() => {
    if (items?.length) return items
    if (costingId && breakdownIds?.length) {
      return breakdownIds.map((breakdownId) => ({ costingId, breakdownId }))
    }
    return []
  }, [items, costingId, breakdownIds])

  const {
    data: shipmentsPage,
    isLoading: isLoadingShipments,
    isFetching: isFetchingShipments,
  } = useShipmentSearch(
    shipmentSearch,
    open && canReadShipmentsForCosting(),
    "true",
    "ONGOING"
  )

  const shipmentItems = useMemo(() => {
    const fromSearch =
      shipmentsPage?.items
        ?.filter((shipment) => shipment.id)
        .map((shipment) => {
          const customerName = shipment.customerCode?.customerName?.trim()
          return {
            value: shipment.id as string,
            label: customerName
              ? `${shipment.orderNumber} · ${customerName}`
              : shipment.orderNumber,
          }
        }) ?? []

    if (
      initialShipmentId &&
      initialShipmentLabel &&
      !fromSearch.some((item) => item.value === initialShipmentId)
    ) {
      return [
        { value: initialShipmentId, label: initialShipmentLabel },
        ...fromSearch,
      ]
    }

    return fromSearch
  }, [shipmentsPage?.items, initialShipmentId, initialShipmentLabel])

  if (!canWrite("costings") || assignments.length === 0) return null

  const count = assignments.length
  const dialogDescription =
    description ??
    `Link ${count} selected breakdown${count === 1 ? "" : "s"} to one shipment.`

  async function assign() {
    if (!shipmentId || shipmentId === "-") {
      toast.error("Select a shipment")
      return
    }

    setPending(true)
    try {
      for (const assignment of assignments) {
        await costingService.updateBreakdown(
          assignment.costingId,
          assignment.breakdownId,
          { shipmentId }
        )
      }

      const costingIds = [...new Set(assignments.map((item) => item.costingId))]
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: costingKeys.all }),
        ...costingIds.map((id) =>
          queryClient.invalidateQueries({ queryKey: costingKeys.detail(id) })
        ),
        queryClient.invalidateQueries({ queryKey: shipmentKeys.all }),
        queryClient.invalidateQueries({
          queryKey: shipmentKeys.detail(shipmentId),
        }),
      ])

      const orderNumber =
        shipmentItems.find((item) => item.value === shipmentId)?.label ??
        "shipment"
      toast.success(
        `Assigned ${count} breakdown${count === 1 ? "" : "s"} to ${orderNumber}`
      )
      setOpen(false)
      onAssigned?.()
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to assign shipment"
      )
    } finally {
      setPending(false)
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        if (next) {
          setShipmentId(
            initialShipmentId && initialShipmentId !== ""
              ? initialShipmentId
              : "-"
          )
          return
        }
        setShipmentSearch("")
      }}
    >
      <DialogTrigger asChild>
        {trigger ?? (
          <Button type="button" size="sm">
            <IconLink className="size-4" />
            Assign to shipment ({count})
          </Button>
        )}
      </DialogTrigger>
      <DialogContent
        className="sm:max-w-lg"
        onInteractOutside={(event) => {
          const target = event.target as Element
          if (target.closest('[data-slot="combobox-content"]')) {
            event.preventDefault()
          }
        }}
      >
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{dialogDescription}</DialogDescription>
        </DialogHeader>

        <SearchableCombobox
          label="Shipment"
          required
          items={shipmentItems}
          value={shipmentId}
          onValueChange={setShipmentId}
          onSearchTermChange={setShipmentSearch}
          placeholder="Search order number or customer"
          emptyMessage="No shipments found"
          isLoading={isLoadingShipments}
          isSearching={isFetchingShipments}
        />

        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline" disabled={pending}>
              Cancel
            </Button>
          </DialogClose>
          <Button type="button" disabled={pending} onClick={() => void assign()}>
            {pending ? "Assigning…" : "Assign"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
