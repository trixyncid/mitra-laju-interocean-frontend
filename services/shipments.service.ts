import { Shipment } from "@/app/dashboard/shipments/columns";
import { apiClient } from "@/lib/api-client";
import { openFetchedAttachment } from "@/lib/open-attachment";
import type { ShipmentDetail } from "@/lib/types/entity-details";
import type { ShipmentStatus } from "@/lib/shipment-status";

export type CreateShipmentInput = {
    customerCodeId: string;
    customerShipperId: string;
    status?: ShipmentStatus;

};

export type CreatedShipment = {
    id: string;
    customerCodeId: string;
    customerShipperId: string;
    status: ShipmentStatus;
};

export type CreateShipmentOperationalInput = {
    shipmentId: string;
    shipmentType: string;
    vesselId: string;
    portDepartureId?: string;
    portDestinationId?: string;
    eta?: string | null;
    loadingInAt?: string | null;
    loadingOutAt?: string | null;
    blNumber?: string;
    bookingNumber?: string;
    loadingLocationId?: string;
    unloadingLocationId?: string;
    services?: { serviceId: string; vendorId: string | null }[];
    remarks?: string;
};

export type ShipmentListParams = {
    page: number;
    pageSize: number;
    search?: string;
    status?: "all" | "true" | "false";
    lifecycleStatus?: "all" | "DRAFT" | "BACKUP" | "ONGOING" | "FINISHED";
    shipmentType?: "all" | "EXPORT" | "IMPORT" | "DOMESTIC";
    from?: string;
    to?: string;
    /** Excel-style column filters: ticked values per field (see SHIPMENT_FILTER_PARAM). */
    columns?: Record<string, string[]>;
    sortBy?: string;
    sortDir?: "asc" | "desc";
};

/** Column filter fields of the shipment list, and their query names. */
export const SHIPMENT_FILTER_PARAM: Record<string, string> = {
    customer: "customerIds",
    status: "statuses",
    type: "types",
    vessel: "vesselIds",
    departure: "departureIds",
    destination: "destinationIds",
    eta: "etaDates",
    loading: "loadingDates",
    bl: "bl",
    service: "serviceIds",
    serviceVendor: "serviceVendorIds",
};

export type ShipmentFacet = { value: string; label: string; count: number };

function setColumnParams(query: URLSearchParams, params: Pick<ShipmentListParams, "columns" | "sortBy" | "sortDir">) {
    for (const [field, values] of Object.entries(params.columns ?? {})) {
        const name = SHIPMENT_FILTER_PARAM[field];
        if (name && values.length) query.set(name, values.join(","));
    }
    if (params.sortBy) {
        query.set("sortBy", params.sortBy);
        query.set("sortDir", params.sortDir ?? "asc");
    }
}

export type PaginatedShipments = {
    items: Shipment[];
    pagination: {
        page: number;
        pageSize: number;
        total: number;
        totalPages: number;
    };
};

export type ShipmentExportFilterParams = Omit<ShipmentListParams, "page" | "pageSize">;

function buildShipmentExportFilename(lifecycleStatus?: string): string {
    const statusPart =
        !lifecycleStatus || lifecycleStatus === "all"
            ? "all"
            : lifecycleStatus.toLowerCase();
    const datePart = new Date().toISOString().slice(0, 10);
    return `shipments-${statusPart}-${datePart}.xlsx`;
}

