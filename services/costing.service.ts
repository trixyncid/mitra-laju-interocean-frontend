import { apiClient } from "@/lib/api-client"
import { openFetchedAttachment } from "@/lib/open-attachment"
import type { Costing, CostingDetail } from "@/app/dashboard/costings/columns"

export type CreateCostingInput = {
    costingNumber?: string
    month?: number
    year?: number
    description: string
    price: number
    currencyCode?: string
    currency?: number
    containerNumber?: string | null
    vatPercentage: number
    pph23Percentage: number
    vendorInvoiceNumber?: string | null
    vendorId: string
    shipmentId?: string
    sellingId?: string
}

export type UpdateCostingInput = Omit<Partial<CreateCostingInput>, "sellingId" | "shipmentId"> & {
    sellingId?: string | null
    shipmentId?: string | null
    status?: string
}

export type CostingListParams = {
    page: number
    pageSize: number
    search?: string
    status?: "all" | "PAID" | "UNPAID"
    from?: string
    to?: string
}

export type PaginatedCostings = {
    items: Costing[]
    pagination: {
        page: number
        pageSize: number
        total: number
        totalPages: number
    }
}

export const costingService = {
    getAll: async (params: CostingListParams): Promise<PaginatedCostings> => {
        const query = new URLSearchParams({
            page: String(params.page),
            pageSize: String(params.pageSize),
            status: params.status ?? "all",
        })
        if (params.search) query.set("search", params.search)
        if (params.from) query.set("from", params.from)
        if (params.to) query.set("to", params.to)
        const response = await apiClient.getEnvelope(`/costings?${query.toString()}`)
        const pagination = response.meta?.pagination ?? {
            page: params.page,
            pageSize: params.pageSize,
            total: 0,
            totalPages: 1,
        }
        return {
            items: (response.data ?? []) as Costing[],
            pagination,
        }
    },
    getById: async (id: string): Promise<CostingDetail> => {
        return apiClient.get<CostingDetail>(`/costings/${id}`)
    },
    create: async (costing: CreateCostingInput) => {
        const response = await apiClient.post("/costings", costing)
        return response
    },
    update: async (id: string, costing: UpdateCostingInput) => {
        const response = await apiClient.put(`/costings/${id}`, costing)
        return response
    },
    delete: async (id: string) => {
        const response = await apiClient.delete(`/costings/${id}`)
        return response
    },
    createCostingAttachment: async (costingId: string, costingAttachment: FormData) => {
        const response = await apiClient.post(`/costings/${costingId}/attachments`, costingAttachment)
        return response
    },
    updateCostingAttachment: async (costingId: string, id: string, costingAttachment: unknown) => {
        const response = await apiClient.put(`/costings/${costingId}/attachments/${id}`, costingAttachment)
        return response
    },
    deleteCostingAttachment: async (costingId: string, id: string) => {
        const response = await apiClient.delete(`/costings/${costingId}/attachments/${id}`)
        return response
    },
    viewCostingAttachment: async (costingId: string, id: string) => {
        await openFetchedAttachment(async () => {
            const response = await apiClient.get<{
                url: string
                contentType?: string | null
                fileName?: string | null
            }>(`/costings/${costingId}/attachments/${id}`)
            return {
                url: response.url,
                contentType: response.contentType,
                fileName: response.fileName,
            }
        })
    }
}
