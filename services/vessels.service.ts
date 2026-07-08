import { apiClient } from "@/lib/api-client";
import { Vessel } from "@/app/dashboard/vessels/columns";

export type VesselListParams = {
    page: number
    pageSize: number
    search?: string
    status?: "all" | "true" | "false"
    from?: string
    to?: string
}

export type PaginatedVessels = {
    items: Vessel[]
    pagination: {
        page: number
        pageSize: number
        total: number
        totalPages: number
    }
}

export const vesselsService = {
    getAll: async (params: VesselListParams): Promise<PaginatedVessels> => {
        const query = new URLSearchParams({
            page: String(params.page),
            pageSize: String(params.pageSize),
            status: params.status ?? "all",
        })
        if (params.search) query.set("search", params.search)
        if (params.from) query.set("from", params.from)
        if (params.to) query.set("to", params.to)
        const response = await apiClient.getEnvelope(`/vessels?${query.toString()}`)
        const pagination = response.meta?.pagination ?? {
            page: params.page,
            pageSize: params.pageSize,
            total: 0,
            totalPages: 1,
        }
        return {
            items: (response.data ?? []) as Vessel[],
            pagination,
        }
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
