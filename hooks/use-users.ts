import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import type { User } from "@/app/dashboard/users/columns"
import {
  usersService,
  type CreateUserPayload,
  type UserListParams,
  type UpdateUserPayload,
} from "@/services/users.service"
import { userKeys } from "@/lib/query-keys"

export const useUsers = (params: UserListParams, enabled = true) => {
  return useQuery({
    queryKey: userKeys.list(params),
    queryFn: () => usersService.getAll(params),
    enabled,
  })
}

export function useUserById(userId: string | undefined) {
  return useQuery({
    queryKey: userKeys.detail(userId ?? ""),
    queryFn: () => usersService.getById(userId!),
    enabled: !!userId,
  })
}

export const useCreateUser = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (user: CreateUserPayload) => usersService.create(user) as Promise<User>,
    onSuccess: (data) => {
      queryClient.setQueryData(userKeys.detail(data.id), data)
      queryClient.invalidateQueries({ queryKey: userKeys.all })
      toast.success("User created successfully")
    },
  })
}

export const useUpdateUser = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, user }: { id: string; user: UpdateUserPayload }) =>
      usersService.update(id, user),
    onSuccess: (data, { id }) => {
      queryClient.setQueryData(userKeys.detail(id), data)
      queryClient.invalidateQueries({ queryKey: userKeys.all })
      toast.success("User updated successfully")
    },
  })
}

export const useDeleteUser = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: usersService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.all })
      toast.success("User deactivated successfully")
    },
  })
}

export const useResetPassword = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, password }: { id: string; password: string }) =>
      usersService.resetPassword(id, password),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.all })
    },
  })
}
