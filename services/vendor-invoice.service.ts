import { apiClient } from "@/lib/api-client"
import { openFetchedAttachment } from "@/lib/open-attachment"
import type { VendorInvoice, VendorInvoiceBreakdown, VendorInvoiceDetail } from "@/app/dashboard/vendor-invoices/columns"

export type VendorInvoiceBreakdownInput = {
  productDescription: string
  quantity: number
  price: number
  currencyPrice: number
  containerNumber?: string | null
  containerSizeId?: string | null
  containerTypeId?: string | null
  /** Invoice tax on the vendor invoice line */
  vatPercentage?: number | null
  pph23Percentage?: number | null
}

export type VendorInvoiceType = "INVOICE" | "REIMBURSEMENT"

export type CreateVendorInvoiceInput = {
  vendorId: string
  vendorInvoiceNumber: string
  vendorInvoiceDate?: string | null
  vendorInvoiceType?: VendorInvoiceType
  vendorVessel?: string | null
  paymentDate?: string | null
  breakdowns: VendorInvoiceBreakdownInput[]
}

export type UpdateVendorInvoiceInput = {
  status?: "PAID" | "UNPAID"
  vendorId?: string
  vendorInvoiceNumber?: string
  vendorInvoiceDate?: string | null
  vendorInvoiceType?: VendorInvoiceType
  vendorVessel?: string | null
  paymentDate?: string | null
}

export type VendorInvoiceListParams = {
  page: number
  pageSize: number
  search?: string
  status?: "all" | "PAID" | "UNPAID"
  vendorId?: string
  paymentDate?: string
  from?: string
  to?: string
  /** Excel-style column filters: ticked values per column field. */
  columns?: Record<string, string[]>
  sortBy?: string
  sortDir?: "asc" | "desc"
}

export type VendorInvoiceBreakdownListParams = VendorInvoiceListParams & {
  costing?: "all" | "linked" | "unlinked"
}

/** Column filter fields of the vendor invoice lists, and their query names. */
export const VENDOR_INVOICE_FILTER_PARAM: Record<string, string> = {
  vendor: "vendorIds",
  status: "statuses",
  type: "types",
  invoiceMonth: "invoiceMonths",
  paymentMonth: "paymentMonths",
  taxInvoice: "taxInvoice",
  costing: "costing",
}

function setColumnParams(query: URLSearchParams, params: VendorInvoiceListParams) {
  for (const [field, values] of Object.entries(params.columns ?? {})) {
    const name = VENDOR_INVOICE_FILTER_PARAM[field]
    if (name && values.length) query.set(name, values.join(","))
  }
  if (params.sortBy) {
    query.set("sortBy", params.sortBy)
    query.set("sortDir", params.sortDir ?? "asc")
  }
}

export type VendorInvoiceFacet = { value: string; label: string; count: number }

