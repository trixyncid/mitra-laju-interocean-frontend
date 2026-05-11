"use client"

import { Customer } from "@/app/dashboard/customers/columns";
import { Shipment } from "@/app/dashboard/shipments/columns";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { useCustomers, useGetShippersByCustomerCodeId } from "@/hooks/use-customers";
import { useCreateShipment, useShipments, useUpdateShipment } from "@/hooks/use-shipments";
import { Switch } from "@/components/ui/switch";
import { IconPlus } from "@tabler/icons-react";
import { useForm } from "@tanstack/react-form";
import { Pencil } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export type Shipper = {
    id: string,
    name: string,
}

const MONTH_IN_ROMANS = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"]
const MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]

const parseOrderNumberDate = (orderNumber: string | undefined): { monthIndex: number, year: number } | null => {
    if (!orderNumber) return null
    const parts = orderNumber.split("/")
    if (parts.length !== 3) return null
    const monthIndex = MONTH_IN_ROMANS.indexOf(parts[1]) + 1
    const year = parseInt(parts[2], 10)
    if (monthIndex === 0 || isNaN(year)) return null
    return { monthIndex, year }
}

const computeOrderNumber = (allShipments: Shipment[], monthIndex: number, year: number, excludeOrderNumber?: string): string => {
    const romanMonth = MONTH_IN_ROMANS[monthIndex - 1]
    const count = (allShipments ?? []).filter((shipment: Shipment) => {
        if (excludeOrderNumber && shipment.orderNumber === excludeOrderNumber) return false
        const parts = shipment.orderNumber?.split("/")
        if (!parts || parts.length !== 3) return false
        return parts[1] === romanMonth && parts[2] === year.toString()
    }).length
    return `${count + 1}/${romanMonth}/${year}`
}

const currentYear = new Date().getFullYear()
const YEAR_OPTIONS = Array.from({ length: 4 }, (_, i) => currentYear - 1 + i)

export default function ShipmentForm({
    id,
    mode,
    orderNumber,
    customerCodeId,
    customerShipperId,
    isActive
}: {
    id: string | undefined,
    mode: "edit" | "create",
    orderNumber: string | undefined,
    customerCodeId: string | undefined,
    customerShipperId: string | undefined
    isActive: boolean | undefined
}) {
    const createShipment = useCreateShipment()
    const updateShipment = useUpdateShipment()
    const { data: allShipments } = useShipments()

    const parsedDate = parseOrderNumberDate(orderNumber)
    const defaultMonth = parsedDate?.monthIndex ?? (new Date().getMonth() + 1)
    const defaultYear = parsedDate?.year ?? new Date().getFullYear()

    const [selectedMonth, setSelectedMonth] = useState<number>(defaultMonth)
    const [selectedYear, setSelectedYear] = useState<number>(defaultYear)

    const form = useForm({
        defaultValues: {
            id: id ?? "",
            orderNumber: orderNumber ?? "",
            customerCodeId: customerCodeId ?? "",
            customerShipperId: customerShipperId ?? "-",
            isActive: isActive ?? true,
        },
        onSubmit: async ({ value }) => {
            if (mode === "create") {
                createShipment.mutate({
                    orderNumber: value.orderNumber,
                    customerCodeId: value.customerCodeId,
                    customerShipperId: value.customerShipperId,
                    isActive: value.isActive,
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

    const [open, setOpen] = useState(false)
    const [selectedCustomerCode, setSelectedCustomerCode] = useState<string | undefined>(customerCodeId ?? "")

    useEffect(() => {
        if (!allShipments) return

        if (mode === "edit" && selectedMonth === defaultMonth && selectedYear === defaultYear && orderNumber) {
            form.setFieldValue("orderNumber", orderNumber)
            return
        }

        // In edit mode, exclude the current shipment from the count so it doesn't
        // inflate the sequence when the same data is still in allShipments.
        const excludeOrder = mode === "edit" ? orderNumber : undefined
        const computed = computeOrderNumber(allShipments, selectedMonth, selectedYear, excludeOrder)
        form.setFieldValue("orderNumber", computed)
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedMonth, selectedYear, allShipments, mode, orderNumber, defaultMonth, defaultYear])

    const { data: customers, isLoading: customersLoading, error: customersError } = useCustomers()
    const { data: shippers, isLoading: shippersLoading, error: shippersError } = useGetShippersByCustomerCodeId(selectedCustomerCode ?? "")

    return (
        <div>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                    {mode === "edit" ? <Button variant="outline" size="icon"><Pencil /></Button> : <Button><IconPlus /> Add Shipment</Button>}
                </DialogTrigger>
                <DialogContent>
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
                                name="orderNumber"
                                validators={{
                                    onChange: ({ value }) =>
                                        !value ? "Order Number is required" : undefined,
                                }}
                            >
                                {(field) => (
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
                                {(field) => (
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
                                                                    <SelectItem key={customer.id} value={customer?.id ?? ""}>{customer?.customerCode} ({customer?.customerName})</SelectItem>
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
                                {(field) => (
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
                            {mode === "edit" ? <form.Field
                                name="isActive"
                            >
                                {(field) => (
                                    <div className="my-3">
                                        <Switch id={field.name} checked={field.state.value === true} onCheckedChange={(checked) => field.handleChange(checked)} />
                                        <Label htmlFor={field.name} className="my-2">Is Active</Label>
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
