import { apiClient } from "@/lib/api-client"
import type { ContainerLookup } from "@/app/dashboard/containers/columns"

export type ContainerLookupKind = "size" | "type"

export type ContainerLookupListParams = {
  page: number
  pageSize: number
  search?: string
  status?: "all" | "true" | "false"
  from?: string
  to?: string
}

export type PaginatedContainerLookups = {
  items: ContainerLookup[]
  pagination: {
    page: number
    pageSize: number
    total: number
    totalPages: number
  }
}

function pathFor(kind: ContainerLookupKind) {
  return kind === "size" ? "/container-sizes" : "/container-types"
}

function createContainerLookupService(kind: ContainerLookupKind) {
  const basePath = pathFor(kind)

  return {
    getAll: async (params: ContainerLookupListParams): Promise<PaginatedContainerLookups> => {
      const query = new URLSearchParams({
        page: String(params.page),
        pageSize: String(params.pageSize),
        status: params.status ?? "all",
      })
      if (params.search) query.set("search", params.search)
      if (params.from) query.set("from", params.from)
      if (params.to) query.set("to", params.to)
      const response = await apiClient.getEnvelope(`${basePath}?${query.toString()}`)
      const pagination = response.meta?.pagination ?? {
        page: params.page,
        pageSize: params.pageSize,
        total: 0,
        totalPages: 1,
      }
      return {
        items: (response.data ?? []) as ContainerLookup[],
        pagination,
      }
    },
    create: async (payload: Pick<ContainerLookup, "name"> & { isActive?: boolean }) => {
      return apiClient.post<ContainerLookup>(basePath, payload)
    },
    update: async (id: string, payload: Partial<ContainerLookup>) => {
      return apiClient.put(`${basePath}/${id}`, payload)
    },
    delete: async (id: string) => {
      return apiClient.delete(`${basePath}/${id}`)
    },
  }
}

export const containerSizesService = createContainerLookupService("size")
export const containerTypesService = createContainerLookupService("type")
