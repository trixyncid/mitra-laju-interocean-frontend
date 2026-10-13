import { apiClient } from "@/lib/api-client"
import type {
  Costing,
  CostingInput,
  CostingSummary,
  SalesOption,
} from "@/lib/types/costing"

export type CostingListParams = {
  page: number
  pageSize: number
  search?: string
  vendorId?: string
  salesId?: string
  matched?: "all" | "matched" | "unmatched"
  selling?: "all" | "linked" | "unlinked"
  /** Whether the line already belongs to a sales job. */
  sales?: "all" | "assigned" | "unassigned"
  /** Excel-style column filters: ticked values per column field. */
  columns?: Record<string, string[]>
  sortBy?: string
  sortDir?: "asc" | "desc"
}

/** Column filter fields of the costing list, and their query names. */
export const COSTING_FILTER_PARAM: Record<string, string> = {
  vendor: "vendorIds",
  source: "sources",
  salesJob: "salesIds",
  charged: "charged",
  vendorBill: "vendorBill",
  createdDate: "createdDates",
}

export type CostingFacet = { value: string; label: string; count: number }

function listQuery(params: Omit<CostingListParams, "page" | "pageSize">) {
  const query = new URLSearchParams({
    matched: params.matched ?? "all",
    selling: params.selling ?? "all",
    sales: params.sales ?? "all",
  })
  if (params.search) query.set("search", params.search)
  if (params.vendorId) query.set("vendorId", params.vendorId)
  if (params.salesId) query.set("salesId", params.salesId)
  for (const [field, values] of Object.entries(params.columns ?? {})) {
    const name = COSTING_FILTER_PARAM[field]
    if (name && values.length) query.set(name, values.join(","))
  }
  if (params.sortBy) {
    query.set("sortBy", params.sortBy)
    query.set("sortDir", params.sortDir ?? "asc")
  }
  return query
}

export type PaginatedCostings = {
  items: Costing[]
  pagination: { page: number; pageSize: number; total: number; totalPages: number }
  summary: CostingSummary
}

const EMPTY_SUMMARY: CostingSummary = {
  lines: 0,
  gross: "0",
  vat: "0",
  pph23: "0",
  net: "0",
  billed: "0",
  matchedLines: 0,
}

export const costingService = {
  getAll: async (params: CostingListParams): Promise<PaginatedCostings> => {
    const query = listQuery(params)
    query.set("page", String(params.page))
    query.set("pageSize", String(params.pageSize))
    const response = await apiClient.getEnvelope(`/costings?${query.toString()}`)
    const meta = response.meta as
      | { pagination?: PaginatedCostings["pagination"]; summary?: CostingSummary }
      | undefined
    return {
      items: (response.data ?? []) as Costing[],
      pagination: meta?.pagination ?? {
        page: params.page,
        pageSize: params.pageSize,
        total: 0,
        totalPages: 1,
      },
      summary: meta?.summary ?? EMPTY_SUMMARY,
    }
  },
  /** Values and counts for one column, under every other active filter. */
  getFacets: async (field: string, params: Omit<CostingListParams, "page" | "pageSize">): Promise<CostingFacet[]> => {
    const query = listQuery({ ...params, sortBy: undefined })
    query.set("field", field)
    return apiClient.get<CostingFacet[]>(`/costings/facets?${query.toString()}`)
  },
  getById: async (id: string): Promise<Costing> => apiClient.get<Costing>(`/costings/${id}`),
  create: async (costing: CostingInput) => apiClient.post<Costing>("/costings", costing),
  update: async (id: string, costing: CostingInput) =>
    apiClient.put<Costing>(`/costings/${id}`, costing),
  delete: async (id: string) => apiClient.delete(`/costings/${id}`),
  matchLines: async (id: string, breakdownIds: string[]) =>
    apiClient.post<Costing>(`/costings/${id}/vendor-invoice-lines`, { breakdownIds }),
  unmatchLine: async (id: string, breakdownId: string) =>
    apiClient.delete(`/costings/${id}/vendor-invoice-lines/${breakdownId}`),
  salesOptions: async (search?: string): Promise<SalesOption[]> => {
    const query = search ? `?${new URLSearchParams({ search }).toString()}` : ""
    return apiClient.get<SalesOption[]>(`/costings/sales-options${query}`)
  },
}