export const shipmentsService = {
    getAll: async (params: ShipmentListParams): Promise<PaginatedShipments> => {
        const query = new URLSearchParams({
            page: String(params.page),
            pageSize: String(params.pageSize),
            status: params.status ?? "all",
            lifecycleStatus: params.lifecycleStatus ?? "all",
            shipmentType: params.shipmentType ?? "all",
        });
        if (params.search) query.set("search", params.search);
        if (params.from) query.set("from", params.from);
        if (params.to) query.set("to", params.to);
        setColumnParams(query, params);

        const response = await apiClient.getEnvelope(`/shipments?${query.toString()}`);
        const pagination = response.meta?.pagination ?? {
            page: params.page,
            pageSize: params.pageSize,
            total: 0,
            totalPages: 1,
        };

        return {
            items: (response.data ?? []) as Shipment[],
            pagination,
        };
    },
    exportExcel: async (
        params: ShipmentExportFilterParams
    ): Promise<{ rowCount: number | null }> => {
        const query = new URLSearchParams({
            status: params.status ?? "all",
            lifecycleStatus: params.lifecycleStatus ?? "all",
            shipmentType: params.shipmentType ?? "all",
        });
        if (params.search) query.set("search", params.search);
        if (params.from) query.set("from", params.from);
        if (params.to) query.set("to", params.to);
        // Export what the list shows: same column filters (sort does not matter for Excel).
        setColumnParams(query, { columns: params.columns });

        const fallbackFilename = buildShipmentExportFilename(
            params.lifecycleStatus
        );
        const result = await apiClient.download(
            `/shipments/export?${query.toString()}`,
            fallbackFilename
        );
        return { rowCount: result.rowCount };
    },
    /** One column's values and counts, given the search and every other column filter. */
    getFacets: async (
        field: string,
        params: Pick<ShipmentListParams, "search" | "columns">
    ): Promise<ShipmentFacet[]> => {
        const query = new URLSearchParams({ field });
        if (params.search) query.set("search", params.search);
        setColumnParams(query, { columns: params.columns });
        return apiClient.get<ShipmentFacet[]>(`/shipments/facets?${query.toString()}`);
    },
    getById: async (id: string): Promise<ShipmentDetail> => {
        return apiClient.get<ShipmentDetail>(`/shipments/${id}`);
    },
    create: async (shipment: CreateShipmentInput) => {
        return apiClient.post<CreatedShipment>("/shipments", shipment);
    },
    createWithOperational: async (payload: {
        shipment: CreateShipmentInput
        operational: Omit<CreateShipmentOperationalInput, "shipmentId">
    }) => {
        return apiClient.post<CreatedShipment>("/shipments/with-operational", payload);
    },
    update: async (id: string, shipment: Partial<Shipment>) => {
        const response = await apiClient.put(`/shipments/${id}`, shipment);
        return response;
    },
    delete: async (id: string) => {
        const response = await apiClient.delete(`/shipments/${id}`);
        return response;
    },
    createShipmentOperational: async (shipmentId: string, shipmentOperational: unknown) => {
        const response = await apiClient.post(`/shipments/${shipmentId}/operational`, shipmentOperational);
        return response;
    },
    updateShipmentOperational: async (shipmentId: string, id: string, shipmentOperational: unknown) => {
        const response = await apiClient.put(`/shipments/${shipmentId}/operational/${id}`, shipmentOperational);
        return response;
    },
    deleteShipmentOperational: async (shipmentId: string, id: string) => {
        const response = await apiClient.delete(`/shipments/${shipmentId}/operational/${id}`);
        return response;
    },
    getShipmentOperationalContainers: async () => {
        const response = await apiClient.get("/containers")
        return response;
    },
    createShipmentOperationalContainer: async (shipmentId: string, shipmentOperationalId: string, shipmentOperationalContainer: unknown) => {
        const response = await apiClient.post(`/shipments/${shipmentId}/operational/${shipmentOperationalId}/containers`, shipmentOperationalContainer);
        return response;
    },
    updateShipmentOperationalContainer: async (shipmentId: string, shipmentOperationalId: string, id: string, shipmentOperationalContainer: unknown) => {
        const response = await apiClient.put(`/shipments/${shipmentId}/operational/${shipmentOperationalId}/containers/${id}`, shipmentOperationalContainer);
        return response;
    },
    deleteShipmentOperationalContainer: async (shipmentId: string, shipmentOperationalId: string, id: string) => {
        const response = await apiClient.delete(`/shipments/${shipmentId}/operational/${shipmentOperationalId}/containers/${id}`);
        return response;
    },
    createShipmentOperationalAttachment: async (shipmentId: string, shipmentOperationalAttachment: FormData) => {
        const response = await apiClient.post(`/shipments/${shipmentId}/attachments`, shipmentOperationalAttachment);
        return response;
    },
    updateShipmentOperationalAttachment: async (shipmentId: string, id: string, shipmentOperationalAttachment: unknown) => {
        const response = await apiClient.put(`/shipments/${shipmentId}/attachments/${id}`, shipmentOperationalAttachment);
        return response;
    },
    deleteShipmentOperationalAttachment: async (shipmentId: string, id: string) => {
        const response = await apiClient.delete(`/shipments/${shipmentId}/attachments/${id}`);
        return response;
    },
    viewShipmentOperationalAttachment: async (shipmentId: string, id: string) => {
        await openFetchedAttachment(async () => {
            const response = await apiClient.get<{
                url: string
                contentType?: string | null
                fileName?: string | null
            }>(`/shipments/${shipmentId}/attachments/${id}`);
            return {
                url: response.url,
                contentType: response.contentType,
                fileName: response.fileName,
            };
        });
    }
}