"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import {
  IconArrowLeft,
  IconBrandWhatsapp,
  IconDotsVertical,
  IconMail,
  IconMapPin,
  IconPhone,
  IconShip,
  IconUsers,
} from "@tabler/icons-react"
import { Search } from "lucide-react"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { StatusChip } from "@/components/ui/status-chip"
import CustomerContactForm from "@/components/forms/customer-contact-form"
import CustomerLocationForm from "@/components/forms/customer-location-form"
import CustomerShipperForm from "@/components/forms/customer-shipper-form"
import { MasterDataWriteGate } from "@/components/write-gates"
import { glassInset, tableSearchInput } from "@/lib/design"
import { cn, formatDate, getInitialContactName } from "@/lib/utils"
import { toWhatsAppUrl } from "@/lib/whatsapp"

export type NetworkContact = {
  id: string
  contactName: string
  phoneNumber: string
  email: string
  isActive: boolean
}

export type NetworkLocation = {
  id: string
  addressLine1: string
  addressLine2: string
  addressLine3: string
  city: string
  province: string
  country: string
  postalCode: string
  customerContacts: NetworkContact[]
  updatedAt: string
  updatedBy?: { name: string }
}

export type NetworkShipper = {
  id: string
  name: string
  phoneNumber: string
  country: string
  isActive: boolean
  customerLocations: NetworkLocation[]
  updatedAt: string
  updatedBy: string
}

function formatAddress(location: NetworkLocation) {
  return [
    location.addressLine2,
    location.addressLine3,
    location.city,
    location.province,
    location.country,
    location.postalCode,
  ]
    .filter((part) => part && part.trim() !== "")
    .join(", ")
}

function locationContactCount(location: NetworkLocation) {
  return Array.isArray(location.customerContacts) ? location.customerContacts.length : 0
}

function shipperLocationCount(shipper: NetworkShipper) {
  return Array.isArray(shipper.customerLocations) ? shipper.customerLocations.length : 0
}

function shipperContactCount(shipper: NetworkShipper) {
  const locations = Array.isArray(shipper.customerLocations) ? shipper.customerLocations : []
  return locations.reduce((total, location) => total + locationContactCount(location), 0)
}

function shipperMatchesQuery(shipper: NetworkShipper, query: string) {
  const parts: string[] = [shipper.name, shipper.phoneNumber ?? "", shipper.country ?? ""]

  for (const location of shipper.customerLocations ?? []) {
    parts.push(
      location.addressLine1,
      location.addressLine2 ?? "",
      location.addressLine3 ?? "",
      location.city,
      location.province,
      location.country,
      location.postalCode ?? ""
    )
    for (const contact of location.customerContacts ?? []) {
      parts.push(contact.contactName, contact.email ?? "", contact.phoneNumber ?? "")
    }
  }

  return parts.join(" ").toLowerCase().includes(query)
}

function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: {
  icon: React.ComponentType<{ className?: string }>
  title: string
  description: string
  action?: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 px-6 py-12 text-center",
        className
      )}
    >
      <div className="flex size-12 items-center justify-center rounded-md bg-[rgba(214,227,255,0.45)] text-[var(--mli-primary-container)]">
        <Icon className="size-6" />
      </div>
      <div className="space-y-1">
        <p className="font-semibold text-foreground">{title}</p>
        <p className="max-w-sm text-sm text-muted-foreground">{description}</p>
      </div>
      {action ? <div className="pt-1">{action}</div> : null}
    </div>
  )
}

function openDialogAfterMenu(open: () => void) {
  // Dropdown dismiss fires an outside-interact that can close dialogs
  // if we open them in the same tick — defer until the menu has fully closed.
  window.setTimeout(open, 50)
}

function CountPill({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-md bg-[rgba(214,227,255,0.4)] px-2.5 py-1 text-xs font-medium text-[var(--mli-primary-container)]">
      {children}
    </span>
  )
}

