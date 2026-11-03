"use client"

import { useMemo, type ReactNode } from "react"
import {
  IconAnchor,
  IconBuildingWarehouse,
  IconFileCertificate,
  IconPlane,
  IconShip,
  IconTool,
  IconTruck,
  IconTruckDelivery,
} from "@tabler/icons-react"

import type { Service } from "./columns"
import ServiceActionCell from "@/components/action-cell/service-action-cell"
import ServiceForm from "@/components/forms/service-form"
import ErrorPage from "@/components/error-page"
import {
  DashboardPage,
  DashboardPageCard,
  DashboardPageHeader,
} from "@/components/layout/dashboard-page"
import { DataTableToolbar } from "@/components/data-table-toolbar"
import { ReferenceEmpty } from "@/components/reference/reference-empty"
import { ReferencePager } from "@/components/reference/reference-pager"
import { Skeleton } from "@/components/ui/skeleton"
import { usePermissions } from "@/hooks/use-permissions"
import { usePersistedTableState } from "@/hooks/use-persisted-table-state"
import { useServices } from "@/hooks/use-services"
import { ACTIVE_STATUS_OPTIONS, type TableFilterConfig } from "@/lib/data-table-filters"
import { cn } from "@/lib/utils"

const serviceFilters: TableFilterConfig<Service> = {
  status: {
    id: "isActive",
    label: "Status",
    options: ACTIVE_STATUS_OPTIONS,
    getValue: (row) => row.isActive,
  },
}

/** An icon that hints at what the service is, read from its code or name. */
const SERVICE_ICONS: { match: RegExp; icon: ReactNode }[] = [
  { match: /TRUCK|HAUL|DRAY/i, icon: <IconTruck className="size-6" /> },
  { match: /FREIGHT|OCEAN|SEA|SHIP/i, icon: <IconShip className="size-6" /> },
  { match: /AIR/i, icon: <IconPlane className="size-6" /> },
  { match: /CUSTOM|CLEAR|PERMIT|DOC/i, icon: <IconFileCertificate className="size-6" /> },
  { match: /WAREHOUSE|STORAGE|DEPOT/i, icon: <IconBuildingWarehouse className="size-6" /> },
  { match: /PORT|STEVEDOR|HANDLING|THC/i, icon: <IconAnchor className="size-6" /> },
]

function serviceIcon(service: Service) {
  const text = `${service.serviceCode} ${service.serviceName}`
  return SERVICE_ICONS.find(({ match }) => match.test(text))?.icon ?? <IconTool className="size-6" />
}

function ServiceTile({ service }: { service: Service }) {
  const vendors = service._count?.vendors ?? 0
  return (
    <li
      className={cn(
        "group flex items-center gap-3 rounded-xl p-3.5",
        service.isActive ? "surface surface-lift" : "border border-dashed border-border bg-muted/40"
      )}
    >
      <span
        className={cn(
          "flex size-12 shrink-0 items-center justify-center rounded-xl",
          service.isActive ? "bg-secondary text-primary" : "bg-muted text-muted-foreground"
        )}
      >
        {serviceIcon(service)}
      </span>
      <div className="min-w-0 flex-1">
        <p className={cn("truncate font-semibold", service.isActive ? "text-foreground" : "text-muted-foreground")}>
          {service.serviceName}
        </p>
        <p className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="rounded bg-muted px-1.5 py-0.5 font-mono text-[11px] font-medium text-foreground/80">
            {service.serviceCode}
          </span>
          {service.isActive ? (
            <span>
              {vendors} {vendors === 1 ? "vendor" : "vendors"}
            </span>
          ) : (
            <span className="font-medium text-[var(--mli-on-error-container)]">Not in use</span>
          )}
        </p>
      </div>
      <div className="shrink-0 transition-opacity sm:opacity-0 sm:group-hover:opacity-100 sm:focus-within:opacity-100 [@media(hover:none)]:opacity-100">
        <ServiceActionCell row={{ original: service }} />
      </div>
    </li>
  )
}

export default function ServiceMasterDataPage() {
  const { can } = usePermissions()
  const { applied, page, pageSize, setApplied, setPage, setPageSize, isRestored } =
    usePersistedTableState("services", 50)
  const params = useMemo(
    () => ({
      page,
      pageSize,
      search: applied.search || undefined,
      status: applied.status as "all" | "true" | "false",
    }),
    [page, pageSize, applied]
  )
  const { data, isLoading, error } = useServices(params, isRestored)
  const services = data?.items ?? []
  const pagination = data?.pagination ?? { page, pageSize, total: 0, totalPages: 1 }

  if (error) return <ErrorPage />

  return (
    <DashboardPage atmosphere>
      <DashboardPageHeader
        title="Services"
        description="The services you book to vendors on a shipment. Tag vendors with the services they provide so the shipment form suggests the right ones."
        action={
          can("SERVICE", "create") ? (
            <ServiceForm mode="create" serviceCode={undefined} serviceName={undefined} isActive={true} id={undefined} />
          ) : null
        }
      />
      <DashboardPageCard>
        <DataTableToolbar
          searchPlaceholder="Search by service name or code..."
          filters={serviceFilters}
          applied={applied}
          onApply={setApplied}
        />
        {!isRestored || isLoading ? (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={index} className="h-20 rounded-xl" />
            ))}
          </div>
        ) : services.length === 0 ? (
          <ReferenceEmpty
            icon={<IconTruckDelivery />}
            title="No services found"
            description="Try another search, or clear the filters."
          />
        ) : (
          <div className="space-y-6">
            <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {services.map((service) => (
                <ServiceTile key={service.id ?? service.serviceCode} service={service} />
              ))}
            </ul>
            <ReferencePager
              className="border-t border-border/70 pt-4"
              page={pagination.page}
              pageSize={pagination.pageSize}
              totalPages={pagination.totalPages}
              total={pagination.total}
              noun="services"
              onPageChange={setPage}
              onPageSizeChange={setPageSize}
            />
          </div>
        )}
      </DashboardPageCard>
    </DashboardPage>
  )
}
