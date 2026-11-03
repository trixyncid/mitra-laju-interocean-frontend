export type Service = {
    id?: string
    serviceCode: string
    serviceName: string
    isActive: boolean
    updatedBy?: string
    updatedAt?: string
    /** How many vendors are tagged with this service (list responses only). */
    _count?: { vendors: number }
}

/** A service as it appears on a vendor or a shipment line. */
export type ServiceRef = {
    id: string
    serviceCode: string
    serviceName: string
}
