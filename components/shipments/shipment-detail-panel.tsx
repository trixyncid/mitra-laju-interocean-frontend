"use client"

import { useState, type ReactNode } from "react"
import Link from "next/link"
import {
  IconArrowUpRight,
  IconBox,
  IconEye,
  IconFile,
  IconRoute,
  IconShip,
  IconTags,
  IconX,
} from "@tabler/icons-react"
import { toast } from "sonner"

import { dayMonth, shortDate } from "@/components/shipments/shipment-format"
import { CopyButton } from "@/components/ui/copy-button"
import { ShipmentDeleteButton } from "@/components/shipments/shipment-delete-button"
import CreateSellingInvoiceForm from "@/components/forms/create-selling-invoice-form"
import DocumentUploadForm from "@/components/forms/document-upload-form"
import ShipmentContainerForm from "@/components/forms/shipment-container-form"
import ShipmentOperationalForm from "@/components/forms/shipment-operational-form"
import { PermissionGate } from "@/components/permission-gate"
import { Button } from "@/components/ui/button"
import { ShipmentStatusControl } from "@/components/ui/shipment-status-control"
import { ShipmentTypeTag } from "@/components/ui/shipment-type-tag"
import { Skeleton } from "@/components/ui/skeleton"
import { SellingStatusChip, ShipmentLifecycleChip } from "@/components/ui/status-chip"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { usePermissions } from "@/hooks/use-permissions"
import { useShipmentById, useUpdateShipment } from "@/hooks/use-shipments"
import { glassTabsTrigger } from "@/lib/design"
import { LEGACY_INVOICE_SCREENS_ENABLED } from "@/lib/feature-flags"
import { shipmentReference, vesselLabel } from "@/lib/shipment-reference"
import type { ShipmentStatus } from "@/lib/shipment-status"
import type { ShipmentDetail, ShipmentOperationalContainer } from "@/lib/types/entity-details"
import { ShipmentServiceList } from "@/components/shipments/shipment-service-list"
import { cn, localDate } from "@/lib/utils"
import { shipmentsService } from "@/services/shipments.service"

function Field({
  label,
  value,
  copy,
  className,
}: {
  label: string
  value: ReactNode
  copy?: string | null
  className?: string
}) {
  const empty = value === null || value === undefined || value === ""
  return (
    <div className={cn("min-w-0", className)}>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 flex min-w-0 items-center gap-1 text-sm font-medium text-foreground">
        <span className={cn("min-w-0 break-words", empty && "font-normal text-muted-foreground")}>
          {empty ? "Not set" : value}
        </span>
        {copy ? <CopyButton value={copy} label={label} /> : null}
      </dd>
    </div>
  )
}

function Section({ title, action, children }: { title: string; action?: ReactNode; children: ReactNode }) {
  return (
    <section className="rounded-xl border border-border p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h3 className="text-sm font-medium text-foreground">{title}</h3>
        {action}
      </div>
      {children}
    </section>
  )
}

function EmptyNote({ icon: Icon, text, action }: { icon: typeof IconBox; text: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border px-4 py-8 text-center">
      <span className="flex size-10 items-center justify-center rounded-full bg-muted">
        <Icon className="size-5 text-muted-foreground" />
      </span>
      <p className="text-sm text-muted-foreground">{text}</p>
      {action}
    </div>
  )
}

/** Origin → vessel → destination, with the operational dates along the way. */
function RouteTimeline({ op }: { op: NonNullable<ShipmentDetail["shipmentOperational"]> }) {
  const stops = [
    { label: "Loading in", date: dayMonth(op.loadingInAt), place: op.portDeparture?.portName, sub: op.portDeparture?.portCountry },
    { label: "Loading out", date: dayMonth(op.loadingOutAt), place: vesselLabel(op.vessel) ?? undefined, sub: "Vessel" },
    { label: "ETA", date: dayMonth(op.eta), place: op.portDestination?.portName, sub: op.portDestination?.portCountry },
  ]
  return (
    <ol className="grid grid-cols-3 gap-2">
      {stops.map((stop, index) => (
        <li key={stop.label} className="relative min-w-0">
          <div className="mb-2 flex items-center">
            <span
              className={cn(
                "relative z-10 size-3 shrink-0 rounded-full",
                stop.date ? "bg-primary ring-4 ring-primary/15" : "border-2 border-input bg-card"
              )}
            />
            {index < stops.length - 1 ? (
              <span className="ml-1 flex-1 border-t-2 border-dashed border-primary/30" />
            ) : null}
          </div>
          <p className="text-[11px] text-muted-foreground">
            {stop.label} · <span className="font-medium text-foreground/80">{stop.date ?? "—"}</span>
          </p>
          <p className="truncate text-sm font-semibold text-foreground" title={stop.place ?? undefined}>
            {stop.place ?? "Not set"}
          </p>
          <p className="truncate text-xs text-muted-foreground">{stop.sub ?? "—"}</p>
        </li>
      ))}
    </ol>
  )
}

