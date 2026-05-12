import { apiClient } from "@/lib/api-client"

export const sellingService = {
    getAll: async () => {
        const response = await apiClient.get("/sellings")
        return response
    },
    getById: async (id: string) => {
        const response = await apiClient.get(`/sellings/${id}`)
        return response
    },
    create: async (selling: unknown) => {
        const response = await apiClient.post("/sellings", selling)
        return response
    },
    update: async (id: string, selling: unknown) => {
        const response = await apiClient.put(`/sellings/${id}`, selling)
        return response
    },
    delete: async (id: string) => {
        const response = await apiClient.delete(`/sellings/${id}`)
        return response
    },
}
