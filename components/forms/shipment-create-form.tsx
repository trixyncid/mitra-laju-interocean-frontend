"use client"

import { useMemo, useState } from "react"
import { useForm, useStore } from "@tanstack/react-form"
import { useRouter } from "next/navigation"

import type { Customer } from "@/app/dashboard/customers/columns"
import type { Port } from "@/app/dashboard/ports/columns"
import type { Vendor } from "@/app/dashboard/vendors/columns"
import type { Vessel } from "@/app/dashboard/vessels/columns"
import { CustomerCombobox } from "@/components/customer-combobox"
import { BookingTicket, splitPortLabel, type BookingTicketData } from "@/components/create-flow/booking-ticket"
import { FlowSection } from "@/components/create-flow/flow-section"
import { ShipmentStatusPicker } from "@/components/create-flow/status-picker"
import { StepRail, StepStrip, type FlowStep } from "@/components/create-flow/step-rail"
import { QuickAddButton } from "@/components/forms/quick-add-button"
import { QuickAddCustomerDialog } from "@/components/forms/quick-add-customer-dialog"
import { QuickAddPortDialog } from "@/components/forms/quick-add-port-dialog"
import { QuickAddShipperDialog } from "@/components/forms/quick-add-shipper-dialog"
import { QuickAddVendorDialog } from "@/components/forms/quick-add-vendor-dialog"
import { QuickAddVesselDialog } from "@/components/forms/quick-add-vessel-dialog"
import { Button } from "@/components/ui/button"
import { DatePicker } from "@/components/ui/date-picker"
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
import { useCustomerById, useGetLocationsByCustomerId, useGetShippersByCustomerCodeId } from "@/hooks/use-customers"
import { usePortSearch, useVendorSearch, useVesselSearch } from "@/hooks/use-entity-searches"
import { usePermissions } from "@/hooks/use-permissions"
import { useCreateShipmentWithOperational } from "@/hooks/use-shipments"
import { fieldError } from "@/lib/form-field"
import {
  customerCodeIdSchema,
  customerShipperIdSchema,
} from "@/lib/schemas/shipment"
import {
  freightBookToIdSchema,
  loadingLocationIdSchema,
  portDepartureIdSchema,
  portDestinationIdSchema,
  shipmentTypeFieldSchema,
  truckingBookToIdSchema,
  unloadingLocationIdSchema,
  vesselIdSchema,
} from "@/lib/schemas/shipment-operational"
import { formatShipmentStatus, type ShipmentStatus } from "@/lib/shipment-status"
import { SHIPMENT_TYPE_OPTIONS } from "@/lib/shipment-types"
import { zodOnChange } from "@/lib/zod-form"
import type { CustomerLocationOption } from "@/services/customers.service"

type Shipper = {
  id: string
  name: string
}

type VendorOption = {
  id: string
  vendorName: string
  vendorCode: string
}

function toLocationOption(location: CustomerLocationOption): SearchableComboboxOption {
  return {
    value: location.id,
    label: `${location.addressLine1}, ${location.city}, ${location.country}`,
  }
}

function toVendorOption(vendor: VendorOption): SearchableComboboxOption {
  return {
    value: vendor.id,
    label: `${vendor.vendorName} (${vendor.vendorCode})`,
  }
}

/** Small heading that splits a long section into groups. */
function GroupLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="col-span-full -mb-1 text-xs font-semibold tracking-[0.08em] text-muted-foreground uppercase">
      {children}
    </p>
  )
}

const REQUIRED_TOTAL = 4

function activeLocations(locations: CustomerLocationOption[] | undefined) {
  return (locations ?? []).filter((location) => location.isActive !== false)
}

