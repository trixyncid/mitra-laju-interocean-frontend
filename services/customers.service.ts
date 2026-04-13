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
    getLocationsByCustomerId: async (customerId: string) => {
        const response = await apiClient.get(`/customers/${customerId}/locations`);
        return response;
    },
    delete: async (id: string) => {
        const response = await apiClient.delete(`/customers/${id}`);
        return response;
    },
    createShipper: async (customerId: string, shipper: unknown) => {
        const response = await apiClient.post(`/customers/${customerId}/shippers`, shipper);
        return response;
    },
    updateShipper: async (customerId: string, shipperId: string, shipper: unknown) => {
        const response = await apiClient.put(`/customers/${customerId}/shippers/${shipperId}`, shipper);
        return response;
    },
    deleteShipper: async (customerId: string, shipperId: string) => {
        const response = await apiClient.delete(`/customers/${customerId}/shippers/${shipperId}`);
        return response;
    },
    createLocation: async (customerId: string, shipperId: string, location: unknown) => {
        const response = await apiClient.post(`/customers/${customerId}/shippers/${shipperId}/locations`, location);
        return response;
    },
    updateLocation: async (customerId: string, shipperId: string, locationId: string, location: unknown) => {
        const response = await apiClient.put(`/customers/${customerId}/shippers/${shipperId}/locations/${locationId}`, location);
        return response;
    },
    deleteLocation: async (customerId: string, shipperId: string, locationId: string) => {
        const response = await apiClient.delete(`/customers/${customerId}/shippers/${shipperId}/locations/${locationId}`);
        return response;
    },
    createContact: async (customerId: string, shipperId: string, locationId: string, contact: unknown) => {
        const response = await apiClient.post(`/customers/${customerId}/shippers/${shipperId}/locations/${locationId}/contacts`, contact);
        return response;
    },
    updateContact: async (customerId: string, shipperId: string, locationId: string, contactId: string, contact: unknown) => {
        const response = await apiClient.put(`/customers/${customerId}/shippers/${shipperId}/locations/${locationId}/contacts/${contactId}`, contact);
        return response;
    },
    deleteContact: async (customerId: string, shipperId: string, locationId: string, contactId: string) => {
        const response = await apiClient.delete(`/customers/${customerId}/shippers/${shipperId}/locations/${locationId}/contacts/${contactId}`);
        return response;
    },
    getShippersByCustomerCodeId: async (customerId: string) => {
        const response = await apiClient.get(`/customers/${customerId}/shippers`);
        return response;
    },
}