import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  costingService,
  type CostingBreakdownInput,
  type CostingBreakdownListParams,
  type CostingListParams,
  type CreateCostingInput,
  type UpdateCostingInput,
} from "@/services/costing.service"
import { costingKeys, shipmentKeys } from "@/lib/query-keys"
import { toast } from "sonner"

export const useCostings = (params: CostingListParams, enabled = true) => {
  return useQuery({
    queryKey: costingKeys.list(params),
    queryFn: () => costingService.getAll(params),
    enabled,
  })
}

export const useCostingBreakdowns = (
  params: CostingBreakdownListParams,
  enabled = true
) => {
  return useQuery({
    queryKey: costingKeys.breakdownList(params),
    queryFn: () => costingService.getBreakdowns(params),
    enabled,
  })
}

export const useCostingById = (id: string) => {
  return useQuery({
    queryKey: costingKeys.detail(id),
    queryFn: () => costingService.getById(id),
    enabled: !!id,
  })
}

function invalidateCosting(
  queryClient: ReturnType<typeof useQueryClient>,
  costingId?: string
) {
  queryClient.invalidateQueries({ queryKey: costingKeys.all })
  if (costingId) {
    queryClient.invalidateQueries({ queryKey: costingKeys.detail(costingId) })
  }
  queryClient.invalidateQueries({ queryKey: shipmentKeys.all })
}

export const useCreateCosting = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (costing: CreateCostingInput) => costingService.create(costing),
    onSuccess: () => {
      invalidateCosting(queryClient)
      toast.success("Vendor invoice created")
    },
  })
}

export const useUpdateCosting = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, costing }: { id: string; costing: UpdateCostingInput }) =>
      costingService.update(id, costing),
    onSuccess: (_data, { id }) => {
      invalidateCosting(queryClient, id)
      toast.success("Costing updated")
    },
  })
}

export const useDeleteCosting = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => costingService.delete(id),
    onSuccess: () => {
      invalidateCosting(queryClient)
      toast.success("Costing deleted")
    },
  })
}

export const useCreateCostingBreakdown = (costingId: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (breakdown: CostingBreakdownInput) =>
      costingService.createBreakdown(costingId, breakdown),
    onSuccess: () => {
      invalidateCosting(queryClient, costingId)
      toast.success("Line item added")
    },
  })
}

export const useUpdateCostingBreakdown = (costingId: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      breakdownId,
      breakdown,
    }: {
      breakdownId: string
      breakdown: Partial<CostingBreakdownInput>
    }) => costingService.updateBreakdown(costingId, breakdownId, breakdown),
    onSuccess: () => {
      invalidateCosting(queryClient, costingId)
      toast.success("Line item updated")
    },
  })
}

export const useDeleteCostingBreakdown = (costingId: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (breakdownId: string) =>
      costingService.deleteBreakdown(costingId, breakdownId),
    onSuccess: () => {
      invalidateCosting(queryClient, costingId)
      toast.success("Line item removed")
    },
  })
}

export const useCreateCostingAttachment = (costingId: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      costingId,
      costingAttachment,
    }: {
      costingId: string
      costingAttachment: FormData
    }) => costingService.createCostingAttachment(costingId, costingAttachment),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: costingKeys.detail(costingId) })
      toast.success("Document uploaded")
    },
  })
}

export const useUpdateCostingAttachment = (costingId: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      costingId,
      id,
      costingAttachment,
    }: {
      costingId: string
      id: string
      costingAttachment: unknown
    }) =>
      costingService.updateCostingAttachment(costingId, id, costingAttachment),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: costingKeys.detail(costingId) })
      toast.success("Document updated")
    },
  })
}

export const useDeleteCostingAttachment = (costingId: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ costingId, id }: { costingId: string; id: string }) =>
      costingService.deleteCostingAttachment(costingId, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: costingKeys.detail(costingId) })
      toast.success("Document deleted")
    },
  })
}
