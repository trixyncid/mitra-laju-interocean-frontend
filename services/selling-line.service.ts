import { apiClient } from "@/lib/api-client"
import type { SalesOption } from "@/lib/types/costing"
import type { Selling, SellingInput, SellingSummary } from "@/lib/types/selling"

export type SellingListParams = {
  page: number
  pageSize: number
  search?: string
  customerId?: string
  salesId?: string
  costed?: "all" | "costed" | "uncosted"
  /** Whether the line already belongs to a sales job. */
  sales?: "all" | "assigned" | "unassigned"
  /** Excel-style column filters: ticked values per column field. */
  columns?: Record<string, string[]>
  sortBy?: string
  sortDir?: "asc" | "desc"
}

/** Column filter fields of the selling list, and their query names. */
export const SELLING_FILTER_PARAM: Record<string, string> = {
  customer: "customerIds",
  salesJob: "salesIds",
  invoice: "invoice",
  costs: "costs",
  createdDate: "createdDates",
}

export type SellingFacet = { value: string; label: string; count: number }

function listQuery(params: Omit<SellingListParams, "page" | "pageSize">) {
  const query = new URLSearchParams({ costed: params.costed ?? "all", sales: params.sales ?? "all" })
  if (params.search) query.set("search", params.search)
  if (params.customerId) query.set("customerId", params.customerId)
  if (params.salesId) query.set("salesId", params.salesId)
  for (const [field, values] of Object.entries(params.columns ?? {})) {
    const name = SELLING_FILTER_PARAM[field]
    if (name && values.length) query.set(name, values.join(","))
  }
  if (params.sortBy) {
    query.set("sortBy", params.sortBy)
    query.set("sortDir", params.sortDir ?? "asc")
  }
  return query
}

export type PaginatedSellings = {
  items: Selling[]
  pagination: { page: number; pageSize: number; total: number; totalPages: number }
  summary: SellingSummary
}

const EMPTY_SUMMARY: SellingSummary = { lines: 0, gross: "0", vat: "0", pph23: "0", net: "0", cost: "0", costedLines: 0 }

/** Selling lines API (the paused customer-invoice screens use `selling.service`). */
export const sellingLineService = {
  getAll: async (params: SellingListParams): Promise<PaginatedSellings> => {
    const query = listQuery(params)
    query.set("page", String(params.page))
    query.set("pageSize", String(params.pageSize))
    const response = await apiClient.getEnvelope(`/sellings?${query.toString()}`)
    const meta = response.meta as { pagination?: PaginatedSellings["pagination"]; summary?: SellingSummary } | undefined
    return {
      items: (response.data ?? []) as Selling[],
      pagination: meta?.pagination ?? { page: params.page, pageSize: params.pageSize, total: 0, totalPages: 1 },
      summary: meta?.summary ?? EMPTY_SUMMARY,
    }
  },
  /** Values and counts for one column, under every other active filter. */
  getFacets: async (field: string, params: Omit<SellingListParams, "page" | "pageSize">): Promise<SellingFacet[]> => {
    const query = listQuery({ ...params, sortBy: undefined })
    query.set("field", field)
    return apiClient.get<SellingFacet[]>(`/sellings/facets?${query.toString()}`)
  },
  /** Downloads the list as Excel: same search, column filters and order as on screen. */
  exportExcel: async (params: Omit<SellingListParams, "page" | "pageSize">): Promise<{ rowCount: number | null }> => {
    const fallbackFilename = `sellings-${new Date().toISOString().slice(0, 10)}.xlsx`
    const result = await apiClient.download(`/sellings/export?${listQuery(params).toString()}`, fallbackFilename)
    return { rowCount: result.rowCount }
  },
  getById: async (id: string): Promise<Selling> => apiClient.get<Selling>(`/sellings/${id}`),
  create: async (selling: SellingInput) => apiClient.post<Selling>("/sellings", selling),
  update: async (id: string, selling: Partial<Omit<SellingInput, "costingIds">>) =>
    apiClient.put<Selling>(`/sellings/${id}`, selling),
  delete: async (id: string) => apiClient.delete(`/sellings/${id}`),
  linkCostings: async (id: string, costingIds: string[]) =>
    apiClient.post<Selling>(`/sellings/${id}/costings`, { costingIds }),
  unlinkCosting: async (id: string, costingId: string) => apiClient.delete(`/sellings/${id}/costings/${costingId}`),
  salesOptions: async (search?: string): Promise<SalesOption[]> => {
    const query = search ? `?${new URLSearchParams({ search }).toString()}` : ""
    return apiClient.get<SalesOption[]>(`/sellings/sales-options${query}`)
  },
}
