import { apiClient } from "@/lib/api-client"

export const vendorsService = {
    getAll: async () => {
        const response = await apiClient.get("/vendors")
        return response
    },
    getById: async (id: string) => {
        const response = await apiClient.get(`/vendors/${id}`)
        return response
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