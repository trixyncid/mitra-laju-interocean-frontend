"use client"

import { useMemo, useState } from "react"
import { useForm } from "@tanstack/react-form"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog"
import { Button } from "../ui/button"
import { IconPlus } from "@tabler/icons-react"
import { Label } from "../ui/label"
import { TextField } from "../ui/text-field"
import { DatePicker } from "@/components/ui/date-picker"
import { SearchableCombobox, type SearchableComboboxOption } from "@/components/searchable-combobox"
import { usePorts } from "@/hooks/use-ports"
import { Port } from "@/app/dashboard/ports/columns"
import { fieldError } from "@/lib/form-field"
import {
  loadingLocationIdSchema,
  portDepartureIdSchema,
  portDestinationIdSchema,
  shipmentTypeFieldSchema,
  unloadingLocationIdSchema,
  vesselIdSchema,
} from "@/lib/schemas/shipment-operational"
import { zodOnChange } from "@/lib/zod-form"
import { useGetLocationsByCustomerId } from "@/hooks/use-customers"
import type { CustomerLocationOption } from "@/services/customers.service"
import { useCreateShipmentOperational, useUpdateShipmentOperational } from "@/hooks/use-shipments"
import { Vessel } from "@/app/dashboard/vessels/columns"
import { useVessels } from "@/hooks/use-vessels"
import { toast } from "sonner"
import { usePermissions } from "@/hooks/use-permissions"
import type { ShipmentType } from "@/lib/permissions"

export type Location = CustomerLocationOption

const SHIPMENT_TYPE_OPTIONS: { value: ShipmentType; label: string }[] = [
    { value: "IMPORT", label: "Import" },
    { value: "EXPORT", label: "Export" },
    { value: "DOMESTIC", label: "Domestic" },
]

function toLocationOption(location: CustomerLocationOption): SearchableComboboxOption {
    return {
        value: location.id,
        label: `${location.addressLine1}, ${location.city}, ${location.country}`,
    }
}

