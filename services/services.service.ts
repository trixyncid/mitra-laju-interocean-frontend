import { Service } from "@/app/dashboard/services/columns";
import { apiClient } from "@/lib/api-client";

export type ServiceListParams = {
    page: number
    pageSize: number
    search?: string
    status?: "all" | "true" | "false"
    from?: string
    to?: string
}

export type PaginatedServices = {
    items: Service[]
    pagination: {
        page: number
        pageSize: number
        total: number
        totalPages: number
    }
}

export const servicesService = {
    getAll: async (params: ServiceListParams): Promise<PaginatedServices> => {
        const query = new URLSearchParams({
            page: String(params.page),
            pageSize: String(params.pageSize),
            status: params.status ?? "all",
        })
        if (params.search) query.set("search", params.search)
        if (params.from) query.set("from", params.from)
        if (params.to) query.set("to", params.to)
        const response = await apiClient.getEnvelope(`/services?${query.toString()}`)
        const pagination = response.meta?.pagination ?? {
            page: params.page,
            pageSize: params.pageSize,
            total: 0,
            totalPages: 1,
        }
        return {
            items: (response.data ?? []) as Service[],
            pagination,
        }
    },
    create: async (service: Pick<Service, "serviceCode" | "serviceName">): Promise<Service> => {
        return apiClient.post<Service>("/services", service);
    },
    update: async (id: string, service: Partial<Service>) => {
        return apiClient.put(`/services/${id}`, service);
    },
    delete: async (id: string) => {
        return apiClient.delete(`/services/${id}`);
    },
}
