import { apiClient } from "@/lib/api-client"
import type { Vendor } from "@/app/dashboard/vendors/columns"
import type { VendorDetail } from "@/lib/types/entity-details"

export type VendorListParams = {
    page: number
    pageSize: number
    search?: string
    status?: "all" | "true" | "false"
    from?: string
    to?: string
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
        })
        if (params.search) query.set("search", params.search)
        if (params.from) query.set("from", params.from)
        if (params.to) query.set("to", params.to)
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
    getById: async (id: string): Promise<VendorDetail> => {
        return apiClient.get<VendorDetail>(`/vendors/${id}`)
    },
    create: async (vendor: unknown) => {
        const response = await apiClient.post("/vendors", vendor)
        return response
    },
    update: async (id: string, vendor: unknown) => {
        const response = await apiClient.put(`/vendors/${id}`, vendor)
        return response
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