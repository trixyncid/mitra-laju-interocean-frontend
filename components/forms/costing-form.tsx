"use client"

import { useForm } from "@tanstack/react-form"
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../ui/dialog"
import { Button } from "../ui/button"
import { IconPencil, IconPlus } from "@tabler/icons-react"
import { TextField } from "../ui/text-field"
import { Label } from "../ui/label"
import { fieldError } from "@/lib/form-field"
import {
  costingContainerSchema,
  costingCurrencySchema,
  costingDescriptionSchema,
  costingNumberSchema,
  costingPph23Schema,
  costingPriceSchema,
  costingVendorInvoiceSchema,
  costingVendorSchema,
  costingVatSchema,
} from "@/lib/schemas/costing"
import { zodOnChange } from "@/lib/zod-form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { useEffect, useState } from "react"
import { useShipmentById } from "@/hooks/use-shipments"
import { useVendors } from "@/hooks/use-vendors"
import { ShipmentOperationalContainer } from "@/app/dashboard/shipments/[shipmentId]/page"
import { Vendor } from "@/app/dashboard/vendors/columns"
import { useCreateCosting, useNextCostingNumber, useUpdateCosting } from "@/hooks/use-costings"
import { usePermissions } from "@/hooks/use-permissions"

const MONTH_IN_ROMANS = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"]
const MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]

const parseCostingNumberDate = (costingNumber: string | undefined): { monthIndex: number, year: number } | null => {
    if (!costingNumber) return null
    const parts = costingNumber.split("/")
    if (parts.length !== 3) return null
    const monthIndex = MONTH_IN_ROMANS.indexOf(parts[1]) + 1
    const year = parseInt(parts[2], 10)
    if (monthIndex === 0 || isNaN(year)) return null
    return { monthIndex, year }
}

const currentYear = new Date().getFullYear()
const YEAR_OPTIONS = Array.from({ length: 4 }, (_, i) => currentYear - 1 + i)

