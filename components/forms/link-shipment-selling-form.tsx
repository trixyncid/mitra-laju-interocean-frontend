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
import { Selling } from "@/app/dashboard/sellings/columns"
import { useSellings, useUpdateSelling } from "@/hooks/use-sellings"
import { usePermissions } from "@/hooks/use-permissions"
import { fieldError } from "@/lib/form-field"
import { sellingSelectionSchema } from "@/lib/schemas/link"
import { cn, sellingNetAmount } from "@/lib/utils"
import { zodOnChange } from "@/lib/zod-form"
import { glassInset } from "@/lib/design"

function formatIdr(value: number) {
  return value.toLocaleString("id-ID", { style: "currency", currency: "IDR" })
}

function isUnlinkedSelling(selling: Selling) {
  return !selling.shipmentId
}

export function UnlinkShipmentSellingButton({
  sellingId,
  sellingNumber,
}: {
  sellingId: string
  sellingNumber: string
}) {
  const [open, setOpen] = useState(false)
  const { canWrite } = usePermissions()
  const updateSelling = useUpdateSelling()

  if (!canWrite("sellings")) return null

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          title="Unlink selling"
          aria-label={`Unlink ${sellingNumber}`}
        >
          <IconLinkOff className="size-4 text-muted-foreground" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Unlink selling</DialogTitle>
          <DialogDescription>
            Remove {sellingNumber} from this shipment. The selling stays in the
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
            disabled={updateSelling.isPending}
            onClick={() => {
              updateSelling.mutate(
                { id: sellingId, selling: { shipmentId: null } },
                {
                  onSuccess: () => setOpen(false),
                }
              )
            }}
          >
            <IconLinkOff className="size-4" />
            {updateSelling.isPending ? "Unlinking..." : "Unlink"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default function LinkShipmentSellingForm({
  shipmentId,
  orderNumber,
}: {
  shipmentId: string
  orderNumber: string
}) {
  const [open, setOpen] = useState(false)
  const { canWrite } = usePermissions()
  const { data: sellingsData, isLoading, isError } = useSellings(
    { page: 1, pageSize: 100 },
    open && canWrite("sellings")
  )
  const updateSelling = useUpdateSelling()

  const form = useForm({
    defaultValues: {
      sellingId: "",
    },
    onSubmit: async ({ value }) => {
      updateSelling.mutate(
        {
          id: value.sellingId,
          selling: { shipmentId },
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

  const sellingItems = useMemo(
    () =>
      (sellingsData?.items ?? [])
        .filter(isUnlinkedSelling)
        .map((selling: Selling) => {
          const net = sellingNetAmount(
            selling.amount,
            selling.vatPercentage,
            selling.pph23Percentage
          )
          return {
            value: selling.id,
            label: [selling.sellingNumber, selling.description, formatIdr(net)]
              .filter(Boolean)
              .join(" · "),
          }
        }),
    [sellingsData?.items]
  )

  if (!canWrite("sellings")) return null

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
          Link selling
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
          <DialogTitle>Link selling to shipment</DialogTitle>
          <DialogDescription>
            Attach an existing unlinked selling to{" "}
            <span className="font-medium text-foreground">{orderNumber}</span>.
            Only sellings without a shipment appear here.
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
            name="sellingId"
            validators={{ onChange: zodOnChange(sellingSelectionSchema) }}
          >
            {(field) => (
              <SearchableCombobox
                id={field.name}
                label="Selling"
                value={field.state.value}
                onValueChange={(nextValue) => field.handleChange(nextValue)}
                items={sellingItems}
                error={fieldError(field.state.meta.errors)}
                required
                isLoading={isLoading}
                disabled={isError}
                placeholder="Search by number or description..."
                emptyMessage={
                  isError
                    ? "Unable to load sellings."
                    : "No unlinked sellings available."
                }
              />
            )}
          </form.Field>

          <form.Subscribe selector={(state) => state.values.sellingId}>
            {(sellingId) => {
              const selectedSelling = (sellingsData?.items ?? []).find(
                (selling) => selling.id === sellingId
              )
              if (!selectedSelling) return null

              return (
                <div className={cn(glassInset, "space-y-2 px-4 py-3")}>
                  <p className="text-xs font-semibold tracking-[0.05em] text-muted-foreground uppercase">
                    Selected selling
                  </p>
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-foreground">
                      {selectedSelling.sellingNumber}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {selectedSelling.description}
                    </p>
                    <p className="text-sm font-medium tabular-nums text-foreground">
                      {formatIdr(
                        sellingNetAmount(
                          selectedSelling.amount,
                          selectedSelling.vatPercentage,
                          selectedSelling.pph23Percentage
                        )
                      )}
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
            <Button type="submit" disabled={updateSelling.isPending}>
              <IconLink className="size-4" />
              {updateSelling.isPending ? "Linking..." : "Link selling"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
