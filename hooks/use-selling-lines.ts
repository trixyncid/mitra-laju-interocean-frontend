import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { autoLinkedNote } from "@/lib/auto-linked"
import { costingKeys, customerInvoiceKeys, salesKeys, sellingLineKeys } from "@/lib/query-keys"
import type { SellingInput } from "@/lib/types/selling"
import { sellingLineService, type SellingListParams } from "@/services/selling-line.service"

/** Linking changes which selling a costing belongs to, so refresh both (and their sales jobs). */
function invalidate(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: sellingLineKeys.all })
  queryClient.invalidateQueries({ queryKey: costingKeys.all })
  queryClient.invalidateQueries({ queryKey: salesKeys.all })
  queryClient.invalidateQueries({ queryKey: customerInvoiceKeys.all })
}

export const useInfiniteSellingLines = (params: Omit<SellingListParams, "page">, enabled = true) =>
  useInfiniteQuery({
    queryKey: [...sellingLineKeys.lists(), "infinite", params],
    queryFn: ({ pageParam }) => sellingLineService.getAll({ ...params, page: pageParam }),
    initialPageParam: 1,
    getNextPageParam: (last) =>
      last.pagination.page < last.pagination.totalPages ? last.pagination.page + 1 : undefined,
    enabled,
  })

/** One page of selling lines, for the table view. */
export const useSellingLinesPage = (params: SellingListParams, enabled = true) =>
  useQuery({
    queryKey: [...sellingLineKeys.lists(), "page", params],
    queryFn: () => sellingLineService.getAll(params),
    enabled,
    placeholderData: (previous) => previous,
  })

export const useSellingLine = (id: string) =>
  useQuery({
    queryKey: sellingLineKeys.detail(id),
    queryFn: () => sellingLineService.getById(id),
    enabled: !!id,
  })

export const useSellingSalesOptions = (search: string, enabled = true) =>
  useQuery({
    queryKey: [...sellingLineKeys.all, "sales-options", search],
    queryFn: () => sellingLineService.salesOptions(search || undefined),
    enabled,
    staleTime: 60_000,
  })

export const useCreateSellingLine = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (selling: SellingInput) => sellingLineService.create(selling),
    onSuccess: (selling) => {
      invalidate(queryClient)
      toast.success("Selling line added", { description: autoLinkedNote(selling) })
    },
  })
}

export const useUpdateSellingLine = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, selling }: { id: string; selling: Partial<Omit<SellingInput, "costingIds">> }) =>
      sellingLineService.update(id, selling),
    onSuccess: (selling) => {
      invalidate(queryClient)
      toast.success("Selling line updated", { description: autoLinkedNote(selling) })
    },
  })
}

export const useDeleteSellingLine = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => sellingLineService.delete(id),
    onSuccess: () => {
      invalidate(queryClient)
      toast.success("Selling line deleted")
    },
  })
}

export const useLinkSellingCostings = (sellingId: string) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (costingIds: string[]) => sellingLineService.linkCostings(sellingId, costingIds),
    onSuccess: (selling, costingIds) => {
      invalidate(queryClient)
      toast.success(costingIds.length === 1 ? "Costing linked" : `${costingIds.length} costings linked`, {
        description: autoLinkedNote(selling),
      })
    },
  })
}

export const useUnlinkSellingCosting = (sellingId: string) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (costingId: string) => sellingLineService.unlinkCosting(sellingId, costingId),
    onSuccess: () => {
      invalidate(queryClient)
      toast.success("Costing unlinked")
    },
  })
}
