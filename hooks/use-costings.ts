import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { costingService } from "@/services/costing.service"
import { toast } from "sonner"

export const useCostings = () => {
    return useQuery({
        queryKey: ["costings"],
        queryFn: costingService.getAll,
    })
}

export const useCostingById = (id: string) => {
    return useQuery({
        queryKey: ["costings", id],
        queryFn: () => costingService.getById(id),
    })
}

export const useCreateCosting = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (costing: unknown) => costingService.create(costing),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["costings"] });
            toast.success("Costing created successfully");
        },
        onError: (error: Error) => {
            toast.error(error.message);
        },
    })
}

export const useUpdateCosting = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, costing }: { id: string, costing: unknown }) => costingService.update(id, costing),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["costings"] });
            toast.success("Costing updated successfully");
        },
        onError: (error: Error) => {
            toast.error(error.message);
        },
    })
}

export const useDeleteCosting = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => costingService.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["costings"] });
            toast.success("Costing deleted successfully");
        },
        onError: (error: Error) => {
            toast.error(error.message);
        },
    })
}