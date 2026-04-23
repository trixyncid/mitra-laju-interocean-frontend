"use client"

import { Customer } from "@/app/dashboard/customers/columns";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { useCustomers, useGetShippersByCustomerCodeId } from "@/hooks/use-customers";
import { useCreateShipment, useUpdateShipment } from "@/hooks/use-shipments";
import { IconPlus } from "@tabler/icons-react";
import { useForm } from "@tanstack/react-form";
import { Pencil } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export type Shipper = {
    id: string,
    name: string,
}

export default function ShipmentForm({
    id,
    mode,
    orderNumber,
    customerCodeId,
    customerShipperId,
}: {
    id: string | undefined,
    mode: "edit" | "create",
    orderNumber: string | undefined,
    customerCodeId: string | undefined,
    customerShipperId: string | undefined
}) {
    const createShipment = useCreateShipment()
    const updateShipment = useUpdateShipment()

    const form = useForm({
        defaultValues: {
            id: id ?? "",
            orderNumber: orderNumber ?? "",
            customerCodeId: customerCodeId ?? "",
            customerShipperId: customerShipperId ?? "-",
        },
        onSubmit: async ({ value }) => {
            if (mode === "create") {
                console.log(value)

                createShipment.mutate({
                    orderNumber: value.orderNumber,
                    customerCodeId: value.customerCodeId,
                    customerShipperId: value.customerShipperId,
                    isActive: true,
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
                        orderNumber: value.orderNumber,
                        customerCodeId: value.customerCodeId,
                        customerShipperId: value.customerShipperId,
                        isActive: true,
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

    const [ open, setOpen ] = useState(false)
    const [ selectedCustomerCode, setSelectedCustomerCode ] = useState<string | undefined>(customerCodeId ?? "")

    useEffect(() => {
        if (mode === "create" && orderNumber) {
            form.setFieldValue("orderNumber", orderNumber)
        }
    }, [orderNumber, form, mode])

    const { data: customers, isLoading: customersLoading, error: customersError } = useCustomers()
    const { data: shippers, isLoading: shippersLoading, error: shippersError } = useGetShippersByCustomerCodeId(selectedCustomerCode ?? "")
    
    return (
        <div>
            <Dialog open={open} onOpenChange={setOpen}>    
                <DialogTrigger asChild>
                    { mode === "edit" ? <Button variant="outline" size="icon"><Pencil /></Button> : <Button><IconPlus /> Add Shipment</Button>}
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{ mode === "edit" ? "Edit Shipment" : "Create New Shipment"}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={
                        (e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            form.handleSubmit()
                        }
                    }>
                        <div>
                            <form.Field
                                name="orderNumber"
                                validators={{
                                    onChange: ({ value }) =>
                                        !value ? "Order Number is required" : undefined,
                                }}
                            >
                                {( field ) => (
                                    <div className="my-3">
                                        <Label htmlFor={field.name} className="my-2">Order Number</Label>
                                        <Input id={field.name} name={field.name} value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} disabled={true} />
                                    </div>
                                )}
                            </form.Field>
                            <form.Field
                                name="customerCodeId"
                                validators={{
                                    onChange: ({ value }) =>
                                        !value ? "Customer Code is required" : undefined,
                                }}
                            >
                                {( field ) => (
                                    <div className="my-3">
                                        <Label htmlFor={field.name} className="my-2">Customer Code</Label>
                                        <Select
                                            value={field.state.value}
                                            onValueChange={(value) => {
                                                field.handleChange(value)
                                                setSelectedCustomerCode(value)
                                            }}
                                        >
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Select customer code" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {
                                                    customersLoading ?
                                                        <SelectItem value="value" disabled>Loading...</SelectItem>
                                                    :
                                                    customersError ?
                                                        toast.error(customersError.message)
                                                    :
                                                    customers?.length === 0 ?
                                                        <SelectItem value="value" disabled>No customers found</SelectItem>
                                                    :
                                                    customers?.map((customer: Customer) => (
                                                        <SelectItem key={customer.id} value={customer?.id ?? ""}>{customer?.customerCode} ({ customer?.customerName })</SelectItem>
                                                    ))
                                                }
                                            </SelectContent>
                                        </Select>
                                        {field.state.meta.errors ? (
                                            <em className="text-xs text-red-500">{field.state.meta.errors}</em>
                                        ) : null}
                                    </div>
                                )}
                            </form.Field>
                            <form.Field
                                name="customerShipperId"
                                validators={{
                                    onChange: ({ value }) =>
                                        value === "-" ? "Customer Shipper is required" : undefined,
                                }}
                            >
                                {( field ) => (
                                    <div className="my-3">
                                        <Label htmlFor={field.name} className="my-2">Customer Shipper</Label>
                                        <Select
                                            value={field.state.value}
                                            onValueChange={field.handleChange}
                                        >
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Select customer code to enable shipper selection" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {
                                                    shippersLoading ?
                                                        <SelectItem value="value" disabled>Loading...</SelectItem>
                                                    :
                                                    shippersError ?
                                                        toast.error(shippersError.message)
                                                    :
                                                    shippers?.length === 0 ?
                                                        <SelectItem value="-">No shippers found for this customer code</SelectItem>
                                                    :
                                                    shippers?.map((shipper: Shipper) => (
                                                        <SelectItem key={shipper.id} value={shipper?.id ?? ""}>{shipper?.name}</SelectItem>
                                                    ))
                                                }
                                            </SelectContent>
                                        </Select>
                                        {field.state.meta.errors ? (
                                            <em className="text-xs text-red-500">{field.state.meta.errors}</em>
                                        ) : null}
                                    </div>
                                )}
                            </form.Field>
                        </div>
                        <DialogFooter>
                            <Button type="submit" disabled={createShipment.isPending || updateShipment.isPending}>{ mode === "edit" ? (updateShipment.isPending ? "Updating..." : "Save Changes") : (createShipment.isPending ? "Creating..." : "Create")}</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>        
            </Dialog>
        </div>
    )
}