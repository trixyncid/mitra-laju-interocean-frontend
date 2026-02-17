import { Customer } from "@/app/dashboard/customers/columns";
import { apiClient } from "@/lib/api-client";

export const customersService = {
    getAll: async () => {
        const response = await apiClient.get("/customers");
        return response;
    },
    create: async (customer: Customer) => {
        const response = await apiClient.post("/customers", customer);
        return response;
    },
    update: async (id: string, customer: Partial<Customer>) => {
        const response = await apiClient.put(`/customers/${id}`, customer);
        return response;
    },
    getById: async (id: string) => {
        const response = await apiClient.get(`/customers/${id}`);
        return response;
    },
    createLocation: async (customerId: string, location: unknown) => {
        const response = await apiClient.post(`/customers/${customerId}/locations`, location);
        return response;
    },
}