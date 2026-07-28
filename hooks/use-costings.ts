import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { costingService, type CostingListParams, type CreateCostingInput, type UpdateCostingInput } from "@/services/costing.service"
import { toast } from "sonner"

export const useCostings = (params: CostingListParams, enabled = true) => {
    return useQuery({
        queryKey: ["costings", params],
        queryFn: () => costingService.getAll(params),
        enabled,
    })
}

export const useCostingById = (id: string) => {
    return useQuery({
        queryKey: ["costings", id],
        queryFn: () => costingService.getById(id),
        enabled: !!id,
    })
}

export const useCreateCosting = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (costing: CreateCostingInput) => costingService.create(costing),
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
        mutationFn: ({ id, costing }: { id: string, costing: UpdateCostingInput }) => costingService.update(id, costing),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["costings"] });
            queryClient.invalidateQueries({ queryKey: ["shipments"] });
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

export const useCreateCostingAttachment = (costingId: string) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ costingId, costingAttachment }: { costingId: string, costingAttachment: FormData }) => costingService.createCostingAttachment(costingId, costingAttachment),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["costings", costingId] });
            toast.success("Costing attachment created successfully");
        },
        onError: (error: Error) => {
            toast.error(error.message);
        },
    })
}

export const useUpdateCostingAttachment = (costingId: string) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ costingId, id, costingAttachment }: { costingId: string, id: string, costingAttachment: unknown }) => costingService.updateCostingAttachment(costingId, id, costingAttachment),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["costings", costingId] });
            toast.success("Costing attachment updated successfully");
        },
        onError: (error: Error) => {
            toast.error(error.message);
        },
    })
}

export const useDeleteCostingAttachment = (costingId: string) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ costingId, id }: { costingId: string, id: string }) => costingService.deleteCostingAttachment(costingId, id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["costings", costingId] });
            toast.success("Costing attachment deleted successfully");
        },
        onError: (error: Error) => {
            toast.error(error.message);
        },
    })
}