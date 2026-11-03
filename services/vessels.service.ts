import { apiClient } from "@/lib/api-client";
import { Vessel } from "@/app/dashboard/vessels/columns";

export type VesselListParams = {
    page: number
    pageSize: number
    search?: string
    status?: "all" | "true" | "false"
    from?: string
    to?: string
    /** Excel-style column filters: ticked values per column field. */
    columns?: Record<string, string[]>
    sortBy?: string
    sortDir?: "asc" | "desc"
}

/** Column filter fields of the vessel list, and their query names. */
export const VESSEL_FILTER_PARAM: Record<string, string> = {
    vesselName: "vesselNames",
    voyageNumber: "voyageNumbers",
    etd: "etds",
    eta: "etas",
    closingReefer: "closingReefers",
    status: "statuses",
}

/** Free-text values (names) are encoded one by one so a comma inside a name survives the list. */
const ENCODED_FIELDS = new Set(["vesselName", "voyageNumber"])

export type VesselFacet = { value: string; label: string; count: number }

export type VesselExportParams = Pick<VesselListParams, "search" | "columns" | "sortBy" | "sortDir">

function setColumnParams(
    query: URLSearchParams,
    params: Pick<VesselListParams, "columns" | "sortBy" | "sortDir">
) {
    for (const [field, values] of Object.entries(params.columns ?? {})) {
        const name = VESSEL_FILTER_PARAM[field]
        if (!name || !values.length) continue
        query.set(name, (ENCODED_FIELDS.has(field) ? values.map(encodeURIComponent) : values).join(","))
    }
    if (params.sortBy) {
        query.set("sortBy", params.sortBy)
        query.set("sortDir", params.sortDir ?? "asc")
    }
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
        setColumnParams(query, params)
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
    /** Values and counts for one column, under the search and every other column filter. */
    getFacets: async (
        field: string,
        params: Pick<VesselListParams, "search" | "columns">
    ): Promise<VesselFacet[]> => {
        const query = new URLSearchParams({ field })
        if (params.search) query.set("search", params.search)
        setColumnParams(query, { columns: params.columns })
        return apiClient.get<VesselFacet[]>(`/vessels/facets?${query.toString()}`)
    },
    /** Every vessel matching the search and column filters, in the list's order, as Excel. */
    exportExcel: async (params: VesselExportParams): Promise<{ rowCount: number | null }> => {
        const query = new URLSearchParams()
        if (params.search) query.set("search", params.search)
        setColumnParams(query, params)
        const fallbackFilename = `vessels-${new Date().toLocaleDateString("en-CA")}.xlsx`
        const result = await apiClient.download(`/vessels/export?${query.toString()}`, fallbackFilename)
        return { rowCount: result.rowCount }
    },
    getById: async (id: string) => {
        const response = await apiClient.get(`/vessels/${id}`);
        return response;
    },
    create: async (vessel: Vessel): Promise<Vessel> => {
        return apiClient.post<Vessel>("/vessels", vessel);
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
