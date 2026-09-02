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