function PanelSkeleton() {
  return (
    <div className="space-y-5 p-6">
      <div className="flex items-center gap-3">
        <Skeleton className="size-12 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-5 w-40 rounded-full" />
          <Skeleton className="h-4 w-56 rounded-full" />
        </div>
      </div>
      <Skeleton className="h-28 rounded-xl" />
      <Skeleton className="h-10 w-80 rounded-full" />
      <Skeleton className="h-64 rounded-xl" />
    </div>
  )
}

export function ShipmentDetailPanel({
  shipmentId,
  onClose,
  onDeleted,
  className,
}: {
  shipmentId: string
  onClose?: () => void
  onDeleted?: () => void
  className?: string
}) {
  const { data, isLoading, error } = useShipmentById(shipmentId)
  const updateShipment = useUpdateShipment()
  const { canWrite, canWriteShipmentType } = usePermissions()
  const [tab, setTab] = useState("overview")

  if (isLoading) return <div className={className}><PanelSkeleton /></div>
  if (error || !data) {
    return (
      <div className={cn("flex flex-col items-center justify-center gap-3 p-10 text-center", className)}>
        <p className="text-sm text-muted-foreground">
          {error?.message ?? "This shipment could not be loaded."}
        </p>
        {onClose ? <Button variant="outline" onClick={onClose}>Close</Button> : null}
      </div>
    )
  }

  const op = data.shipmentOperational
  const containers: ShipmentOperationalContainer[] = op?.shipmentOperationalContainers ?? []
  const attachments = data.shipmentOperationalAttachments ?? []
  const sellings = data.sellings ?? []
  const canEdit = op?.shipmentType ? canWriteShipmentType(op.shipmentType) : canWrite("shipments")

  const operationalForm = (mode: "create" | "edit") =>
    mode === "edit" && op ? (
      <ShipmentOperationalForm
        mode="edit"
        id={op.id}
        shipmentId={data.id}
        status={data.status}
        isActive={data.isActive}
        shipmentType={op.shipmentType}
        portDepartureId={op.portDepartureId ?? undefined}
        portDestinationId={op.portDestinationId ?? undefined}
        loadingLocationId={op.loadingLocationId ?? undefined}
        unloadingLocationId={op.unloadingLocationId ?? undefined}
        blNumber={op.blNumber ?? undefined}
        bookingNumber={op.bookingNumber ?? undefined}
        services={op.services}
        remarks={op.remarks ?? undefined}
        customerCodeId={data.customerCodeId}
        customerShipperId={data.customerShipperId}
        vesselId={op.vesselId}
        eta={op.eta ?? undefined}
        loadingInAt={op.loadingInAt ?? undefined}
        loadingOutAt={op.loadingOutAt ?? undefined}
      />
    ) : (
      <ShipmentOperationalForm
        mode="create"
        id={undefined}
        shipmentId={data.id}
        shipmentType={undefined}
        portDepartureId={undefined}
        portDestinationId={undefined}
        loadingLocationId={undefined}
        unloadingLocationId={undefined}
        blNumber={undefined}
        bookingNumber={undefined}
        remarks={undefined}
        customerCodeId={data.customerCodeId}
        customerShipperId={data.customerShipperId}
        vesselId={undefined}
        eta={undefined}
        loadingInAt={undefined}
        loadingOutAt={undefined}
      />
    )

  const addContainer = op ? (
    <PermissionGate resource="shipments" write shipmentType={op.shipmentType}>
      <ShipmentContainerForm
        mode="create"
        containerNumber={undefined}
        sealNumber={undefined}
        containerSizeId={undefined}
        containerTypeId={undefined}
        shipmentOperationalId={op.id}
        shipmentId={data.id}
        id={undefined}
      />
    </PermissionGate>
  ) : null

  const uploadDocument = op ? (
    <PermissionGate resource="shipments" write shipmentType={op.shipmentType}>
      <DocumentUploadForm mode="create" shipmentId={data.id} id={undefined} attachmentName={undefined} document={undefined} />
    </PermissionGate>
  ) : null

  return (
    <div className={cn("flex min-h-0 flex-col", className)}>
      {/* Header */}
      <header className="border-b border-border p-5 sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl brand-fill">
              <IconShip className="size-6" />
            </span>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="truncate text-xl font-semibold tracking-[-0.02em] text-foreground">
                  {shipmentReference(data)}
                </h2>
                {op?.shipmentType ? <ShipmentTypeTag type={op.shipmentType} /> : null}
              </div>
              <p className="truncate text-sm text-muted-foreground">
                {data.customerCode.customerCode}
                {data.customerShipper?.name ? ` · ${data.customerShipper.name}` : ""}
              </p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <Button asChild variant="ghost" size="icon" aria-label="Open full page" title="Open full page">
              <Link href={`/dashboard/shipments/${data.id}`}>
                <IconArrowUpRight />
              </Link>
            </Button>
            {canEdit ? (
              <ShipmentDeleteButton shipmentId={data.id} onDeleted={onDeleted} />
            ) : null}
            {onClose ? (
              <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close details">
                <IconX />
              </Button>
            ) : null}
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          {canEdit ? (
            <div className="w-40">
              <ShipmentStatusControl
                value={data.status}
                disabled={updateShipment.isPending}
                onValueChange={(status: ShipmentStatus) =>
                  updateShipment.mutate({ id: data.id, shipment: { status } })
                }
              />
            </div>
          ) : (
            <ShipmentLifecycleChip status={data.status} />
          )}
          {canEdit && op ? operationalForm("edit") : null}
          {op ? (
            <p className="ml-auto text-xs text-muted-foreground">
              Updated {localDate(op.updatedAt)} by {op.updatedBy.name}
            </p>
          ) : null}
        </div>
      </header>

      {!op ? (
        <div className="p-6">
          <EmptyNote
            icon={IconRoute}
            text="Operational details haven't been set up. Add the route, vessel and booking to start tracking this shipment."
            action={canEdit ? operationalForm("create") : null}
          />
        </div>
      ) : (
        <div className="min-h-0 flex-1 space-y-5 overflow-y-auto p-5 sm:p-6">
          <div className="rounded-xl bg-muted/70 p-4">
            <RouteTimeline op={op} />
          </div>

          <Tabs value={tab} onValueChange={setTab} className="gap-4">
            <TabsList className="scrollbar-none h-10 w-full justify-start overflow-x-auto sm:w-fit">
              <TabsTrigger value="overview" className={glassTabsTrigger}>Overview</TabsTrigger>
              <TabsTrigger value="containers" className={glassTabsTrigger}>
                Containers <span className="tabular-nums opacity-70">{containers.length}</span>
              </TabsTrigger>
              <TabsTrigger value="documents" className={glassTabsTrigger}>
                Documents <span className="tabular-nums opacity-70">{attachments.length}</span>
              </TabsTrigger>
              {LEGACY_INVOICE_SCREENS_ENABLED ? (
                <TabsTrigger value="invoices" className={glassTabsTrigger}>
                  Invoices <span className="tabular-nums opacity-70">{sellings.length}</span>
                </TabsTrigger>
              ) : null}
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <Section title="References">
                <dl className="grid gap-4 sm:grid-cols-2">
                  <Field label="Booking number" value={op.bookingNumber} copy={op.bookingNumber} />
                  <Field label="BL number" value={op.blNumber} copy={op.blNumber} />
                  <Field
                    label="Vessel / Voyage"
                    value={vesselLabel(op.vessel)}
                  />
                  <Field label="Shipment type" value={op.shipmentType ? <ShipmentTypeTag type={op.shipmentType} /> : null} />
                </dl>
              </Section>
              <Section title="Parties & bookings">
                <dl className="grid gap-4 sm:grid-cols-2">
                  <Field
                    label="Customer"
                    value={`${data.customerCode.customerName} (${data.customerCode.customerCode})`}
                  />
                  <Field label="Shipper" value={data.customerShipper?.name} />
                  <div className="min-w-0 sm:col-span-2">
                    <dt className="text-xs text-muted-foreground">Services</dt>
                    <dd className="mt-1 text-sm">
                      {op.services?.length ? (
                        <ShipmentServiceList lines={op.services} />
                      ) : (
                        <span className="text-muted-foreground">Not set</span>
                      )}
                    </dd>
                  </div>
                </dl>
              </Section>
              <Section title="Route & dates">
                <dl className="grid gap-4 sm:grid-cols-2">
                  <Field
                    label="Origin port"
                    value={op.portDeparture ? `${op.portDeparture.portName} (${op.portDeparture.portCountry})` : null}
                  />
                  <Field
                    label="Destination port"
                    value={op.portDestination ? `${op.portDestination.portName} (${op.portDestination.portCountry})` : null}
                  />
                  <Field label="Loading in" value={shortDate(op.loadingInAt)} />
                  <Field label="Loading out" value={shortDate(op.loadingOutAt)} />
                  <Field label="ETA" value={shortDate(op.eta)} />
                </dl>
              </Section>
              <Section title="Remarks">
                <p className={cn("whitespace-pre-wrap text-sm", op.remarks ? "text-foreground" : "text-muted-foreground")}>
                  {op.remarks || "No remarks."}
                </p>
              </Section>
            </TabsContent>

            <TabsContent value="containers" className="space-y-3">
              {containers.length === 0 ? (
                <EmptyNote icon={IconBox} text="No containers assigned yet." action={addContainer} />
              ) : (
                <>
                  <div className="flex justify-end">{addContainer}</div>
                  <ul className="space-y-2">
                    {containers.map((container) => (
                      <li
                        key={container.id}
                        className="flex items-center gap-3 rounded-xl border border-border p-3"
                      >
                        <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
                          <IconBox className="size-5" />
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1">
                            <p className="truncate font-mono text-sm font-medium text-foreground">
                              {container.containerNumber || "No number"}
                            </p>
                            {container.containerNumber ? (
                              <CopyButton value={container.containerNumber} label="Container number" />
                            ) : null}
                          </div>
                          <p className="truncate text-xs text-muted-foreground">
                            Seal {container.sealNumber || "—"} ·{" "}
                            {[container.containerSize?.name && `${container.containerSize.name}'`, container.containerType?.name]
                              .filter(Boolean)
                              .join(" ") || "Size/type not set"}
                          </p>
                        </div>
                        <PermissionGate resource="shipments" write shipmentType={op.shipmentType}>
                          <ShipmentContainerForm
                            mode="edit"
                            containerNumber={container.containerNumber ?? undefined}
                            sealNumber={container.sealNumber ?? undefined}
                            containerSizeId={container.containerSizeId ?? container.containerSize?.id}
                            containerTypeId={container.containerTypeId ?? container.containerType?.id}
                            shipmentOperationalId={op.id}
                            shipmentId={data.id}
                            id={container.id}
                          />
                        </PermissionGate>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </TabsContent>

            <TabsContent value="documents" className="space-y-3">
              {attachments.length === 0 ? (
                <EmptyNote icon={IconFile} text="No documents uploaded yet." action={uploadDocument} />
              ) : (
                <>
                  <div className="flex justify-end">{uploadDocument}</div>
                  <ul className="space-y-2">
                    {attachments.map((attachment) => (
                      <li key={attachment.id} className="flex items-center gap-3 rounded-xl border border-border p-3">
                        <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted">
                          <IconFile className="size-5 text-muted-foreground" />
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-foreground">{attachment.attachmentName}</p>
                          <p className="truncate text-xs text-muted-foreground">
                            {attachment.fileName} · {localDate(attachment.updatedAt)} by {attachment.updatedBy.name}
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          size="icon"
                          aria-label={`View ${attachment.attachmentName}`}
                          onClick={() => {
                            void shipmentsService
                              .viewShipmentOperationalAttachment(data.id, attachment.id!)
                              .catch((err: unknown) => {
                                toast.error(err instanceof Error ? err.message : "Unable to open attachment")
                              })
                          }}
                        >
                          <IconEye className="size-4" />
                        </Button>
                        <PermissionGate resource="shipments" write shipmentType={op.shipmentType}>
                          <DocumentUploadForm
                            mode="edit"
                            shipmentId={data.id}
                            id={attachment.id}
                            attachmentName={attachment.attachmentName}
                            document={undefined}
                          />
                        </PermissionGate>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </TabsContent>

            {LEGACY_INVOICE_SCREENS_ENABLED ? (
              <TabsContent value="invoices" className="space-y-3">
                {sellings.length === 0 ? (
                  <EmptyNote
                    icon={IconTags}
                    text="No customer invoices for this shipment."
                    action={
                      <PermissionGate resource="sellings" write>
                        <CreateSellingInvoiceForm shipmentId={data.id} />
                      </PermissionGate>
                    }
                  />
                ) : (
                  <>
                    <div className="flex justify-end">
                      <PermissionGate resource="sellings" write>
                        <CreateSellingInvoiceForm shipmentId={data.id} />
                      </PermissionGate>
                    </div>
                    <ul className="space-y-2">
                      {sellings.map((selling) => (
                        <li key={selling.id}>
                          <Link
                            href={`/dashboard/sellings/${selling.id}`}
                            className="flex items-center gap-3 rounded-xl border border-border p-3 transition-colors hover:bg-muted/60"
                          >
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-medium text-foreground">{selling.sellingNumber}</p>
                              <p className="truncate text-xs text-muted-foreground">
                                {selling.invoiceDate ? localDate(selling.invoiceDate) : "No invoice date"}
                                {selling.remarks?.trim() ? ` · ${selling.remarks.trim()}` : ""}
                              </p>
                            </div>
                            <SellingStatusChip status={selling.status} />
                            <IconArrowUpRight className="size-4 text-muted-foreground" />
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </TabsContent>
            ) : null}
          </Tabs>
        </div>
      )}
    </div>
  )
}
