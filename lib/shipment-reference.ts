type ShipmentReferenceSource = {
  /** Shipment payloads carry the customer as `customerCode`; flattened rows pass `customerName`. */
  customerCode?: { customerName?: string | null } | null
  customerName?: string | null
  /** Flattened rows (e.g. dashboard voyages) pass the vessel directly. */
  vesselName?: string | null
  voyageNumber?: string | null
  shipmentOperational?: {
    vessel?: { vesselName?: string | null; voyageNumber?: string | null } | null
  } | null
}

/** Display label for a shipment: "<customer name> · <vessel name> v. <voyage>". */
export function shipmentReference(shipment: ShipmentReferenceSource | null | undefined) {
  if (!shipment) return "—"
  const customer = (shipment.customerCode?.customerName ?? shipment.customerName)?.trim() || "No customer"
  const vessel =
    vesselLabel(shipment.shipmentOperational?.vessel ?? {
      vesselName: shipment.vesselName,
      voyageNumber: shipment.voyageNumber,
    }) ?? "No vessel"
  return `${customer} · ${vessel}`
}

/** Vessel and voyage as one label: "<vessel name> v. <voyage>". */
export function vesselLabel(vessel: { vesselName?: string | null; voyageNumber?: string | null } | null | undefined) {
  const name = vessel?.vesselName?.trim()
  const voyage = vessel?.voyageNumber?.trim()
  if (!name && !voyage) return null
  return [name || "No vessel", voyage ? `v. ${voyage}` : null].filter(Boolean).join(" ")
}
