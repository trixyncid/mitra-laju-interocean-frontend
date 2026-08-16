import { Port } from "@/app/dashboard/ports/columns";
import { apiClient } from "@/lib/api-client";

export type PortListParams = {
    page: number
    pageSize: number
    search?: string
    status?: "all" | "true" | "false"
    from?: string
    to?: string
}

export type PaginatedPorts = {
    items: Port[]
    pagination: {
        page: number
        pageSize: number
        total: number
        totalPages: number
    }
}

export const portsService = {
    getAll: async (params: PortListParams): Promise<PaginatedPorts> => {
        const query = new URLSearchParams({
            page: String(params.page),
            pageSize: String(params.pageSize),
            status: params.status ?? "all",
        })
        if (params.search) query.set("search", params.search)
        if (params.from) query.set("from", params.from)
        if (params.to) query.set("to", params.to)
        const response = await apiClient.getEnvelope(`/ports?${query.toString()}`)
        const pagination = response.meta?.pagination ?? {
            page: params.page,
            pageSize: params.pageSize,
            total: 0,
            totalPages: 1,
        }
        return {
            items: (response.data ?? []) as Port[],
            pagination,
        }
    },
    create: async (port: Port): Promise<Port> => {
        return apiClient.post<Port>("/ports", port);
    },
    update: async (id: string, port: Partial<Port>) => {
        const response = await apiClient.put(`/ports/${id}`, port);
        return response;
    },
    delete: async (id: string) => {
        const response = await apiClient.delete(`/ports/${id}`);
        return response;
    },
}
