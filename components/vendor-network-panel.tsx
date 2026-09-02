"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import {
  IconBrandWhatsapp,
  IconDotsVertical,
  IconMail,
  IconMapPin,
  IconPhone,
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
import VendorContactForm from "@/components/forms/vendor-contact-form"
import VendorLocationForm from "@/components/forms/vendor-location-form"
import { MasterDataWriteGate } from "@/components/write-gates"
import { glassInset, tableSearchInput } from "@/lib/design"
import { cn, localDate, getInitialContactName } from "@/lib/utils"
import { toWhatsAppUrl } from "@/lib/whatsapp"

export type VendorNetworkContact = {
  id: string
  contactName: string
  phoneNumber: string
  email: string
  isActive: boolean
}

export type VendorNetworkLocation = {
  id: string
  addressLine1: string
  addressLine2: string
  addressLine3: string
  city: string
  province: string
  country: string
  postalCode: string
  vendorContacts: VendorNetworkContact[]
  updatedAt: string
  updatedBy?: { name: string }
}

function formatAddress(location: VendorNetworkLocation) {
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

function locationContactCount(location: VendorNetworkLocation) {
  return Array.isArray(location.vendorContacts) ? location.vendorContacts.length : 0
}

function locationMatchesQuery(location: VendorNetworkLocation, query: string) {
  const parts: string[] = [
    location.addressLine1,
    location.addressLine2 ?? "",
    location.addressLine3 ?? "",
    location.city,
    location.province,
    location.country,
    location.postalCode ?? "",
  ]

  for (const contact of location.vendorContacts ?? []) {
    parts.push(contact.contactName, contact.email ?? "", contact.phoneNumber ?? "")
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
  vendorId,
  locationId,
}: {
  contact: VendorNetworkContact
  vendorId: string
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
          <VendorContactForm
            mode="edit"
            id={contact.id}
            contactName={contact.contactName}
            phoneNumber={contact.phoneNumber}
            email={contact.email}
            isActive={contact.isActive}
            vendorId={vendorId}
            locationId={locationId}
          />
        </MasterDataWriteGate>
      </div>
    </li>
  )
}

function LocationCard({
  location,
  vendorId,
}: {
  location: VendorNetworkLocation
  vendorId: string
}) {
  const contacts = Array.isArray(location.vendorContacts) ? location.vendorContacts : []
  const secondaryAddress = formatAddress(location)
  const [menuOpen, setMenuOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)

  return (
    <article className={cn(glassInset, "space-y-5 p-5 lg:p-6")}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 space-y-1">
          <div className="flex items-center gap-2">
            <IconMapPin className="size-4 shrink-0 text-[var(--mli-primary-container)]" />
            <h3 className="text-base font-semibold tracking-tight">{location.addressLine1}</h3>
          </div>
          {secondaryAddress ? (
            <p className="pl-6 text-sm text-muted-foreground">{secondaryAddress}</p>
          ) : null}
          <p className="pl-6 text-xs text-muted-foreground">
            Updated {localDate(location.updatedAt)} by {location.updatedBy?.name ?? "Unknown"}
          </p>
        </div>

        <MasterDataWriteGate>
          <div className="flex shrink-0 items-center gap-2 self-end sm:self-start">
            <VendorContactForm
              mode="create"
              contactName={undefined}
              phoneNumber={undefined}
              email={undefined}
              isActive={undefined}
              vendorId={vendorId}
              locationId={location.id}
            />
            <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon-sm" aria-label="Office actions">
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
                  Edit office
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  variant="destructive"
                  onSelect={() => {
                    setMenuOpen(false)
                    openDialogAfterMenu(() => setDeleteOpen(true))
                  }}
                >
                  Delete office
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <VendorLocationForm
              mode="edit"
              id={location.id}
              addressLine1={location.addressLine1}
              addressLine2={location.addressLine2}
              addressLine3={location.addressLine3}
              city={location.city}
              province={location.province}
              country={location.country}
              postalCode={location.postalCode}
              vendorId={vendorId}
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
            description="Add someone at this office so your team knows who to call."
            className="rounded-md bg-[rgba(232,238,246,0.45)] py-10"
            action={
              <MasterDataWriteGate>
                <VendorContactForm
                  mode="create"
                  contactName={undefined}
                  phoneNumber={undefined}
                  email={undefined}
                  isActive={undefined}
                  vendorId={vendorId}
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
                vendorId={vendorId}
                locationId={location.id}
              />
            ))}
          </ul>
        )}
      </div>
    </article>
  )
}

export function VendorNetworkPanel({
  vendorId,
  locations,
  totalContacts,
}: {
  vendorId: string
  locations: VendorNetworkLocation[]
  totalContacts: number
}) {
  const [locationSearch, setLocationSearch] = useState("")

  const filteredLocations = useMemo(() => {
    const q = locationSearch.trim().toLowerCase()
    if (!q) return locations
    return locations.filter((location) => locationMatchesQuery(location, q))
  }, [locations, locationSearch])

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 space-y-1">
          <h2 className="text-headline-md font-semibold tracking-tight">Office network</h2>
          <p className="max-w-2xl text-sm text-muted-foreground">
            Manage vendor offices and the contacts at each location.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <CountPill>
            {locations.length} office{locations.length === 1 ? "" : "s"}
          </CountPill>
          <CountPill>
            {totalContacts} contact{totalContacts === 1 ? "" : "s"}
          </CountPill>
          <MasterDataWriteGate>
            <VendorLocationForm
              mode="create"
              id={undefined}
              addressLine1={undefined}
              addressLine2={undefined}
              addressLine3={undefined}
              city={undefined}
              province={undefined}
              country={undefined}
              postalCode={undefined}
              vendorId={vendorId}
            />
          </MasterDataWriteGate>
        </div>
      </div>

      {locations.length === 0 ? (
        <EmptyState
          icon={IconMapPin}
          title="No offices yet"
          description="Add an office address to start organizing contacts for this vendor."
          className={cn(glassInset, "py-14")}
          action={
            <MasterDataWriteGate>
              <VendorLocationForm
                mode="create"
                id={undefined}
                addressLine1={undefined}
                addressLine2={undefined}
                addressLine3={undefined}
                city={undefined}
                province={undefined}
                country={undefined}
                postalCode={undefined}
                vendorId={vendorId}
              />
            </MasterDataWriteGate>
          }
        />
      ) : (
        <div className="space-y-4">
          <div className="relative max-w-xl">
            <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search offices, places, people…"
              className={cn(tableSearchInput, "h-10 max-w-none pl-10 text-sm")}
              value={locationSearch}
              onChange={(e) => setLocationSearch(e.target.value)}
            />
          </div>

          {filteredLocations.length === 0 ? (
            <EmptyState
              icon={Search}
              title="No matches"
              description={`Nothing matched “${locationSearch.trim()}”.`}
              className={cn(glassInset, "py-10")}
            />
          ) : (
            <div className="space-y-4">
              {filteredLocations.map((location) => (
                <LocationCard
                  key={location.id}
                  location={location}
                  vendorId={vendorId}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {locations.length > 0 ? (
        <p className="text-xs text-muted-foreground">
          Showing {filteredLocations.length} of {locations.length} office
          {locations.length === 1 ? "" : "s"}
          {" · "}
          {filteredLocations.reduce((total, location) => total + locationContactCount(location), 0)}{" "}
          contacts in view
        </p>
      ) : null}
    </div>
  )
}
