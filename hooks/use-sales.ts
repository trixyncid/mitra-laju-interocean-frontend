import { keepPreviousData, useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { autoLinkedNote } from "@/lib/auto-linked"
import { costingKeys, customerInvoiceKeys, salesKeys, sellingLineKeys, shipmentKeys } from "@/lib/query-keys"
import type { SalesInput, SalesUpdate } from "@/lib/types/sales"
import { salesService, type SalesLineKind, type SalesListParams } from "@/services/sales.service"

/** A job owns its shipment and lines, so changes show up in those lists too. */
function invalidate(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: salesKeys.all })
  queryClient.invalidateQueries({ queryKey: customerInvoiceKeys.all })
  queryClient.invalidateQueries({ queryKey: costingKeys.all })
  queryClient.invalidateQueries({ queryKey: sellingLineKeys.all })
  queryClient.invalidateQueries({ queryKey: shipmentKeys.all })
}

export const useInfiniteSales = (params: Omit<SalesListParams, "page">, enabled = true) =>
  useInfiniteQuery({
    queryKey: [...salesKeys.lists(), "infinite", params],
    queryFn: ({ pageParam }) => salesService.getAll({ ...params, page: pageParam }),
    initialPageParam: 1,
    getNextPageParam: (last) =>
      last.pagination.page < last.pagination.totalPages ? last.pagination.page + 1 : undefined,
    enabled,
  })

/** One page of jobs, for the table view (the split view loads batches instead). */
export const useSalesPage = (params: SalesListParams, enabled = true) =>
  useQuery({
    queryKey: [...salesKeys.lists(), "page", params],
    queryFn: () => salesService.getAll(params),
    placeholderData: keepPreviousData,
    enabled,
  })

export const useSales = (id: string) =>
  useQuery({
    queryKey: salesKeys.detail(id),
    queryFn: () => salesService.getById(id),
    enabled: !!id,
  })

export const useSalesShipmentOptions = (search: string, enabled = true) =>
  useQuery({
    queryKey: [...salesKeys.all, "shipment-options", search],
    queryFn: () => salesService.shipmentOptions(search || undefined),
    enabled,
    staleTime: 30_000,
  })

export const useCreateSales = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (sales: SalesInput) => salesService.create(sales),
    onSuccess: (sales) => {
      invalidate(queryClient)
      toast.success(`Sales job ${sales.salesNumber} created`)
    },
  })
}

export const useUpdateSales = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, sales }: { id: string; sales: SalesUpdate }) => salesService.update(id, sales),
    onSuccess: () => {
      invalidate(queryClient)
      toast.success("Sales job updated")
    },
  })
}

export const useDeleteSales = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => salesService.delete(id),
    onSuccess: () => {
      invalidate(queryClient)
      toast.success("Sales job deleted")
    },
  })
}

const LINE_LABEL: Record<SalesLineKind, [string, string]> = {
  costings: ["costing", "costings"],
  sellings: ["selling", "sellings"],
}

export const useLinkSalesLines = (salesId: string, kind: SalesLineKind) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (lineIds: string[]) => salesService.link(salesId, kind, lineIds),
    onSuccess: (sales, lineIds) => {
      invalidate(queryClient)
      const [one, many] = LINE_LABEL[kind]
      toast.success(lineIds.length === 1 ? `1 ${one} added` : `${lineIds.length} ${many} added`, {
        description: autoLinkedNote(sales),
      })
    },
  })
}

export const useUnlinkSalesLine = (salesId: string, kind: SalesLineKind) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (lineId: string) => salesService.unlink(salesId, kind, lineId),
    onSuccess: () => {
      invalidate(queryClient)
      toast.success(`${LINE_LABEL[kind][0][0].toUpperCase()}${LINE_LABEL[kind][0].slice(1)} removed from job`)
    },
  })
}

/** First page of jobs matching a search, for pickers. */
export const useSalesSearch = (search: string, enabled = true) =>
  useQuery({
    queryKey: [...salesKeys.lists(), "search", search],
    queryFn: () => salesService.getAll({ page: 1, pageSize: 20, search: search || undefined }),
    enabled,
    staleTime: 30_000,
  })
