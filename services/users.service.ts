import type { User } from "@/app/dashboard/users/columns"
import { apiClient } from "@/lib/api-client"

export type CreateUserPayload = {
  name: string
  email: string
  password: string
  roleId?: string
  role?: string
  image?: string | null
  emailVerified?: boolean
}

export type UpdateUserPayload = {
  name?: string
  email?: string
  roleId?: string
  role?: string
  image?: string | null
  emailVerified?: boolean
  isActive?: boolean
}

export type ChangePasswordPayload = {
  currentPassword: string
  newPassword: string
}

export type UserListParams = {
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

/** Column filter fields of the team list, and their query names. */
export const USER_FILTER_PARAM: Record<string, string> = {
  role: "roleIds",
  status: "statuses",
  createdAt: "createdDates",
  updatedAt: "updatedDates",
}

export type UserFacet = { value: string; label: string; count: number }

function setColumnParams(
  query: URLSearchParams,
  params: Pick<UserListParams, "columns" | "sortBy" | "sortDir">
) {
  for (const [field, values] of Object.entries(params.columns ?? {})) {
    const name = USER_FILTER_PARAM[field]
    if (name && values.length) query.set(name, values.join(","))
  }
  if (params.sortBy) {
    query.set("sortBy", params.sortBy)
    query.set("sortDir", params.sortDir ?? "asc")
  }
}

export type PaginatedUsers = {
  items: User[]
  pagination: {
    page: number
    pageSize: number
    total: number
    totalPages: number
  }
}

export const usersService = {
  getAll: async (params: UserListParams): Promise<PaginatedUsers> => {
    const query = new URLSearchParams({
      page: String(params.page),
      pageSize: String(params.pageSize),
      status: params.status ?? "all",
    })
    if (params.search) query.set("search", params.search)
    if (params.from) query.set("from", params.from)
    if (params.to) query.set("to", params.to)
    setColumnParams(query, params)
    const response = await apiClient.getEnvelope(`/users?${query.toString()}`)
    const pagination = response.meta?.pagination ?? {
      page: params.page,
      pageSize: params.pageSize,
      total: 0,
      totalPages: 1,
    }
    return {
      items: (response.data ?? []) as User[],
      pagination,
    }
  },
  /** Values and counts for one column, under the search and every other column filter. */
  getFacets: async (field: string, params: Pick<UserListParams, "search" | "columns">): Promise<UserFacet[]> => {
    const query = new URLSearchParams({ field })
    if (params.search) query.set("search", params.search)
    setColumnParams(query, { columns: params.columns })
    return apiClient.get<UserFacet[]>(`/users/facets?${query.toString()}`)
  },
  getById: async (id: string): Promise<User> => apiClient.get(`/users/${id}`),
  create: async (user: CreateUserPayload): Promise<User> => apiClient.post("/users", user),
  update: async (id: string, user: UpdateUserPayload): Promise<User> =>
    apiClient.put(`/users/${id}`, user),
  changePassword: async (id: string, payload: ChangePasswordPayload) =>
    apiClient.put(`/users/${id}/password`, payload),
  resetPassword: async (id: string, password: string): Promise<User> =>
    apiClient.post(`/users/${id}/reset-password`, { password }),
  uploadAvatar: async (id: string, avatar: FormData): Promise<User> =>
    apiClient.post(`/users/${id}/avatar`, avatar),
  getAvatarUrl: async (id: string): Promise<{ url: string }> =>
    apiClient.get(`/users/${id}/avatar`),
  delete: async (id: string) => apiClient.delete(`/users/${id}`),
}
