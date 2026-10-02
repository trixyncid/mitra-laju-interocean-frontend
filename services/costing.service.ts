import { apiClient } from "@/lib/api-client"
import { openFetchedAttachment } from "@/lib/open-attachment"
import type { Costing, CostingBreakdown, CostingDetail } from "@/app/dashboard/costings/columns"

export type CostingBreakdownInput = {
  productDescription: string
  quantity: number
  price: number
  currencyPrice: number
  containerNumber?: string | null
  containerSizeId?: string | null
  containerTypeId?: string | null
  shipmentId?: string | null
  /** Invoice tax on the vendor costing line */
  vatPercentage?: number | null
  pph23Percentage?: number | null
  /** Customer-side — edited on shipment detail once linked */
  sellingVatPercentage?: number | null
  sellingPph23Percentage?: number | null
  sellingAmount?: number | null
}

export type VendorInvoiceType = "INVOICE" | "REIMBURSEMENT"

export type CreateCostingInput = {
  costingNumber?: string
  month?: number
  year?: number
  vendorId: string
  vendorInvoiceNumber?: string | null
  vendorInvoiceDate?: string | null
  vendorInvoiceType?: VendorInvoiceType
  vendorVessel?: string | null
  paymentDate?: string | null
  breakdowns: CostingBreakdownInput[]
}

export type UpdateCostingInput = {
  costingNumber?: string
  status?: "PAID" | "UNPAID"
  vendorId?: string
  vendorInvoiceNumber?: string | null
  vendorInvoiceDate?: string | null
  vendorInvoiceType?: VendorInvoiceType
  vendorVessel?: string | null
  paymentDate?: string | null
}

export type CostingListParams = {
  page: number
  pageSize: number
  search?: string
  status?: "all" | "PAID" | "UNPAID"
  vendorId?: string
  paymentDate?: string
  from?: string
  to?: string
}

export type CostingBreakdownListParams = CostingListParams & {
  assigned?: "all" | "linked" | "unlinked"
}

export type CostingBreakdownListItem = {
  id: string
  costingId: string
  productDescription: string
  quantity: number
  price: number | string
  currencyPrice: number | string
  containerNumber?: string | null
  shipmentId?: string | null
  vatPercentage?: number | string | null
  pph23Percentage?: number | string | null
  sellingVatPercentage?: number | string | null
  sellingPph23Percentage?: number | string | null
  sellingAmount?: number | string | null
  shipment?: {
    id: string
    orderNumber: string
    status: string
    isActive: boolean
  } | null
  containerSize?: { id: string; name: string } | null
  containerType?: { id: string; name: string } | null
  costing: {
    id: string
    costingNumber: string
    vendorInvoiceNumber?: string | null
    vendorInvoiceDate?: string | null
    vendorVessel?: string | null
    paymentDate?: string | null
    status: string
    vendorId: string
    vendor?: {
      id?: string
      vendorName: string
      vendorCode?: string
    } | null
  }
  updatedBy?: { id?: string; name?: string } | null
  updatedAt?: string
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

export type PaginatedCostingBreakdowns = {
  items: CostingBreakdownListItem[]
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
    if (params.vendorId) query.set("vendorId", params.vendorId)
    if (params.paymentDate) query.set("paymentDate", params.paymentDate)
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
  getBreakdowns: async (
    params: CostingBreakdownListParams
  ): Promise<PaginatedCostingBreakdowns> => {
    const query = new URLSearchParams({
      page: String(params.page),
      pageSize: String(params.pageSize),
      status: params.status ?? "all",
      assigned: params.assigned ?? "all",
    })
    if (params.search) query.set("search", params.search)
    if (params.vendorId) query.set("vendorId", params.vendorId)
    if (params.paymentDate) query.set("paymentDate", params.paymentDate)
    if (params.from) query.set("from", params.from)
    if (params.to) query.set("to", params.to)
    const response = await apiClient.getEnvelope(
      `/costings/breakdowns?${query.toString()}`
    )
    const pagination = response.meta?.pagination ?? {
      page: params.page,
      pageSize: params.pageSize,
      total: 0,
      totalPages: 1,
    }
    return {
      items: (response.data ?? []) as CostingBreakdownListItem[],
      pagination,
    }
  },
  getById: async (id: string): Promise<CostingDetail> => {
    return apiClient.get<CostingDetail>(`/costings/${id}`)
  },
  create: async (costing: CreateCostingInput) => {
    return apiClient.post<CostingDetail>("/costings", costing)
  },
  update: async (id: string, costing: UpdateCostingInput) => {
    return apiClient.put<CostingDetail>(`/costings/${id}`, costing)
  },
  delete: async (id: string) => {
    return apiClient.delete(`/costings/${id}`)
  },
  createBreakdown: async (costingId: string, breakdown: CostingBreakdownInput) => {
    return apiClient.post<CostingBreakdown>(
      `/costings/${costingId}/breakdowns`,
      breakdown
    )
  },
  updateBreakdown: async (
    costingId: string,
    breakdownId: string,
    breakdown: Partial<CostingBreakdownInput>
  ) => {
    return apiClient.put<CostingBreakdown>(
      `/costings/${costingId}/breakdowns/${breakdownId}`,
      breakdown
    )
  },
  deleteBreakdown: async (costingId: string, breakdownId: string) => {
    return apiClient.delete(`/costings/${costingId}/breakdowns/${breakdownId}`)
  },
  createCostingAttachment: async (costingId: string, costingAttachment: FormData) => {
    return apiClient.post(`/costings/${costingId}/attachments`, costingAttachment)
  },
  updateCostingAttachment: async (
    costingId: string,
    id: string,
    costingAttachment: unknown
  ) => {
    return apiClient.put(
      `/costings/${costingId}/attachments/${id}`,
      costingAttachment
    )
  },
  deleteCostingAttachment: async (costingId: string, id: string) => {
    return apiClient.delete(`/costings/${costingId}/attachments/${id}`)
  },
  exportPph23Excel: async (params: {
    invoiceDateFrom: string
    invoiceDateTo: string
  }): Promise<{ rowCount: number | null }> => {
    const query = new URLSearchParams({
      invoiceDateFrom: params.invoiceDateFrom,
      invoiceDateTo: params.invoiceDateTo,
    })
    const fallbackFilename = `pph23-${params.invoiceDateFrom}-to-${params.invoiceDateTo}.xlsx`
    const result = await apiClient.download(
      `/costings/export/pph23?${query.toString()}`,
      fallbackFilename
    )
    return { rowCount: result.rowCount }
  },
  exportPaidExcel: async (params: {
    paymentDateFrom: string
    paymentDateTo: string
    vendorId?: string
  }): Promise<{ rowCount: number | null }> => {
    const query = new URLSearchParams({
      paymentDateFrom: params.paymentDateFrom,
      paymentDateTo: params.paymentDateTo,
    })
    if (params.vendorId) query.set("vendorId", params.vendorId)
    const vendorPart = params.vendorId ? "vendor" : "all-vendors"
    const fallbackFilename = `paid-invoices-${vendorPart}-${params.paymentDateFrom}-to-${params.paymentDateTo}.xlsx`
    const result = await apiClient.download(
      `/costings/export/paid?${query.toString()}`,
      fallbackFilename
    )
    return { rowCount: result.rowCount }
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
  },
}
