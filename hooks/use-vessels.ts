import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { vesselsService, type VesselListParams } from "@/services/vessels.service";
import { vesselKeys } from "@/lib/query-keys";
import { toast } from "sonner";
import { Vessel } from "@/app/dashboard/vessels/columns";

export const useVessels = (params: VesselListParams, enabled = true) => {
    return useQuery({
        queryKey: vesselKeys.list(params),
        queryFn: () => vesselsService.getAll(params),
        enabled,
    });
}

export const useCreateVessel = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: vesselsService.create,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: vesselKeys.all });
            toast.success("Vessel created successfully");
        },
    });
}

export const useUpdateVessel = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, vessel }: { id: string, vessel: Partial<Vessel> }) => vesselsService.update(id, vessel),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: vesselKeys.all });
            toast.success("Vessel updated successfully");
        },
    });
}

export const useDeleteVessel = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: vesselsService.delete,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: vesselKeys.all });
            toast.success("Vessel deleted successfully");
        },
    });
}