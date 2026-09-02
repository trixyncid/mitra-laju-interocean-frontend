import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import {
  rolesService,
  type CreateRolePayload,
  type RoleListParams,
  type UpdateRolePayload,
} from "@/services/roles.service"
import { roleKeys } from "@/lib/query-keys"

export const useRoles = (params: RoleListParams) => {
  return useQuery({
    queryKey: roleKeys.list(params),
    queryFn: () => rolesService.getAll(params),
  })
}

export const useRolesOptions = () => {
  return useQuery({
    queryKey: roleKeys.options(),
    queryFn: () => rolesService.getAll({ page: 1, pageSize: 100 }),
    select: (data) => data.items,
  })
}

export function useRoleById(roleId: string | undefined) {
  return useQuery({
    queryKey: roleKeys.detail(roleId ?? ""),
    queryFn: () => rolesService.getById(roleId!),
    enabled: !!roleId,
  })
}

export function useRoleModules() {
  return useQuery({
    queryKey: roleKeys.modules(),
    queryFn: () => rolesService.getModules(),
  })
}

export const useCreateRole = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreateRolePayload) => rolesService.create(payload),
    onSuccess: (data) => {
      queryClient.setQueryData(roleKeys.detail(data.id), data)
      queryClient.invalidateQueries({ queryKey: roleKeys.all })
      queryClient.invalidateQueries({ queryKey: ["me", "permissions"] })
      toast.success("Role created successfully")
    },
  })
}

export const useUpdateRole = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateRolePayload }) =>
      rolesService.update(id, payload),
    onSuccess: (data, { id }) => {
      queryClient.setQueryData(roleKeys.detail(id), data)
      queryClient.invalidateQueries({ queryKey: roleKeys.all })
      queryClient.invalidateQueries({ queryKey: ["me", "permissions"] })
      toast.success("Role updated successfully")
    },
  })
}

export const useDeleteRole = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: rolesService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: roleKeys.all })
      queryClient.invalidateQueries({ queryKey: ["me", "permissions"] })
      toast.success("Role deleted successfully")
    },
  })
}
