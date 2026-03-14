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
    }
}