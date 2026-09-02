import { useEntityListSearch } from "@/hooks/use-entity-list-search"
import { costingService } from "@/services/costing.service"
import { portsService } from "@/services/ports.service"
import { rolesService } from "@/services/roles.service"
import { sellingService } from "@/services/selling.service"
import { shipmentsService } from "@/services/shipments.service"
import { vendorsService } from "@/services/vendors.service"
import { vesselsService } from "@/services/vessels.service"
import {
  costingKeys,
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
  status: "all" | "true" | "false" = "all"
) {
  return useEntityListSearch(
    [...shipmentKeys.all, "search", status],
    shipmentsService.getAll,
    search,
    enabled,
    { status },
    PICKER_PAGE_SIZE
  )
}

export function useCostingSearch(search: string, enabled = true) {
  return useEntityListSearch(
    [...costingKeys.all, "search"],
    costingService.getAll,
    search,
    enabled,
    undefined,
    PICKER_PAGE_SIZE
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
