import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import type { User } from "@/app/dashboard/users/columns"
import {
  usersService,
  type CreateUserPayload,
  type ResetPasswordResponse,
  type UpdateUserPayload,
} from "@/services/users.service"

export const useUsers = () => {
  return useQuery({
    queryKey: ["users"],
    queryFn: usersService.getAll,
  })
}

export const useCreateUser = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (user: CreateUserPayload) => usersService.create(user),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] })
      toast.success("User created successfully")
    },
    onError: (error: Error) => toast.error(error.message),
  })
}

export const useUpdateUser = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, user }: { id: string; user: UpdateUserPayload }) =>
      usersService.update(id, user),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] })
      toast.success("User updated successfully")
    },
    onError: (error: Error) => toast.error(error.message),
  })
}

export const useDeleteUser = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: usersService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] })
      toast.success("User deactivated successfully")
    },
    onError: (error: Error) => toast.error(error.message),
  })
}

export const useResetPassword = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: usersService.resetPassword,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] })
    },
    onError: (error: Error) => toast.error(error.message),
  })
}

export type { ResetPasswordResponse }
