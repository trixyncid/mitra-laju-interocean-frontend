"use client"

import type { ReactNode } from "react"
import { useMemo, useState } from "react"
import { IconPencil, IconPlus } from "@tabler/icons-react"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { TextField } from "@/components/ui/text-field"
import { NumberField } from "@/components/ui/number-field"
import { Field, FieldContent, FieldDescription, FieldLabel } from "@/components/ui/field"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { SearchableCombobox } from "@/components/searchable-combobox"
import {
  useCreateCostingBreakdown,
  useUpdateCostingBreakdown,
} from "@/hooks/use-costings"
import { useShipmentSearch } from "@/hooks/use-entity-searches"
import { useContainerLookups } from "@/hooks/use-container-lookups"
import { usePermissions } from "@/hooks/use-permissions"
import type { CostingBreakdown } from "@/app/dashboard/costings/columns"

/** Parse API Decimal/number without treating "." as a thousands separator. */
function toFormNumber(
  value: number | string | null | undefined,
  fallback: number
): number {
  if (value === "" || value == null) return fallback
  const num = typeof value === "number" ? value : Number(value)
  return Number.isFinite(num) ? num : fallback
}

function toPercentageFormNumber(
  value: number | string | null | undefined,
  fallback: number
): number {
  return Math.round(toFormNumber(value, fallback) * 100) / 100
}