function ContactRow({
  contact,
  customerId,
  shipperId,
  locationId,
}: {
  contact: NetworkContact
  customerId: string
  shipperId: string
  locationId: string
}) {
  const whatsappUrl = toWhatsAppUrl(contact.phoneNumber)

  return (
    <li className="flex flex-col gap-3 border-b border-[rgba(214,227,255,0.3)] py-3.5 last:border-b-0 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 items-center gap-3">
        <Avatar>
          <AvatarFallback className="bg-secondary text-secondary-foreground">
            {getInitialContactName(contact.contactName)}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-semibold">{contact.contactName}</p>
            {!contact.isActive ? <StatusChip active={false} /> : null}
          </div>
          <div className="flex flex-col gap-0.5 text-xs text-muted-foreground sm:flex-row sm:flex-wrap sm:gap-x-3">
            <span className="inline-flex items-center gap-1.5">
              <IconMail className="size-3.5 shrink-0" />
              {contact.email === "" ? "No email" : contact.email}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <IconPhone className="size-3.5 shrink-0" />
              {contact.phoneNumber === "" ? "No phone" : contact.phoneNumber}
            </span>
          </div>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2 self-end sm:self-center">
        {whatsappUrl ? (
          <Button variant="outline" size="icon-sm" asChild>
            <Link
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`WhatsApp ${contact.contactName}`}
            >
              <IconBrandWhatsapp className="text-[#25D366]" />
            </Link>
          </Button>
        ) : null}
        <MasterDataWriteGate>
          <CustomerContactForm
            mode="edit"
            id={contact.id}
            contactName={contact.contactName}
            customerId={customerId}
            shipperId={shipperId}
            phoneNumber={contact.phoneNumber}
            email={contact.email}
            isActive={contact.isActive}
            locationId={locationId}
          />
        </MasterDataWriteGate>
      </div>
    </li>
  )
}

