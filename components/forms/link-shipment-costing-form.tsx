"use client"

import { useMemo, useState } from "react"
import { useForm } from "@tanstack/react-form"
import { IconLink, IconLinkOff } from "@tabler/icons-react"

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
import { Costing } from "@/app/dashboard/costings/columns"
import { useCostingSearch } from "@/hooks/use-entity-searches"
import { useUpdateCosting } from "@/hooks/use-costings"
import { usePermissions } from "@/hooks/use-permissions"
import { fieldError } from "@/lib/form-field"
import { costingSelectionSchema } from "@/lib/schemas/link"
import { amountCalculation, cn } from "@/lib/utils"
import { zodOnChange } from "@/lib/zod-form"
import { glassInset } from "@/lib/design"

function formatIdr(value: number) {
  return value.toLocaleString("id-ID", { style: "currency", currency: "IDR" })
}

function isUnlinkedCosting(costing: Costing) {
  return !costing.shipment?.id
}

export function UnlinkShipmentCostingButton({
  costingId,
  costingNumber,
}: {
  costingId: string
  costingNumber: string
}) {
  const [open, setOpen] = useState(false)
  const { canWrite } = usePermissions()
  const updateCosting = useUpdateCosting()

  if (!canWrite("costings")) return null

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          title="Unlink costing"
          aria-label={`Unlink ${costingNumber}`}
        >
          <IconLinkOff className="size-4 text-muted-foreground" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Unlink costing</DialogTitle>
          <DialogDescription>
            Remove {costingNumber} from this shipment. The costing stays in the
            system and can be linked again later.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="secondary">
              Cancel
            </Button>
          </DialogClose>
          <Button
            type="button"
            variant="destructive"
            disabled={updateCosting.isPending}
            onClick={() => {
              updateCosting.mutate(
                { id: costingId, costing: { shipmentId: null } },
                {
                  onSuccess: () => setOpen(false),
                }
              )
            }}
          >
            <IconLinkOff className="size-4" />
            {updateCosting.isPending ? "Unlinking..." : "Unlink"}
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
  const [costingSearch, setCostingSearch] = useState("")
  const { canWrite } = usePermissions()
  const { data: costingsData, isLoading, isFetching, isError } = useCostingSearch(
    costingSearch,
    open && canWrite("costings")
  )
  const updateCosting = useUpdateCosting()

  const form = useForm({
    defaultValues: {
      costingId: "",
    },
    onSubmit: async ({ value }) => {
      updateCosting.mutate(
        {
          id: value.costingId,
          costing: { shipmentId },
        },
        {
          onSuccess: () => {
            setOpen(false)
            form.reset()
          },
        }
      )
    },
  })

  const costingItems = useMemo(
    () =>
      (costingsData?.items ?? [])
        .filter(isUnlinkedCosting)
        .map((costing: Costing) => {
          const net = amountCalculation(
            costing.price,
            costing.currency,
            costing.vatPercentage,
            costing.pph23Percentage
          )
          const vendor = costing.vendor?.vendorName
          return {
            value: costing.id,
            label: [
              costing.costingNumber,
              costing.description,
              vendor,
              formatIdr(net),
            ]
              .filter(Boolean)
              .join(" · "),
          }
        }),
    [costingsData?.items]
  )

  if (!canWrite("costings")) return null

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen)
        if (!nextOpen) form.reset()
      }}
    >
      <DialogTrigger asChild>
        <Button type="button" variant="outline" size="sm">
          <IconLink className="size-4" />
          Link costing
        </Button>
      </DialogTrigger>
      <DialogContent
        className="sm:max-w-lg"
        onInteractOutside={(e) => {
          const target = e.target as Element
          if (target.closest('[data-slot="combobox-content"]')) {
            e.preventDefault()
          }
        }}
      >
        <DialogHeader>
          <DialogTitle>Link costing to shipment</DialogTitle>
          <DialogDescription>
            Attach an existing unlinked costing to{" "}
            <span className="font-medium text-foreground">{orderNumber}</span>.
            Only costings without a shipment appear here.
          </DialogDescription>
        </DialogHeader>

        <form
          className="space-y-5"
          onSubmit={(e) => {
            e.preventDefault()
            e.stopPropagation()
            form.handleSubmit()
          }}
        >
          <form.Field
            name="costingId"
            validators={{ onChange: zodOnChange(costingSelectionSchema) }}
          >
            {(field) => (
              <SearchableCombobox
                id={field.name}
                label="Costing"
                value={field.state.value}
                onValueChange={(nextValue) => field.handleChange(nextValue)}
                items={costingItems}
                error={fieldError(field.state.meta.errors)}
                required
                isLoading={isLoading}
                isSearching={isFetching}
                searchError={isError}
                onSearchTermChange={setCostingSearch}
                placeholder="Search by number, description, or vendor..."
                emptyMessage="No unlinked costings available."
              />
            )}
          </form.Field>

          <form.Subscribe selector={(state) => state.values.costingId}>
            {(costingId) => {
              const selectedCosting = (costingsData?.items ?? []).find(
                (costing) => costing.id === costingId
              )
              if (!selectedCosting) return null

              return (
                <div className={cn(glassInset, "space-y-2 px-4 py-3")}>
                  <p className="text-xs font-semibold tracking-[0.05em] text-muted-foreground uppercase">
                    Selected costing
                  </p>
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-foreground">
                      {selectedCosting.costingNumber}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {selectedCosting.description}
                    </p>
                    <p className="text-sm font-medium tabular-nums text-foreground">
                      {formatIdr(
                        amountCalculation(
                          selectedCosting.price,
                          selectedCosting.currency,
                          selectedCosting.vatPercentage,
                          selectedCosting.pph23Percentage
                        )
                      )}
                      {selectedCosting.vendor?.vendorName
                        ? ` · ${selectedCosting.vendor.vendorName}`
                        : ""}
                    </p>
                  </div>
                </div>
              )
            }}
          </form.Subscribe>

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="secondary">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" disabled={updateCosting.isPending}>
              <IconLink className="size-4" />
              {updateCosting.isPending ? "Linking..." : "Link costing"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
