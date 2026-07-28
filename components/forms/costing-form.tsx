"use client"

import type { ReactNode } from "react"
import { useForm } from "@tanstack/react-form"
import { Dialog, DialogTrigger, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "../ui/dialog"
import { Button } from "../ui/button"
import { IconPencil, IconPlus } from "@tabler/icons-react"
import { TextField } from "../ui/text-field"
import { NumberField } from "../ui/number-field"
import { FormLabel } from "../ui/form-label"
import { FieldDescription } from "../ui/field"
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
import { useVendors } from "@/hooks/use-vendors"
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

function normalizeContainerNumber(value: string) {
    const trimmed = value.trim()
    return trimmed === "" ? undefined : trimmed
}

export default function CostingForm({
    mode,
    id,
    costingNumber,
    description,
    price,
    currencyCode,
    currency,
    containerNumber,
    vatPercentage,
    pph23Percentage,
    vendorInvoiceNumber,
    vendorId,
    shipmentId,
    trigger,
}: {
    mode: "edit" | "create"
    id: string | undefined,
    costingNumber: string | undefined,
    description: string | undefined,
    price: number | undefined,
    currencyCode: string | undefined,
    currency: number | undefined,
    containerNumber: string | undefined,
    vatPercentage: number | undefined,
    pph23Percentage: number | undefined,
    vendorInvoiceNumber: string | undefined,
    vendorId: string | undefined,
    shipmentId: string | null | undefined,
    trigger?: ReactNode,
}) {
    const [open, setOpen] = useState(false)
    const { canReadVendorsForCosting } = usePermissions()

    const createCosting = useCreateCosting()
    const updateCosting = useUpdateCosting()

    const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1)
    const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear())

    const fetchDependencies = open && canReadVendorsForCosting()
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
            containerNumber: containerNumber ?? "",
            vatPercentage: vatPercentage ?? "",
            pph23Percentage: pph23Percentage ?? "",
            vendorInvoiceNumber: vendorInvoiceNumber ?? "",
            vendorId: vendorId ?? "-",
        },
        onSubmit: async ({ value }) => {
            const vendorId = normalizeSelectId(value.vendorId)
            if (!vendorId) return

            const nextContainerNumber = normalizeContainerNumber(value.containerNumber)
            const nextVendorInvoiceNumber = value.vendorInvoiceNumber.trim() || null

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
                    ...(nextContainerNumber ? { containerNumber: nextContainerNumber } : {}),
                    ...(shipmentId ? { shipmentId } : {}),
                    vatPercentage: Number(value.vatPercentage),
                    pph23Percentage: Number(value.pph23Percentage),
                    ...(nextVendorInvoiceNumber
                        ? { vendorInvoiceNumber: nextVendorInvoiceNumber }
                        : {}),
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
                        containerNumber: nextContainerNumber ?? null,
                        vatPercentage: Number(value.vatPercentage),
                        pph23Percentage: Number(value.pph23Percentage),
                        vendorInvoiceNumber: nextVendorInvoiceNumber,
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
                    {trigger ?? (
                        mode === "edit"
                            ? <Button size="icon-sm" variant="outline"><IconPencil /></Button>
                            : <Button><IconPlus /> Add Costing</Button>
                    )}
                </DialogTrigger>
                <DialogContent className="flex max-h-[min(92dvh,820px)] flex-col gap-0 overflow-hidden p-0 sm:max-w-3xl">
                    <DialogHeader className="shrink-0 border-b border-[rgba(214,227,255,0.4)] px-6 py-5 pr-12">
                        <DialogTitle>{ mode === "edit" ? "Edit Costing" : "Add Costing"}</DialogTitle>
                        <DialogDescription>
                            {mode === "edit"
                                ? "Update vendor charges, tax rates, and invoice details."
                                : "Enter vendor charges, tax rates, and invoice details for this costing."}
                        </DialogDescription>
                    </DialogHeader>
                    <form
                        className="flex min-h-0 flex-1 flex-col"
                        onSubmit={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            form.handleSubmit()
                        }}
                    >
                        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 py-5">
                            <div className="space-y-6">
                                {mode === "edit" && costingNumber ? (
                                    <div className="rounded-md border border-[rgba(214,227,255,0.45)] bg-[rgba(232,238,246,0.45)] px-4 py-3">
                                        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                                            Costing number
                                        </p>
                                        <p className="mt-1 font-mono text-sm font-semibold tracking-wide">
                                            {costingNumber}
                                        </p>
                                    </div>
                                ) : null}

                                {mode === "create" ? (
                                    <section className="space-y-3">
                                        <div>
                                            <h3 className="text-sm font-semibold text-foreground">
                                                Period
                                            </h3>
                                            <FieldDescription>
                                                Used to generate the costing number automatically.
                                            </FieldDescription>
                                        </div>
                                        <div className="grid gap-4 sm:grid-cols-2">
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
                                    </section>
                                ) : null}

                                <section className="space-y-3">
                                    <div>
                                        <h3 className="text-sm font-semibold text-foreground">
                                            Details
                                        </h3>
                                        <FieldDescription>
                                            What this charge covers and any related container.
                                        </FieldDescription>
                                    </div>
                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <form.Field name="description" validators={{ onChange: zodOnChange(costingDescriptionSchema) }}>
                                            {( field ) => (
                                                <div className="sm:col-span-2">
                                                    <TextField
                                                        label="Description"
                                                        id={field.name}
                                                        name={field.name}
                                                        value={field.state.value}
                                                        onChange={(e) => field.handleChange(e.target.value)}
                                                        error={fieldError(field.state.meta.errors)}
                                                    />
                                                </div>
                                            )}
                                        </form.Field>
                                        <form.Field name="containerNumber" validators={{ onChange: zodOnChange(costingContainerSchema) }}>
                                            {( field ) => (
                                                <TextField
                                                    label="Container Number"
                                                    id={field.name}
                                                    name={field.name}
                                                    value={field.state.value}
                                                    onChange={(e) => field.handleChange(e.target.value)}
                                                    error={fieldError(field.state.meta.errors)}
                                                    placeholder="e.g. TCKU1234567"
                                                />
                                            )}
                                        </form.Field>
                                    </div>
                                </section>

                                <section className="space-y-3">
                                    <div>
                                        <h3 className="text-sm font-semibold text-foreground">
                                            Pricing
                                        </h3>
                                        <FieldDescription>
                                            Vendor price and exchange rate used for IDR conversion.
                                        </FieldDescription>
                                    </div>
                                    <form.Subscribe selector={(state) => state.values.currencyCode}>
                                        {(selectedCurrencyCode) => (
                                            <div className="grid gap-4 sm:grid-cols-2">
                                                <form.Field name="currencyCode" validators={{ onChange: zodOnChange(costingCurrencyCodeSchema), onSubmit: zodOnChange(costingCurrencyCodeSchema) }}>
                                                    {(field) => (
                                                        <div>
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
                                                <form.Field name="price" validators={{ onChange: zodOnChange(costingPriceSchema) }}>
                                                    {( field ) => (
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
                                                        )}
                                                    </form.Field>
                                                ) : null}
                                                <form.Field
                                                    name="vatPercentage"
                                                    validators={{ onChange: zodOnChange(costingVatSchema) }}
                                                >
                                                    {( field ) => (
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
                                                    )}
                                                </form.Field>
                                                <form.Field
                                                    name="pph23Percentage"
                                                    validators={{ onChange: zodOnChange(costingPph23Schema) }}
                                                >
                                                    {( field ) => (
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
                                                    )}
                                                </form.Field>
                                            </div>
                                        )}
                                    </form.Subscribe>
                                </section>

                                <section className="space-y-3">
                                    <div>
                                        <h3 className="text-sm font-semibold text-foreground">
                                            Vendor
                                        </h3>
                                        <FieldDescription>
                                            Who issued the charge and their invoice reference.
                                        </FieldDescription>
                                    </div>
                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <form.Field name="vendorId" validators={{ onChange: zodOnChange(costingVendorSchema), onSubmit: zodOnChange(costingVendorSchema) }}>
                                            {( field ) => (
                                                <div>
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
                                        <form.Field name="vendorInvoiceNumber" validators={{ onChange: zodOnChange(costingVendorInvoiceSchema) }}>
                                            {( field ) => (
                                                <TextField
                                                    label="Vendor Invoice Number"
                                                    id={field.name}
                                                    name={field.name}
                                                    value={field.state.value}
                                                    onChange={(e) => field.handleChange(e.target.value)}
                                                    error={fieldError(field.state.meta.errors)}
                                                />
                                            )}
                                        </form.Field>
                                    </div>
                                </section>
                            </div>
                        </div>
                        <DialogFooter className="shrink-0 border-t border-[rgba(214,227,255,0.4)] px-6 py-4">
                            <Button type="submit" disabled={createCosting.isPending || updateCosting.isPending}>{ mode === "edit" ? (updateCosting.isPending ? "Updating..." : "Save Changes") : (createCosting.isPending ? "Creating..." : "Create")}</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    )
}
