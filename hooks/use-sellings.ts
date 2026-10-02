import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  sellingService,
  type AddSellingLinesPayload,
  type CreateSellingPayload,
  type SellingListParams,
} from "@/services/selling.service"
import { sellingKeys, shipmentKeys, customerKeys } from "@/lib/query-keys"
import { toast } from "sonner"

function invalidateSellingQueries(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: sellingKeys.all })
  queryClient.invalidateQueries({ queryKey: shipmentKeys.all })
  queryClient.invalidateQueries({ queryKey: customerKeys.all })
}

export const useSellings = (params: SellingListParams, enabled = true) => {
  return useQuery({
    queryKey: sellingKeys.list(params),
    queryFn: () => sellingService.getAll(params),
    enabled,
  })
}

export const useSellingById = (id: string) => {
  return useQuery({
    queryKey: sellingKeys.detail(id),
    queryFn: () => sellingService.getById(id),
    enabled: !!id,
  })
}

export const useCreateSelling = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (selling: CreateSellingPayload) => sellingService.create(selling),
    onSuccess: () => {
      invalidateSellingQueries(queryClient)
      toast.success("Customer invoice created")
    },
  })
}

export const useUpdateSelling = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      id,
      selling,
    }: {
      id: string
      selling: {
        remarks?: string | null
        termsOfPayment?: string | null
        taxInvoice?: string | null
        taxInvoiceDate?: string | null
      }
    }) => sellingService.update(id, selling),
    onSuccess: () => {
      invalidateSellingQueries(queryClient)
      toast.success("Invoice updated")
    },
  })
}

export const useIssueSelling = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => sellingService.issue(id),
    onSuccess: () => {
      invalidateSellingQueries(queryClient)
      toast.success("Invoice issued")
    },
  })
}

export const useMarkSellingPaid = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => sellingService.markPaid(id),
    onSuccess: () => {
      invalidateSellingQueries(queryClient)
      toast.success("Invoice marked as paid")
    },
  })
}

export const useMarkSellingUnpaid = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => sellingService.markUnpaid(id),
    onSuccess: () => {
      invalidateSellingQueries(queryClient)
      toast.success("Invoice marked as unpaid")
    },
  })
}

export const useRevertSellingToDraft = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => sellingService.revertToDraft(id),
    onSuccess: () => {
      invalidateSellingQueries(queryClient)
      toast.success("Invoice reverted to draft")
    },
  })
}

export const useDeleteSelling = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => sellingService.delete(id),
    onSuccess: () => {
      invalidateSellingQueries(queryClient)
      toast.success("Invoice deleted")
    },
  })
}

export const useAddSellingLines = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string
      payload: AddSellingLinesPayload
    }) => sellingService.addLines(id, payload),
    onSuccess: () => {
      invalidateSellingQueries(queryClient)
      toast.success("Lines added")
    },
  })
}

export const useDeleteSellingLine = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, lineId }: { id: string; lineId: string }) =>
      sellingService.deleteLine(id, lineId),
    onSuccess: () => {
      invalidateSellingQueries(queryClient)
      toast.success("Line removed")
    },
  })
}