function LocationSection({
  location,
  customerId,
  shipperId,
}: {
  location: NetworkLocation
  customerId: string
  shipperId: string
}) {
  const contacts = Array.isArray(location.customerContacts) ? location.customerContacts : []
  const secondaryAddress = formatAddress(location)
  const [menuOpen, setMenuOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)

  return (
    <section className="space-y-4 border-t border-[rgba(214,227,255,0.35)] pt-6 first:border-t-0 first:pt-0">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 space-y-1">
          <div className="flex items-center gap-2">
            <IconMapPin className="size-4 shrink-0 text-[var(--mli-primary-container)]" />
            <h4 className="text-base font-semibold tracking-tight">{location.addressLine1}</h4>
          </div>
          {secondaryAddress ? (
            <p className="pl-6 text-sm text-muted-foreground">{secondaryAddress}</p>
          ) : null}
          <p className="pl-6 text-xs text-muted-foreground">
            Updated {formatDate(location.updatedAt)} by {location.updatedBy?.name ?? "Unknown"}
          </p>
        </div>

        <MasterDataWriteGate>
          <div className="flex shrink-0 items-center gap-2 self-end sm:self-start">
            <CustomerContactForm
              mode="create"
              contactName={undefined}
              customerId={customerId}
              shipperId={shipperId}
              phoneNumber={undefined}
              email={undefined}
              isActive={undefined}
              locationId={location.id}
            />
            <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon-sm" aria-label="Location actions">
                  <IconDotsVertical className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onSelect={() => {
                    setMenuOpen(false)
                    openDialogAfterMenu(() => setEditOpen(true))
                  }}
                >
                  Edit location
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  variant="destructive"
                  onSelect={() => {
                    setMenuOpen(false)
                    openDialogAfterMenu(() => setDeleteOpen(true))
                  }}
                >
                  Delete location
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <CustomerLocationForm
              mode="edit"
              id={location.id}
              customerId={customerId}
              shipperId={shipperId}
              addressLine1={location.addressLine1}
              addressLine2={location.addressLine2}
              addressLine3={location.addressLine3}
              city={location.city}
              province={location.province}
              country={location.country}
              postalCode={location.postalCode}
              trigger={null}
              hideDeleteTrigger
              open={editOpen}
              onOpenChange={setEditOpen}
              deleteOpen={deleteOpen}
              onDeleteOpenChange={setDeleteOpen}
            />
          </div>
        </MasterDataWriteGate>
      </div>

      <div>
        <div className="mb-1 flex items-center gap-2">
          <IconUsers className="size-4 text-[var(--mli-primary-container)]" />
          <p className="text-xs font-semibold tracking-[0.05em] text-muted-foreground uppercase">
            Contacts · {contacts.length}
          </p>
        </div>

        {contacts.length === 0 ? (
          <EmptyState
            icon={IconUsers}
            title="No contacts yet"
            description="Add someone at this location so your team knows who to call."
            className="rounded-md bg-[rgba(232,238,246,0.45)] py-10"
            action={
              <MasterDataWriteGate>
                <CustomerContactForm
                  mode="create"
                  contactName={undefined}
                  customerId={customerId}
                  shipperId={shipperId}
                  phoneNumber={undefined}
                  email={undefined}
                  isActive={undefined}
                  locationId={location.id}
                />
              </MasterDataWriteGate>
            }
          />
        ) : (
          <ul className="divide-y-0">
            {contacts.map((contact) => (
              <ContactRow
                key={contact.id}
                contact={contact}
                customerId={customerId}
                shipperId={shipperId}
                locationId={location.id}
              />
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}

function ShipperRailItem({
  shipper,
  selected,
  onSelect,
}: {
  shipper: NetworkShipper
  selected: boolean
  onSelect: () => void
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "w-full rounded-md border px-3.5 py-3 text-left transition-[border-color,background-color,box-shadow] duration-200",
        selected
          ? "border-[rgba(27,54,93,0.35)] bg-[var(--mli-primary-container)] text-primary-foreground shadow-[0_8px_24px_rgba(27,54,93,0.18)]"
          : "border-transparent bg-transparent hover:border-[rgba(214,227,255,0.55)] hover:bg-[rgba(247,249,251,0.7)]"
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <p className={cn("truncate text-sm font-semibold", selected && "text-primary-foreground")}>
          {shipper.name}
        </p>
        {selected ? null : <StatusChip active={Boolean(shipper.isActive)} className="shrink-0" />}
        {selected ? (
          <span
            className={cn(
              "inline-flex shrink-0 items-center rounded-md px-2 py-0.5 text-[10px] font-semibold tracking-[0.05em] uppercase",
              shipper.isActive
                ? "bg-[rgba(255,255,255,0.18)] text-primary-foreground"
                : "bg-[rgba(0,0,0,0.2)] text-primary-foreground/90"
            )}
          >
            {shipper.isActive ? "Active" : "Inactive"}
          </span>
        ) : null}
      </div>
      <p
        className={cn(
          "mt-1 truncate text-xs",
          selected ? "text-primary-foreground/75" : "text-muted-foreground"
        )}
      >
        {shipper.country || "No country"}
        {" · "}
        {shipperLocationCount(shipper)} loc
        {" · "}
        {shipperContactCount(shipper)} contacts
      </p>
    </button>
  )
}

function ShipperDetail({
  shipper,
  customerId,
  onBack,
}: {
  shipper: NetworkShipper
  customerId: string
  onBack?: () => void
}) {
  const locations = Array.isArray(shipper.customerLocations) ? shipper.customerLocations : []
  const [menuOpen, setMenuOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)

  return (
    <div className="min-w-0 space-y-6">
      {onBack ? (
        <Button
          type="button"
          variant="ghost"
          className="-ml-2 text-muted-foreground lg:hidden"
          onClick={onBack}
        >
          <IconArrowLeft className="size-4" />
          All shippers
        </Button>
      ) : null}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-md bg-[rgba(214,227,255,0.55)] text-[var(--mli-primary-container)]">
            <IconShip className="size-5" />
          </div>
          <div className="min-w-0 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-xl font-semibold tracking-tight">{shipper.name}</h3>
              <StatusChip active={Boolean(shipper.isActive)} />
            </div>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
              {shipper.country ? (
                <span className="inline-flex items-center gap-1.5">
                  <IconMapPin className="size-3.5" />
                  {shipper.country}
                </span>
              ) : null}
              {shipper.phoneNumber ? (
                <span className="inline-flex items-center gap-1.5">
                  <IconPhone className="size-3.5" />
                  {shipper.phoneNumber}
                </span>
              ) : null}
              <span>
                {locations.length} location{locations.length === 1 ? "" : "s"}
                {" · "}
                {shipperContactCount(shipper)} contact
                {shipperContactCount(shipper) === 1 ? "" : "s"}
              </span>
            </div>
          </div>
        </div>

        <MasterDataWriteGate>
          <div className="flex shrink-0 items-center gap-2">
            <CustomerLocationForm
              mode="create"
              id={undefined}
              customerId={customerId}
              shipperId={shipper.id}
              addressLine1={undefined}
              addressLine2={undefined}
              addressLine3={undefined}
              city={undefined}
              province={undefined}
              country={undefined}
              postalCode={undefined}
            />
            <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon-sm" aria-label="Shipper actions">
                  <IconDotsVertical className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onSelect={() => {
                    setMenuOpen(false)
                    openDialogAfterMenu(() => setEditOpen(true))
                  }}
                >
                  Edit shipper
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  variant="destructive"
                  onSelect={() => {
                    setMenuOpen(false)
                    openDialogAfterMenu(() => setDeleteOpen(true))
                  }}
                >
                  Delete shipper
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <CustomerShipperForm
              mode="edit"
              id={shipper.id}
              name={shipper.name}
              phoneNumber={shipper.phoneNumber}
              country={shipper.country}
              isActive={shipper.isActive}
              customerId={customerId}
              trigger={null}
              hideDeleteTrigger
              open={editOpen}
              onOpenChange={setEditOpen}
              deleteOpen={deleteOpen}
              onDeleteOpenChange={setDeleteOpen}
            />
          </div>
        </MasterDataWriteGate>
      </div>

      <div className="border-t border-[rgba(214,227,255,0.35)] pt-6">
        {locations.length === 0 ? (
          <EmptyState
            icon={IconMapPin}
            title="No locations"
            description="Add an office or warehouse address for this shipper."
            action={
              <MasterDataWriteGate>
                <CustomerLocationForm
                  mode="create"
                  id={undefined}
                  customerId={customerId}
                  shipperId={shipper.id}
                  addressLine1={undefined}
                  addressLine2={undefined}
                  addressLine3={undefined}
                  city={undefined}
                  province={undefined}
                  country={undefined}
                  postalCode={undefined}
                />
              </MasterDataWriteGate>
            }
          />
        ) : (
          <div className="space-y-8">
            {locations.map((location) => (
              <LocationSection
                key={location.id}
                location={location}
                customerId={customerId}
                shipperId={shipper.id}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export function CustomerNetworkPanel({
  customerId,
  shippers,
  totalLocations,
  totalContacts,
}: {
  customerId: string
  shippers: NetworkShipper[]
  totalLocations: number
  totalContacts: number
}) {
  const [shipperSearch, setShipperSearch] = useState("")
  const [selectedShipperId, setSelectedShipperId] = useState<string | null>(
    shippers[0]?.id ?? null
  )
  const [networkView, setNetworkView] = useState<"list" | "detail">("list")

  const filteredShippers = useMemo(() => {
    const q = shipperSearch.trim().toLowerCase()
    if (!q) return shippers
    return shippers.filter((shipper) => shipperMatchesQuery(shipper, q))
  }, [shippers, shipperSearch])

  useEffect(() => {
    if (filteredShippers.length === 0) {
      setSelectedShipperId(null)
      return
    }

    setSelectedShipperId((current) => {
      if (current && filteredShippers.some((shipper) => shipper.id === current)) {
        return current
      }
      return filteredShippers[0].id
    })
  }, [filteredShippers])

  const selectedShipper =
    filteredShippers.find((shipper) => shipper.id === selectedShipperId) ?? null

  const selectShipper = (shipperId: string) => {
    setSelectedShipperId(shipperId)
    setNetworkView("detail")
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 space-y-1">
          <h2 className="text-headline-md font-semibold tracking-tight">Shipper network</h2>
          <p className="max-w-2xl text-sm text-muted-foreground">
            Select a shipper to manage its locations and contacts.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <CountPill>
            {shippers.length} shipper{shippers.length === 1 ? "" : "s"}
          </CountPill>
          <CountPill>
            {totalLocations} location{totalLocations === 1 ? "" : "s"}
          </CountPill>
          <CountPill>
            {totalContacts} contact{totalContacts === 1 ? "" : "s"}
          </CountPill>
        </div>
      </div>

      {shippers.length === 0 ? (
        <div className="space-y-4">
          <EmptyState
            icon={IconShip}
            title="No shippers yet"
            description="Add a shipper to start organizing locations and contacts for this customer."
            className={cn(glassInset, "py-14")}
            action={
              <MasterDataWriteGate>
                <CustomerShipperForm
                  mode="create"
                  id={undefined}
                  name={undefined}
                  phoneNumber={undefined}
                  country={undefined}
                  isActive={undefined}
                  customerId={customerId}
                />
              </MasterDataWriteGate>
            }
          />
        </div>
      ) : (
        <div className="grid gap-5 lg:grid-cols-[minmax(240px,300px)_minmax(0,1fr)] lg:items-start">
          <aside
            className={cn(
              glassInset,
              "flex flex-col gap-4 p-4",
              networkView === "detail" && "hidden lg:flex"
            )}
          >
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs font-semibold tracking-[0.05em] text-muted-foreground uppercase">
                Shippers
              </p>
              <MasterDataWriteGate>
                <CustomerShipperForm
                  mode="create"
                  id={undefined}
                  name={undefined}
                  phoneNumber={undefined}
                  country={undefined}
                  isActive={undefined}
                  customerId={customerId}
                />
              </MasterDataWriteGate>
            </div>

            <div className="relative">
              <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search shippers, places, people…"
                className={cn(tableSearchInput, "h-10 max-w-none pl-10 text-sm")}
                value={shipperSearch}
                onChange={(e) => setShipperSearch(e.target.value)}
              />
            </div>

            {filteredShippers.length === 0 ? (
              <EmptyState
                icon={Search}
                title="No matches"
                description={`Nothing matched “${shipperSearch.trim()}”.`}
                className="px-4 py-10"
              />
            ) : (
              <div className="flex max-h-[min(70vh,560px)] flex-col gap-1.5 overflow-y-auto pr-0.5">
                {filteredShippers.map((shipper) => (
                  <ShipperRailItem
                    key={shipper.id}
                    shipper={shipper}
                    selected={shipper.id === selectedShipperId}
                    onSelect={() => selectShipper(shipper.id)}
                  />
                ))}
              </div>
            )}
          </aside>

          <div
            className={cn(
              glassInset,
              "min-w-0 p-5 lg:p-6",
              networkView === "list" && "hidden lg:block"
            )}
          >
            {selectedShipper ? (
              <ShipperDetail
                shipper={selectedShipper}
                customerId={customerId}
                onBack={() => setNetworkView("list")}
              />
            ) : (
              <EmptyState
                icon={IconShip}
                title="Select a shipper"
                description="Choose a shipper from the list to view locations and contacts."
              />
            )}
          </div>
        </div>
      )}
    </div>
  )
}
