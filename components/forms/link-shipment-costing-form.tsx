"use client"

import { useEffect, useMemo, useState } from "react"
import { useQueryClient } from "@tanstack/react-query"
import {
  IconChevronLeft,
  IconChevronRight,
  IconLink,
  IconLinkOff,
  IconSearch,
} from "@tabler/icons-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
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
import { Input } from "@/components/ui/input"
import { useCostingBreakdownSearch } from "@/hooks/use-entity-searches"
import { costingService } from "@/services/costing.service"
import { usePermissions } from "@/hooks/use-permissions"
import { costingInvoiceLineNet, cn } from "@/lib/utils"
import {
  glassControl,
  glassInset,
  tableCellClass,
  tableHeaderCell,
  tableHeaderRow,
  tableRowClass,
  tableShell,
} from "@/lib/design"
import { costingKeys, shipmentKeys } from "@/lib/query-keys"

const PICKER_PAGE_SIZE = 25

type SelectedBreakdown = {
  id: string
  costingId: string
}

function formatIdr(value: number) {
  return value.toLocaleString("id-ID", { style: "currency", currency: "IDR" })
}

async function invalidateShipmentCosting(
  queryClient: ReturnType<typeof useQueryClient>,
  shipmentId: string,
  costingIds: string[] = []
) {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: shipmentKeys.all }),
    queryClient.invalidateQueries({ queryKey: shipmentKeys.detail(shipmentId) }),
    queryClient.invalidateQueries({ queryKey: costingKeys.all }),
    ...costingIds.map((costingId) =>
      queryClient.invalidateQueries({ queryKey: costingKeys.detail(costingId) })
    ),
  ])
}

