import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import {
  usersService,
  type ChangePasswordPayload,
  type UpdateUserPayload,
} from "@/services/users.service"
import { authClient } from "@/lib/auth-client"
import { userKeys } from "@/lib/query-keys"

export function useUserProfile(userId: string | undefined) {
  return useQuery({
    queryKey: userKeys.detail(userId ?? ""),
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
      queryClient.invalidateQueries({ queryKey: userKeys.detail(id) })
      queryClient.invalidateQueries({ queryKey: userKeys.all })
      await authClient.getSession()
      toast.success("Profile updated successfully")
    },
  })
}

export function useChangePassword() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, ...payload }: ChangePasswordPayload & { id: string }) =>
      usersService.changePassword(id, payload),
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: userKeys.detail(id) })
      toast.success("Password changed successfully")
    },
  })
}

export function useUploadAvatar() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, avatar }: { id: string; avatar: FormData }) =>
      usersService.uploadAvatar(id, avatar),
    onSuccess: async (data, { id }) => {
      queryClient.setQueryData(userKeys.detail(id), data)
      await queryClient.refetchQueries({ queryKey: ["user-avatar", id] })
      queryClient.invalidateQueries({ queryKey: userKeys.all })
      await authClient.getSession()
      toast.success("Profile photo updated")
    },
  })
}

export function useRemoveAvatar() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id }: { id: string }) =>
      usersService.update(id, { image: null }),
    onSuccess: async (data, { id }) => {
      queryClient.setQueryData(userKeys.detail(id), data)
      queryClient.removeQueries({ queryKey: ["user-avatar", id] })
      queryClient.invalidateQueries({ queryKey: userKeys.all })
      await authClient.getSession()
      toast.success("Profile photo removed")
    },
  })
}
