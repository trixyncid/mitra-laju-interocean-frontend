import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import type { ContainerLookup } from "@/app/dashboard/containers/columns"
import {
  containerSizesService,
  containerTypesService,
  type ContainerLookupKind,
  type ContainerLookupListParams,
} from "@/services/container-lookups.service"

function queryKeyFor(kind: ContainerLookupKind) {
  return kind === "size" ? "container-sizes" : "container-types"
}

function serviceFor(kind: ContainerLookupKind) {
  return kind === "size" ? containerSizesService : containerTypesService
}

function labelFor(kind: ContainerLookupKind) {
  return kind === "size" ? "Container size" : "Container type"
}

export const useContainerLookups = (
  kind: ContainerLookupKind,
  params: ContainerLookupListParams,
  enabled = true
) => {
  return useQuery({
    queryKey: [queryKeyFor(kind), params],
    queryFn: () => serviceFor(kind).getAll(params),
    enabled,
  })
}

export const useCreateContainerLookup = (kind: ContainerLookupKind) => {
  const queryClient = useQueryClient()
  const label = labelFor(kind)

  return useMutation({
    mutationFn: serviceFor(kind).create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [queryKeyFor(kind)] })
      toast.success(`${label} created successfully`)
    },
    onError: (error: Error) => {
      toast.warning(error.message)
    },
  })
}

export const useUpdateContainerLookup = (kind: ContainerLookupKind) => {
  const queryClient = useQueryClient()
  const label = labelFor(kind)

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<ContainerLookup> }) =>
      serviceFor(kind).update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [queryKeyFor(kind)] })
      toast.success(`${label} updated successfully`)
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}

export const useDeleteContainerLookup = (kind: ContainerLookupKind) => {
  const queryClient = useQueryClient()
  const label = labelFor(kind)

  return useMutation({
    mutationFn: serviceFor(kind).delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [queryKeyFor(kind)] })
      toast.success(`${label} deleted successfully`)
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}
