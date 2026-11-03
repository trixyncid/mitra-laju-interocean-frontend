import { Customer } from "@/app/dashboard/customers/columns";
import { apiClient } from "@/lib/api-client";
import type { CustomerDetail } from "@/lib/types/entity-details";

export type CustomerListParams = {
    page: number;
    pageSize: number;
    search?: string;
    status?: "all" | "true" | "false";
    shipmentType?: "all" | "EXPORT" | "IMPORT" | "DOMESTIC";
    from?: string;
    to?: string;
    /** Excel-style column filters: ticked values per column field. */
    columns?: Record<string, string[]>;
    sortBy?: string;
    sortDir?: "asc" | "desc";
};

/** Column filter fields of the customer list, and their query names. */
export const CUSTOMER_FILTER_PARAM: Record<string, string> = {
    customer: "customerIds",
    status: "statuses",
    shipmentType: "shipmentTypes",
    modified: "modifiedDates",
};

export type CustomerFacet = { value: string; label: string; count: number };

/** What the export needs: the list's filters without paging. */
export type CustomerExportParams = Omit<CustomerListParams, "page" | "pageSize">;

function setColumnParams(
    query: URLSearchParams,
    params: Pick<CustomerListParams, "columns" | "sortBy" | "sortDir">
) {
    for (const [field, values] of Object.entries(params.columns ?? {})) {
        const name = CUSTOMER_FILTER_PARAM[field];
        if (name && values.length) query.set(name, values.join(","));
    }
    if (params.sortBy) {
        query.set("sortBy", params.sortBy);
        query.set("sortDir", params.sortDir ?? "asc");
    }
}

/** The list's filters (everything but paging) as a query string. */
function filterQuery(params: CustomerExportParams) {
    const query = new URLSearchParams({
        status: params.status ?? "all",
        shipmentType: params.shipmentType ?? "all",
    });
    if (params.search) query.set("search", params.search);
    if (params.from) query.set("from", params.from);
    if (params.to) query.set("to", params.to);
    setColumnParams(query, params);
    return query;
}

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
    isActive?: boolean;
};

export const customersService = {
    getAll: async (params: CustomerListParams): Promise<PaginatedCustomers> => {
        const query = filterQuery(params);
        query.set("page", String(params.page));
        query.set("pageSize", String(params.pageSize));
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
    /** Values and counts for one column, under every other active filter. */
    getFacets: async (
        field: string,
        params: Pick<CustomerListParams, "search" | "status" | "shipmentType" | "columns">
    ): Promise<CustomerFacet[]> => {
        const query = filterQuery(params);
        query.set("field", field);
        return apiClient.get<CustomerFacet[]>(`/customers/facets?${query.toString()}`);
    },
    /** Downloads the customer table as Excel under the current search and column filters. */
    exportExcel: async (params: CustomerExportParams): Promise<{ rowCount: number | null }> => {
        const result = await apiClient.download(
            `/customers/export?${filterQuery(params).toString()}`,
            `customers-${new Date().toLocaleDateString("en-CA")}.xlsx`
        );
        return { rowCount: result.rowCount };
    },
    create: async (customer: Customer) => {
        const response = await apiClient.post("/customers", customer);
        return response;
    },
    update: async (id: string, customer: Partial<Customer>): Promise<CustomerDetail> => {
        return apiClient.put<CustomerDetail>(`/customers/${id}`, customer);
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
    createShipper: async (customerId: string, shipper: unknown): Promise<CustomerShipperOption> => {
        return apiClient.post<CustomerShipperOption>(`/customers/${customerId}/shippers`, shipper);
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