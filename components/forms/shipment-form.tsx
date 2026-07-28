"use client"

import { Button } from "@/components/ui/button";
import { CustomerCombobox } from "@/components/customer-combobox";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { FormLabel } from "@/components/ui/form-label";
import { FieldDescription } from "@/components/ui/field";
import { ActiveStatusField } from "@/components/forms/active-status-field";
import { fieldError } from "@/lib/form-field";
import {
  customerCodeIdSchema,
  customerShipperIdSchema,
} from "@/lib/schemas/shipment";
import { zodOnChange } from "@/lib/zod-form";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { useGetShippersByCustomerCodeId } from "@/hooks/use-customers";
import { useCreateShipment, useUpdateShipment } from "@/hooks/use-shipments";
import { IconPlus } from "@tabler/icons-react";
import { useForm } from "@tanstack/react-form";
import { Pencil } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export type Shipper = {
    id: string,
    name: string,
}

const MONTH_IN_ROMANS = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"]
const MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]

const currentYear = new Date().getFullYear()
const YEAR_OPTIONS = Array.from({ length: 4 }, (_, i) => currentYear - 1 + i)

export default function ShipmentForm({
    id,
    mode,
    orderNumber,
    customerCodeId,
    customerShipperId,
    status,
    isActive
}: {
    id: string | undefined,
    mode: "edit" | "create",
    orderNumber: string | undefined,
    customerCodeId: string | undefined,
    customerShipperId: string | undefined
    status: "ONGOING" | "COMPLETED" | undefined
    isActive: boolean | undefined
}) {
    const createShipment = useCreateShipment()
    const updateShipment = useUpdateShipment()

    const [open, setOpen] = useState(false)
    const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1)
    const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear())
    const [selectedCustomerCode, setSelectedCustomerCode] = useState<string | undefined>(customerCodeId ?? "")

    const form = useForm({
        defaultValues: {
            id: id ?? "",
            customerCodeId: customerCodeId ?? "",
            customerShipperId: customerShipperId ?? "-",
            status: status ?? "ONGOING",
            isActive: isActive ?? true,
        },
        onSubmit: async ({ value }) => {
            if (mode === "create") {
                createShipment.mutate({
                    month: selectedMonth,
                    year: selectedYear,
                    customerCodeId: value.customerCodeId,
                    customerShipperId: value.customerShipperId,
                    status: value.status,
                }, {
                    onSuccess: () => {
                        setOpen(false)
                        form.reset()
                    },
                    onError: (error: Error) => {
                        toast.error(error.message)
                    }
                })
            } else {
                updateShipment.mutate({
                    id: value.id,
                    shipment: {
                        customerCodeId: value.customerCodeId,
                        customerShipperId: value.customerShipperId,
                        status: value.status,
                        isActive: value.isActive,
                    }
                }, {
                    onSuccess: () => {
                        setOpen(false)
                        form.reset()
                    },
                    onError: (error: Error) => {
                        toast.error(error.message)
                    }
                })
            }
        }
    })

    const { data: shippers, isLoading: shippersLoading, error: shippersError } = useGetShippersByCustomerCodeId(selectedCustomerCode ?? "")

    return (
        <div>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                    {mode === "edit" ? <Button variant="outline" size="icon"><Pencil /></Button> : <Button><IconPlus /> Add Shipment</Button>}
                </DialogTrigger>
                <DialogContent
                    onInteractOutside={(e) => {
                        const target = e.target as Element
                        if (target.closest('[data-slot="combobox-content"]')) {
                            e.preventDefault()
                        }
                    }}
                >
                    <DialogHeader>
                        <DialogTitle>{mode === "edit" ? "Edit Shipment" : "Create New Shipment"}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={
                        (e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            form.handleSubmit()
                        }
                    }>
                        <div>
                            {mode === "edit" && orderNumber ? (
                                <div className="my-3">
                                    <FormLabel className="my-2">Order Number</FormLabel>
                                    <p className="text-sm font-medium">{orderNumber}</p>
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
                                        The order number will be generated automatically when you create this shipment.
                                    </FieldDescription>
                                </>
                            ) : null}
                            <form.Field
                                name="customerCodeId"
                                validators={{
                                    onChange: zodOnChange(customerCodeIdSchema),
                                }}
                            >
                                {(field) => (
                                    <div className="my-3">
                                        <CustomerCombobox
                                            id={field.name}
                                            value={field.state.value}
                                            onValueChange={(nextValue) => {
                                                field.handleChange(nextValue)
                                                setSelectedCustomerCode(nextValue)
                                                form.setFieldValue("customerShipperId", "-")
                                            }}
                                            error={fieldError(field.state.meta.errors)}
                                            required
                                            enabled={open}
                                            placeholder="Search customer code or name..."
                                        />
                                    </div>
                                )}
                            </form.Field>
                            <form.Field
                                name="status"
                            >
                                {(field) => (
                                    <div className="my-3">
                                        <FormLabel htmlFor={field.name} className="my-2" required>
                                            Shipment Status
                                        </FormLabel>
                                        <Select
                                            value={field.state.value}
                                            onValueChange={(value) =>
                                                field.handleChange(
                                                    value as "ONGOING" | "COMPLETED"
                                                )
                                            }
                                        >
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Select shipment status" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="ONGOING">Ongoing</SelectItem>
                                                <SelectItem value="COMPLETED">Completed</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FieldDescription className="mt-2">
                                            Tracks shipment lifecycle separately from whether the
                                            record is active in the system.
                                        </FieldDescription>
                                    </div>
                                )}
                            </form.Field>
                            <form.Field
                                name="customerShipperId"
                                validators={{
                                    onChange: zodOnChange(customerShipperIdSchema),
                                }}
                            >
                                {(field) => (
                                    <div className="my-3">
                                        <FormLabel htmlFor={field.name} className="my-2" required>Customer Shipper</FormLabel>
                                        <Select
                                            value={field.state.value}
                                            onValueChange={field.handleChange}
                                        >
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Select customer code to enable shipper selection" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {shippersLoading ? (
                                                    <SelectItem value="_loading" disabled>Loading...</SelectItem>
                                                ) : shippersError ? (
                                                    <SelectItem value="_error" disabled>Unable to load shippers</SelectItem>
                                                ) : shippers?.length === 0 ? (
                                                    <SelectItem value="-">No shippers found for this customer code</SelectItem>
                                                ) : (
                                                    shippers?.map((shipper: Shipper) => (
                                                        <SelectItem key={shipper.id} value={shipper?.id ?? ""}>{shipper?.name}</SelectItem>
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
                            {mode === "edit" ? <form.Field
                                name="isActive"
                            >
                                {(field) => (
                                    <div className="my-3">
                                        <ActiveStatusField
                                            id={field.name}
                                            value={field.state.value === true}
                                            onChange={(checked) => field.handleChange(checked)}
                                            description="Inactive shipments stay in history but are hidden from active workflows."
                                        />
                                    </div>
                                )}
                            </form.Field> : null}
                        </div>
                        <DialogFooter>
                            <Button type="submit" disabled={createShipment.isPending || updateShipment.isPending}>{mode === "edit" ? (updateShipment.isPending ? "Updating..." : "Save Changes") : (createShipment.isPending ? "Creating..." : "Create")}</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    )
}
