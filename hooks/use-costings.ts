import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { costingService, type CostingListParams, type CreateCostingInput, type UpdateCostingInput } from "@/services/costing.service"
import { costingKeys, shipmentKeys } from "@/lib/query-keys"
import { toast } from "sonner"

export const useCostings = (params: CostingListParams, enabled = true) => {
    return useQuery({
        queryKey: costingKeys.list(params),
        queryFn: () => costingService.getAll(params),
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

function invalidateShipmentCostingLinks(
    queryClient: ReturnType<typeof useQueryClient>,
    shipmentId?: string | null
) {
    queryClient.invalidateQueries({ queryKey: shipmentKeys.all })
    if (shipmentId) {
        queryClient.invalidateQueries({ queryKey: shipmentKeys.detail(shipmentId) })
    }
}

export const useCreateCosting = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (costing: CreateCostingInput) => costingService.create(costing),
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: costingKeys.all });
            invalidateShipmentCostingLinks(queryClient, variables.shipmentId);
            toast.success("Costing created successfully");
        },
    })
}

export const useUpdateCosting = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, costing }: { id: string, costing: UpdateCostingInput }) => costingService.update(id, costing),
        onSuccess: (_data, { id, costing }) => {
            queryClient.invalidateQueries({ queryKey: costingKeys.all });
            queryClient.invalidateQueries({ queryKey: costingKeys.detail(id) });
            invalidateShipmentCostingLinks(queryClient, costing.shipmentId);
            toast.success("Costing updated successfully");
        },
    })
}

export const useDeleteCosting = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => costingService.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: costingKeys.all });
            queryClient.invalidateQueries({ queryKey: shipmentKeys.all });
            toast.success("Costing deleted successfully");
        },
    })
}

export const useCreateCostingAttachment = (costingId: string) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ costingId, costingAttachment }: { costingId: string, costingAttachment: FormData }) => costingService.createCostingAttachment(costingId, costingAttachment),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: costingKeys.detail(costingId) });
            toast.success("Costing attachment created successfully");
        },
    })
}

export const useUpdateCostingAttachment = (costingId: string) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ costingId, id, costingAttachment }: { costingId: string, id: string, costingAttachment: unknown }) => costingService.updateCostingAttachment(costingId, id, costingAttachment),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: costingKeys.detail(costingId) });
            toast.success("Costing attachment updated successfully");
        },
    })
}

export const useDeleteCostingAttachment = (costingId: string) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ costingId, id }: { costingId: string, id: string }) => costingService.deleteCostingAttachment(costingId, id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: costingKeys.detail(costingId) });
            toast.success("Costing attachment deleted successfully");
        },
    })
}
