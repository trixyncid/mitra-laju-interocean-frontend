"use client"

import { useState } from "react"
import { useForm } from "@tanstack/react-form"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog"
import { Button } from "../ui/button"
import { IconPlus } from "@tabler/icons-react"
import { Label } from "../ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { usePorts } from "@/hooks/use-ports"
import { Port } from "@/app/dashboard/ports/columns"
import { Input } from "../ui/input"
import { useGetLocationsByCustomerId } from "@/hooks/use-customers"
import { useCreateShipmentOperational, useUpdateShipmentOperational } from "@/hooks/use-shipments"
import { Vessel } from "@/app/dashboard/vessels/columns"
import { useVessels } from "@/hooks/use-vessels"
import { ISOFormat } from "@/lib/utils"
import { toast } from "sonner"
import {
    Combobox,
    ComboboxContent,
    ComboboxEmpty,
    ComboboxInput,
    ComboboxItem,
    ComboboxList,
    ComboboxTrigger,
    ComboboxValue,
  } from "@/components/ui/combobox"

export type Location = {
    id: string
    addressLine1: string
    city: string
    country: string
    customerShipperId: string
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
    vesselId,
    eta,
    blNumber,
    bookingNumber,
    customerCodeId,
    customerShipperId,
    customerChargeAmount,
    status
}: {
    id: string | undefined,
    eta: string | undefined
    shipmentId: string | undefined,
    mode: "edit" | "create",
    shipmentType: string | undefined,
    portDepartureId: string | undefined,
    portDestinationId: string | undefined,
    loadingLocationId: string | undefined,
    unloadingLocationId: string | undefined,
    vesselId: string | undefined,
    blNumber: string | undefined,
    bookingNumber: string | undefined,
    customerCodeId: string,
    customerShipperId: string | undefined,
    customerChargeAmount: number | undefined
    status: string | undefined
}) {
    const [open, setOpen] = useState(false)
    
    const { data: ports, isLoading: portsLoading, error: portsError } = usePorts()
    const { data: locations, isLoading: locationsLoading, error: locationsError } = useGetLocationsByCustomerId(customerCodeId ?? "")
    const { data: vessels, isLoading: vesselsLoading, error: vesselsError } = useVessels()

    const createShipmentOperational = useCreateShipmentOperational(shipmentId ?? "")
    const updateShipmentOperational = useUpdateShipmentOperational(shipmentId ?? "")

    type ComboItem = { value: string; label: string }
    const portItems: ComboItem[] = ports?.map((p: Port) => ({ value: p.id ?? "", label: `${p.portName}, ${p.portCountry}` })) ?? []
    const filteredLocations = customerShipperId
        ? locations?.filter((l: Location) => l.customerShipperId === customerShipperId).map((l: Location) => ({ value: l.id, label: `${l.addressLine1}, ${l.city}, ${l.country}` })) ?? []
        : locations ?? []
    const locationItems: ComboItem[] = locations?.map((l: Location) => ({ value: l.id, label: `${l.addressLine1}, ${l.city}, ${l.country}` })) ?? []

    const form = useForm({
        defaultValues: {
            id: id ?? "",
            shipmentId: shipmentId ?? "",
            shipmentType: shipmentType ?? "",
            eta: eta ?? "",
            portDepartureId: portDepartureId ?? "",
            portDestinationId: portDestinationId ?? "",
            loadingLocationId: loadingLocationId ?? "",
            unloadingLocationId: unloadingLocationId ?? "",
            vesselId: vesselId ?? "",
            blNumber: blNumber ?? "",
            bookingNumber: bookingNumber ?? "",
        },
        onSubmit: async ({ value }) => {
            const payload = {
                ...value,
                eta: value.eta === "" ? null : value.eta,
            }

            if (mode === "create") {
                createShipmentOperational.mutate({
                    shipmentId: shipmentId ?? "",
                    shipmentOperational: payload,
                }, {
                    onSuccess: () => {
                        setOpen(false)
                        form.reset()
                    }
                })
            } else {
                updateShipmentOperational.mutate({
                    shipmentId: shipmentId ?? "",
                    id: id ?? "",
                    shipmentOperational: payload,
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
        <div className="flex items-center gap-x-2">
            <Dialog open={open} onOpenChange={setOpen} modal={false}>
                <DialogTrigger asChild>
                    { mode === "edit" ? <Button variant="outline">Edit Shipment Operational</Button> : <Button><IconPlus /> Add Shipment Operational</Button>}
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
                                                <em className="text-xs text-[var(--mli-on-error-container)]">{field.state.meta.errors}</em>
                                            ) : null }
                                        </div>
                                    )
                                }
                            </form.Field>
                        </div>
                        <div>
                            <form.Field name="vesselId" validators={{ onChange: ({ value }) => !value ? "Vessel is required" : undefined }}>
                                {
                                    ( field ) => (
                                        <div className="my-3">
                                            <Label htmlFor={field.name} className="my-2">Vessel</Label>
                                            <Select value={field.state.value} onValueChange={(value) => field.handleChange(value)}>
                                                <SelectTrigger className="w-full">
                                                    <SelectValue placeholder="Select a vessel" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    { vessels?.map((vessel: Vessel) => (
                                                        <SelectItem key={vessel.id} value={vessel.id ?? ""}>{ vessel.vesselName } / { vessel.voyageNumber }</SelectItem>
                                                    )) ?? (
                                                        <SelectItem value="-">No vessels found</SelectItem>
                                                    )}
                                                </SelectContent>
                                            </Select>
                                            { field.state.meta.errors ? (
                                                <em className="text-xs text-[var(--mli-on-error-container)]">{field.state.meta.errors}</em>
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
                                            <Combobox
                                                items={portItems}
                                                value={portItems.find(item => item.value === field.state.value) ?? null}
                                                onValueChange={(item) => field.handleChange(item?.value ?? "")}
                                                isItemEqualToValue={(a, b) => a.value === b.value}
                                            >
                                                <ComboboxTrigger render={<Button type="button" variant="outline" className="w-full justify-between font-normal"><ComboboxValue placeholder="Select port of departure..." /></Button>} />
                                                <ComboboxContent>
                                                    <ComboboxInput showTrigger={false} placeholder="Search..." />
                                                    <ComboboxEmpty>No ports found.</ComboboxEmpty>
                                                    <ComboboxList>
                                                        {(item) => (
                                                            <ComboboxItem key={item.value} value={item}>
                                                                {item.label}
                                                            </ComboboxItem>
                                                        )}
                                                    </ComboboxList>
                                                </ComboboxContent>
                                            </Combobox>
                                            { field.state.meta.errors ? (
                                                <em className="text-xs text-[var(--mli-on-error-container)]">{field.state.meta.errors}</em>
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
                                            <Combobox
                                                items={portItems}
                                                value={portItems.find(item => item.value === field.state.value) ?? null}
                                                onValueChange={(item) => field.handleChange(item?.value ?? "")}
                                                isItemEqualToValue={(a, b) => a.value === b.value}
                                            >
                                                <ComboboxTrigger render={<Button type="button" variant="outline" className="w-full justify-between font-normal"><ComboboxValue placeholder="Select port of destination..." /></Button>} />
                                                <ComboboxContent>
                                                    <ComboboxInput showTrigger={false} placeholder="Search..." />
                                                    <ComboboxEmpty>No ports found.</ComboboxEmpty>
                                                    <ComboboxList>
                                                        {(item) => (
                                                            <ComboboxItem key={item.value} value={item}>
                                                                {item.label}
                                                            </ComboboxItem>
                                                        )}
                                                    </ComboboxList>
                                                </ComboboxContent>
                                            </Combobox>
                                            { field.state.meta.errors ? (
                                                <em className="text-xs text-[var(--mli-on-error-container)]">{field.state.meta.errors}</em>
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
                                            <Combobox
                                                items={filteredLocations}
                                                value={filteredLocations.find((item: ComboItem) => item.value === field.state.value) ?? null}
                                                onValueChange={(item) => field.handleChange(item?.value ?? "")}
                                                isItemEqualToValue={(a, b) => a.value === b.value}
                                            >
                                                <ComboboxTrigger render={<Button type="button" variant="outline" className="w-full justify-between font-normal"><ComboboxValue placeholder="Select stuffing location..." /></Button>} />
                                                <ComboboxContent>
                                                    <ComboboxInput showTrigger={false} placeholder="Search..." />
                                                    <ComboboxEmpty>No locations found.</ComboboxEmpty>
                                                    <ComboboxList>
                                                        {(item) => (
                                                            <ComboboxItem key={item.value} value={item.value}>
                                                                {item.label}
                                                            </ComboboxItem>
                                                        )}
                                                    </ComboboxList>
                                                </ComboboxContent>
                                            </Combobox>
                                            { field.state.meta.errors ? (
                                                <em className="text-xs text-[var(--mli-on-error-container)]">{field.state.meta.errors}</em>
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
                                            <Combobox
                                                items={locationItems}
                                                value={locationItems.find(item => item.value === field.state.value) ?? null}
                                                onValueChange={(item) => field.handleChange(item?.value ?? "")}
                                                isItemEqualToValue={(a, b) => a.value === b.value}
                                            >
                                                <ComboboxTrigger render={<Button type="button" variant="outline" className="w-full justify-between font-normal"><ComboboxValue placeholder="Select unstuffing location..." /></Button>} />
                                                <ComboboxContent>
                                                    <ComboboxInput showTrigger={false} placeholder="Search..." />
                                                    <ComboboxEmpty>No locations found.</ComboboxEmpty>
                                                    <ComboboxList>
                                                        {(item) => (
                                                            <ComboboxItem key={item.value} value={item}>
                                                                {item.label}
                                                            </ComboboxItem>
                                                        )}
                                                    </ComboboxList>
                                                </ComboboxContent>
                                            </Combobox>
                                            { field.state.meta.errors ? (
                                                <em className="text-xs text-[var(--mli-on-error-container)]">{field.state.meta.errors}</em>
                                            ) : null }
                                        </div>
                                    )
                                }
                            </form.Field>
                        </div>
                        <div>
                            <form.Field
                                name="eta"
                            >
                                {
                                    ( field ) => (
                                        <div className="my-3">
                                            <Label htmlFor={field.name} className="my-2">ETA</Label>
                                            <Input value={field.state.value ? field.state.value.split('T')[0] : ''} onChange={(e) => field.handleChange(e.target.value ? ISOFormat(e.target.value) : "")} type="date" />
                                        </div>
                                    )
                                }
                            </form.Field>
                        </div>
                        <div>
                            <form.Field
                                name="blNumber"
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
                            <Button type="submit" disabled={ mode === "create" ? createShipmentOperational.isPending : false || mode === "edit" ? updateShipmentOperational.isPending : false}>{ mode === "edit" ? (updateShipmentOperational.isPending ? "Updating..." : "Save Changes") : (createShipmentOperational.isPending ? "Creating..." : "Create")}</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {
                mode === "edit" && customerChargeAmount !== 0 && customerChargeAmount !== null
                ?
                <Button type="button" size="sm" onClick={() => {
                    updateShipmentOperational.mutate({
                        shipmentId: shipmentId ?? "",
                        id: id ?? "",
                        shipmentOperational: { status: status === "paid" ? "unpaid" : "paid" },
                    }, {
                        onSuccess: () => {
                            toast.success("Shipment operational payment status updated successfully")
                        }
                    })
                }} disabled={updateShipmentOperational.isPending}>{ updateShipmentOperational.isPending ? "Updating..." : status === "paid" ? "Mark as Unpaid" : "Mark as Paid"}</Button>
                : null}
        </div>
        
    )
}