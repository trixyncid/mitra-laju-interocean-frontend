"use client"

import { Button } from "@/components/ui/button";
import { CustomerCombobox } from "@/components/customer-combobox";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { FormLabel } from "@/components/ui/form-label";
import { ActiveStatusField } from "@/components/forms/active-status-field";
import { ShipmentStatusField } from "@/components/forms/shipment-status-field";
import { fieldError } from "@/lib/form-field";
import {
  customerCodeIdSchema,
  customerShipperIdSchema,
} from "@/lib/schemas/shipment";
import { zodOnChange } from "@/lib/zod-form";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { useGetShippersByCustomerCodeId } from "@/hooks/use-customers";
import { useUpdateShipment } from "@/hooks/use-shipments";
import { type ShipmentStatus } from "@/lib/shipment-status";
import { useForm } from "@tanstack/react-form";
import { Pencil } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export type Shipper = {
    id: string,
    name: string,
}

export default function ShipmentForm({
    id,
    orderNumber,
    customerCodeId,
    customerShipperId,
    status,
    isActive
}: {
    id: string | undefined,
    orderNumber: string | undefined,
    customerCodeId: string | undefined,
    customerShipperId: string | undefined
    status: ShipmentStatus | undefined
    isActive: boolean | undefined
}) {
    const updateShipment = useUpdateShipment()

    const [open, setOpen] = useState(false)
    const [selectedCustomerCode, setSelectedCustomerCode] = useState<string | undefined>(customerCodeId ?? "")

    const form = useForm({
        defaultValues: {
            id: id ?? "",
            customerCodeId: customerCodeId ?? "",
            customerShipperId: customerShipperId ?? "-",
            status: status ?? "DRAFT",
            isActive: isActive ?? true,
        },
        onSubmit: async ({ value }) => {
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
    })

    const { data: shippers, isLoading: shippersLoading, error: shippersError } = useGetShippersByCustomerCodeId(selectedCustomerCode ?? "")

    return (
        <div>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                    <Button variant="outline" size="icon"><Pencil /></Button>
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
                        <DialogTitle>Edit Shipment</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={
                        (e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            form.handleSubmit()
                        }
                    }>
                        <div>
                            {orderNumber ? (
                                <div className="my-3">
                                    <FormLabel className="my-2">Order Number</FormLabel>
                                    <p className="text-sm font-medium">{orderNumber}</p>
                                </div>
                            ) : null}
                            <form.Field name="status">
                                {(field) => (
                                    <div className="my-3">
                                        <ShipmentStatusField
                                            id={field.name}
                                            value={field.state.value}
                                            onValueChange={(value) => field.handleChange(value)}
                                        />
                                    </div>
                                )}
                            </form.Field>
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
                            <form.Field
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
                            </form.Field>
                        </div>
                        <DialogFooter>
                            <Button type="submit" disabled={updateShipment.isPending}>{updateShipment.isPending ? "Updating..." : "Save Changes"}</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    )
}
