import { apiClient } from "@/lib/api-client"
import type { Vendor } from "@/app/dashboard/vendors/columns"
import type { VendorDetail } from "@/lib/types/entity-details"

export type VendorListParams = {
    page: number
    pageSize: number
    search?: string
    status?: "all" | "true" | "false"
    shipmentType?: "all" | "EXPORT" | "IMPORT" | "DOMESTIC"
    /** Vendors tagged with this service, plus untagged ones. */
    serviceId?: string
    from?: string
    to?: string
    /** Excel-style column filters: ticked values per column field. */
    columns?: Record<string, string[]>
    sortBy?: string
    sortDir?: "asc" | "desc"
}

/** Column filter fields of the vendor list, and their query names. */
export const VENDOR_FILTER_PARAM: Record<string, string> = {
    vendor: "vendorIds",
    status: "statuses",
    shipmentType: "shipmentTypes",
    service: "serviceIds",
    modifiedDate: "modifiedDates",
}

export type VendorFacet = { value: string; label: string; count: number }

function setColumnParams(
    query: URLSearchParams,
    params: Pick<VendorListParams, "columns" | "sortBy" | "sortDir">
) {
    for (const [field, values] of Object.entries(params.columns ?? {})) {
        const name = VENDOR_FILTER_PARAM[field]
        if (name && values.length) query.set(name, values.join(","))
    }
    if (params.sortBy) {
        query.set("sortBy", params.sortBy)
        query.set("sortDir", params.sortDir ?? "asc")
    }
}

/** "vendors-2026-11-03.xlsx" (the server sends the real name). */
function exportFilename() {
    return `vendors-${new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Jakarta" })}.xlsx`
}

export type PaginatedVendors = {
    items: Vendor[]
    pagination: {
        page: number
        pageSize: number
        total: number
        totalPages: number
    }
}

export const vendorsService = {
    getAll: async (params: VendorListParams): Promise<PaginatedVendors> => {
        const query = new URLSearchParams({
            page: String(params.page),
            pageSize: String(params.pageSize),
            status: params.status ?? "all",
            shipmentType: params.shipmentType ?? "all",
        })
        if (params.search) query.set("search", params.search)
        if (params.serviceId) query.set("serviceId", params.serviceId)
        if (params.from) query.set("from", params.from)
        if (params.to) query.set("to", params.to)
        setColumnParams(query, params)
        const response = await apiClient.getEnvelope<Vendor[]>(`/vendors?${query.toString()}`)
        const pagination = response.meta?.pagination ?? {
            page: params.page,
            pageSize: params.pageSize,
            total: 0,
            totalPages: 1,
        }
        return {
            items: response.data ?? [],
            pagination,
        }
    },
    /** Values and counts for one column, under every other active filter. */
    getFacets: async (
        field: string,
        params: Pick<VendorListParams, "search" | "status" | "shipmentType" | "columns">
    ): Promise<VendorFacet[]> => {
        const query = new URLSearchParams({ field })
        if (params.search) query.set("search", params.search)
        if (params.status && params.status !== "all") query.set("status", params.status)
        if (params.shipmentType && params.shipmentType !== "all") query.set("shipmentType", params.shipmentType)
        setColumnParams(query, { columns: params.columns })
        return apiClient.get<VendorFacet[]>(`/vendors/facets?${query.toString()}`)
    },
    /** Every vendor matching the search and column filters, as Excel (sort does not matter there). */
    exportExcel: async (
        params: Pick<VendorListParams, "search" | "status" | "shipmentType" | "columns">
    ): Promise<{ rowCount: number | null }> => {
        const query = new URLSearchParams({
            status: params.status ?? "all",
            shipmentType: params.shipmentType ?? "all",
        })
        if (params.search) query.set("search", params.search)
        setColumnParams(query, { columns: params.columns })
        const result = await apiClient.download(`/vendors/export?${query.toString()}`, exportFilename())
        return { rowCount: result.rowCount }
    },
    getById: async (id: string): Promise<VendorDetail> => {
        return apiClient.get<VendorDetail>(`/vendors/${id}`)
    },
    create: async (vendor: unknown) => {
        const response = await apiClient.post("/vendors", vendor)
        return response
    },
    update: async (id: string, vendor: Partial<Vendor>): Promise<VendorDetail> => {
        return apiClient.put<VendorDetail>(`/vendors/${id}`, vendor)
    },
    delete: async (id: string) => {
        const response = await apiClient.delete(`/vendors/${id}`)
        return response
    },
    createLocation: async (vendorId: string, location: unknown) => {
        const response = await apiClient.post(`/vendors/${vendorId}/locations`, location)
        return response
    },
    updateLocation: async (vendorId: string, locationId: string, location: unknown) => {
        const response = await apiClient.put(`/vendors/${vendorId}/locations/${locationId}`, location)
        return response
    },
    deleteLocation: async (vendorId: string, locationId: string) => {
        const response = await apiClient.delete(`/vendors/${vendorId}/locations/${locationId}`)
        return response
    },
    createContact: async (vendorId: string, locationId: string, contact: unknown) => {
        const response = await apiClient.post(`/vendors/${vendorId}/locations/${locationId}/contacts`, contact)
        return response
    },
    updateContact: async (vendorId: string, locationId: string, contactId: string, contact: unknown) => {
        const response = await apiClient.put(`/vendors/${vendorId}/locations/${locationId}/contacts/${contactId}`, contact)
        return response
    },
    deleteContact: async (vendorId: string, locationId: string, contactId: string) => {
        const response = await apiClient.delete(`/vendors/${vendorId}/locations/${locationId}/contacts/${contactId}`)
        return response
    },
}