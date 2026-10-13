type ShipmentReferenceSource = {
  /** Shipment payloads carry the customer as `customerCode`; flattened rows pass `customerName`. */
  customerCode?: { customerName?: string | null } | null
  customerName?: string | null
  /** Flattened rows (e.g. dashboard voyages) pass the vessel name directly. */
  vesselName?: string | null
  shipmentOperational?: {
    vessel?: { vesselName?: string | null } | null
  } | null
}

/** Display label for a shipment: "<customer name> · <vessel name>". */
export function shipmentReference(shipment: ShipmentReferenceSource | null | undefined) {
  if (!shipment) return "—"
  const customer = (shipment.customerCode?.customerName ?? shipment.customerName)?.trim() || "No customer"
  const vessel = (shipment.shipmentOperational?.vessel?.vesselName ?? shipment.vesselName)?.trim() || "No vessel"
  return `${customer} · ${vessel}`
}
