"use client"

import { useState } from "react"
import { useForm } from "@tanstack/react-form"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog"
import { Button } from "../ui/button"
import { Pencil } from "lucide-react"
import { IconPlus } from "@tabler/icons-react"
import { Label } from "../ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { usePorts } from "@/hooks/use-ports"
import { Port } from "@/app/dashboard/ports/columns"
import { Input } from "../ui/input"
import { useGetLocationsByCustomerId } from "@/hooks/use-customers"

export type Location = {
    id: string
    addressLine1: string
    city: string
    country: string
}

export default function ShipmentOperationalForm({
    id,
    shipmentId,
    mode,
    shipmentType,
    portDepartureId,
    portDestinationId,
    loadingLocationId,
    unloadingLocationId,
    blNumber,
    bookingNumber,
    customerCodeId
}: {
    id: string | undefined,
    shipmentId: string | undefined,
    mode: "edit" | "create",
    shipmentType: string | undefined,
    portDepartureId: string | undefined,
    portDestinationId: string | undefined,
    loadingLocationId: string | undefined,
    unloadingLocationId: string | undefined,
    blNumber: string | undefined,
    bookingNumber: string | undefined,
    customerCodeId?: string | undefined,
}) {
    const [open, setOpen] = useState(false)

    const { data: ports, isLoading: portsLoading, error: portsError } = usePorts()
    const { data: locations, isLoading: locationsLoading, error: locationsError } = useGetLocationsByCustomerId(customerCodeId ?? "")

    console.log(locations)

    const form = useForm({
        defaultValues: {
            id: id ?? "",
            shipmentId: shipmentId ?? "",
            shipmentType: shipmentType ?? "",
            portDepartureId: portDepartureId ?? "",
            portDestinationId: portDestinationId ?? "",
            loadingLocationId: loadingLocationId ?? "",
            unloadingLocationId: unloadingLocationId ?? "",
            blNumber: blNumber ?? "",
            bookingNumber: bookingNumber ?? "",
        },
        onSubmit: async ({ value }) => {
            console.log(value)
        }
    })

    return (
        <div>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                    { mode === "edit" ? <Button variant="outline" size="icon"><Pencil /></Button> : <Button><IconPlus /> Add Shipment Operational</Button>}
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{ mode === "edit" ? "Edit Shipment Operational" : "Add Shipment Operational"}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        form.handleSubmit()
                    }}>
                        <div>
                            <form.Field name="shipmentType" validators={{ onChange: ({ value }) => !value ? "Shipment Type is required" : undefined }}>
                                {
                                    ( field ) => (
                                        <div className="my-3">
                                            <Label htmlFor={field.name} className="my-2">Shipment Type</Label>
                                            <Select value={field.state.value} onValueChange={(value) => field.handleChange(value)}>
                                                <SelectTrigger className="w-full">
                                                    <SelectValue placeholder="Select a shipment type" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="IMPORT">Import</SelectItem>
                                                    <SelectItem value="EXPORT">Export</SelectItem>
                                                    <SelectItem value="DOMESTIC">Domestic</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            { field.state.meta.errors ? (
                                                <em className="text-xs text-red-500">{field.state.meta.errors}</em>
                                            ) : null }
                                        </div>
                                    )
                                }
                            </form.Field>
                        </div>
                        <div>
                            <form.Field
                                name="portDepartureId"
                                validators={{ onChange: ({ value }) => !value ? "Port Departure is required" : undefined }}
                            >
                                {
                                    ( field ) => (
                                        <div className="my-3">
                                            <Label htmlFor={field.name} className="my-2">Port of Departure (From)</Label>
                                            <Select value={field.state.value} onValueChange={(value) => field.handleChange(value)}>
                                                <SelectTrigger className="w-full">
                                                    <SelectValue placeholder="Select a port departure" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {
                                                        ports?.map((port: Port) => (
                                                            <SelectItem key={port.id} value={port.id ?? ""}>{ port.portName }, { port.portCountry }</SelectItem>
                                                        )) ?? (
                                                            <SelectItem value="-">No ports found</SelectItem>
                                                        )
                                                    }
                                                </SelectContent>
                                            </Select>
                                            { field.state.meta.errors ? (
                                                <em className="text-xs text-red-500">{field.state.meta.errors}</em>
                                            ) : null }
                                        </div>
                                    )
                                }
                            </form.Field>
                        </div>
                        <div>
                            <form.Field
                                name="portDestinationId"
                                validators={{ onChange: ({ value }) => !value ? "Port Destination is required" : undefined }}
                            >
                                {
                                    ( field ) => (
                                        <div className="my-3">
                                            <Label htmlFor={field.name} className="my-2">Port of Destination (To)</Label>
                                            <Select value={field.state.value} onValueChange={(value) => field.handleChange(value)}>
                                                <SelectTrigger className="w-full">
                                                    <SelectValue placeholder="Select a port destination" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {
                                                        ports?.map((port: Port) => (
                                                            <SelectItem key={port.id} value={port.id ?? ""}>{ port.portName }, { port.portCountry }</SelectItem>
                                                        )) ?? (
                                                            <SelectItem value="-">No ports found</SelectItem>
                                                        )
                                                    }
                                                </SelectContent>
                                            </Select>
                                            { field.state.meta.errors ? (
                                                <em className="text-xs text-red-500">{field.state.meta.errors}</em>
                                            ) : null }
                                        </div>
                                    )
                                }
                            </form.Field>
                        </div>
                        <div>
                            <form.Field
                                name="loadingLocationId"
                                validators={{ onChange: ({ value }) => !value ? "Loading Location is required" : undefined }}
                            >
                                {
                                    ( field ) => (
                                        <div className="my-3">
                                            <Label htmlFor={field.name} className="my-2">Loading Location (Stuffing)</Label>
                                            <Select value={field.state.value} onValueChange={(value) => field.handleChange(value)}>
                                                <SelectTrigger className="w-full">
                                                    <SelectValue placeholder="Select a loading location" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {
                                                        locations?.map((location: Location) => (
                                                            <SelectItem key={location.id} value={location.id ?? ""}>{ location.addressLine1 }, { location.city }, { location.country }</SelectItem>
                                                        )) ?? (
                                                            <SelectItem value="-">No locations found</SelectItem>
                                                        )
                                                    }
                                                </SelectContent>
                                            </Select>
                                            { field.state.meta.errors ? (
                                                <em className="text-xs text-red-500">{field.state.meta.errors}</em>
                                            ) : null }
                                        </div>
                                    )
                                }
                            </form.Field>
                        </div>
                        <div>
                            <form.Field
                                name="unloadingLocationId"
                                validators={{ onChange: ({ value }) => !value ? "Unloading Location is required" : undefined }}
                            >
                                {
                                    ( field ) => (
                                        <div className="my-3">
                                            <Label htmlFor={field.name} className="my-2">Unloading Location (Unstuffing)</Label>
                                            <Select value={field.state.value} onValueChange={(value) => field.handleChange(value)}>
                                                <SelectTrigger className="w-full">
                                                    <SelectValue placeholder="Select a unloading location" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {
                                                        locations?.map((location: Location) => (
                                                            <SelectItem key={location.id} value={location.id ?? ""}>{ location.addressLine1 }, { location.city }, { location.country }</SelectItem>
                                                        )) ?? (
                                                            <SelectItem value="-">No locations found</SelectItem>
                                                        )
                                                    }
                                                </SelectContent>
                                            </Select>
                                            { field.state.meta.errors ? (
                                                <em className="text-xs text-red-500">{field.state.meta.errors}</em>
                                            ) : null }
                                        </div>
                                    )
                                }
                            </form.Field>
                        </div>
                        <div>
                            <form.Field
                                name="blNumber"
                                validators={{ onChange: ({ value }) => !value ? "BL Number is required" : undefined }}
                            >
                                {
                                    ( field ) => (
                                        <div className="my-3">
                                            <Label htmlFor={field.name} className="my-2">BL Number</Label>
                                            <Input value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} />
                                        </div>
                                    )
                                }
                            </form.Field>
                        </div>
                        <div>
                            <form.Field
                                name="bookingNumber"
                                validators={{ onChange: ({ value }) => !value ? "Booking Number is required" : undefined }}
                            >
                                {
                                    ( field ) => (
                                        <div className="my-3">
                                            <Label htmlFor={field.name} className="my-2">Booking Number</Label>
                                            <Input value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} />
                                        </div>
                                    )
                                }
                            </form.Field>
                        </div>
                        <DialogFooter>
                            <Button type="submit">{ mode === "edit" ? "Save Changes" : "Create"}</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    )
}