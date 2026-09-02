"use client"

import { useMemo, useState } from "react"
import { useForm } from "@tanstack/react-form"
import { useRouter } from "next/navigation"

import type { Customer } from "@/app/dashboard/customers/columns"
import type { Port } from "@/app/dashboard/ports/columns"
import type { Vendor } from "@/app/dashboard/vendors/columns"
import type { Vessel } from "@/app/dashboard/vessels/columns"
import { CustomerCombobox } from "@/components/customer-combobox"
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
import { useGetLocationsByCustomerId, useGetShippersByCustomerCodeId } from "@/hooks/use-customers"
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
import { ShipmentStatusField } from "@/components/forms/shipment-status-field"
import { type ShipmentStatus } from "@/lib/shipment-status"
import { SHIPMENT_TYPE_OPTIONS } from "@/lib/shipment-types"
import { zodOnChange } from "@/lib/zod-form"
import type { CustomerLocationOption } from "@/services/customers.service"

type Shipper = {
  id: string
  name: string
}

const MONTH_IN_ROMANS = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"]
const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
]

const currentYear = new Date().getFullYear()
const YEAR_OPTIONS = Array.from({ length: 4 }, (_, i) => currentYear - 1 + i)

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
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear(),
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
            month: value.month,
            year: value.year,
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
    <div className="space-y-8">
      <form
        className="space-y-8"
        onSubmit={(e) => {
          e.preventDefault()
          e.stopPropagation()
          form.handleSubmit()
        }}
      >
        <section className="space-y-4">
          <div>
            <h2 className="text-headline-md font-semibold">Shipment details</h2>
            <p className="text-sm text-muted-foreground">
              Set the order period and customer. New shipments start as Draft
              unless you choose another lifecycle status. The order number is
              generated automatically.
            </p>
          </div>

          <form.Field name="status">
            {(field) => (
              <ShipmentStatusField
                id={field.name}
                value={field.state.value}
                onValueChange={(value) => field.handleChange(value)}
                description="Lifecycle of this booking — not whether the record is active in the system."
              />
            )}
          </form.Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <form.Field name="month">
              {(field) => (
                <div>
                  <FormLabel htmlFor={field.name} className="my-2" required>
                    Month
                  </FormLabel>
                  <Select
                    value={String(field.state.value)}
                    onValueChange={(value) => field.handleChange(Number(value))}
                  >
                    <SelectTrigger id={field.name} className="w-full">
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
              )}
            </form.Field>

            <form.Field name="year">
              {(field) => (
                <div>
                  <FormLabel htmlFor={field.name} className="my-2" required>
                    Year
                  </FormLabel>
                  <Select
                    value={String(field.state.value)}
                    onValueChange={(value) => field.handleChange(Number(value))}
                  >
                    <SelectTrigger id={field.name} className="w-full">
                      <SelectValue placeholder="Select year" />
                    </SelectTrigger>
                    <SelectContent>
                      {YEAR_OPTIONS.map((year) => (
                        <SelectItem key={year} value={String(year)}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </form.Field>
          </div>

          <FieldDescription>
            The order number will be generated automatically when you create
            this shipment.
          </FieldDescription>

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
                >
                  <SelectTrigger id={field.name} className="w-full">
                    <SelectValue placeholder="Select customer code to enable shipper selection" />
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
                        No shippers found for this customer code
                      </SelectItem>
                    ) : (
                      shipperItems.map((shipper: Shipper) => (
                        <SelectItem key={shipper.id} value={shipper.id ?? ""}>
                          {shipper.name}
                        </SelectItem>
                      ))
                    )}
                    {canCreateCustomer ? (
                      <div
                        className="-mx-1 mt-1 border-t border-[rgba(214,227,255,0.4)]"
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
                    Select a customer first to add or choose a shipper.
                  </FieldDescription>
                ) : null}
              </div>
            )}
          </form.Field>
        </section>

        <section className="space-y-4">
          <div>
            <h2 className="text-headline-md font-semibold">
              Operational details
            </h2>
            <p className="text-sm text-muted-foreground">
              Set the route, vessel, and shipment type so this order can accept
              containers and documents immediately.
            </p>
          </div>

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
                  onValueChange={(nextValue) => field.handleChange(nextValue)}
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
                  onValueChange={(nextValue) => field.handleChange(nextValue)}
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
                  onValueChange={(nextValue) => field.handleChange(nextValue)}
                  items={portItems}
                  error={fieldError(field.state.meta.errors)}
                  isLoading={portsLoading}
                  isSearching={portsFetching}
                  searchError={portsError}
                  onSearchTermChange={setPortSearch}
                  placeholder="Search port of loading..."
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
                  onValueChange={(nextValue) => field.handleChange(nextValue)}
                  items={portItems}
                  error={fieldError(field.state.meta.errors)}
                  isLoading={portsLoading}
                  isSearching={portsFetching}
                  searchError={portsError}
                  onSearchTermChange={setPortSearch}
                  placeholder="Search port of discharge..."
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
                  onValueChange={(nextValue) => field.handleChange(nextValue)}
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
                  onValueChange={(nextValue) => field.handleChange(nextValue)}
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
                  onChange={(e) => field.handleChange(e.target.value)}
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
                    onChange={(e) => field.handleChange(e.target.value)}
                    error={fieldError(field.state.meta.errors)}
                  />
                </div>
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
                  onValueChange={(nextValue) => field.handleChange(nextValue)}
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
                  onValueChange={(nextValue) => field.handleChange(nextValue)}
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

            <form.Field name="remarks">
              {(field) => (
                <div className="sm:col-span-2">
                  <TextField
                    label="Remarks"
                    multiline
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
        </section>

        <div className="flex flex-wrap gap-3 pt-2">
          {createShipment.isError ? (
            <p className="w-full text-sm text-[var(--mli-on-error-container)]">
              {createShipment.error instanceof Error
                ? createShipment.error.message
                : "Unable to create shipment. Please try again."}
            </p>
          ) : null}
          <Button type="submit" disabled={createShipment.isPending}>
            {createShipment.isPending ? "Creating..." : "Create shipment"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/dashboard/shipments")}
          >
            Cancel
          </Button>
        </div>
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
    </div>
  )
}
