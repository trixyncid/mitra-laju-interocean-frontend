import { apiClient } from "@/lib/api-client"
import type { Sales, SalesInput, SalesShipment, SalesSummary, SalesType, SalesUpdate } from "@/lib/types/sales"

export type SalesListParams = {
  page: number
  pageSize: number
  search?: string
  salesType?: "all" | SalesType
  customerId?: string
  /** Excel-style column filters: ticked values per column field. */
  columns?: Record<string, string[]>
  sortBy?: string
  sortDir?: "asc" | "desc"
}

/** Column filter fields of the sales list, and their query names. */
export const SALES_FILTER_PARAM: Record<string, string> = {
  customer: "customerIds",
  jobType: "jobTypes",
  shipmentType: "shipmentTypes",
  opened: "openedDates",
  billing: "billing",
}

export type SalesFacet = { value: string; label: string; count: number }

function setColumnParams(query: URLSearchParams, params: Pick<SalesListParams, "columns" | "sortBy" | "sortDir">) {
  for (const [field, values] of Object.entries(params.columns ?? {})) {
    const name = SALES_FILTER_PARAM[field]
    if (name && values.length) query.set(name, values.join(","))
  }
  if (params.sortBy) {
    query.set("sortBy", params.sortBy)
    query.set("sortDir", params.sortDir ?? "asc")
  }
}

export type PaginatedSales = {
  items: Sales[]
  pagination: { page: number; pageSize: number; total: number; totalPages: number }
  summary: SalesSummary
}

export type SalesLineKind = "costings" | "sellings"

const EMPTY_SUMMARY: SalesSummary = { jobs: 0, revenue: "0", cost: "0" }

export const salesService = {
  getAll: async (params: SalesListParams): Promise<PaginatedSales> => {
    const query = new URLSearchParams({
      page: String(params.page),
      pageSize: String(params.pageSize),
      salesType: params.salesType ?? "all",
    })
    if (params.search) query.set("search", params.search)
    if (params.customerId) query.set("customerId", params.customerId)
    setColumnParams(query, params)
    const response = await apiClient.getEnvelope(`/sales?${query.toString()}`)
    const meta = response.meta as { pagination?: PaginatedSales["pagination"]; summary?: SalesSummary } | undefined
    return {
      items: (response.data ?? []) as Sales[],
      pagination: meta?.pagination ?? { page: params.page, pageSize: params.pageSize, total: 0, totalPages: 1 },
      summary: meta?.summary ?? EMPTY_SUMMARY,
    }
  },
  /** Values and counts for one column, under every other active filter. */
  getFacets: async (field: string, params: Pick<SalesListParams, "search" | "columns">): Promise<SalesFacet[]> => {
    const query = new URLSearchParams({ field })
    if (params.search) query.set("search", params.search)
    setColumnParams(query, { columns: params.columns })
    return apiClient.get<SalesFacet[]>(`/sales/facets?${query.toString()}`)
  },
  getById: async (id: string): Promise<Sales> => apiClient.get<Sales>(`/sales/${id}`),
  create: async (sales: SalesInput) => apiClient.post<Sales>("/sales", sales),
  update: async (id: string, sales: SalesUpdate) => apiClient.put<Sales>(`/sales/${id}`, sales),
  delete: async (id: string) => apiClient.delete(`/sales/${id}`),
  link: async (id: string, kind: SalesLineKind, lineIds: string[]) =>
    apiClient.post<Sales>(
      `/sales/${id}/${kind}`,
      kind === "costings" ? { costingIds: lineIds } : { sellingIds: lineIds }
    ),
  unlink: async (id: string, kind: SalesLineKind, lineId: string) => apiClient.delete(`/sales/${id}/${kind}/${lineId}`),
  shipmentOptions: async (search?: string): Promise<SalesShipment[]> => {
    const query = search ? `?${new URLSearchParams({ search }).toString()}` : ""
    return apiClient.get<SalesShipment[]>(`/sales/shipment-options${query}`)
  },
}