export default function CostingBreakdownForm({
  mode,
  costingId,
  breakdown,
  trigger,
}: {
  mode: "create" | "edit"
  costingId: string
  breakdown?: CostingBreakdown
  trigger?: ReactNode
}) {
  const [open, setOpen] = useState(false)
  const createBreakdown = useCreateCostingBreakdown(costingId)
  const updateBreakdown = useUpdateCostingBreakdown(costingId)
  const { canReadShipmentsForCosting } = usePermissions()

  const [productDescription, setProductDescription] = useState(
    breakdown?.productDescription ?? ""
  )
  const [quantity, setQuantity] = useState<number | "">(
    toFormNumber(breakdown?.quantity, 1)
  )
  const [price, setPrice] = useState<number | "">(
    breakdown?.price == null || breakdown.price === ""
      ? ""
      : toFormNumber(breakdown.price, 0)
  )
  const [currencyPrice, setCurrencyPrice] = useState<number | "">(
    toFormNumber(breakdown?.currencyPrice, 1)
  )
  const [vatPercentage, setVatPercentage] = useState<number | "">(
    toPercentageFormNumber(breakdown?.vatPercentage, 0)
  )
  const [pph23Percentage, setPph23Percentage] = useState<number | "">(
    toPercentageFormNumber(breakdown?.pph23Percentage, 0)
  )
  const [containerNumber, setContainerNumber] = useState(
    breakdown?.containerNumber ?? ""
  )
  const [containerSizeId, setContainerSizeId] = useState(
    breakdown?.containerSizeId ?? ""
  )
  const [containerTypeId, setContainerTypeId] = useState(
    breakdown?.containerTypeId ?? ""
  )
  const [shipmentId, setShipmentId] = useState(
    breakdown?.shipmentId ? breakdown.shipmentId : "-"
  )
  const [shipmentSearch, setShipmentSearch] = useState("")

  function resetForm() {
    setProductDescription(breakdown?.productDescription ?? "")
    setQuantity(toFormNumber(breakdown?.quantity, 1))
    setPrice(
      breakdown?.price == null || breakdown.price === ""
        ? ""
        : toFormNumber(breakdown.price, 0)
    )
    setCurrencyPrice(toFormNumber(breakdown?.currencyPrice, 1))
    setVatPercentage(toPercentageFormNumber(breakdown?.vatPercentage, 0))
    setPph23Percentage(toPercentageFormNumber(breakdown?.pph23Percentage, 0))
    setContainerNumber(breakdown?.containerNumber ?? "")
    setContainerSizeId(breakdown?.containerSizeId ?? "")
    setContainerTypeId(breakdown?.containerTypeId ?? "")
    setShipmentId(breakdown?.shipmentId ? breakdown.shipmentId : "-")
    setShipmentSearch("")
  }

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen)
    if (nextOpen) {
      resetForm()
    }
  }

  const { data: sizesData } = useContainerLookups(
    "size",
    { page: 1, pageSize: 100, status: "all" },
    open
  )
  const { data: typesData } = useContainerLookups(
    "type",
    { page: 1, pageSize: 100, status: "all" },
    open
  )
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

  const sizeOptions = useMemo(
    () =>
      (sizesData?.items ?? []).filter(
        (item) => item.isActive || item.id === containerSizeId
      ),
    [sizesData?.items, containerSizeId]
  )
  const typeOptions = useMemo(
    () =>
      (typesData?.items ?? []).filter(
        (item) => item.isActive || item.id === containerTypeId
      ),
    [typesData?.items, containerTypeId]
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
      breakdown?.shipment?.id &&
      !fromSearch.some((item) => item.value === breakdown.shipment?.id)
    ) {
      return [
        {
          value: breakdown.shipment.id,
          label: breakdown.shipment.orderNumber,
        },
        ...fromSearch,
      ]
    }
    return fromSearch
  }, [shipmentsPage?.items, breakdown?.shipment])

  const isPending = createBreakdown.isPending || updateBreakdown.isPending

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (!productDescription.trim()) return

    const payload = {
      productDescription: productDescription.trim(),
      quantity: typeof quantity === "number" ? quantity : 1,
      price: typeof price === "number" ? price : 0,
      currencyPrice: typeof currencyPrice === "number" ? currencyPrice : 1,
      vatPercentage:
        typeof vatPercentage === "number"
          ? Math.round(vatPercentage * 100) / 100
          : 0,
      pph23Percentage:
        typeof pph23Percentage === "number"
          ? Math.round(pph23Percentage * 100) / 100
          : 0,
      containerNumber: containerNumber.trim() || null,
      containerSizeId: containerSizeId || null,
      containerTypeId: containerTypeId || null,
      shipmentId: shipmentId && shipmentId !== "-" ? shipmentId : null,
    }

    if (mode === "create") {
      await createBreakdown.mutateAsync(payload)
    } else if (breakdown) {
      await updateBreakdown.mutateAsync({
        breakdownId: breakdown.id,
        breakdown: payload,
      })
    }
    setOpen(false)
    if (mode === "create") {
      resetForm()
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger ??
          (mode === "create" ? (
            <Button size="sm">
              <IconPlus className="size-4" />
              Add line
            </Button>
          ) : (
            <Button variant="ghost" size="icon-sm">
              <IconPencil className="size-4" />
            </Button>
          ))}
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Add breakdown" : "Edit breakdown"}
          </DialogTitle>
          <DialogDescription>
            Describe the charge and optionally link it to a shipment.
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-4" onSubmit={onSubmit}>
          <TextField
            label="Product / charge"
            required
            value={productDescription}
            onChange={(event) => setProductDescription(event.target.value)}
            placeholder="e.g. Ocean freight, THC, trucking"
          />

          <div className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-3">
              <NumberField
                label="Quantity"
                required
                value={quantity}
                onValueChange={setQuantity}
                maximumFractionDigits={0}
              />
              <NumberField
                label="Unit price"
                required
                value={price}
                onValueChange={setPrice}
              />
              <NumberField
                label="Exchange rate"
                required
                value={currencyPrice}
                onValueChange={setCurrencyPrice}
                description="Use 1 if already IDR"
              />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <NumberField
                label="VAT %"
                required
                value={vatPercentage}
                onValueChange={setVatPercentage}
                useGrouping={false}
                maximumFractionDigits={2}
                placeholder="0"
              />
              <NumberField
                label="PPH 23 %"
                required
                value={pph23Percentage}
                onValueChange={setPph23Percentage}
                useGrouping={false}
                maximumFractionDigits={2}
                placeholder="0"
              />
            </div>
            <FieldDescription>
              VAT and PPH 23 apply to this line’s gross (unit × rate × qty).
            </FieldDescription>
          </div>

          <div className="rounded-md border border-[rgba(214,227,255,0.55)] bg-[rgba(247,249,251,0.55)] p-4">
            <div className="mb-3">
              <p className="text-sm font-medium text-foreground">
                Container details
              </p>
              <p className="mt-0.5 text-sm text-muted-foreground">
                Optional — fill these in when this charge belongs to a specific
                container.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <TextField
                label="Container number"
                value={containerNumber}
                onChange={(event) => setContainerNumber(event.target.value)}
                placeholder="e.g. MSKU1234567"
              />

              <Field>
                <FieldLabel htmlFor="breakdown-container-size" className="cursor-default">
                  Size
                </FieldLabel>
                <FieldContent>
                  <Select
                    value={containerSizeId || "-"}
                    onValueChange={(value) =>
                      setContainerSizeId(value === "-" ? "" : value)
                    }
                  >
                    <SelectTrigger
                      id="breakdown-container-size"
                      className="w-full"
                    >
                      <SelectValue placeholder="Select size" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="-">None</SelectItem>
                      {sizeOptions.map((size) => (
                        <SelectItem key={size.id} value={size.id ?? ""}>
                          {size.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FieldContent>
              </Field>

              <Field>
                <FieldLabel htmlFor="breakdown-container-type" className="cursor-default">
                  Type
                </FieldLabel>
                <FieldContent>
                  <Select
                    value={containerTypeId || "-"}
                    onValueChange={(value) =>
                      setContainerTypeId(value === "-" ? "" : value)
                    }
                  >
                    <SelectTrigger
                      id="breakdown-container-type"
                      className="w-full"
                    >
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="-">None</SelectItem>
                      {typeOptions.map((type) => (
                        <SelectItem key={type.id} value={type.id ?? ""}>
                          {type.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FieldContent>
              </Field>
            </div>
          </div>

          <SearchableCombobox
            label="Assign to shipment"
            items={[{ value: "-", label: "Unassigned" }, ...shipmentItems]}
            value={shipmentId || "-"}
            onValueChange={setShipmentId}
            onSearchTermChange={setShipmentSearch}
            placeholder="Search order number"
            emptyMessage="No shipments found"
            isLoading={isLoadingShipments}
            isSearching={isFetchingShipments}
            description="Leave unassigned if you will link this charge later"
          />

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving…" : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
