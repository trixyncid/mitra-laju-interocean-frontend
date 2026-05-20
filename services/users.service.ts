import type { User } from "@/app/dashboard/users/columns"
import { apiClient } from "@/lib/api-client"

export type CreateUserPayload = {
  name: string
  email: string
  password: string
  role?: User["role"]
  image?: string | null
  emailVerified?: boolean
}

export type UpdateUserPayload = {
  name?: string
  email?: string
  role?: User["role"]
  image?: string | null
  emailVerified?: boolean
  isActive?: boolean
}

export type ChangePasswordPayload = {
  currentPassword: string
  newPassword: string
}

export type ResetPasswordResponse = {
  user: User
  temporaryPassword: string
}

export const usersService = {
  getAll: async (): Promise<User[]> => apiClient.get("/users"),
  getById: async (id: string): Promise<User> => apiClient.get(`/users/${id}`),
  create: async (user: CreateUserPayload) => apiClient.post("/users", user),
  update: async (id: string, user: UpdateUserPayload) => apiClient.put(`/users/${id}`, user),
  changePassword: async (id: string, payload: ChangePasswordPayload) =>
    apiClient.put(`/users/${id}/password`, payload),
  resetPassword: async (id: string): Promise<ResetPasswordResponse> =>
    apiClient.post(`/users/${id}/reset-password`, {}),
  delete: async (id: string) => apiClient.delete(`/users/${id}`),
}
