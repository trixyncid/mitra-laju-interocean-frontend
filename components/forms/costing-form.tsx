"use client"

import { useForm } from "@tanstack/react-form"
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../ui/dialog"
import { Button } from "../ui/button"
import { IconPencil, IconPlus } from "@tabler/icons-react"
import { TextField } from "../ui/text-field"
import { NumberField } from "../ui/number-field"
import { FormLabel } from "../ui/form-label"
import { FieldDescription } from "../ui/field"
import { Label } from "../ui/label"
import { fieldError } from "@/lib/form-field"
import {
  costingContainerSchema,
  costingCurrencyCodeSchema,
  costingCurrencyRateForCodeSchema,
  costingDescriptionSchema,
  costingPph23Schema,
  costingPriceSchema,
  costingVendorInvoiceSchema,
  costingVendorSchema,
  costingVatSchema,
} from "@/lib/schemas/costing"
import { zodOnChange } from "@/lib/zod-form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { useState } from "react"
import { useShipmentById } from "@/hooks/use-shipments"
import { useVendors } from "@/hooks/use-vendors"
import { ShipmentOperationalContainer } from "@/app/dashboard/shipments/[shipmentId]/page"
import { Vendor } from "@/app/dashboard/vendors/columns"
import { useCreateCosting, useUpdateCosting } from "@/hooks/use-costings"
import { usePermissions } from "@/hooks/use-permissions"
import {
  COSTING_CURRENCIES,
  DEFAULT_COSTING_CURRENCY_CODE,
  costingCurrencyRequiresRate,
} from "@/lib/costing-currencies"

const MONTH_IN_ROMANS = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"]
const MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]

const currentYear = new Date().getFullYear()
const YEAR_OPTIONS = Array.from({ length: 4 }, (_, i) => currentYear - 1 + i)

function normalizeSelectId(value: string) {
    return value && value !== "-" ? value : undefined
}

