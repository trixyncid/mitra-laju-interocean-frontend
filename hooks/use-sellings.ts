import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { sellingService } from "@/services/selling.service"
import { toast } from "sonner"

export const useSellings = () => {
    return useQuery({
        queryKey: ["sellings"],
        queryFn: sellingService.getAll,
    })
}

export const useSellingById = (id: string) => {
    return useQuery({
        queryKey: ["sellings", id],
        queryFn: () => sellingService.getById(id),
    })
}

export const useCreateSelling = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (selling: unknown) => sellingService.create(selling),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["sellings"] })
            queryClient.invalidateQueries({ queryKey: ["shipments"] })
            toast.success("Selling created successfully")
        },
        onError: (error: Error) => {
            toast.error(error.message)
        },
    })
}

export const useUpdateSelling = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, selling }: { id: string, selling: unknown }) => sellingService.update(id, selling),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["sellings"] })
            queryClient.invalidateQueries({ queryKey: ["shipments"] })
            toast.success("Selling updated successfully")
        },
        onError: (error: Error) => {
            toast.error(error.message)
        },
    })
}

export const useDeleteSelling = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (id: string) => sellingService.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["sellings"] })
            queryClient.invalidateQueries({ queryKey: ["shipments"] })
            toast.success("Selling deleted successfully")
        },
        onError: (error: Error) => {
            toast.error(error.message)
        },
    })
}
