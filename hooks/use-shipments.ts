import { shipmentsService } from "@/services/shipments.service";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Shipment } from "@/app/dashboard/shipments/columns";

export const useShipments = () => {
    return useQuery({
        queryKey: ["shipments"],
        queryFn: shipmentsService.getAll,
    });
}

export const useShipmentById = (id: string) => {
    return useQuery({
        queryKey: ["shipments", id],
        queryFn: () => shipmentsService.getById(id),
    });
}

export const useCreateShipment = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: shipmentsService.create,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["shipments"] });
            toast.success("Shipment created successfully");
        },
        onError: (error: Error) => {
            toast.error(error.message);
        },
    });
}

export const useUpdateShipment = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, shipment }: { id: string, shipment: Partial<Shipment> }) => shipmentsService.update(id, shipment),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["shipments"] });
            toast.success("Shipment updated successfully");
        },
        onError: (error: Error) => {
            toast.error(error.message);
        },
    });
}

export const useDeleteShipment = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: shipmentsService.delete,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["shipments"] });
            toast.success("Shipment deleted successfully");
        },
    });
}

export const useCreateShipmentOperational = (shipmentId: string) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ shipmentId, shipmentOperational }: { shipmentId: string, shipmentOperational: unknown }) => shipmentsService.createShipmentOperational(shipmentId, shipmentOperational),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["shipments", shipmentId] });
            toast.success("Shipment operational created successfully");
        },
    });
}

export const useUpdateShipmentOperational = (shipmentId: string) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ shipmentId, id, shipmentOperational }: { shipmentId: string, id: string, shipmentOperational: unknown }) => shipmentsService.updateShipmentOperational(shipmentId, id, shipmentOperational),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["shipments", shipmentId] });
            toast.success("Shipment operational updated successfully");
        },
    });
}

export const useDeleteShipmentOperational = (shipmentId: string) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ shipmentId, id }: { shipmentId: string, id: string }) => shipmentsService.deleteShipmentOperational(shipmentId, id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["shipments", shipmentId] });
            toast.success("Shipment operational deleted successfully");
        },
    });
}

export const useGetShipmentOperationalContainers = () => {
    return useQuery({
        queryKey: ["shipmentOperationalContainers"],
        queryFn: shipmentsService.getShipmentOperationalContainers,
    });
}

export const useCreateShipmentOperationalContainer = (shipmentId: string) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ shipmentId, shipmentOperationalId, shipmentOperationalContainer }: { shipmentId: string, shipmentOperationalId: string, shipmentOperationalContainer: unknown }) => shipmentsService.createShipmentOperationalContainer(shipmentId, shipmentOperationalId, shipmentOperationalContainer),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["shipments", shipmentId] });
            toast.success("Shipment operational container created successfully");
        },
    });
}

export const useUpdateShipmentOperationalContainer = (shipmentId: string) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ shipmentId, shipmentOperationalId, id, shipmentOperationalContainer }: { shipmentId: string, shipmentOperationalId: string, id: string, shipmentOperationalContainer: unknown }) => shipmentsService.updateShipmentOperationalContainer(shipmentId, shipmentOperationalId, id, shipmentOperationalContainer),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["shipments", shipmentId] });
            toast.success("Shipment operational container updated successfully");
        },
    });
}

export const useDeleteShipmentOperationalContainer = (shipmentId: string) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ shipmentId, shipmentOperationalId, id }: { shipmentId: string, shipmentOperationalId: string, id: string }) => shipmentsService.deleteShipmentOperationalContainer(shipmentId, shipmentOperationalId, id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["shipments", shipmentId] });
            toast.success("Shipment operational container deleted successfully");
        },
    });
}

export const useCreateShipmentOperationalAttachment = (shipmentId: string) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ shipmentId, shipmentOperationalAttachment }: { shipmentId: string, shipmentOperationalAttachment: unknown }) => shipmentsService.createShipmentOperationalAttachment(shipmentId, shipmentOperationalAttachment),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["shipments", shipmentId] });
            toast.success("Shipment operational attachment created successfully");
        },
    });
}

export const useUpdateShipmentOperationalAttachment = (shipmentId: string) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ shipmentId, id, shipmentOperationalAttachment }: { shipmentId: string, id: string, shipmentOperationalAttachment: unknown }) => shipmentsService.updateShipmentOperationalAttachment(shipmentId, id, shipmentOperationalAttachment),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["shipments", shipmentId] });
            toast.success("Shipment operational attachment updated successfully");
        },
    });
}

export const useDeleteShipmentOperationalAttachment = (shipmentId: string) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ shipmentId, id }: { shipmentId: string, id: string }) => shipmentsService.deleteShipmentOperationalAttachment(shipmentId, id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["shipments", shipmentId] });
            toast.success("Shipment operational attachment deleted successfully");
        },
    });
}