function activeLocations(locations: CustomerLocationOption[] | undefined) {
    return (locations ?? []).filter((location) => location.isActive !== false)
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
    const { canWrite, canWriteShipmentType, allowedShipmentTypes } = usePermissions()

    const { data: portsData, isLoading: portsLoading } = usePorts({ page: 1, pageSize: 100 })
    const {
        data: locations,
        isLoading: locationsLoading,
        isError: locationsError,
    } = useGetLocationsByCustomerId(customerCodeId ?? "", {
        enabled: open && Boolean(customerCodeId),
    })
    const { data: vesselsData, isLoading: vesselsLoading } = useVessels({ page: 1, pageSize: 100 })

    const ports = portsData?.items
    const vessels = vesselsData?.items

    const createShipmentOperational = useCreateShipmentOperational(shipmentId ?? "")
    const updateShipmentOperational = useUpdateShipmentOperational(shipmentId ?? "")

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

    const shipmentTypeOptions = useMemo(
        () =>
            allowedShipmentTypes === "all"
                ? SHIPMENT_TYPE_OPTIONS
                : SHIPMENT_TYPE_OPTIONS.filter((option) =>
                      allowedShipmentTypes.includes(option.value)
                  ),
        [allowedShipmentTypes]
    )

    const shipmentTypeItems = useMemo<SearchableComboboxOption[]>(
        () => shipmentTypeOptions.map((option) => ({
            value: option.value,
            label: option.label,
        })),
        [shipmentTypeOptions]
    )

    const portItems = useMemo<SearchableComboboxOption[]>(
        () =>
            ports?.map((port: Port) => ({
                value: port.id ?? "",
                label: `${port.portName}, ${port.portCountry}`,
            })) ?? [],
        [ports]
    )

    const vesselItems = useMemo<SearchableComboboxOption[]>(
        () =>
            vessels?.map((vessel: Vessel) => ({
                value: vessel.id ?? "",
                label: `${vessel.vesselName} / ${vessel.voyageNumber}`,
            })) ?? [],
        [vessels]
    )

    const activeCustomerLocations = useMemo(
        () => activeLocations(locations),
        [locations]
    )

    const loadingLocationItems = useMemo<SearchableComboboxOption[]>(() => {
        const scopedLocations = customerShipperId
            ? activeCustomerLocations.filter(
                  (location) => location.customerShipperId === customerShipperId
              )
            : activeCustomerLocations

        return scopedLocations.map(toLocationOption)
    }, [activeCustomerLocations, customerShipperId])

    const unloadingLocationItems = useMemo<SearchableComboboxOption[]>(
        () => activeCustomerLocations.map(toLocationOption),
        [activeCustomerLocations]
    )

    const canEdit =
        mode === "create" ? canWrite("shipments") : canWriteShipmentType(shipmentType)

    if (!canEdit) return null

    const locationsEmptyMessage = locationsError
        ? "Unable to load customer locations."
        : customerShipperId
          ? "No stuffing locations found for this customer shipper."
          : "No customer locations found."

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
                            <form.Field name="shipmentType" validators={{ onChange: zodOnChange(shipmentTypeFieldSchema) }}>
                                {(field) => (
                                    <div className="my-3">
                                        <SearchableCombobox
                                            id={field.name}
                                            label="Shipment Type"
                                            value={field.state.value}
                                            onValueChange={(nextValue) => field.handleChange(nextValue)}
                                            items={shipmentTypeItems}
                                            error={fieldError(field.state.meta.errors)}
                                            required
                                            placeholder="Search shipment type..."
                                        />
                                    </div>
                                )}
                            </form.Field>
                        </div>
                        <div>
                            <form.Field name="vesselId" validators={{ onChange: zodOnChange(vesselIdSchema) }}>
                                {(field) => (
                                    <div className="my-3">
                                        <SearchableCombobox
                                            id={field.name}
                                            label="Vessel"
                                            value={field.state.value}
                                            onValueChange={(nextValue) => field.handleChange(nextValue)}
                                            items={vesselItems}
                                            error={fieldError(field.state.meta.errors)}
                                            required
                                            isLoading={vesselsLoading}
                                            placeholder="Search vessel..."
                                            emptyMessage="No vessels found."
                                        />
                                    </div>
                                )}
                            </form.Field>
                        </div>
                        <div>
                            <form.Field
                                name="portDepartureId"
                                validators={{ onChange: zodOnChange(portDepartureIdSchema) }}
                            >
                                {(field) => (
                                    <div className="my-3">
                                        <SearchableCombobox
                                            id={field.name}
                                            label="Port of Loading"
                                            value={field.state.value}
                                            onValueChange={(nextValue) => field.handleChange(nextValue)}
                                            items={portItems}
                                            error={fieldError(field.state.meta.errors)}
                                            required
                                            isLoading={portsLoading}
                                            placeholder="Search port of loading..."
                                            emptyMessage="No ports found."
                                        />
                                    </div>
                                )}
                            </form.Field>
                        </div>
                        <div>
                            <form.Field
                                name="portDestinationId"
                                validators={{ onChange: zodOnChange(portDestinationIdSchema) }}
                            >
                                {(field) => (
                                    <div className="my-3">
                                        <SearchableCombobox
                                            id={field.name}
                                            label="Port of Discharge"
                                            value={field.state.value}
                                            onValueChange={(nextValue) => field.handleChange(nextValue)}
                                            items={portItems}
                                            error={fieldError(field.state.meta.errors)}
                                            required
                                            isLoading={portsLoading}
                                            placeholder="Search port of discharge..."
                                            emptyMessage="No ports found."
                                        />
                                    </div>
                                )}
                            </form.Field>
                        </div>
                        <div>
                            <form.Field
                                name="loadingLocationId"
                                validators={{ onChange: zodOnChange(loadingLocationIdSchema) }}
                            >
                                {(field) => (
                                    <div className="my-3">
                                        <SearchableCombobox
                                            id={field.name}
                                            label="Loading Location (Stuffing)"
                                            value={field.state.value}
                                            onValueChange={(nextValue) => field.handleChange(nextValue)}
                                            items={loadingLocationItems}
                                            error={fieldError(field.state.meta.errors)}
                                            required
                                            isLoading={locationsLoading}
                                            disabled={!customerCodeId}
                                            placeholder={
                                                customerCodeId
                                                    ? "Search stuffing location..."
                                                    : "Customer is required to load locations"
                                            }
                                            emptyMessage={locationsEmptyMessage}
                                            description={
                                                !customerCodeId
                                                    ? "This shipment has no linked customer."
                                                    : undefined
                                            }
                                        />
                                    </div>
                                )}
                            </form.Field>
                        </div>
                        <div>
                            <form.Field
                                name="unloadingLocationId"
                                validators={{ onChange: zodOnChange(unloadingLocationIdSchema) }}
                            >
                                {(field) => (
                                    <div className="my-3">
                                        <SearchableCombobox
                                            id={field.name}
                                            label="Unloading Location (Unstuffing)"
                                            value={field.state.value}
                                            onValueChange={(nextValue) => field.handleChange(nextValue)}
                                            items={unloadingLocationItems}
                                            error={fieldError(field.state.meta.errors)}
                                            required
                                            isLoading={locationsLoading}
                                            disabled={!customerCodeId}
                                            placeholder={
                                                customerCodeId
                                                    ? "Search unstuffing location..."
                                                    : "Customer is required to load locations"
                                            }
                                            emptyMessage={
                                                locationsError
                                                    ? "Unable to load customer locations."
                                                    : "No customer locations found."
                                            }
                                        />
                                    </div>
                                )}
                            </form.Field>
                        </div>
                        <div>
                            <form.Field
                                name="eta"
                            >
                                {(field) => (
                                    <div className="my-3">
                                        <DatePicker
                                            label="ETA"
                                            id={field.name}
                                            value={field.state.value}
                                            onValueChange={(nextValue) => field.handleChange(nextValue)}
                                            error={fieldError(field.state.meta.errors)}
                                            placeholder="Pick ETA"
                                        />
                                    </div>
                                )}
                            </form.Field>
                        </div>
                        <div>
                            <form.Field
                                name="blNumber"
                            >
                                {(field) => (
                                    <div className="my-3">
                                        <TextField
                                            label="BL Number"
                                            id={field.name}
                                            name={field.name}
                                            value={field.state.value}
                                            onChange={(e) => field.handleChange(e.target.value)}
                                            error={fieldError(field.state.meta.errors)}
                                        />
                                    </div>
                                )}
                            </form.Field>
                        </div>
                        <div>
                            <form.Field
                                name="bookingNumber"
                            >
                                {(field) => (
                                    <div className="my-3">
                                        <TextField
                                            label="Booking Number"
                                            id={field.name}
                                            name={field.name}
                                            value={field.state.value}
                                            onChange={(e) => field.handleChange(e.target.value)}
                                            error={fieldError(field.state.meta.errors)}
                                        />
                                    </div>
                                )}
                            </form.Field>
                        </div>
                        <DialogFooter>
                            <Button
                                type="submit"
                                disabled={
                                    mode === "create"
                                        ? createShipmentOperational.isPending
                                        : updateShipmentOperational.isPending
                                }
                            >
                                {mode === "edit"
                                    ? updateShipmentOperational.isPending
                                        ? "Updating..."
                                        : "Save Changes"
                                    : createShipmentOperational.isPending
                                      ? "Creating..."
                                      : "Create"}
                            </Button>
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
