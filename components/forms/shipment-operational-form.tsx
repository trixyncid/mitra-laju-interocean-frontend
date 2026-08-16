"use client"

import { useMemo, useState } from "react"
import { useForm } from "@tanstack/react-form"
import { IconPencil, IconPlus } from "@tabler/icons-react"

import type { Customer } from "@/app/dashboard/customers/columns"
import type { Port } from "@/app/dashboard/ports/columns"
import type { Vessel } from "@/app/dashboard/vessels/columns"
import { CustomerCombobox } from "@/components/customer-combobox"
import { ActiveStatusField } from "@/components/forms/active-status-field"
import { QuickAddButton } from "@/components/forms/quick-add-button"
import { QuickAddCustomerDialog } from "@/components/forms/quick-add-customer-dialog"
import { QuickAddPortDialog } from "@/components/forms/quick-add-port-dialog"
import { QuickAddShipperDialog } from "@/components/forms/quick-add-shipper-dialog"
import { QuickAddVesselDialog } from "@/components/forms/quick-add-vessel-dialog"
import { ShipmentStatusField } from "@/components/forms/shipment-status-field"
import { Button } from "@/components/ui/button"
import { DatePicker } from "@/components/ui/date-picker"
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { FieldDescription } from "@/components/ui/field"
import { FormLabel } from "@/components/ui/form-label"
import {
    SearchableCombobox,
    type SearchableComboboxOption,
} from "@/components/searchable-combobox"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { TextField } from "@/components/ui/text-field"
import {
    useGetLocationsByCustomerId,
    useGetShippersByCustomerCodeId,
} from "@/hooks/use-customers"
import { usePermissions } from "@/hooks/use-permissions"
import { usePorts } from "@/hooks/use-ports"
import {
    useCreateShipmentOperational,
    useUpdateShipmentWithOperational,
} from "@/hooks/use-shipments"
import { useVessels } from "@/hooks/use-vessels"
import { fieldError } from "@/lib/form-field"
import {
    customerCodeIdSchema,
    customerShipperIdSchema,
} from "@/lib/schemas/shipment"
import {
    loadingLocationIdSchema,
    portDepartureIdSchema,
    portDestinationIdSchema,
    shipmentTypeFieldSchema,
    unloadingLocationIdSchema,
    vesselIdSchema,
} from "@/lib/schemas/shipment-operational"
import { type ShipmentStatus } from "@/lib/shipment-status"
import { SHIPMENT_TYPE_OPTIONS } from "@/lib/shipment-types"
import { zodOnChange } from "@/lib/zod-form"
import type { CustomerLocationOption } from "@/services/customers.service"

