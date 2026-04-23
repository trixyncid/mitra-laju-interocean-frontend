import { apiClient } from "@/lib/api-client"

export const costingService = {
    getAll: async () => {
        const response = await apiClient.get("/costings")
        return response
    },
    getById: async (id: string) => {
        const response = await apiClient.get(`/costings/${id}`)
        return response
    },
    create: async (costing: unknown) => {
        const response = await apiClient.post("/costings", costing)
        return response
    },
    update: async (id: string, costing: unknown) => {
        const response = await apiClient.put(`/costings/${id}`, costing)
        return response
    },
    delete: async (id: string) => {
        const response = await apiClient.delete(`/costings/${id}`)
        return response
    },
    createCostingAttachment: async (costingId: string, costingAttachment: FormData) => {
        const response = await apiClient.post(`/costings/${costingId}/attachments`, costingAttachment)
        return response
    },
    updateCostingAttachment: async (costingId: string, id: string, costingAttachment: unknown) => {
        const response = await apiClient.put(`/costings/${costingId}/attachments/${id}`, costingAttachment)
        return response
    },
    deleteCostingAttachment: async (costingId: string, id: string) => {
        const response = await apiClient.delete(`/costings/${costingId}/attachments/${id}`)
        return response
    },
    viewCostingAttachment: async (costingId: string, id: string) => {
        const response = await apiClient.get(`/costings/${costingId}/attachments/${id}`)
        
        window.open(response.url, "_blank");
    }
}