import { apiClient } from "@/lib/api-client"
import type { Selling } from "@/app/dashboard/sellings/columns"
import type { SellingDetail } from "@/lib/types/entity-details"

export type SellingListParams = {
    page: number
    pageSize: number
    search?: string
    status?: "all" | "paid" | "unpaid"
    from?: string
    to?: string
}

export type PaginatedSellings = {
    items: Selling[]
    pagination: {
        page: number
        pageSize: number
        total: number
        totalPages: number
    }
}

export const sellingService = {
    getAll: async (params: SellingListParams): Promise<PaginatedSellings> => {
        const query = new URLSearchParams({
            page: String(params.page),
            pageSize: String(params.pageSize),
            status: params.status ?? "all",
        })
        if (params.search) query.set("search", params.search)
        if (params.from) query.set("from", params.from)
        if (params.to) query.set("to", params.to)
        const response = await apiClient.getEnvelope(`/sellings?${query.toString()}`)
        const pagination = response.meta?.pagination ?? {
            page: params.page,
            pageSize: params.pageSize,
            total: 0,
            totalPages: 1,
        }
        return {
            items: (response.data ?? []) as Selling[],
            pagination,
        }
    },
    getById: async (id: string): Promise<SellingDetail> => {
        return apiClient.get<SellingDetail>(`/sellings/${id}`)
    },
    create: async (selling: unknown) => {
        const response = await apiClient.post("/sellings", selling)
        return response
    },
    update: async (id: string, selling: unknown) => {
        const response = await apiClient.put(`/sellings/${id}`, selling)
        return response
    },
    delete: async (id: string) => {
        const response = await apiClient.delete(`/sellings/${id}`)
        return response
    },
}
