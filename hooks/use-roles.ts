import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import {
  rolesService,
  type CreateRolePayload,
  type RoleListParams,
  type UpdateRolePayload,
} from "@/services/roles.service"

export const useRoles = (params: RoleListParams) => {
  return useQuery({
    queryKey: ["roles", params],
    queryFn: () => rolesService.getAll(params),
  })
}

export const useRolesOptions = () => {
  return useQuery({
    queryKey: ["roles", "options"],
    queryFn: () => rolesService.getAll({ page: 1, pageSize: 100 }),
    select: (data) => data.items,
  })
}

export function useRoleById(roleId: string | undefined) {
  return useQuery({
    queryKey: ["role", roleId],
    queryFn: () => rolesService.getById(roleId!),
    enabled: !!roleId,
  })
}

export function useRoleModules() {
  return useQuery({
    queryKey: ["roles", "modules"],
    queryFn: () => rolesService.getModules(),
  })
}

export const useCreateRole = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreateRolePayload) => rolesService.create(payload),
    onSuccess: (data) => {
      queryClient.setQueryData(["role", data.id], data)
      queryClient.invalidateQueries({ queryKey: ["roles"] })
      queryClient.invalidateQueries({ queryKey: ["me", "permissions"] })
      toast.success("Role created successfully")
    },
    onError: (error: Error) => toast.error(error.message),
  })
}

export const useUpdateRole = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateRolePayload }) =>
      rolesService.update(id, payload),
    onSuccess: (data, { id }) => {
      queryClient.setQueryData(["role", id], data)
      queryClient.invalidateQueries({ queryKey: ["roles"] })
      queryClient.invalidateQueries({ queryKey: ["me", "permissions"] })
      toast.success("Role updated successfully")
    },
    onError: (error: Error) => toast.error(error.message),
  })
}

export const useDeleteRole = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: rolesService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roles"] })
      queryClient.invalidateQueries({ queryKey: ["me", "permissions"] })
      toast.success("Role deleted successfully")
    },
    onError: (error: Error) => toast.error(error.message),
  })
}