export type VendorInvoiceBreakdownListItem = {
  id: string
  vendorInvoiceId: string
  productDescription: string
  quantity: number
  price: number | string
  currencyPrice: number | string
  containerNumber?: string | null
  containerSizeId?: string | null
  containerTypeId?: string | null
  vatPercentage?: number | string | null
  pph23Percentage?: number | string | null
  containerSize?: { id: string; name: string } | null
  containerType?: { id: string; name: string } | null
  costing?: { id: string; costingDescription: string | null } | null
  vendorInvoice: {
    id: string
    vendorInvoiceNumber: string
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

export type PaginatedVendorInvoices = {
  items: VendorInvoice[]
  pagination: {
    page: number
    pageSize: number
    total: number
    totalPages: number
  }
}

export type PaginatedVendorInvoiceBreakdowns = {
  items: VendorInvoiceBreakdownListItem[]
  pagination: {
    page: number
    pageSize: number
    total: number
    totalPages: number
  }
}

export const vendorInvoiceService = {
  getAll: async (params: VendorInvoiceListParams): Promise<PaginatedVendorInvoices> => {
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
    setColumnParams(query, params)
    const response = await apiClient.getEnvelope(`/vendor-invoices?${query.toString()}`)
    const pagination = response.meta?.pagination ?? {
      page: params.page,
      pageSize: params.pageSize,
      total: 0,
      totalPages: 1,
    }
    return {
      items: (response.data ?? []) as VendorInvoice[],
      pagination,
    }
  },
  getBreakdowns: async (
    params: VendorInvoiceBreakdownListParams
  ): Promise<PaginatedVendorInvoiceBreakdowns> => {
    const query = new URLSearchParams({
      page: String(params.page),
      pageSize: String(params.pageSize),
      status: params.status ?? "all",
      costing: params.costing ?? "all",
    })
    setColumnParams(query, params)
    if (params.search) query.set("search", params.search)
    if (params.vendorId) query.set("vendorId", params.vendorId)
    if (params.paymentDate) query.set("paymentDate", params.paymentDate)
    if (params.from) query.set("from", params.from)
    if (params.to) query.set("to", params.to)
    const response = await apiClient.getEnvelope(
      `/vendor-invoices/breakdowns?${query.toString()}`
    )
    const pagination = response.meta?.pagination ?? {
      page: params.page,
      pageSize: params.pageSize,
      total: 0,
      totalPages: 1,
    }
    return {
      items: (response.data ?? []) as VendorInvoiceBreakdownListItem[],
      pagination,
    }
  },
  /** Values and counts for one column, under every other active filter. */
  getFacets: async (
    scope: "invoices" | "lines",
    field: string,
    params: Omit<VendorInvoiceBreakdownListParams, "page" | "pageSize">
  ): Promise<VendorInvoiceFacet[]> => {
    const query = new URLSearchParams({ field, status: params.status ?? "all" })
    if (params.search) query.set("search", params.search)
    if (scope === "lines" && params.costing && params.costing !== "all") query.set("costing", params.costing)
    setColumnParams(query, { ...params, page: 1, pageSize: 1, sortBy: undefined })
    const path = scope === "lines" ? "/vendor-invoices/breakdowns/facets" : "/vendor-invoices/facets"
    return apiClient.get<VendorInvoiceFacet[]>(`${path}?${query.toString()}`)
  },
  getById: async (id: string): Promise<VendorInvoiceDetail> => {
    return apiClient.get<VendorInvoiceDetail>(`/vendor-invoices/${id}`)
  },
  create: async (vendorInvoice: CreateVendorInvoiceInput) => {
    return apiClient.post<VendorInvoiceDetail>("/vendor-invoices", vendorInvoice)
  },
  update: async (id: string, vendorInvoice: UpdateVendorInvoiceInput) => {
    return apiClient.put<VendorInvoiceDetail>(`/vendor-invoices/${id}`, vendorInvoice)
  },
  delete: async (id: string) => {
    return apiClient.delete(`/vendor-invoices/${id}`)
  },
  createBreakdown: async (vendorInvoiceId: string, breakdown: VendorInvoiceBreakdownInput) => {
    return apiClient.post<VendorInvoiceBreakdown>(
      `/vendor-invoices/${vendorInvoiceId}/breakdowns`,
      breakdown
    )
  },
  updateBreakdown: async (
    vendorInvoiceId: string,
    breakdownId: string,
    breakdown: Partial<VendorInvoiceBreakdownInput>
  ) => {
    return apiClient.put<VendorInvoiceBreakdown>(
      `/vendor-invoices/${vendorInvoiceId}/breakdowns/${breakdownId}`,
      breakdown
    )
  },
  deleteBreakdown: async (vendorInvoiceId: string, breakdownId: string) => {
    return apiClient.delete(`/vendor-invoices/${vendorInvoiceId}/breakdowns/${breakdownId}`)
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
      `/vendor-invoices/export/pph23?${query.toString()}`,
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
      `/vendor-invoices/export/paid?${query.toString()}`,
      fallbackFilename
    )
    return { rowCount: result.rowCount }
  },
  createAttachment: async (vendorInvoiceId: string, attachment: FormData) => {
    return apiClient.post(`/vendor-invoices/${vendorInvoiceId}/attachments`, attachment)
  },
  updateAttachment: async (
    vendorInvoiceId: string,
    id: string,
    attachment: { attachmentName: string }
  ) => {
    return apiClient.put(
      `/vendor-invoices/${vendorInvoiceId}/attachments/${id}`,
      attachment
    )
  },
  deleteAttachment: async (vendorInvoiceId: string, id: string) => {
    return apiClient.delete(`/vendor-invoices/${vendorInvoiceId}/attachments/${id}`)
  },
  viewAttachment: async (vendorInvoiceId: string, id: string) => {
    await openFetchedAttachment(async () => {
      const response = await apiClient.get<{
        url: string
        contentType?: string | null
        fileName?: string | null
      }>(`/vendor-invoices/${vendorInvoiceId}/attachments/${id}`)
      return {
        url: response.url,
        contentType: response.contentType,
        fileName: response.fileName,
      }
    })
  },
}
