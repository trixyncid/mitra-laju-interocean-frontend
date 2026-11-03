import { apiClient } from "@/lib/api-client"
import type {
  CustomerInvoice,
  CustomerInvoiceInput,
  CustomerInvoiceStatus,
  CustomerInvoiceSummary,
  CustomerInvoiceType,
  CustomerInvoiceUpdate,
} from "@/lib/types/customer-invoice"

export type CustomerInvoiceListParams = {
  page: number
  pageSize: number
  search?: string
  status?: "all" | CustomerInvoiceStatus
  customerInvoiceType?: "all" | CustomerInvoiceType
  salesId?: string
  customerId?: string
  /** Excel-style column filters: ticked values per column field. */
  columns?: Record<string, string[]>
  sortBy?: string
  sortDir?: "asc" | "desc"
}

/** Column filter fields of the customer invoice list, and their query names. */
export const CUSTOMER_INVOICE_FILTER_PARAM: Record<string, string> = {
  customer: "customerIds",
  status: "statuses",
  type: "types",
  invoiceDate: "invoiceDates",
  paymentDate: "paymentDates",
  taxInvoice: "taxInvoice",
}

export type CustomerInvoiceFacet = { value: string; label: string; count: number }

function setColumnParams(
  query: URLSearchParams,
  params: Pick<CustomerInvoiceListParams, "columns" | "sortBy" | "sortDir">
) {
  for (const [field, values] of Object.entries(params.columns ?? {})) {
    const name = CUSTOMER_INVOICE_FILTER_PARAM[field]
    if (name && values.length) query.set(name, values.join(","))
  }
  if (params.sortBy) {
    query.set("sortBy", params.sortBy)
    query.set("sortDir", params.sortDir ?? "asc")
  }
}

export type PaginatedCustomerInvoices = {
  items: CustomerInvoice[]
  pagination: { page: number; pageSize: number; total: number; totalPages: number }
  summary: CustomerInvoiceSummary
}

const EMPTY_SUMMARY: CustomerInvoiceSummary = { invoices: 0, unpaidInvoices: 0, total: "0", outstanding: "0" }

export const customerInvoiceService = {
  getAll: async (params: CustomerInvoiceListParams): Promise<PaginatedCustomerInvoices> => {
    const query = new URLSearchParams({
      page: String(params.page),
      pageSize: String(params.pageSize),
      status: params.status ?? "all",
      customerInvoiceType: params.customerInvoiceType ?? "all",
    })
    if (params.search) query.set("search", params.search)
    if (params.salesId) query.set("salesId", params.salesId)
    if (params.customerId) query.set("customerId", params.customerId)
    setColumnParams(query, params)
    const response = await apiClient.getEnvelope(`/customer-invoices?${query.toString()}`)
    const meta = response.meta as
      | { pagination?: PaginatedCustomerInvoices["pagination"]; summary?: CustomerInvoiceSummary }
      | undefined
    return {
      items: (response.data ?? []) as CustomerInvoice[],
      pagination: meta?.pagination ?? { page: params.page, pageSize: params.pageSize, total: 0, totalPages: 1 },
      summary: meta?.summary ?? EMPTY_SUMMARY,
    }
  },
  /** Downloads the list as Excel: same search, column filters and order as on screen. */
  exportExcel: async (
    params: Omit<CustomerInvoiceListParams, "page" | "pageSize">
  ): Promise<{ rowCount: number | null }> => {
    const query = new URLSearchParams({
      status: params.status ?? "all",
      customerInvoiceType: params.customerInvoiceType ?? "all",
    })
    if (params.search) query.set("search", params.search)
    if (params.salesId) query.set("salesId", params.salesId)
    if (params.customerId) query.set("customerId", params.customerId)
    setColumnParams(query, params)
    const fallbackFilename = `customer-invoices-${new Date().toISOString().slice(0, 10)}.xlsx`
    const result = await apiClient.download(`/customer-invoices/export?${query.toString()}`, fallbackFilename)
    return { rowCount: result.rowCount }
  },
  /** Values and counts for one column, under every other active filter. */
  getFacets: async (
    field: string,
    params: Pick<CustomerInvoiceListParams, "search" | "columns">
  ): Promise<CustomerInvoiceFacet[]> => {
    const query = new URLSearchParams({ field })
    if (params.search) query.set("search", params.search)
    setColumnParams(query, { columns: params.columns })
    return apiClient.get<CustomerInvoiceFacet[]>(`/customer-invoices/facets?${query.toString()}`)
  },
  getById: async (id: string): Promise<CustomerInvoice> => apiClient.get<CustomerInvoice>(`/customer-invoices/${id}`),
  nextNumber: async (salesId: string, type: CustomerInvoiceType) =>
    apiClient.get<{ salesNumber: string; customerInvoiceNumber: string }>(
      `/customer-invoices/next-number?${new URLSearchParams({ salesId, customerInvoiceType: type }).toString()}`
    ),
  create: async (invoice: CustomerInvoiceInput) => apiClient.post<CustomerInvoice>("/customer-invoices", invoice),
  update: async (id: string, invoice: CustomerInvoiceUpdate) =>
    apiClient.put<CustomerInvoice>(`/customer-invoices/${id}`, invoice),
  delete: async (id: string) => apiClient.delete(`/customer-invoices/${id}`),
}