export default function CostingForm({
    mode,
    id,
    costingNumber,
    description,
    price,
    currencyCode,
    currency,
    containerId,
    vatPercentage,
    pph23Percentage,
    vendorInvoiceNumber,
    vendorId,
    shipmentId,
}: {
    mode: "edit" | "create"
    id: string | undefined,
    costingNumber: string | undefined,
    description: string | undefined,
    price: number | undefined,
    currencyCode: string | undefined,
    currency: number | undefined,
    containerId: string | undefined,
    vatPercentage: number | undefined,
    pph23Percentage: number | undefined,
    vendorInvoiceNumber: string | undefined,
    vendorId: string | undefined,
    shipmentId: string | null | undefined,
}) {
    const [open, setOpen] = useState(false)
    const { canReadVendorsForCosting } = usePermissions()

    const createCosting = useCreateCosting()
    const updateCosting = useUpdateCosting()

    const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1)
    const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear())

    const fetchDependencies = open && canReadVendorsForCosting()
    const { data: shipmentData, isLoading: isLoadingContainers } = useShipmentById(
        fetchDependencies && shipmentId ? shipmentId : ""
    )
    const shipmentContainers: ShipmentOperationalContainer[] =
        shipmentData?.shipmentOperational?.shipmentOperationalContainers ?? []
    const { data: vendorsPage, isLoading: isLoadingVendors, error: errorVendors } = useVendors(
        {
            page: 1,
            pageSize: 100,
        },
        fetchDependencies
    )
    const vendors = vendorsPage?.items ?? []

    const form = useForm({
        defaultValues: {
            description: description ?? "",
            currencyCode: currencyCode ?? DEFAULT_COSTING_CURRENCY_CODE,
            price: price ?? "",
            currency: currency ?? (costingCurrencyRequiresRate(currencyCode ?? DEFAULT_COSTING_CURRENCY_CODE) ? "" : 1),
            containerId: containerId ?? "-",
            vatPercentage: vatPercentage ?? "",
            pph23Percentage: pph23Percentage ?? "",
            vendorInvoiceNumber: vendorInvoiceNumber ?? "",
            vendorId: vendorId ?? "-",
        },
        onSubmit: async ({ value }) => {
            const vendorId = normalizeSelectId(value.vendorId)
            if (!vendorId) return

            const containerId = shipmentId
                ? normalizeSelectId(value.containerId)
                : undefined

            if (mode === "create") {
                createCosting.mutate({
                    month: selectedMonth,
                    year: selectedYear,
                    description: value.description,
                    currencyCode: value.currencyCode,
                    price: Number(value.price),
                    ...(costingCurrencyRequiresRate(value.currencyCode)
                        ? { currency: Number(value.currency) }
                        : {}),
                    ...(shipmentId ? { shipmentId, containerId } : {}),
                    vatPercentage: Number(value.vatPercentage),
                    pph23Percentage: Number(value.pph23Percentage),
                    vendorInvoiceNumber: value.vendorInvoiceNumber,
                    vendorId,
                }, {
                    onSuccess: () => {
                        setOpen(false)
                        form.reset()
                    }
                })
            } else {
                updateCosting.mutate({
                    id: id as string,
                    costing: {
                        description: value.description,
                        currencyCode: value.currencyCode,
                        price: Number(value.price),
                        ...(costingCurrencyRequiresRate(value.currencyCode)
                            ? { currency: Number(value.currency) }
                            : { currency: 1 }),
                        ...(shipmentId ? { containerId } : {}),
                        vatPercentage: Number(value.vatPercentage),
                        pph23Percentage: Number(value.pph23Percentage),
                        vendorInvoiceNumber: value.vendorInvoiceNumber,
                        vendorId,
                    }
                }, {
                    onSuccess: () => {
                        setOpen(false)
                        form.reset()
                    }
                })
            }
        }
    })

    return (
        <div>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                    { mode === "edit" ? <Button size="icon"><IconPencil /></Button> : <Button><IconPlus /> Add Costing</Button>}
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{ mode === "edit" ? "Edit Costing" : "Add Costing"}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        form.handleSubmit()
                    }}>
                        <div>
                            {mode === "edit" && costingNumber ? (
                                <div className="my-3">
                                    <FormLabel className="my-2">Costing Number</FormLabel>
                                    <p className="text-sm font-medium">{costingNumber}</p>
                                </div>
                            ) : null}
                            {mode === "create" ? (
                                <>
                                    <div className="my-3 grid grid-cols-2 gap-x-3">
                                        <div>
                                            <FormLabel className="my-2" required>Month</FormLabel>
                                            <Select
                                                value={String(selectedMonth)}
                                                onValueChange={(value) => setSelectedMonth(Number(value))}
                                            >
                                                <SelectTrigger className="w-full">
                                                    <SelectValue placeholder="Select month" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {MONTH_NAMES.map((name, i) => (
                                                        <SelectItem key={i + 1} value={String(i + 1)}>
                                                            {name} ({MONTH_IN_ROMANS[i]})
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div>
                                            <FormLabel className="my-2" required>Year</FormLabel>
                                            <Select
                                                value={String(selectedYear)}
                                                onValueChange={(value) => setSelectedYear(Number(value))}
                                            >
                                                <SelectTrigger className="w-full">
                                                    <SelectValue placeholder="Select year" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {YEAR_OPTIONS.map((year) => (
                                                        <SelectItem key={year} value={String(year)}>{year}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                    <FieldDescription className="my-3">
                                        The costing number will be generated automatically when you create this costing.
                                    </FieldDescription>
                                </>
                            ) : null}
                            <form.Field name="description" validators={{ onChange: zodOnChange(costingDescriptionSchema) }}>
                                {( field ) => (
                                    <div className="my-3">
                                        <TextField
                                            label="Description"
                                            required
                                            id={field.name}
                                            name={field.name}
                                            value={field.state.value}
                                            onChange={(e) => field.handleChange(e.target.value)}
                                            error={fieldError(field.state.meta.errors)}
                                        />
                                    </div>
                                )}
                            </form.Field>
                            <form.Field name="currencyCode" validators={{ onChange: zodOnChange(costingCurrencyCodeSchema), onSubmit: zodOnChange(costingCurrencyCodeSchema) }}>
                                {(field) => (
                                    <div className="my-3">
                                        <FormLabel htmlFor={field.name} className="my-2" required>Currency</FormLabel>
                                        <Select
                                            value={field.state.value as string}
                                            onValueChange={(value) => {
                                                field.handleChange(value)
                                                if (!costingCurrencyRequiresRate(value)) {
                                                    form.setFieldValue("currency", 1)
                                                } else {
                                                    form.setFieldValue("currency", "")
                                                }
                                            }}
                                        >
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Select currency" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {COSTING_CURRENCIES.map((item) => (
                                                    <SelectItem key={item.code} value={item.code}>
                                                        {item.code} — {item.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {field.state.meta.errors ? (
                                            <em className="text-xs text-[var(--mli-on-error-container)]">{field.state.meta.errors}</em>
                                        ) : null}
                                    </div>
                                )}
                            </form.Field>
                            <form.Subscribe selector={(state) => state.values.currencyCode}>
                                {(selectedCurrencyCode) => (
                                    <>
                            <form.Field name="price" validators={{ onChange: zodOnChange(costingPriceSchema) }}>
                                {( field ) => (
                                    <div className="my-3">
                                        <NumberField
                                            label="Price"
                                            required
                                            id={field.name}
                                            name={field.name}
                                            value={field.state.value}
                                            onValueChange={(nextValue) => field.handleChange(nextValue)}
                                            error={fieldError(field.state.meta.errors)}
                                            placeholder="0"
                                            description={
                                                costingCurrencyRequiresRate(selectedCurrencyCode)
                                                    ? `Vendor price in ${selectedCurrencyCode}.`
                                                    : "Vendor price in IDR."
                                            }
                                        />
                                    </div>
                                )}
                            </form.Field>
                            {costingCurrencyRequiresRate(selectedCurrencyCode) ? (
                            <form.Field
                                name="currency"
                                validators={{
                                    onChange: ({ value }) =>
                                        zodOnChange(costingCurrencyRateForCodeSchema(selectedCurrencyCode))({ value }),
                                    onSubmit: ({ value }) =>
                                        zodOnChange(costingCurrencyRateForCodeSchema(selectedCurrencyCode))({ value }),
                                }}
                            >
                                {( field ) => (
                                    <div className="my-3">
                                        <NumberField
                                            label="Currency Rate"
                                            required
                                            id={field.name}
                                            name={field.name}
                                            value={field.state.value}
                                            onValueChange={(nextValue) => field.handleChange(nextValue)}
                                            error={fieldError(field.state.meta.errors)}
                                            placeholder="0"
                                            description={`${selectedCurrencyCode} to IDR exchange rate.`}
                                        />
                                    </div>
                                )}
                            </form.Field>
                            ) : null}
                                    </>
                                )}
                            </form.Subscribe>
                            {shipmentId && (
                                <form.Field name="containerId" validators={{ onChange: zodOnChange(costingContainerSchema), onSubmit: zodOnChange(costingContainerSchema) }}>
                                    {(field) => (
                                        <div className="my-3">
                                            <FormLabel htmlFor={field.name} className="my-2" required>Container Number</FormLabel>
                                            <Select
                                                value={field.state.value as string}
                                                onValueChange={(value) => field.handleChange(value)}
                                            >
                                                <SelectTrigger className="w-full">
                                                    <SelectValue placeholder="Select a container number" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {isLoadingContainers ? (
                                                        <SelectItem value="-">Loading...</SelectItem>
                                                    ) : shipmentContainers.length === 0 ? (
                                                        <SelectItem value="-">No containers found for this shipment</SelectItem>
                                                    ) : (
                                                        shipmentContainers.map((container: ShipmentOperationalContainer) => (
                                                            <SelectItem key={container.id} value={container.id as string}>
                                                                {container.containerNumber} ({container.sealNumber})
                                                            </SelectItem>
                                                        ))
                                                    )}
                                                </SelectContent>
                                            </Select>
                                            {field.state.meta.errors ? (
                                                <em className="text-xs text-[var(--mli-on-error-container)]">{field.state.meta.errors}</em>
                                            ) : null}
                                        </div>
                                    )}
                                </form.Field>
                            )}
                            <form.Field 
                                name="vatPercentage"
                                validators={{ onChange: zodOnChange(costingVatSchema) }}
                            >
                                {( field ) => (
                                    <div className="my-3">
                                        <NumberField
                                            label="VAT (%)"
                                            required
                                            id={field.name}
                                            name={field.name}
                                            value={field.state.value}
                                            onValueChange={(nextValue) => field.handleChange(nextValue)}
                                            error={fieldError(field.state.meta.errors)}
                                            useGrouping={false}
                                            maximumFractionDigits={2}
                                            placeholder="0"
                                        />
                                    </div>
                                )}
                            </form.Field>
                            <form.Field 
                                name="pph23Percentage"
                                validators={{ onChange: zodOnChange(costingPph23Schema) }}
                            >
                                {( field ) => (
                                    <div className="my-3">
                                        <NumberField
                                            label="PPH 23 (%)"
                                            required
                                            id={field.name}
                                            name={field.name}
                                            value={field.state.value}
                                            onValueChange={(nextValue) => field.handleChange(nextValue)}
                                            error={fieldError(field.state.meta.errors)}
                                            useGrouping={false}
                                            maximumFractionDigits={2}
                                            placeholder="0"
                                        />
                                    </div>
                                )}
                            </form.Field>
                            <form.Field name="vendorInvoiceNumber" validators={{ onChange: zodOnChange(costingVendorInvoiceSchema) }}>
                                {( field ) => (
                                    <div className="my-3">
                                        <TextField
                                            label="Vendor Invoice Number"
                                            required
                                            id={field.name}
                                            name={field.name}
                                            value={field.state.value}
                                            onChange={(e) => field.handleChange(e.target.value)}
                                            error={fieldError(field.state.meta.errors)}
                                        />
                                    </div>
                                )}
                            </form.Field>
                            <form.Field name="vendorId" validators={{ onChange: zodOnChange(costingVendorSchema), onSubmit: zodOnChange(costingVendorSchema) }}>
                                {( field ) => (
                                    <div className="my-3">
                                        <FormLabel htmlFor={field.name} className="my-2" required>Vendor</FormLabel>
                                        <Select
                                            value={field.state.value as string}
                                            onValueChange={(value) => field.handleChange(value)}
                                        >
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Select a vendor" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {
                                                    isLoadingVendors ? (
                                                        <SelectItem value="-">Loading...</SelectItem>
                                                    ) : errorVendors ? (
                                                        <SelectItem value="-">Error loading vendors</SelectItem>
                                                    ) : vendors?.length === 0 ? (
                                                        <SelectItem value="-">No vendors found</SelectItem>
                                                    ) : vendors?.map((vendor: Vendor) => (
                                                        <SelectItem key={vendor.id} value={vendor.id ?? "-"}>{vendor.vendorName}</SelectItem>
                                                    ))
                                                }
                                            </SelectContent>
                                        </Select>
                                        {
                                            field.state.meta.errors ? (
                                                <em className="text-xs text-[var(--mli-on-error-container)]">{field.state.meta.errors}</em>
                                            ) : null
                                        }
                                    </div>
                                )}
                            </form.Field>
                        </div>
                        <DialogFooter>
                            <Button type="submit" disabled={createCosting.isPending || updateCosting.isPending}>{ mode === "edit" ? (updateCosting.isPending ? "Updating..." : "Save Changes") : (createCosting.isPending ? "Creating..." : "Create")}</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    )
}