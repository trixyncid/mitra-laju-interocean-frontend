import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { autoLinkedNote } from "@/lib/auto-linked"
import { costingKeys, salesKeys, vendorInvoiceKeys } from "@/lib/query-keys"
import type { CostingInput } from "@/lib/types/costing"
import { costingService, type CostingListParams } from "@/services/costing.service"

function invalidateCostings(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: costingKeys.all })
  // Sales jobs show their costings and totals.
  queryClient.invalidateQueries({ queryKey: salesKeys.all })
  // Matching changes vendor invoice lines too.
  queryClient.invalidateQueries({ queryKey: vendorInvoiceKeys.all })
}

/** Loads costing lines batch by batch; the first page carries the filtered totals. */
export const useInfiniteCostings = (params: Omit<CostingListParams, "page">, enabled = true) => {
  return useInfiniteQuery({
    queryKey: [...costingKeys.lists(), "infinite", params],
    queryFn: ({ pageParam }) => costingService.getAll({ ...params, page: pageParam }),
    initialPageParam: 1,
    getNextPageParam: (last) =>
      last.pagination.page < last.pagination.totalPages ? last.pagination.page + 1 : undefined,
    enabled,
  })
}

/** One page of costings, e.g. for pickers. */
export const useCostingsQuery = (params: CostingListParams, enabled = true) => {
  return useQuery({
    queryKey: [...costingKeys.lists(), "page", params],
    queryFn: () => costingService.getAll(params),
    enabled,
    staleTime: 30_000,
  })
}

export const useCostingById = (id: string) => {
  return useQuery({
    queryKey: costingKeys.detail(id),
    queryFn: () => costingService.getById(id),
    enabled: !!id,
  })
}

export const useSalesOptions = (search: string, enabled = true) => {
  return useQuery({
    queryKey: [...costingKeys.all, "sales-options", search],
    queryFn: () => costingService.salesOptions(search || undefined),
    enabled,
    staleTime: 60_000,
  })
}

export const useCreateCosting = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (costing: CostingInput) => costingService.create(costing),
    onSuccess: () => {
      invalidateCostings(queryClient)
      toast.success("Costing line added")
    },
  })
}

export const useUpdateCosting = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, costing }: { id: string; costing: CostingInput }) =>
      costingService.update(id, costing),
    onSuccess: (costing) => {
      invalidateCostings(queryClient)
      toast.success("Costing line updated", { description: autoLinkedNote(costing) })
    },
  })
}

export const useDeleteCosting = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => costingService.delete(id),
    onSuccess: () => {
      invalidateCostings(queryClient)
      toast.success("Costing line deleted")
    },
  })
}

export const useMatchCostingLines = (costingId: string) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (breakdownIds: string[]) => costingService.matchLines(costingId, breakdownIds),
    onSuccess: (_data, breakdownIds) => {
      invalidateCostings(queryClient)
      toast.success(
        breakdownIds.length === 1 ? "Vendor invoice line matched" : `${breakdownIds.length} vendor invoice lines matched`
      )
    },
  })
}

export const useUnmatchCostingLine = (costingId: string) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (breakdownId: string) => costingService.unmatchLine(costingId, breakdownId),
    onSuccess: () => {
      invalidateCostings(queryClient)
      toast.success("Vendor invoice line unmatched")
    },
  })
}
