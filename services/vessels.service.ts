import { apiClient } from "@/lib/api-client";
import { Vessel } from "@/app/dashboard/vessels/columns";

export const vesselsService = {
    getAll: async () => {
        const response = await apiClient.get("/vessels");
        return response;
    },
    getById: async (id: string) => {
        const response = await apiClient.get(`/vessels/${id}`);
        return response;
    },
    create: async (vessel: Vessel) => {
        const response = await apiClient.post("/vessels", vessel);
        return response;
    },
    update: async (id: string, vessel: Partial<Vessel>) => {
        const response = await apiClient.put(`/vessels/${id}`, vessel);
        return response;
    },
    delete: async (id: string) => {
        const response = await apiClient.delete(`/vessels/${id}`);
        return response;
    }
}