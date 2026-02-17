import { Port } from "@/app/dashboard/ports/columns";
import { apiClient } from "@/lib/api-client";

export const portsService = {
    getAll: async () => {
        const response = await apiClient.get("/ports");
        return response;
    },
    create: async (port: Port) => {
        const response = await apiClient.post("/ports", port);
        return response;
    },
    update: async (id: string, port: Partial<Port>) => {
        const response = await apiClient.put(`/ports/${id}`, port);
        return response;
    },
}