export default function ShipmentCreateForm() {
  const router = useRouter()
  const createShipment = useCreateShipmentWithOperational()
  const { allowedShipmentTypes, can } = usePermissions()
  const canCreateCustomer = can("CUSTOMER", "create")
  const canCreatePort = can("PORT", "create")
  const canCreateVessel = can("VESSEL", "create")
  const canCreateVendor = can("VENDOR", "create")
  const [selectedCustomerCode, setSelectedCustomerCode] = useState("")
  const [selectedShipperId, setSelectedShipperId] = useState("-")
  const [createdShipper, setCreatedShipper] = useState<Shipper | null>(null)
  const [createdPorts, setCreatedPorts] = useState<SearchableComboboxOption[]>([])
  const [createdVessels, setCreatedVessels] = useState<SearchableComboboxOption[]>([])
  const [createdVendors, setCreatedVendors] = useState<SearchableComboboxOption[]>([])
  const [customerDialogOpen, setCustomerDialogOpen] = useState(false)
  const [shipperSelectOpen, setShipperSelectOpen] = useState(false)
  const [shipperDialogOpen, setShipperDialogOpen] = useState(false)
  const [vesselDialogOpen, setVesselDialogOpen] = useState(false)
  const [portDialogTarget, setPortDialogTarget] = useState<
    "departure" | "destination" | null
  >(null)
  const [vendorDialogTarget, setVendorDialogTarget] = useState<
    "trucking" | "freight" | null
  >(null)
  const [portSearch, setPortSearch] = useState("")
  const [vesselSearch, setVesselSearch] = useState("")
  const [vendorSearch, setVendorSearch] = useState("")

  const form = useForm({
    defaultValues: {
      customerCodeId: "",
      customerShipperId: "-",
      status: "DRAFT" as ShipmentStatus,
      shipmentType: "",
      vesselId: "",
      portDepartureId: "",
      portDestinationId: "",
      loadingLocationId: "",
      unloadingLocationId: "",
      eta: "",
      blNumber: "",
      bookingNumber: "",
      truckingBookToId: "",
      freightBookToId: "",
      remarks: "",
    },
    onSubmit: async ({ value }) => {
      const normalizeOptionalId = (optionalId: string) =>
        optionalId === "" ? undefined : optionalId

      createShipment.mutate(
        {
          shipment: {
            customerCodeId: value.customerCodeId,
            customerShipperId: value.customerShipperId,
            status: value.status,
          },
          operational: {
            shipmentType: value.shipmentType,
            vesselId: value.vesselId,
            portDepartureId: normalizeOptionalId(value.portDepartureId),
            portDestinationId: normalizeOptionalId(value.portDestinationId),
            loadingLocationId: normalizeOptionalId(value.loadingLocationId),
            unloadingLocationId: normalizeOptionalId(value.unloadingLocationId),
            eta: value.eta === "" ? null : value.eta,
            blNumber: value.blNumber,
            bookingNumber: value.bookingNumber,
            truckingBookToId: normalizeOptionalId(value.truckingBookToId),
            freightBookToId: normalizeOptionalId(value.freightBookToId),
            remarks: value.remarks.trim() === "" ? undefined : value.remarks,
          },
        },
        {
          onSuccess: (data) => {
            if (data.id) {
              router.push(`/dashboard/shipments/${data.id}`)
              return
            }
            router.push("/dashboard/shipments")
          },
        }
      )
    },
  })

  const { data: shippers, isLoading: shippersLoading, error: shippersError } =
    useGetShippersByCustomerCodeId(selectedCustomerCode)
  const {
    data: locations,
    isLoading: locationsLoading,
    isError: locationsError,
  } = useGetLocationsByCustomerId(selectedCustomerCode, {
    enabled: Boolean(selectedCustomerCode),
  })
  const { data: portsData, isLoading: portsLoading, isFetching: portsFetching, isError: portsError } =
    usePortSearch(portSearch)
  const { data: vesselsData, isLoading: vesselsLoading, isFetching: vesselsFetching, isError: vesselsError } =
    useVesselSearch(vesselSearch)
  const { data: vendorsData, isLoading: vendorsLoading, isFetching: vendorsFetching, isError: vendorsError } =
    useVendorSearch(vendorSearch, true, "true")

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

  const shipperItems = useMemo<Shipper[]>(() => {
    const items = shippers ?? []
    if (createdShipper && !items.some((shipper) => shipper.id === createdShipper.id)) {
      return [createdShipper, ...items]
    }
    return items
  }, [createdShipper, shippers])

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

  const vendorItems = useMemo<SearchableComboboxOption[]>(() => {
    const items =
      vendorsData?.items
        ?.filter((vendor: Vendor) => vendor.id)
        .map((vendor: Vendor) =>
          toVendorOption({
            id: vendor.id as string,
            vendorName: vendor.vendorName,
            vendorCode: vendor.vendorCode,
          })
        ) ?? []
    const extras = createdVendors.filter(
      (vendor) => !items.some((item) => item.value === vendor.value)
    )
    return [...extras, ...items]
  }, [createdVendors, vendorsData?.items])

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

  const locationsEmptyMessage = locationsError
    ? "Unable to load customer locations."
    : selectedShipperId && selectedShipperId !== "-"
      ? "No stuffing locations found for this customer shipper."
      : "No customer locations found."

  const values = useStore(form.store, (state) => state.values)
  const { data: selectedCustomer } = useCustomerById(values.customerCodeId)
  // Search results change as people type, so keep the label of what they picked.
  const [pickedLabels, setPickedLabels] = useState<Record<string, string>>({})

  function remember(name: string, value: string, items: SearchableComboboxOption[]) {
    const label = items.find((item) => item.value === value)?.label ?? ""
    setPickedLabels((current) => ({ ...current, [name]: label }))
  }

  function labelOf(name: string, value: string, items: SearchableComboboxOption[]) {
    if (!value) return null
    return items.find((item) => item.value === value)?.label || pickedLabels[name] || null
  }

  const hasCustomer = Boolean(values.customerCodeId)
  const hasShipper = values.customerShipperId !== "-" && values.customerShipperId !== ""
  const hasType = Boolean(values.shipmentType)
  const hasVessel = Boolean(values.vesselId)
  const missing = [
    { done: hasCustomer, label: "Customer", href: "#step-customer" },
    { done: hasShipper, label: "Shipper", href: "#step-customer" },
    { done: hasType, label: "Shipment type", href: "#step-route" },
    { done: hasVessel, label: "Vessel", href: "#step-route" },
  ].filter((item) => !item.done)
  const requiredDone = REQUIRED_TOTAL - missing.length
  const ready = missing.length === 0
  const routeExtras = [
    values.portDepartureId,
    values.portDestinationId,
    values.eta,
    values.loadingLocationId,
    values.unloadingLocationId,
  ].filter(Boolean).length
  const bookingFilled = [
    values.bookingNumber.trim(),
    values.blNumber.trim(),
    values.truckingBookToId,
    values.freightBookToId,
  ].filter(Boolean).length

  const steps: FlowStep[] = [
    {
      id: "step-customer",
      title: "Customer",
      state: hasCustomer && hasShipper ? "done" : "todo",
      detail: !hasCustomer
        ? "Choose the customer"
        : !hasShipper
          ? "Choose the shipper"
          : "Customer and shipper set",
    },
    {
      id: "step-route",
      title: "Route & vessel",
      state: hasType && hasVessel ? "done" : "todo",
      detail: !hasType
        ? "Choose the shipment type"
        : !hasVessel
          ? "Choose the vessel"
          : `${routeExtras} of 5 extra details added`,
    },
    {
      id: "step-booking",
      title: "Booking details",
      state: bookingFilled === 4 ? "done" : "optional",
      detail: `${bookingFilled} of 4 added`,
    },
    {
      id: "step-review",
      title: "Review & save",
      state: ready ? "done" : "todo",
      detail: ready ? "Ready to save" : `${missing.length} required left`,
    },
  ]
  const currentId = steps.find((step) => step.state === "todo")?.id ?? "step-review"

  const shipperName = shipperItems.find((shipper) => shipper.id === values.customerShipperId)?.name ?? null
  const ticketData: BookingTicketData = {
    customer: hasCustomer
      ? selectedCustomer
        ? `${selectedCustomer.customerName} (${selectedCustomer.customerCode})`
        : "Loading…"
      : null,
    shipper: hasShipper ? shipperName : null,
    shipmentType: values.shipmentType || null,
    status: formatShipmentStatus(values.status) ?? values.status,
    origin: splitPortLabel(labelOf("portDepartureId", values.portDepartureId, portItems)),
    destination: splitPortLabel(labelOf("portDestinationId", values.portDestinationId, portItems)),
    vessel: labelOf("vesselId", values.vesselId, vesselItems),
    eta: values.eta || null,
    bookingNumber: values.bookingNumber.trim() || null,
    blNumber: values.blNumber.trim() || null,
    trucking: labelOf("truckingBookToId", values.truckingBookToId, vendorItems),
    freight: labelOf("freightBookToId", values.freightBookToId, vendorItems),
    stuffing: labelOf("loadingLocationId", values.loadingLocationId, loadingLocationItems),
  }

  function applyCreatedCustomer(customer: Customer) {
    if (!customer.id) return
    form.setFieldValue("customerCodeId", customer.id)
    setSelectedCustomerCode(customer.id)
    setSelectedShipperId("-")
    setCreatedShipper(null)
    form.setFieldValue("customerShipperId", "-", { dontValidate: true })
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

  function applyCreatedVendor(vendor: Vendor) {
    if (!vendor.id) return
    setCreatedVendors((current) => [
      toVendorOption({
        id: vendor.id as string,
        vendorName: vendor.vendorName,
        vendorCode: vendor.vendorCode,
      }),
      ...current.filter((item) => item.value !== vendor.id),
    ])
    if (vendorDialogTarget === "trucking") {
      form.setFieldValue("truckingBookToId", vendor.id)
    }
    if (vendorDialogTarget === "freight") {
      form.setFieldValue("freightBookToId", vendor.id)
    }
  }

  return (
    <>
      <form
        className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_20rem] xl:grid-cols-[13.5rem_minmax(0,1fr)_21rem]"
        onSubmit={(e) => {
          e.preventDefault()
          e.stopPropagation()
          form.handleSubmit()
        }}
      >
        <aside className="hidden xl:sticky xl:top-24 xl:block">
          <StepRail
            steps={steps}
            requiredDone={requiredDone}
            requiredTotal={REQUIRED_TOTAL}
            currentId={currentId}
          />
        </aside>

        <div className="min-w-0 space-y-5">
          <div className="xl:hidden">
            <StepStrip steps={steps} requiredDone={requiredDone} requiredTotal={REQUIRED_TOTAL} />
          </div>

          <FlowSection
            id="step-customer"
            step={1}
            title="Customer"
            hint="Who is this shipment for? Pick the customer, then their shipper."
            state={steps[0].state}
          >
            <div className="space-y-4">
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
                      // A new customer means a new shipper list; don't flag it as an error yet.
                      form.setFieldValue("customerShipperId", "-", { dontValidate: true })
                      form.setFieldValue("loadingLocationId", "")
                      form.setFieldValue("unloadingLocationId", "")
                    }}
                    error={fieldError(field.state.meta.errors)}
                    required
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
                    <FormLabel htmlFor={field.name} className="my-2" required>
                      Customer Shipper
                    </FormLabel>
                    <Select
                      open={shipperSelectOpen}
                      onOpenChange={setShipperSelectOpen}
                      value={field.state.value}
                      onValueChange={(nextValue) => {
                        field.handleChange(nextValue)
                        setSelectedShipperId(nextValue)
                        form.setFieldValue("loadingLocationId", "")
                      }}
                      disabled={!selectedCustomerCode}
                    >
                      <SelectTrigger id={field.name} className="w-full">
                        <SelectValue placeholder="Choose a customer first" />
                      </SelectTrigger>
                      <SelectContent>
                        {shippersLoading ? (
                          <SelectItem value="_loading" disabled>
                            Loading...
                          </SelectItem>
                        ) : shippersError ? (
                          <SelectItem value="_error" disabled>
                            Unable to load shippers
                          </SelectItem>
                        ) : shipperItems.length === 0 ? (
                          <SelectItem value="-">
                            No shippers found for this customer
                          </SelectItem>
                        ) : (
                          <>
                            <SelectItem value="-" disabled>
                              Choose a shipper
                            </SelectItem>
                            {shipperItems.map((shipper: Shipper) => (
                              <SelectItem key={shipper.id} value={shipper.id ?? ""}>
                                {shipper.name}
                              </SelectItem>
                            ))}
                          </>
                        )}
                        {canCreateCustomer ? (
                          <div
                            className="-mx-1 mt-1 border-t border-[rgba(var(--mli-tint-rgb),0.4)]"
                            onMouseDown={(event) => event.preventDefault()}
                            onPointerDown={(event) => event.preventDefault()}
                          >
                            <QuickAddButton
                              label="Add new shipper"
                              disabled={!selectedCustomerCode}
                              onClick={() => {
                                setShipperSelectOpen(false)
                                queueMicrotask(() => setShipperDialogOpen(true))
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
                        Choose a customer first. Then you can pick or add a shipper.
                      </FieldDescription>
                    ) : null}
                  </div>
                )}
              </form.Field>
            </div>
          </FlowSection>

          <FlowSection
            id="step-route"
            step={2}
            title="Route & vessel"
            hint="How does the cargo travel? Type and vessel are required. Ports and dates help everyone else."
            state={steps[1].state}
            meta={hasType && hasVessel ? `${routeExtras} of 5 extra details` : undefined}
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <GroupLabel>Type and vessel</GroupLabel>
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
                    onValueChange={(nextValue) => field.handleChange(nextValue)}
                    items={shipmentTypeItems}
                    error={fieldError(field.state.meta.errors)}
                    required
                    placeholder="Export, import or domestic"
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
                    onValueChange={(nextValue) => {
                      field.handleChange(nextValue)
                      remember(field.name, nextValue, vesselItems)
                    }}
                    items={vesselItems}
                    error={fieldError(field.state.meta.errors)}
                    required
                    isLoading={vesselsLoading}
                    isSearching={vesselsFetching}
                    searchError={vesselsError}
                    onSearchTermChange={setVesselSearch}
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

              <GroupLabel>Ports</GroupLabel>
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
                    onValueChange={(nextValue) => {
                      field.handleChange(nextValue)
                      remember(field.name, nextValue, portItems)
                    }}
                    items={portItems}
                    error={fieldError(field.state.meta.errors)}
                    isLoading={portsLoading}
                    isSearching={portsFetching}
                    searchError={portsError}
                    onSearchTermChange={setPortSearch}
                    placeholder="Where the ship leaves"
                    emptyMessage="No ports found."
                    quickAddLabel="Add new port"
                    onQuickAdd={
                      canCreatePort
                        ? () => setPortDialogTarget("departure")
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
                    onValueChange={(nextValue) => {
                      field.handleChange(nextValue)
                      remember(field.name, nextValue, portItems)
                    }}
                    items={portItems}
                    error={fieldError(field.state.meta.errors)}
                    isLoading={portsLoading}
                    isSearching={portsFetching}
                    searchError={portsError}
                    onSearchTermChange={setPortSearch}
                    placeholder="Where the ship arrives"
                    emptyMessage="No ports found."
                    quickAddLabel="Add new port"
                    onQuickAdd={
                      canCreatePort
                        ? () => setPortDialogTarget("destination")
                        : undefined
                    }
                  />
                )}
              </form.Field>

              <GroupLabel>Places and date</GroupLabel>
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
                    onValueChange={(nextValue) => {
                      field.handleChange(nextValue)
                      remember(field.name, nextValue, loadingLocationItems)
                    }}
                    items={loadingLocationItems}
                    error={fieldError(field.state.meta.errors)}
                    isLoading={locationsLoading}
                    disabled={!selectedCustomerCode}
                    placeholder={
                      selectedCustomerCode
                        ? "Search stuffing location..."
                        : "Choose a customer first"
                    }
                    emptyMessage={locationsEmptyMessage}
                    description={
                      !selectedCustomerCode
                        ? "The places come from the customer you choose."
                        : undefined
                    }
                  />
                )}
              </form.Field>

              <form.Field
                name="unloadingLocationId"
                validators={{
                  onChange: zodOnChange(unloadingLocationIdSchema),
                }}
              >
                {(field) => (
                  <SearchableCombobox
                    id={field.name}
                    label="Unloading Location (Unstuffing)"
                    value={field.state.value}
                    onValueChange={(nextValue) => field.handleChange(nextValue)}
                    items={unloadingLocationItems}
                    error={fieldError(field.state.meta.errors)}
                    isLoading={locationsLoading}
                    disabled={!selectedCustomerCode}
                    placeholder={
                      selectedCustomerCode
                        ? "Search unstuffing location..."
                        : "Choose a customer first"
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
                    onValueChange={(nextValue) => field.handleChange(nextValue)}
                    error={fieldError(field.state.meta.errors)}
                    placeholder="Arrival date"
                    description="When the ship is expected to arrive."
                  />
                )}
              </form.Field>
            </div>
          </FlowSection>

          <FlowSection
            id="step-booking"
            step={3}
            title="Booking details"
            hint="Add these now if you have them, or fill them in later."
            state={steps[2].state}
            meta={`${bookingFilled} of 4 added`}
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <form.Field name="bookingNumber">
                {(field) => (
                  <TextField
                    label="Booking Number"
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    error={fieldError(field.state.meta.errors)}
                    placeholder="e.g. MRT-BK-24117"
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
                    onChange={(e) => field.handleChange(e.target.value)}
                    error={fieldError(field.state.meta.errors)}
                    placeholder="Bill of lading number"
                  />
                )}
              </form.Field>

              <form.Field
                name="truckingBookToId"
                validators={{ onChange: zodOnChange(truckingBookToIdSchema) }}
              >
                {(field) => (
                  <SearchableCombobox
                    id={field.name}
                    label="Trucking Book To"
                    value={field.state.value}
                    onValueChange={(nextValue) => {
                      field.handleChange(nextValue)
                      remember(field.name, nextValue, vendorItems)
                    }}
                    items={vendorItems}
                    error={fieldError(field.state.meta.errors)}
                    isLoading={vendorsLoading}
                    isSearching={vendorsFetching}
                    searchError={vendorsError}
                    onSearchTermChange={setVendorSearch}
                    placeholder="Search trucking vendor..."
                    emptyMessage="No vendors found."
                    quickAddLabel="Add new vendor"
                    onQuickAdd={
                      canCreateVendor
                        ? () => setVendorDialogTarget("trucking")
                        : undefined
                    }
                  />
                )}
              </form.Field>

              <form.Field
                name="freightBookToId"
                validators={{ onChange: zodOnChange(freightBookToIdSchema) }}
              >
                {(field) => (
                  <SearchableCombobox
                    id={field.name}
                    label="Freight Book To"
                    value={field.state.value}
                    onValueChange={(nextValue) => {
                      field.handleChange(nextValue)
                      remember(field.name, nextValue, vendorItems)
                    }}
                    items={vendorItems}
                    error={fieldError(field.state.meta.errors)}
                    isLoading={vendorsLoading}
                    isSearching={vendorsFetching}
                    searchError={vendorsError}
                    onSearchTermChange={setVendorSearch}
                    placeholder="Search freight vendor..."
                    emptyMessage="No vendors found."
                    quickAddLabel="Add new vendor"
                    onQuickAdd={
                      canCreateVendor
                        ? () => setVendorDialogTarget("freight")
                        : undefined
                    }
                  />
                )}
              </form.Field>
            </div>
          </FlowSection>

          <FlowSection
            id="step-review"
            step={4}
            title="Review & save"
            hint="Pick the status, add a note if needed, then check the booking card."
            state={steps[3].state}
          >
            <div className="space-y-5">
              <form.Field name="status">
                {(field) => (
                  <ShipmentStatusPicker
                    id={field.name}
                    value={field.state.value}
                    onValueChange={(value) => field.handleChange(value)}
                  />
                )}
              </form.Field>

              <form.Field name="remarks">
                {(field) => (
                  <TextField
                    label="Remarks"
                    multiline
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    error={fieldError(field.state.meta.errors)}
                    placeholder="Anything the team should know (optional)"
                  />
                )}
              </form.Field>

              <BookingTicket data={ticketData} className="lg:hidden" />

              {missing.length > 0 ? (
                <div className="rounded-lg bg-[var(--mli-warning-container)] px-4 py-3">
                  <p className="text-sm font-medium text-[var(--mli-on-warning-container)]">
                    Still needed before you can save:
                  </p>
                  <ul className="mt-2 flex flex-wrap gap-2">
                    {missing.map((item) => (
                      <li key={item.label}>
                        <a
                          href={item.href}
                          className="inline-flex rounded-full bg-card px-3 py-1 text-xs font-medium text-foreground shadow-elev-1 hover:underline"
                        >
                          {item.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}

              {createShipment.isError ? (
                <p className="text-sm text-[var(--mli-on-error-container)]">
                  {createShipment.error instanceof Error
                    ? createShipment.error.message
                    : "Unable to create shipment. Please try again."}
                </p>
              ) : null}

              <div className="hidden flex-wrap gap-3 lg:flex">
                <Button type="submit" size="lg" disabled={createShipment.isPending}>
                  {createShipment.isPending ? "Creating..." : "Create shipment"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  onClick={() => router.push("/dashboard/shipments")}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </FlowSection>

          {/* Phones and tablets: the save button stays in reach while scrolling. */}
          <div className="sticky bottom-3 z-20 lg:hidden">
            <div className="flex items-center gap-3 rounded-2xl surface p-3 shadow-elev-3">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-foreground">
                  {ready ? "Ready to save" : `${requiredDone} of ${REQUIRED_TOTAL} required filled`}
                </p>
                <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-[rgba(var(--mli-inset-rgb),0.95)]">
                  <div
                    className="h-full rounded-full bg-primary bg-[image:var(--mli-gradient-brand)] transition-[width] duration-500"
                    style={{ width: `${(requiredDone / REQUIRED_TOTAL) * 100}%` }}
                  />
                </div>
              </div>
              <Button type="submit" disabled={createShipment.isPending}>
                {createShipment.isPending ? "Creating..." : "Create"}
              </Button>
            </div>
          </div>
        </div>

        <aside className="hidden space-y-3 lg:sticky lg:top-24 lg:block">
          <BookingTicket data={ticketData} />
          <p className="px-1 text-xs text-muted-foreground">
            This card fills in as you type. Check it before you save.
          </p>
        </aside>
      </form>

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
      <QuickAddVendorDialog
        open={vendorDialogTarget !== null}
        onOpenChange={(next) => {
          if (!next) setVendorDialogTarget(null)
        }}
        onCreated={applyCreatedVendor}
      />
    </>
  )
}
