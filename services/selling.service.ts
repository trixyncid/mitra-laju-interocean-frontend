import { apiClient } from "@/lib/api-client"
import type { Selling } from "@/app/dashboard/sellings/columns"
import type { SellingDetail } from "@/lib/types/entity-details"

export type SellingListParams = {
  page: number
  pageSize: number
  search?: string
  status?: "all" | "DRAFT" | "PAID" | "UNPAID"
  from?: string
  to?: string
  customerId?: string
  shipmentId?: string
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

export type CreateSellingPayload = {
  shipmentId: string
  month: number
  year: number
  remarks: string
  lines: Array<{
    costingBreakdownId: string
  }>
}

export type AddSellingLinesPayload = {
  lines: Array<{
    costingBreakdownId: string
  }>
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
    if (params.customerId) query.set("customerId", params.customerId)
    if (params.shipmentId) query.set("shipmentId", params.shipmentId)
    const response = await apiClient.getEnvelope(
      `/sellings?${query.toString()}`
    )
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
  exportVatExcel: async (): Promise<{ rowCount: number | null }> => {
    const result = await apiClient.download(
      "/sellings/export/vat",
      "customer-invoice-vat.xlsx"
    )
    return { rowCount: result.rowCount }
  },
  getById: async (id: string): Promise<SellingDetail> => {
    return apiClient.get<SellingDetail>(`/sellings/${id}`)
  },
  create: async (selling: CreateSellingPayload) => {
    return apiClient.post("/sellings", selling)
  },
  update: async (
    id: string,
    selling: {
      remarks?: string | null
      termsOfPayment?: string | null
      taxInvoice?: string | null
      taxInvoiceDate?: string | null
    }
  ) => {
    return apiClient.put(`/sellings/${id}`, selling)
  },
  issue: async (id: string) => {
    return apiClient.post(`/sellings/${id}/issue`, {})
  },
  markPaid: async (id: string) => {
    return apiClient.post(`/sellings/${id}/mark-paid`, {})
  },
  markUnpaid: async (id: string) => {
    return apiClient.post(`/sellings/${id}/mark-unpaid`, {})
  },
  revertToDraft: async (id: string) => {
    return apiClient.post(`/sellings/${id}/revert-to-draft`, {})
  },
  delete: async (id: string) => {
    return apiClient.delete(`/sellings/${id}`)
  },
  addLines: async (id: string, payload: AddSellingLinesPayload) => {
    return apiClient.post(`/sellings/${id}/lines`, payload)
  },
  deleteLine: async (id: string, lineId: string) => {
    return apiClient.delete(`/sellings/${id}/lines/${lineId}`)
  },
}