type Shipper = {
    id: string
    name: string
}

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
    orderNumber,
    status,
    isActive,
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
}: {
    id: string | undefined
    eta: string | undefined
    shipmentId: string | undefined
    mode: "edit" | "create"
    orderNumber?: string
    status?: ShipmentStatus
    isActive?: boolean
    shipmentType: string | undefined
    portDepartureId: string | undefined
    portDestinationId: string | undefined
    loadingLocationId: string | undefined
    unloadingLocationId: string | undefined
    vesselId: string | undefined
    blNumber: string | undefined
    bookingNumber: string | undefined
    customerCodeId: string
    customerShipperId: string | undefined
}) {
    const [open, setOpen] = useState(false)
    const { canWrite, canWriteShipmentType, allowedShipmentTypes, can } = usePermissions()
    const canCreateCustomer = can("CUSTOMER", "create")
    const canCreatePort = can("PORT", "create")
    const canCreateVessel = can("VESSEL", "create")

    const [selectedCustomerCode, setSelectedCustomerCode] = useState(customerCodeId)
    const [selectedShipperId, setSelectedShipperId] = useState(customerShipperId ?? "-")
    const [createdShipper, setCreatedShipper] = useState<Shipper | null>(null)
    const [createdPorts, setCreatedPorts] = useState<SearchableComboboxOption[]>([])
    const [createdVessels, setCreatedVessels] = useState<SearchableComboboxOption[]>([])
    const [customerDialogOpen, setCustomerDialogOpen] = useState(false)
    const [shipperSelectOpen, setShipperSelectOpen] = useState(false)
    const [shipperDialogOpen, setShipperDialogOpen] = useState(false)
    const [vesselDialogOpen, setVesselDialogOpen] = useState(false)
    const [portDialogTarget, setPortDialogTarget] = useState<
        "departure" | "destination" | null
    >(null)

    const { data: portsData, isLoading: portsLoading } = usePorts({
        page: 1,
        pageSize: 100,
    })
    const {
        data: locations,
        isLoading: locationsLoading,
        isError: locationsError,
    } = useGetLocationsByCustomerId(selectedCustomerCode, {
        enabled: open && Boolean(selectedCustomerCode),
    })
    const { data: vesselsData, isLoading: vesselsLoading } = useVessels({
        page: 1,
        pageSize: 100,
    })
    const { data: shippers, isLoading: shippersLoading, error: shippersError } =
        useGetShippersByCustomerCodeId(selectedCustomerCode)

    const createShipmentOperational = useCreateShipmentOperational(shipmentId ?? "")
    const updateShipment = useUpdateShipmentWithOperational(shipmentId ?? "")

    const form = useForm({
        defaultValues: {
            id: id ?? "",
            shipmentId: shipmentId ?? "",
            customerCodeId: customerCodeId,
            customerShipperId: customerShipperId ?? "-",
            status: status ?? "DRAFT",
            isActive: isActive ?? true,
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
            const normalizeLocationId = (locationId: string) => {
                if (locationId !== "") return locationId
                return mode === "create" ? undefined : null
            }

            const operational = {
                shipmentId: value.shipmentId,
                shipmentType: value.shipmentType,
                eta: value.eta === "" ? null : value.eta,
                portDepartureId: value.portDepartureId,
                portDestinationId: value.portDestinationId,
                loadingLocationId: normalizeLocationId(value.loadingLocationId),
                unloadingLocationId: normalizeLocationId(value.unloadingLocationId),
                vesselId: value.vesselId,
                blNumber: value.blNumber,
                bookingNumber: value.bookingNumber,
            }

            if (mode === "create") {
                createShipmentOperational.mutate(
                    {
                        shipmentId: shipmentId ?? "",
                        shipmentOperational: operational,
                    },
                    {
                        onSuccess: () => {
                            setOpen(false)
                            form.reset()
                        },
                    }
                )
                return
            }

            updateShipment.mutate(
                {
                    shipment: {
                        customerCodeId: value.customerCodeId,
                        customerShipperId: value.customerShipperId,
                        status: value.status,
                        isActive: value.isActive,
                    },
                    operationalId: id ?? "",
                    operational,
                },
                {
                    onSuccess: () => {
                        setOpen(false)
                        form.reset()
                    },
                }
            )
        },
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
        () =>
            shipmentTypeOptions.map((option) => ({
                value: option.value,
                label: option.label,
            })),
        [shipmentTypeOptions]
    )

    const portItems = useMemo<SearchableComboboxOption[]>(() => {
        const items =
            portsData?.items?.map((port: Port) => ({
                value: port.id ?? "",
                label: `${port.portName}, ${port.portCountry}`,
            })) ?? []
        const extras = createdPorts.filter(
            (port) => !items.some((item) => item.value === port.value)
        )
        return [...extras, ...items]
    }, [createdPorts, portsData?.items])

    const vesselItems = useMemo<SearchableComboboxOption[]>(() => {
        const items =
            vesselsData?.items?.map((vessel: Vessel) => ({
                value: vessel.id ?? "",
                label: `${vessel.vesselName} / ${vessel.voyageNumber}`,
            })) ?? []
        const extras = createdVessels.filter(
            (vessel) => !items.some((item) => item.value === vessel.value)
        )
        return [...extras, ...items]
    }, [createdVessels, vesselsData?.items])

    const shipperItems = useMemo<Shipper[]>(() => {
        const items = shippers ?? []
        if (createdShipper && !items.some((shipper) => shipper.id === createdShipper.id)) {
            return [createdShipper, ...items]
        }
        return items
    }, [createdShipper, shippers])

    const activeCustomerLocations = useMemo(
        () => activeLocations(locations),
        [locations]
    )

    const loadingLocationItems = useMemo<SearchableComboboxOption[]>(() => {
        const scopedLocations =
            selectedShipperId && selectedShipperId !== "-"
                ? activeCustomerLocations.filter(
                      (location) => location.customerShipperId === selectedShipperId
                  )
                : activeCustomerLocations

        return scopedLocations.map(toLocationOption)
    }, [activeCustomerLocations, selectedShipperId])

    const unloadingLocationItems = useMemo<SearchableComboboxOption[]>(
        () => activeCustomerLocations.map(toLocationOption),
        [activeCustomerLocations]
    )

    const canEdit =
        mode === "create" ? canWrite("shipments") : canWriteShipmentType(shipmentType)

    if (!canEdit) return null

    const locationsEmptyMessage = locationsError
        ? "Unable to load customer locations."
        : selectedShipperId && selectedShipperId !== "-"
          ? "No stuffing locations found for this customer shipper."
          : "No customer locations found."

    const isPending =
        mode === "create"
            ? createShipmentOperational.isPending
            : updateShipment.isPending

    function applyCreatedCustomer(customer: Customer) {
        if (!customer.id) return
        form.setFieldValue("customerCodeId", customer.id)
        setSelectedCustomerCode(customer.id)
        setSelectedShipperId("-")
        setCreatedShipper(null)
        form.setFieldValue("customerShipperId", "-")
        form.setFieldValue("loadingLocationId", "")
        form.setFieldValue("unloadingLocationId", "")
    }

    function applyCreatedShipper(shipper: Shipper) {
        setCreatedShipper(shipper)
        form.setFieldValue("customerShipperId", shipper.id)
        setSelectedShipperId(shipper.id)
        form.setFieldValue("loadingLocationId", "")
    }

    function applyCreatedVessel(vessel: Vessel) {
        if (!vessel.id) return
        setCreatedVessels((current) => [
            {
                value: vessel.id ?? "",
                label: `${vessel.vesselName} / ${vessel.voyageNumber}`,
            },
            ...current.filter((item) => item.value !== vessel.id),
        ])
        form.setFieldValue("vesselId", vessel.id)
    }

    function applyCreatedPort(port: Port) {
        if (!port.id) return
        setCreatedPorts((current) => [
            {
                value: port.id ?? "",
                label: `${port.portName}, ${port.portCountry}`,
            },
            ...current.filter((item) => item.value !== port.id),
        ])
        if (portDialogTarget === "departure") {
            form.setFieldValue("portDepartureId", port.id)
        }
        if (portDialogTarget === "destination") {
            form.setFieldValue("portDestinationId", port.id)
        }
    }

    return (
        <div className="flex items-center gap-x-2">
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                    {mode === "edit" ? (
                        <Button variant="outline">
                            <IconPencil className="size-4" />
                            Edit Shipment
                        </Button>
                    ) : (
                        <Button>
                            <IconPlus /> Add Shipment Operational
                        </Button>
                    )}
                </DialogTrigger>
                <DialogContent
                    className="flex max-h-[min(92dvh,920px)] flex-col gap-0 overflow-hidden p-0 sm:max-w-3xl"
                    onInteractOutside={(e) => {
                        const target = e.target as Element
                        if (target.closest('[data-slot="combobox-content"]')) {
                            e.preventDefault()
                        }
                    }}
                >
                    <DialogHeader className="shrink-0 border-b border-[rgba(214,227,255,0.4)] px-6 py-5 pr-12">
                        <DialogTitle>
                            {mode === "edit" ? "Edit Shipment" : "Add Shipment Operational"}
                        </DialogTitle>
                    </DialogHeader>
                    <form
                        className="flex min-h-0 flex-1 flex-col"
                        onSubmit={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            form.handleSubmit()
                        }}
                    >
                        <div className="min-h-0 flex-1 space-y-8 overflow-y-auto overscroll-contain px-6 py-5">
                            {mode === "edit" ? (
                                <section className="space-y-4">
                                    <div>
                                        <h2 className="text-headline-md font-semibold">
                                            Shipment details
                                        </h2>
                                        <p className="text-sm text-muted-foreground">
                                            Update the booking party and lifecycle. The
                                            order number stays the same.
                                        </p>
                                    </div>

                                    {orderNumber ? (
                                        <div>
                                            <FormLabel className="my-2">Order Number</FormLabel>
                                            <p className="text-sm font-medium">{orderNumber}</p>
                                        </div>
                                    ) : null}

                                    <form.Field name="status">
                                        {(field) => (
                                            <ShipmentStatusField
                                                id={field.name}
                                                value={field.state.value}
                                                onValueChange={(value) =>
                                                    field.handleChange(value)
                                                }
                                            />
                                        )}
                                    </form.Field>

                                    <form.Field
                                        name="customerCodeId"
                                        validators={{
                                            onChange: zodOnChange(customerCodeIdSchema),
                                        }}
                                    >
                                        {(field) => (
                                            <CustomerCombobox
                                                id={field.name}
                                                value={field.state.value}
                                                onValueChange={(nextValue) => {
                                                    field.handleChange(nextValue)
                                                    setSelectedCustomerCode(nextValue)
                                                    setSelectedShipperId("-")
                                                    setCreatedShipper(null)
                                                    form.setFieldValue("customerShipperId", "-")
                                                    form.setFieldValue("loadingLocationId", "")
                                                    form.setFieldValue("unloadingLocationId", "")
                                                }}
                                                error={fieldError(field.state.meta.errors)}
                                                required
                                                enabled={open}
                                                placeholder="Search customer code or name..."
                                                onQuickAdd={
                                                    canCreateCustomer
                                                        ? () => setCustomerDialogOpen(true)
                                                        : undefined
                                                }
                                            />
                                        )}
                                    </form.Field>

                                    <form.Field
                                        name="customerShipperId"
                                        validators={{
                                            onChange: zodOnChange(customerShipperIdSchema),
                                        }}
                                    >
                                        {(field) => (
                                            <div>
                                                <FormLabel
                                                    htmlFor={field.name}
                                                    className="my-2"
                                                    required
                                                >
                                                    Customer Shipper
                                                </FormLabel>
                                                <Select
                                                    open={shipperSelectOpen}
                                                    onOpenChange={setShipperSelectOpen}
                                                    value={field.state.value}
                                                    onValueChange={(nextValue) => {
                                                        field.handleChange(nextValue)
                                                        setSelectedShipperId(nextValue)
                                                        form.setFieldValue(
                                                            "loadingLocationId",
                                                            ""
                                                        )
                                                    }}
                                                >
                                                    <SelectTrigger
                                                        id={field.name}
                                                        className="w-full"
                                                    >
                                                        <SelectValue placeholder="Select customer code to enable shipper selection" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {shippersLoading ? (
                                                            <SelectItem
                                                                value="_loading"
                                                                disabled
                                                            >
                                                                Loading...
                                                            </SelectItem>
                                                        ) : shippersError ? (
                                                            <SelectItem
                                                                value="_error"
                                                                disabled
                                                            >
                                                                Unable to load shippers
                                                            </SelectItem>
                                                        ) : shipperItems.length === 0 ? (
                                                            <SelectItem value="-">
                                                                No shippers found for this
                                                                customer code
                                                            </SelectItem>
                                                        ) : (
                                                            shipperItems.map(
                                                                (shipper: Shipper) => (
                                                                    <SelectItem
                                                                        key={shipper.id}
                                                                        value={
                                                                            shipper.id ?? ""
                                                                        }
                                                                    >
                                                                        {shipper.name}
                                                                    </SelectItem>
                                                                )
                                                            )
                                                        )}
                                                        {canCreateCustomer ? (
                                                            <div
                                                                className="-mx-1 mt-1 border-t border-[rgba(214,227,255,0.4)]"
                                                                onMouseDown={(event) =>
                                                                    event.preventDefault()
                                                                }
                                                                onPointerDown={(event) =>
                                                                    event.preventDefault()
                                                                }
                                                            >
                                                                <QuickAddButton
                                                                    label="Add new shipper"
                                                                    disabled={
                                                                        !selectedCustomerCode
                                                                    }
                                                                    onClick={() => {
                                                                        setShipperSelectOpen(
                                                                            false
                                                                        )
                                                                        queueMicrotask(() =>
                                                                            setShipperDialogOpen(
                                                                                true
                                                                            )
                                                                        )
                                                                    }}
                                                                />
                                                            </div>
                                                        ) : null}
                                                    </SelectContent>
                                                </Select>
                                                {field.state.meta.errors.length ? (
                                                    <em className="text-xs text-[var(--mli-on-error-container)]">
                                                        {fieldError(field.state.meta.errors)}
                                                    </em>
                                                ) : !selectedCustomerCode ? (
                                                    <FieldDescription className="mt-2">
                                                        Select a customer first to add or
                                                        choose a shipper.
                                                    </FieldDescription>
                                                ) : null}
                                            </div>
                                        )}
                                    </form.Field>

                                    <form.Field name="isActive">
                                        {(field) => (
                                            <ActiveStatusField
                                                id={field.name}
                                                value={field.state.value === true}
                                                onChange={(checked) =>
                                                    field.handleChange(checked)
                                                }
                                                description="Inactive shipments stay in history but are hidden from active workflows."
                                            />
                                        )}
                                    </form.Field>
                                </section>
                            ) : null}

                            <section className="space-y-4">
                                {mode === "edit" ? (
                                    <div>
                                        <h2 className="text-headline-md font-semibold">
                                            Operational details
                                        </h2>
                                        <p className="text-sm text-muted-foreground">
                                            Update the route, vessel, and shipment type.
                                        </p>
                                    </div>
                                ) : null}

                                <div className="grid gap-4 sm:grid-cols-2">
                                    <form.Field
                                        name="shipmentType"
                                        validators={{
                                            onChange: zodOnChange(shipmentTypeFieldSchema),
                                        }}
                                    >
                                        {(field) => (
                                            <SearchableCombobox
                                                id={field.name}
                                                label="Shipment Type"
                                                value={field.state.value}
                                                onValueChange={(nextValue) =>
                                                    field.handleChange(nextValue)
                                                }
                                                items={shipmentTypeItems}
                                                error={fieldError(field.state.meta.errors)}
                                                required
                                                placeholder="Search shipment type..."
                                            />
                                        )}
                                    </form.Field>

                                    <form.Field
                                        name="vesselId"
                                        validators={{ onChange: zodOnChange(vesselIdSchema) }}
                                    >
                                        {(field) => (
                                            <SearchableCombobox
                                                id={field.name}
                                                label="Vessel"
                                                value={field.state.value}
                                                onValueChange={(nextValue) =>
                                                    field.handleChange(nextValue)
                                                }
                                                items={vesselItems}
                                                error={fieldError(field.state.meta.errors)}
                                                required
                                                isLoading={vesselsLoading}
                                                placeholder="Search vessel..."
                                                emptyMessage="No vessels found."
                                                quickAddLabel="Add new vessel"
                                                onQuickAdd={
                                                    canCreateVessel
                                                        ? () => setVesselDialogOpen(true)
                                                        : undefined
                                                }
                                            />
                                        )}
                                    </form.Field>

                                    <form.Field
                                        name="portDepartureId"
                                        validators={{
                                            onChange: zodOnChange(portDepartureIdSchema),
                                        }}
                                    >
                                        {(field) => (
                                            <SearchableCombobox
                                                id={field.name}
                                                label="Port of Loading"
                                                value={field.state.value}
                                                onValueChange={(nextValue) =>
                                                    field.handleChange(nextValue)
                                                }
                                                items={portItems}
                                                error={fieldError(field.state.meta.errors)}
                                                required
                                                isLoading={portsLoading}
                                                placeholder="Search port of loading..."
                                                emptyMessage="No ports found."
                                                quickAddLabel="Add new port"
                                                onQuickAdd={
                                                    canCreatePort
                                                        ? () =>
                                                              setPortDialogTarget("departure")
                                                        : undefined
                                                }
                                            />
                                        )}
                                    </form.Field>

                                    <form.Field
                                        name="portDestinationId"
                                        validators={{
                                            onChange: zodOnChange(portDestinationIdSchema),
                                        }}
                                    >
                                        {(field) => (
                                            <SearchableCombobox
                                                id={field.name}
                                                label="Port of Discharge"
                                                value={field.state.value}
                                                onValueChange={(nextValue) =>
                                                    field.handleChange(nextValue)
                                                }
                                                items={portItems}
                                                error={fieldError(field.state.meta.errors)}
                                                required
                                                isLoading={portsLoading}
                                                placeholder="Search port of discharge..."
                                                emptyMessage="No ports found."
                                                quickAddLabel="Add new port"
                                                onQuickAdd={
                                                    canCreatePort
                                                        ? () =>
                                                              setPortDialogTarget(
                                                                  "destination"
                                                              )
                                                        : undefined
                                                }
                                            />
                                        )}
                                    </form.Field>

                                    <form.Field
                                        name="loadingLocationId"
                                        validators={{
                                            onChange: zodOnChange(loadingLocationIdSchema),
                                        }}
                                    >
                                        {(field) => (
                                            <SearchableCombobox
                                                id={field.name}
                                                label="Loading Location (Stuffing)"
                                                value={field.state.value}
                                                onValueChange={(nextValue) =>
                                                    field.handleChange(nextValue)
                                                }
                                                items={loadingLocationItems}
                                                error={fieldError(field.state.meta.errors)}
                                                isLoading={locationsLoading}
                                                disabled={!selectedCustomerCode}
                                                placeholder={
                                                    selectedCustomerCode
                                                        ? "Search stuffing location..."
                                                        : "Customer is required to load locations"
                                                }
                                                emptyMessage={locationsEmptyMessage}
                                                description={
                                                    !selectedCustomerCode
                                                        ? "Select a customer to load stuffing locations."
                                                        : undefined
                                                }
                                            />
                                        )}
                                    </form.Field>

                                    <form.Field
                                        name="unloadingLocationId"
                                        validators={{
                                            onChange: zodOnChange(
                                                unloadingLocationIdSchema
                                            ),
                                        }}
                                    >
                                        {(field) => (
                                            <SearchableCombobox
                                                id={field.name}
                                                label="Unloading Location (Unstuffing)"
                                                value={field.state.value}
                                                onValueChange={(nextValue) =>
                                                    field.handleChange(nextValue)
                                                }
                                                items={unloadingLocationItems}
                                                error={fieldError(field.state.meta.errors)}
                                                isLoading={locationsLoading}
                                                disabled={!selectedCustomerCode}
                                                placeholder={
                                                    selectedCustomerCode
                                                        ? "Search unstuffing location..."
                                                        : "Customer is required to load locations"
                                                }
                                                emptyMessage={
                                                    locationsError
                                                        ? "Unable to load customer locations."
                                                        : "No customer locations found."
                                                }
                                            />
                                        )}
                                    </form.Field>

                                    <form.Field name="eta">
                                        {(field) => (
                                            <DatePicker
                                                label="ETA"
                                                id={field.name}
                                                value={field.state.value}
                                                onValueChange={(nextValue) =>
                                                    field.handleChange(nextValue)
                                                }
                                                error={fieldError(field.state.meta.errors)}
                                                placeholder="Pick ETA"
                                            />
                                        )}
                                    </form.Field>

                                    <form.Field name="blNumber">
                                        {(field) => (
                                            <TextField
                                                label="BL Number"
                                                id={field.name}
                                                name={field.name}
                                                value={field.state.value}
                                                onChange={(e) =>
                                                    field.handleChange(e.target.value)
                                                }
                                                error={fieldError(field.state.meta.errors)}
                                            />
                                        )}
                                    </form.Field>

                                    <form.Field name="bookingNumber">
                                        {(field) => (
                                            <div className="sm:col-span-2">
                                                <TextField
                                                    label="Booking Number"
                                                    id={field.name}
                                                    name={field.name}
                                                    value={field.state.value}
                                                    onChange={(e) =>
                                                        field.handleChange(e.target.value)
                                                    }
                                                    error={fieldError(field.state.meta.errors)}
                                                />
                                            </div>
                                        )}
                                    </form.Field>
                                </div>
                            </section>
                        </div>

                        <DialogFooter className="shrink-0 border-t border-[rgba(214,227,255,0.4)] px-6 py-4">
                            <Button type="submit" disabled={isPending}>
                                {mode === "edit"
                                    ? isPending
                                        ? "Updating..."
                                        : "Save Changes"
                                    : isPending
                                      ? "Creating..."
                                      : "Create"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <QuickAddCustomerDialog
                open={customerDialogOpen}
                onOpenChange={setCustomerDialogOpen}
                onCreated={applyCreatedCustomer}
            />
            <QuickAddShipperDialog
                open={shipperDialogOpen}
                onOpenChange={setShipperDialogOpen}
                customerId={selectedCustomerCode}
                onCreated={applyCreatedShipper}
            />
            <QuickAddVesselDialog
                open={vesselDialogOpen}
                onOpenChange={setVesselDialogOpen}
                onCreated={applyCreatedVessel}
            />
            <QuickAddPortDialog
                open={portDialogTarget !== null}
                onOpenChange={(next) => {
                    if (!next) setPortDialogTarget(null)
                }}
                onCreated={applyCreatedPort}
            />
        </div>
    )
}