export function UnlinkShipmentCostingButton({
  costingId,
  costingNumber,
  shipmentId,
  breakdownId,
  lineLabel,
}: {
  costingId: string
  costingNumber: string
  shipmentId: string
  breakdownId: string
  lineLabel: string
}) {
  const [open, setOpen] = useState(false)
  const [pending, setPending] = useState(false)
  const { canWrite } = usePermissions()
  const queryClient = useQueryClient()

  if (!canWrite("costings")) return null

  return (
    <Dialog open={open} onOpenChange={(next) => {
      if (pending) return
      setOpen(next)
    }}>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          title="Unlink this line"
          aria-label={`Unlink ${lineLabel} from ${costingNumber}`}
        >
          <IconLinkOff className="size-4 text-muted-foreground" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Unlink line</DialogTitle>
          <DialogDescription>
            Remove {lineLabel} on {costingNumber} from this shipment. The
            costing invoice stays in the system.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="secondary" disabled={pending}>
              Cancel
            </Button>
          </DialogClose>
          <Button
            type="button"
            variant="destructive"
            disabled={pending}
            onClick={async () => {
              setPending(true)
              try {
                await costingService.updateBreakdown(costingId, breakdownId, {
                  shipmentId: null,
                })
                await invalidateShipmentCosting(queryClient, shipmentId, [
                  costingId,
                ])
                toast.success("Line unlinked from shipment")
                setOpen(false)
              } catch (error) {
                toast.error(
                  error instanceof Error ? error.message : "Failed to unlink"
                )
              } finally {
                setPending(false)
              }
            }}
          >
            <IconLinkOff className="size-4" />
            {pending ? "Unlinking..." : "Unlink"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default function LinkShipmentCostingForm({
  shipmentId,
  orderNumber,
}: {
  shipmentId: string
  orderNumber: string
}) {
  const [open, setOpen] = useState(false)
  const [breakdownSearch, setBreakdownSearch] = useState("")
  const [page, setPage] = useState(1)
  const [selected, setSelected] = useState<SelectedBreakdown[]>([])
  const [pending, setPending] = useState(false)
  const { canWrite } = usePermissions()
  const queryClient = useQueryClient()
  const {
    data: breakdownsData,
    isLoading,
    isFetching,
    isError,
  } = useCostingBreakdownSearch(
    breakdownSearch,
    open && canWrite("costings"),
    "unlinked",
    page,
    PICKER_PAGE_SIZE
  )

  const availableBreakdowns = breakdownsData?.items ?? []
  const pagination = breakdownsData?.pagination
  const totalPages = Math.max(1, pagination?.totalPages ?? 1)
  const totalRows = pagination?.total ?? 0

  useEffect(() => {
    setPage(1)
  }, [breakdownSearch])

  useEffect(() => {
    if (page > totalPages) setPage(totalPages)
  }, [page, totalPages])

  const selectedIds = useMemo(
    () => new Set(selected.map((item) => item.id)),
    [selected]
  )

  const availableIds = useMemo(
    () => availableBreakdowns.map((line) => line.id),
    [availableBreakdowns]
  )

  const allVisibleSelected =
    availableIds.length > 0 && availableIds.every((id) => selectedIds.has(id))
  const someVisibleSelected =
    availableIds.some((id) => selectedIds.has(id)) && !allVisibleSelected

  function resetPicker() {
    setBreakdownSearch("")
    setPage(1)
    setSelected([])
  }

  function toggleLine(line: SelectedBreakdown, checked: boolean) {
    setSelected((prev) => {
      if (checked) {
        return prev.some((item) => item.id === line.id)
          ? prev
          : [...prev, line]
      }
      return prev.filter((item) => item.id !== line.id)
    })
  }

  async function linkSelected() {
    if (selected.length === 0) {
      toast.error("Select at least one line item to link")
      return
    }

    setPending(true)
    try {
      for (const line of selected) {
        await costingService.updateBreakdown(line.costingId, line.id, {
          shipmentId,
        })
      }

      const costingIds = [...new Set(selected.map((line) => line.costingId))]
      await invalidateShipmentCosting(queryClient, shipmentId, costingIds)
      toast.success(
        `Linked ${selected.length} line${selected.length === 1 ? "" : "s"} to ${orderNumber}`
      )
      setOpen(false)
      resetPicker()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to link")
    } finally {
      setPending(false)
    }
  }

  if (!canWrite("costings")) return null

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen)
        if (!nextOpen) resetPicker()
      }}
    >
      <DialogTrigger asChild>
        <Button type="button" variant="outline" size="sm">
          <IconLink className="size-4" />
          Link costing
        </Button>
      </DialogTrigger>
      <DialogContent className="flex max-h-[85vh] w-[min(100%-2rem,80vw)] flex-col gap-0 overflow-hidden p-0 sm:max-w-[80vw]">
        <DialogHeader className="shrink-0 space-y-1.5 border-b border-[rgba(214,227,255,0.35)] px-6 py-5">
          <DialogTitle>Link costing lines to shipment</DialogTitle>
          <DialogDescription>
            Select unassigned costing breakdown lines to assign to{" "}
            <span className="font-medium text-foreground">{orderNumber}</span>.
          </DialogDescription>
        </DialogHeader>

        <div className="flex min-h-0 flex-1 flex-col gap-4 px-6 py-4">
          <div className="relative shrink-0">
            <IconSearch className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={breakdownSearch}
              onChange={(event) => setBreakdownSearch(event.target.value)}
              placeholder="Search by description, costing #, or vendor..."
              fieldSize="sm"
              className="pl-9"
              aria-label="Search costing lines"
            />
          </div>

          <div className={cn(tableShell, "min-h-0 flex-1 overflow-hidden")}>
            <div className="max-h-[min(24rem,50vh)] overflow-auto">
              <table className="w-full min-w-[48rem] text-left">
                <thead className="sticky top-0 z-10">
                  <tr
                    className={cn(
                      tableHeaderRow,
                      "bg-[#e8eef6] hover:bg-[#e8eef6] shadow-[0_1px_0_rgba(214,227,255,0.55)]"
                    )}
                  >
                    <th className={cn(tableHeaderCell, "w-12 bg-[#e8eef6]")}>
                      <Checkbox
                        checked={
                          allVisibleSelected
                            ? true
                            : someVisibleSelected
                              ? "indeterminate"
                              : false
                        }
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelected((prev) => {
                              const next = new Map(
                                prev.map((item) => [item.id, item])
                              )
                              for (const line of availableBreakdowns) {
                                next.set(line.id, {
                                  id: line.id,
                                  costingId: line.costingId,
                                })
                              }
                              return [...next.values()]
                            })
                          } else {
                            const visible = new Set(availableIds)
                            setSelected((prev) =>
                              prev.filter((item) => !visible.has(item.id))
                            )
                          }
                        }}
                        disabled={availableIds.length === 0 || pending}
                        aria-label="Select all lines on this page"
                      />
                    </th>
                    <th className={cn(tableHeaderCell, "bg-[#e8eef6]")}>
                      Line
                    </th>
                    <th className={cn(tableHeaderCell, "bg-[#e8eef6]")}>
                      Costing / invoice
                    </th>
                    <th className={cn(tableHeaderCell, "bg-[#e8eef6]")}>
                      Vendor
                    </th>
                    <th
                      className={cn(tableHeaderCell, "bg-[#e8eef6] text-right")}
                    >
                      Net amount
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading && availableBreakdowns.length === 0 ? (
                    <tr>
                      <td
                        colSpan={5}
                        className={cn(
                          tableCellClass,
                          "py-10 text-center text-muted-foreground"
                        )}
                      >
                        Loading costing lines...
                      </td>
                    </tr>
                  ) : isError ? (
                    <tr>
                      <td
                        colSpan={5}
                        className={cn(
                          tableCellClass,
                          "py-10 text-center text-destructive"
                        )}
                      >
                        Failed to load costing lines. Try again.
                      </td>
                    </tr>
                  ) : availableBreakdowns.length === 0 ? (
                    <tr>
                      <td
                        colSpan={5}
                        className={cn(
                          tableCellClass,
                          "py-10 text-center text-muted-foreground"
                        )}
                      >
                        No unassigned costing lines found.
                      </td>
                    </tr>
                  ) : (
                    availableBreakdowns.map((line) => {
                      const checked = selectedIds.has(line.id)
                      const net = costingInvoiceLineNet(line)
                      const containerBits = [
                        line.containerNumber
                          ? `Ctr. ${line.containerNumber}`
                          : null,
                        line.containerSize?.name,
                        line.containerType?.name,
                      ].filter(Boolean)

                      return (
                        <tr
                          key={line.id}
                          className={cn(
                            tableRowClass,
                            checked && "bg-[rgba(214,227,255,0.28)]"
                          )}
                          onClick={() =>
                            toggleLine(
                              { id: line.id, costingId: line.costingId },
                              !checked
                            )
                          }
                        >
                          <td
                            className={tableCellClass}
                            onClick={(event) => event.stopPropagation()}
                          >
                            <Checkbox
                              checked={checked}
                              onCheckedChange={(next) =>
                                toggleLine(
                                  { id: line.id, costingId: line.costingId },
                                  Boolean(next)
                                )
                              }
                              disabled={pending}
                              aria-label={`Select ${line.productDescription}`}
                            />
                          </td>
                          <td className={tableCellClass}>
                            <div className="min-w-0 space-y-0.5">
                              <p className="font-medium text-foreground">
                                {line.productDescription}
                              </p>
                              {containerBits.length > 0 ? (
                                <p className="text-xs text-muted-foreground">
                                  {containerBits.join(" · ")}
                                </p>
                              ) : null}
                            </div>
                          </td>
                          <td className={tableCellClass}>
                            <div className="space-y-0.5">
                              <p className="font-medium text-foreground">
                                {line.costing.costingNumber}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {line.costing.vendorInvoiceNumber || "—"}
                              </p>
                            </div>
                          </td>
                          <td className={tableCellClass}>
                            {line.costing.vendor?.vendorName ?? "—"}
                          </td>
                          <td
                            className={cn(
                              tableCellClass,
                              "text-right font-medium tabular-nums"
                            )}
                          >
                            {formatIdr(net)}
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex shrink-0 flex-wrap items-center justify-between gap-3">
            <div
              className={cn(
                glassInset,
                "flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 text-sm"
              )}
            >
              <p className="text-muted-foreground">
                {selected.length === 0
                  ? "No lines selected"
                  : `${selected.length} line${selected.length === 1 ? "" : "s"} selected`}
                {isFetching && !isLoading ? (
                  <span className="ml-2 text-xs">Updating…</span>
                ) : null}
              </p>
              {selected.length > 0 ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={pending}
                  onClick={() => setSelected([])}
                >
                  Clear selection
                </Button>
              ) : null}
            </div>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="whitespace-nowrap">
                {totalRows > 0
                  ? `${totalRows} total · Page ${page} of ${totalPages}`
                  : "Page 1 of 1"}
              </span>
              <Button
                type="button"
                variant="outline"
                size="icon"
                className={cn(glassControl, "size-8")}
                disabled={page <= 1 || pending || isFetching}
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                aria-label="Previous page"
              >
                <IconChevronLeft className="size-4" />
              </Button>
              <Button
                type="button"
                variant="outline"
                size="icon"
                className={cn(glassControl, "size-8")}
                disabled={page >= totalPages || pending || isFetching}
                onClick={() =>
                  setPage((prev) => Math.min(totalPages, prev + 1))
                }
                aria-label="Next page"
              >
                <IconChevronRight className="size-4" />
              </Button>
            </div>
          </div>
        </div>

        <DialogFooter className="shrink-0 border-t border-[rgba(214,227,255,0.35)] px-6 py-4">
          <DialogClose asChild>
            <Button type="button" variant="secondary" disabled={pending}>
              Cancel
            </Button>
          </DialogClose>
          <Button
            type="button"
            disabled={pending || selected.length === 0}
            onClick={() => void linkSelected()}
          >
            <IconLink className="size-4" />
            {pending
              ? "Linking..."
              : selected.length === 0
                ? "Link selected"
                : `Link ${selected.length} line${selected.length === 1 ? "" : "s"}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
