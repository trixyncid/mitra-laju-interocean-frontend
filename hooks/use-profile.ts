import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import {
  usersService,
  type ChangePasswordPayload,
  type UpdateUserPayload,
} from "@/services/users.service"
import { authClient } from "@/lib/auth-client"

export function useUserProfile(userId: string | undefined) {
  return useQuery({
    queryKey: ["user", userId],
    queryFn: () => usersService.getById(userId!),
    enabled: !!userId,
  })
}

export function useUpdateProfile() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, user }: { id: string; user: UpdateUserPayload }) =>
      usersService.update(id, user),
    onSuccess: async (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["user", id] })
      queryClient.invalidateQueries({ queryKey: ["users"] })
      await authClient.getSession()
      toast.success("Profile updated successfully")
    },
    onError: (error: Error) => toast.error(error.message),
  })
}

export function useChangePassword() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, ...payload }: ChangePasswordPayload & { id: string }) =>
      usersService.changePassword(id, payload),
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["user", id] })
      toast.success("Password changed successfully")
    },
    onError: (error: Error) => toast.error(error.message),
  })
}

export function useUploadAvatar() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, avatar }: { id: string; avatar: FormData }) =>
      usersService.uploadAvatar(id, avatar),
    onSuccess: async (data, { id }) => {
      queryClient.setQueryData(["user", id], data)
      await queryClient.refetchQueries({ queryKey: ["user-avatar", id] })
      queryClient.invalidateQueries({ queryKey: ["users"] })
      await authClient.getSession()
      toast.success("Profile photo updated")
    },
    onError: (error: Error) => toast.error(error.message),
  })
}

export function useRemoveAvatar() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id }: { id: string }) =>
      usersService.update(id, { image: null }),
    onSuccess: async (data, { id }) => {
      queryClient.setQueryData(["user", id], data)
      queryClient.removeQueries({ queryKey: ["user-avatar", id] })
      queryClient.invalidateQueries({ queryKey: ["users"] })
      await authClient.getSession()
      toast.success("Profile photo removed")
    },
    onError: (error: Error) => toast.error(error.message),
  })
}
