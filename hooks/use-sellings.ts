import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { sellingService, type SellingListParams } from "@/services/selling.service"
import { sellingKeys, shipmentKeys } from "@/lib/query-keys"
import { toast } from "sonner"

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
        mutationFn: (selling: unknown) => sellingService.create(selling),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: sellingKeys.all })
            queryClient.invalidateQueries({ queryKey: shipmentKeys.all })
            toast.success("Selling created successfully")
        },
    })
}

export const useUpdateSelling = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, selling }: { id: string, selling: unknown }) => sellingService.update(id, selling),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: sellingKeys.all })
            queryClient.invalidateQueries({ queryKey: shipmentKeys.all })
            toast.success("Selling updated successfully")
        },
    })
}

export const useDeleteSelling = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (id: string) => sellingService.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: sellingKeys.all })
            queryClient.invalidateQueries({ queryKey: shipmentKeys.all })
            toast.success("Selling deleted successfully")
        },
    })
}
