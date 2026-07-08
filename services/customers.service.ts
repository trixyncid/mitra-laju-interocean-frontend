import { Customer } from "@/app/dashboard/customers/columns";
import { apiClient } from "@/lib/api-client";
import type { CustomerDetail } from "@/lib/types/entity-details";

export type CustomerListParams = {
    page: number;
    pageSize: number;
    search?: string;
    status?: "all" | "true" | "false";
    from?: string;
    to?: string;
};

export type PaginatedCustomers = {
    items: Customer[];
    pagination: {
        page: number;
        pageSize: number;
        total: number;
        totalPages: number;
    };
};

export type CustomerShipperOption = {
    id: string;
    name: string;
};

export type CustomerLocationOption = {
    id: string;
    addressLine1: string;
    city: string;
    country: string;
    customerShipperId: string;
};

export const customersService = {
    getAll: async (params: CustomerListParams): Promise<PaginatedCustomers> => {
        const query = new URLSearchParams({
            page: String(params.page),
            pageSize: String(params.pageSize),
            status: params.status ?? "all",
        });
        if (params.search) query.set("search", params.search);
        if (params.from) query.set("from", params.from);
        if (params.to) query.set("to", params.to);
        const response = await apiClient.getEnvelope(`/customers?${query.toString()}`);
        const pagination = response.meta?.pagination ?? {
            page: params.page,
            pageSize: params.pageSize,
            total: 0,
            totalPages: 1,
        };
        return {
            items: (response.data ?? []) as Customer[],
            pagination,
        };
    },
    create: async (customer: Customer) => {
        const response = await apiClient.post("/customers", customer);
        return response;
    },
    update: async (id: string, customer: Partial<Customer>) => {
        const response = await apiClient.put(`/customers/${id}`, customer);
        return response;
    },
    getById: async (id: string): Promise<CustomerDetail> => {
        return apiClient.get<CustomerDetail>(`/customers/${id}`);
    },
    getLocationsByCustomerId: async (customerId: string): Promise<CustomerLocationOption[]> => {
        return apiClient.get<CustomerLocationOption[]>(`/customers/${customerId}/locations`);
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
    getShippersByCustomerCodeId: async (customerId: string): Promise<CustomerShipperOption[]> => {
        return apiClient.get<CustomerShipperOption[]>(`/customers/${customerId}/shippers`);
    },
}