import { useEntityListSearch } from "@/hooks/use-entity-list-search"
import { vendorInvoiceService } from "@/services/vendor-invoice.service"
import { portsService } from "@/services/ports.service"
import { rolesService } from "@/services/roles.service"
import { sellingService } from "@/services/selling.service"
import { shipmentsService } from "@/services/shipments.service"
import { vendorsService } from "@/services/vendors.service"
import { vesselsService } from "@/services/vessels.service"
import {
  vendorInvoiceKeys,
  portKeys,
  roleKeys,
  sellingKeys,
  shipmentKeys,
  vendorKeys,
  vesselKeys,
} from "@/lib/query-keys"

const PICKER_PAGE_SIZE = 25

export function usePortSearch(search: string, enabled = true) {
  return useEntityListSearch(
    [...portKeys.all, "search"],
    portsService.getAll,
    search,
    enabled,
    undefined,
    PICKER_PAGE_SIZE
  )
}

export function useVesselSearch(search: string, enabled = true) {
  return useEntityListSearch(
    [...vesselKeys.all, "search"],
    vesselsService.getAll,
    search,
    enabled,
    undefined,
    PICKER_PAGE_SIZE
  )
}

export function useVendorSearch(
  search: string,
  enabled = true,
  status: "all" | "true" | "false" = "true"
) {
  return useEntityListSearch(
    [...vendorKeys.all, "search", status],
    vendorsService.getAll,
    search,
    enabled,
    { status },
    PICKER_PAGE_SIZE
  )
}

export function useShipmentSearch(
  search: string,
  enabled = true,
  status: "all" | "true" | "false" = "all",
  lifecycleStatus: "all" | "DRAFT" | "BACKUP" | "ONGOING" | "FINISHED" = "all"
) {
  return useEntityListSearch(
    [...shipmentKeys.all, "search", status, lifecycleStatus],
    shipmentsService.getAll,
    search,
    enabled,
    { status, lifecycleStatus },
    PICKER_PAGE_SIZE
  )
}

export function useVendorInvoiceSearch(search: string, enabled = true) {
  return useEntityListSearch(
    [...vendorInvoiceKeys.all, "search"],
    vendorInvoiceService.getAll,
    search,
    enabled,
    undefined,
    PICKER_PAGE_SIZE
  )
}

/** Vendor invoice lines that are not in any costing yet. */
export function useUnassignedBreakdownSearch(
  search: string,
  enabled = true,
  pageSize = PICKER_PAGE_SIZE,
  vendorId?: string
) {
  return useEntityListSearch(
    [...vendorInvoiceKeys.breakdownLists(), "search", "unlinked", vendorId ?? "any"],
    vendorInvoiceService.getBreakdowns,
    search,
    enabled,
    { costing: "unlinked", ...(vendorId ? { vendorId } : {}) },
    pageSize
  )
}

export function useSellingSearch(search: string, enabled = true) {
  return useEntityListSearch(
    [...sellingKeys.all, "search"],
    sellingService.getAll,
    search,
    enabled,
    undefined,
    PICKER_PAGE_SIZE
  )
}

export function useRoleSearch(search: string, enabled = true) {
  return useEntityListSearch(
    [...roleKeys.all, "search"],
    rolesService.getAll,
    search,
    enabled,
    undefined,
    PICKER_PAGE_SIZE
  )
}
