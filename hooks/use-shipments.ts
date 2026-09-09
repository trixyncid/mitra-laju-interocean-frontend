import {
    shipmentsService,
    type CreateShipmentInput,
    type CreateShipmentOperationalInput,
    type ShipmentListParams,
} from "@/services/shipments.service";
import { shipmentKeys } from "@/lib/query-keys";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Shipment } from "@/app/dashboard/shipments/columns";

export const useShipments = (params: ShipmentListParams, enabled = true) => {
    return useQuery({
        queryKey: shipmentKeys.list(params),
        queryFn: () => shipmentsService.getAll(params),
        enabled,
    });
}

export const useShipmentById = (id: string) => {
    return useQuery({
        queryKey: shipmentKeys.detail(id),
        queryFn: () => shipmentsService.getById(id),
        enabled: !!id,
    });
}

export const useCreateShipment = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: shipmentsService.create,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: shipmentKeys.all });
            toast.success("Shipment created successfully");
        },
    });
}

export const useCreateShipmentWithOperational = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            shipment,
            operational,
        }: {
            shipment: CreateShipmentInput
            operational: Omit<CreateShipmentOperationalInput, "shipmentId">
        }) => {
            const created = await shipmentsService.createWithOperational({
                shipment,
                operational,
            })
            if (!created?.id) {
                throw new Error("Shipment was created but no ID was returned.")
            }
            return created
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: shipmentKeys.all })
            toast.success("Shipment created successfully")
        },
    })
}

export const useUpdateShipment = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, shipment }: { id: string, shipment: Partial<Shipment> }) => shipmentsService.update(id, shipment),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: shipmentKeys.all });
            toast.success("Shipment updated successfully");
        },
    });
}

export const useDeleteShipment = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: shipmentsService.delete,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: shipmentKeys.all });
            toast.success("Shipment deleted successfully");
        },
    });
}

export const useCreateShipmentOperational = (shipmentId: string) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ shipmentId, shipmentOperational }: { shipmentId: string, shipmentOperational: unknown }) => shipmentsService.createShipmentOperational(shipmentId, shipmentOperational),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: shipmentKeys.all });
            toast.success("Shipment operational created successfully");
        },
    });
}

export const useUpdateShipmentWithOperational = (shipmentId: string) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            shipment,
            operationalId,
            operational,
        }: {
            shipment: Partial<Shipment>
            operationalId: string
            operational: unknown
        }) => {
            await shipmentsService.update(shipmentId, shipment)
            await shipmentsService.updateShipmentOperational(
                shipmentId,
                operationalId,
                operational
            )
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: shipmentKeys.all })
            toast.success("Shipment updated successfully")
        },
    })
}

export const useUpdateShipmentOperational = (shipmentId: string) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ shipmentId, id, shipmentOperational }: { shipmentId: string, id: string, shipmentOperational: unknown }) => shipmentsService.updateShipmentOperational(shipmentId, id, shipmentOperational),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: shipmentKeys.all });
            toast.success("Shipment operational updated successfully");
        },
    });
}

export const useDeleteShipmentOperational = (shipmentId: string) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ shipmentId, id }: { shipmentId: string, id: string }) => shipmentsService.deleteShipmentOperational(shipmentId, id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: shipmentKeys.all });
            toast.success("Shipment operational deleted successfully");
        },
    });
}

export const useGetShipmentOperationalContainers = (enabled = true) => {
    return useQuery({
        queryKey: ["shipmentOperationalContainers"],
        queryFn: shipmentsService.getShipmentOperationalContainers,
        enabled,
    });
}

export const useCreateShipmentOperationalContainer = (shipmentId: string) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ shipmentId, shipmentOperationalId, shipmentOperationalContainer }: { shipmentId: string, shipmentOperationalId: string, shipmentOperationalContainer: unknown }) => shipmentsService.createShipmentOperationalContainer(shipmentId, shipmentOperationalId, shipmentOperationalContainer),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: shipmentKeys.all });
            queryClient.invalidateQueries({ queryKey: ["shipmentOperationalContainers"] });
            toast.success("Shipment operational container created successfully");
        },
    });
}

export const useUpdateShipmentOperationalContainer = (shipmentId: string) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ shipmentId, shipmentOperationalId, id, shipmentOperationalContainer }: { shipmentId: string, shipmentOperationalId: string, id: string, shipmentOperationalContainer: unknown }) => shipmentsService.updateShipmentOperationalContainer(shipmentId, shipmentOperationalId, id, shipmentOperationalContainer),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: shipmentKeys.all });
            queryClient.invalidateQueries({ queryKey: ["shipmentOperationalContainers"] });
            toast.success("Shipment operational container updated successfully");
        },
    });
}

export const useDeleteShipmentOperationalContainer = (shipmentId: string) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ shipmentId, shipmentOperationalId, id }: { shipmentId: string, shipmentOperationalId: string, id: string }) => shipmentsService.deleteShipmentOperationalContainer(shipmentId, shipmentOperationalId, id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: shipmentKeys.all });
            queryClient.invalidateQueries({ queryKey: ["shipmentOperationalContainers"] });
            toast.success("Shipment operational container deleted successfully");
        },
    });
}

export const useCreateShipmentOperationalAttachment = (shipmentId: string) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ shipmentId, shipmentOperationalAttachment }: { shipmentId: string, shipmentOperationalAttachment: FormData }) => shipmentsService.createShipmentOperationalAttachment(shipmentId, shipmentOperationalAttachment),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: shipmentKeys.detail(shipmentId) });
            toast.success("Shipment operational attachment created successfully");
        },
    });
}

export const useUpdateShipmentOperationalAttachment = (shipmentId: string) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ shipmentId, id, shipmentOperationalAttachment }: { shipmentId: string, id: string, shipmentOperationalAttachment: unknown }) => shipmentsService.updateShipmentOperationalAttachment(shipmentId, id, shipmentOperationalAttachment),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: shipmentKeys.detail(shipmentId) });
            toast.success("Shipment operational attachment updated successfully");
        },
    });
}

export const useDeleteShipmentOperationalAttachment = (shipmentId: string) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ shipmentId, id }: { shipmentId: string, id: string }) => shipmentsService.deleteShipmentOperationalAttachment(shipmentId, id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: shipmentKeys.detail(shipmentId) });
            toast.success("Shipment operational attachment deleted successfully");
        },
    });
}