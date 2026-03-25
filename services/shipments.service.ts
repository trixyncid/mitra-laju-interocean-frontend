import { Shipment } from "@/app/dashboard/shipments/columns";
import { apiClient } from "@/lib/api-client";

export const shipmentsService = {
    getAll: async () => {
        const response = await apiClient.get("/shipments");
        console.log(response)
        return response;
    },
    getById: async (id: string) => {
        const response = await apiClient.get(`/shipments/${id}`);
        return response;
    },
    create: async (shipment: Shipment) => {
        const response = await apiClient.post("/shipments", shipment);
        return response;
    },
    update: async (id: string, shipment: Partial<Shipment>) => {
        const response = await apiClient.put(`/shipments/${id}`, shipment);
        return response;
    },
    delete: async (id: string) => {
        const response = await apiClient.delete(`/shipments/${id}`);
        return response;
    },
}