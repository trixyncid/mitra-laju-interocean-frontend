import { apiClient } from "@/lib/api-client"
import type { AppModule, ShipmentType } from "@/lib/permissions"

export type RolePermission = {
  id?: string
  module: AppModule
  canView: boolean
  canCreate: boolean
  canEdit: boolean
  canDelete: boolean
}

export type Role = {
  id: string
  slug: string
  name: string
  description: string | null
  isSystem: boolean
  allowedShipmentTypes: ShipmentType[]
  createdAt: string
  updatedAt: string
  permissions: RolePermission[]
  _count: { users: number }
}

export type ModuleCatalogItem = {
  key: AppModule
  label: string
  actions: string[]
}

export type CreateRolePayload = {
  slug: string
  name: string
  description?: string | null
  allowedShipmentTypes?: ShipmentType[]
  permissions?: RolePermission[]
}

export type UpdateRolePayload = {
  slug?: string
  name?: string
  description?: string | null
  allowedShipmentTypes?: ShipmentType[]
  permissions?: RolePermission[]
}

export type RoleListParams = {
  page: number
  pageSize: number
  search?: string
}

export type PaginatedRoles = {
  items: Role[]
  pagination: {
    page: number
    pageSize: number
    total: number
    totalPages: number
  }
}

export const rolesService = {
  getAll: async (params: RoleListParams): Promise<PaginatedRoles> => {
    const query = new URLSearchParams({
      page: String(params.page),
      pageSize: String(params.pageSize),
    })
    if (params.search) query.set("search", params.search)
    const response = await apiClient.getEnvelope(`/roles?${query.toString()}`)
    const pagination = response.meta?.pagination ?? {
      page: params.page,
      pageSize: params.pageSize,
      total: 0,
      totalPages: 1,
    }
    return {
      items: (response.data ?? []) as Role[],
      pagination,
    }
  },
  getById: async (id: string): Promise<Role> => apiClient.get(`/roles/${id}`),
  getModules: async (): Promise<ModuleCatalogItem[]> =>
    apiClient.get("/roles/modules"),
  create: async (payload: CreateRolePayload): Promise<Role> =>
    apiClient.post("/roles", payload),
  update: async (id: string, payload: UpdateRolePayload): Promise<Role> =>
    apiClient.put(`/roles/${id}`, payload),
  delete: async (id: string): Promise<Role> => apiClient.delete(`/roles/${id}`),
}