export default function CostingForm({
    mode,
    id,
    costingNumber,
    description,
    price,
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

    const parsedDate = parseCostingNumberDate(costingNumber)
    const defaultMonth = parsedDate?.monthIndex ?? (new Date().getMonth() + 1)
    const defaultYear = parsedDate?.year ?? new Date().getFullYear()

    const [selectedMonth, setSelectedMonth] = useState<number>(defaultMonth)
    const [selectedYear, setSelectedYear] = useState<number>(defaultYear)

    const excludeCostingNumber =
        mode === "edit" &&
        selectedMonth === defaultMonth &&
        selectedYear === defaultYear
            ? costingNumber
            : undefined

    const { data: nextCostingNumberData } = useNextCostingNumber(selectedMonth, selectedYear, {
        enabled: open,
        excludeCostingNumber,
    })

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
            costingNumber: costingNumber ?? "",
            description: description ?? "",
            price: price ?? "",
            currency: currency ?? "",
            containerId: containerId ?? "-",
            vatPercentage: vatPercentage ?? "",
            pph23Percentage: pph23Percentage ?? "",
            vendorInvoiceNumber: vendorInvoiceNumber ?? "",
            vendorId: vendorId ?? "-",
        },
        onSubmit: async ({ value }) => {
            if (mode === "create") {
                createCosting.mutate({
                    month: selectedMonth,
                    year: selectedYear,
                    description: value.description,
                    price: Number(value.price),
                    currency: Number(value.currency),
                    containerId: value.containerId,
                    vatPercentage: Number(value.vatPercentage),
                    pph23Percentage: Number(value.pph23Percentage),
                    vendorInvoiceNumber: value.vendorInvoiceNumber,
                    vendorId: value.vendorId,
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
                        costingNumber: value.costingNumber,
                        description: value.description,
                        price: Number(value.price),
                        currency: Number(value.currency),
                        containerId: value.containerId,
                        vatPercentage: Number(value.vatPercentage),
                        pph23Percentage: Number(value.pph23Percentage),
                        vendorInvoiceNumber: value.vendorInvoiceNumber,
                        vendorId: value.vendorId,
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

    useEffect(() => {
        if (!open) return

        if (
            mode === "edit" &&
            selectedMonth === defaultMonth &&
            selectedYear === defaultYear &&
            costingNumber
        ) {
            form.setFieldValue("costingNumber", costingNumber)
            return
        }

        if (nextCostingNumberData?.costingNumber) {
            form.setFieldValue("costingNumber", nextCostingNumberData.costingNumber)
        }
    }, [
        open,
        selectedMonth,
        selectedYear,
        nextCostingNumberData?.costingNumber,
        mode,
        costingNumber,
        defaultMonth,
        defaultYear,
        form,
    ])

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
                            <div className="my-3 grid grid-cols-2 gap-x-3">
                                <div>
                                    <Label className="my-2">Month</Label>
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
                                    <Label className="my-2">Year</Label>
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
                            <form.Field
                                name="costingNumber"
                                validators={{
                                    onChange: zodOnChange(costingNumberSchema),
                                }}
                            >
                                {(field) => (
                                    <div className="my-3">
                                        <TextField
                                            label="Costing Number"
                                            id={field.name}
                                            name={field.name}
                                            value={field.state.value}
                                            onChange={(e) => field.handleChange(e.target.value)}
                                            disabled
                                        />
                                    </div>
                                )}
                            </form.Field>
                            <form.Field name="description" validators={{ onChange: zodOnChange(costingDescriptionSchema) }}>
                                {( field ) => (
                                    <div className="my-3">
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
                            <form.Field name="price" validators={{ onChange: zodOnChange(costingPriceSchema) }}>
                                {( field ) => (
                                    <div className="my-3">
                                        <TextField
                                            label="Price"
                                            id={field.name}
                                            name={field.name}
                                            type="number"
                                            step="0.01"
                                            value={field.state.value}
                                            onChange={(e) => field.handleChange(Number(e.target.value))}
                                            error={fieldError(field.state.meta.errors)}
                                        />
                                    </div>
                                )}
                            </form.Field>
                            <form.Field name="currency" validators={{ onChange: zodOnChange(costingCurrencySchema) }}>
                                {( field ) => (
                                    <div className="my-3">
                                        <TextField
                                            label="Currency"
                                            id={field.name}
                                            name={field.name}
                                            type="number"
                                            step="0.01"
                                            value={field.state.value}
                                            onChange={(e) => field.handleChange(Number(e.target.value))}
                                            error={fieldError(field.state.meta.errors)}
                                        />
                                    </div>
                                )}
                            </form.Field>
                            {shipmentId && (
                                <form.Field name="containerId" validators={{ onChange: zodOnChange(costingContainerSchema) }}>
                                    {(field) => (
                                        <div className="my-3">
                                            <Label htmlFor={field.name} className="my-2">Container Number</Label>
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
                                        <TextField
                                            label="VAT (%)"
                                            id={field.name}
                                            name={field.name}
                                            type="number"
                                            step="0.01"
                                            value={field.state.value}
                                            onChange={(e) => field.handleChange(Number(e.target.value))}
                                            error={fieldError(field.state.meta.errors)}
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
                                        <TextField
                                            label="PPH 23 (%)"
                                            id={field.name}
                                            name={field.name}
                                            type="number"
                                            step="0.01"
                                            value={field.state.value}
                                            onChange={(e) => field.handleChange(Number(e.target.value))}
                                            error={fieldError(field.state.meta.errors)}
                                        />
                                    </div>
                                )}
                            </form.Field>
                            <form.Field name="vendorInvoiceNumber" validators={{ onChange: zodOnChange(costingVendorInvoiceSchema) }}>
                                {( field ) => (
                                    <div className="my-3">
                                        <TextField
                                            label="Vendor Invoice Number"
                                            id={field.name}
                                            name={field.name}
                                            value={field.state.value}
                                            onChange={(e) => field.handleChange(e.target.value)}
                                            error={fieldError(field.state.meta.errors)}
                                        />
                                    </div>
                                )}
                            </form.Field>
                            <form.Field name="vendorId" validators={{ onChange: zodOnChange(costingVendorSchema) }}>
                                {( field ) => (
                                    <div className="my-3">
                                        <Label htmlFor={field.name} className="my-2">Vendor</Label>
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