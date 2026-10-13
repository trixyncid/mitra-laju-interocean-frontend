import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  vendorInvoiceService,
  type VendorInvoiceBreakdownInput,
  type VendorInvoiceBreakdownListParams,
  type VendorInvoiceListParams,
  type CreateVendorInvoiceInput,
  type UpdateVendorInvoiceInput,
} from "@/services/vendor-invoice.service"
import { costingKeys, vendorInvoiceKeys, shipmentKeys } from "@/lib/query-keys"
import { toast } from "sonner"

export const useVendorInvoices = (params: VendorInvoiceListParams, enabled = true) => {
  return useQuery({
    queryKey: vendorInvoiceKeys.list(params),
    queryFn: () => vendorInvoiceService.getAll(params),
    enabled,
  })
}

/** Loads vendor invoices batch by batch for continuous scrolling. */
export const useInfiniteVendorInvoices = (
  params: Omit<VendorInvoiceListParams, "page">,
  enabled = true
) => {
  return useInfiniteQuery({
    queryKey: [...vendorInvoiceKeys.lists(), "infinite", params],
    queryFn: ({ pageParam }) => vendorInvoiceService.getAll({ ...params, page: pageParam }),
    initialPageParam: 1,
    getNextPageParam: (last) =>
      last.pagination.page < last.pagination.totalPages ? last.pagination.page + 1 : undefined,
    enabled,
  })
}

export const useVendorInvoiceBreakdowns = (
  params: VendorInvoiceBreakdownListParams,
  enabled = true
) => {
  return useQuery({
    queryKey: vendorInvoiceKeys.breakdownList(params),
    queryFn: () => vendorInvoiceService.getBreakdowns(params),
    enabled,
  })
}

export const useVendorInvoiceById = (id: string) => {
  return useQuery({
    queryKey: vendorInvoiceKeys.detail(id),
    queryFn: () => vendorInvoiceService.getById(id),
    enabled: !!id,
  })
}

function invalidateVendorInvoice(
  queryClient: ReturnType<typeof useQueryClient>,
  vendorInvoiceId?: string
) {
  queryClient.invalidateQueries({ queryKey: vendorInvoiceKeys.all })
  if (vendorInvoiceId) {
    queryClient.invalidateQueries({ queryKey: vendorInvoiceKeys.detail(vendorInvoiceId) })
  }
  queryClient.invalidateQueries({ queryKey: shipmentKeys.all })
  queryClient.invalidateQueries({ queryKey: costingKeys.all })
}

export const useCreateVendorInvoice = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (vendorInvoice: CreateVendorInvoiceInput) => vendorInvoiceService.create(vendorInvoice),
    onSuccess: () => {
      invalidateVendorInvoice(queryClient)
      toast.success("Vendor invoice created")
    },
  })
}

export const useUpdateVendorInvoice = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, vendorInvoice }: { id: string; vendorInvoice: UpdateVendorInvoiceInput }) =>
      vendorInvoiceService.update(id, vendorInvoice),
    onSuccess: (_data, { id }) => {
      invalidateVendorInvoice(queryClient, id)
      toast.success("Vendor invoice updated")
    },
  })
}

export const useDeleteVendorInvoice = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => vendorInvoiceService.delete(id),
    onSuccess: () => {
      invalidateVendorInvoice(queryClient)
      toast.success("Vendor invoice deleted")
    },
  })
}

export const useCreateVendorInvoiceBreakdown = (vendorInvoiceId: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (breakdown: VendorInvoiceBreakdownInput) =>
      vendorInvoiceService.createBreakdown(vendorInvoiceId, breakdown),
    onSuccess: () => {
      invalidateVendorInvoice(queryClient, vendorInvoiceId)
      toast.success("Line item added")
    },
  })
}

export const useUpdateVendorInvoiceBreakdown = (vendorInvoiceId: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      breakdownId,
      breakdown,
    }: {
      breakdownId: string
      breakdown: Partial<VendorInvoiceBreakdownInput>
    }) => vendorInvoiceService.updateBreakdown(vendorInvoiceId, breakdownId, breakdown),
    onSuccess: () => {
      invalidateVendorInvoice(queryClient, vendorInvoiceId)
      toast.success("Line item updated")
    },
  })
}

export const useDeleteVendorInvoiceBreakdown = (vendorInvoiceId: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (breakdownId: string) =>
      vendorInvoiceService.deleteBreakdown(vendorInvoiceId, breakdownId),
    onSuccess: () => {
      invalidateVendorInvoice(queryClient, vendorInvoiceId)
      toast.success("Line item removed")
    },
  })
}

export const useCreateVendorInvoiceAttachment = (vendorInvoiceId: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (attachment: FormData) =>
      vendorInvoiceService.createAttachment(vendorInvoiceId, attachment),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: vendorInvoiceKeys.detail(vendorInvoiceId) })
      toast.success("Document uploaded")
    },
  })
}

export const useUpdateVendorInvoiceAttachment = (vendorInvoiceId: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, attachmentName }: { id: string; attachmentName: string }) =>
      vendorInvoiceService.updateAttachment(vendorInvoiceId, id, { attachmentName }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: vendorInvoiceKeys.detail(vendorInvoiceId) })
      toast.success("Document updated")
    },
  })
}

export const useDeleteVendorInvoiceAttachment = (vendorInvoiceId: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) =>
      vendorInvoiceService.deleteAttachment(vendorInvoiceId, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: vendorInvoiceKeys.detail(vendorInvoiceId) })
      toast.success("Document deleted")
    },
  })
}
