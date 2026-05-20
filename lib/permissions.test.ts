import { describe, expect, it } from "bun:test"
import {
  canRead,
  canWrite,
  canWriteShipmentType,
  canReadVendorsForCosting,
  canReadShipmentsForCosting,
} from "@/lib/permissions"

describe("role permissions", () => {
  it("domestic_admin can write costings and DOMESTIC operationals", () => {
    expect(canWrite("domestic_admin", "costings")).toBe(true)
    expect(canWriteShipmentType("domestic_admin", "DOMESTIC")).toBe(true)
    expect(canWriteShipmentType("domestic_admin", "EXPORT")).toBe(false)
    expect(canReadVendorsForCosting("domestic_admin")).toBe(true)
    expect(canReadShipmentsForCosting("domestic_admin")).toBe(true)
  })

  it("export_admin can write costings and EXPORT operationals", () => {
    expect(canWrite("export_admin", "costings")).toBe(true)
    expect(canWriteShipmentType("export_admin", "EXPORT")).toBe(true)
    expect(canWriteShipmentType("export_admin", "DOMESTIC")).toBe(false)
  })

  it("operational_admin can write costings and all shipment types", () => {
    expect(canWrite("operational_admin", "costings")).toBe(true)
    expect(canWriteShipmentType("operational_admin", "EXPORT")).toBe(true)
    expect(canWriteShipmentType("operational_admin", "IMPORT")).toBe(true)
    expect(canWriteShipmentType("operational_admin", "DOMESTIC")).toBe(true)
  })

  it("costing_admin can write costings but not shipments", () => {
    expect(canWrite("costing_admin", "costings")).toBe(true)
    expect(canWrite("costing_admin", "shipments")).toBe(false)
    expect(canRead("costing_admin", "costings")).toBe(true)
  })

  it("viewer is read-only", () => {
    expect(canWrite("viewer", "costings")).toBe(false)
    expect(canWrite("viewer", "shipments")).toBe(false)
    expect(canRead("viewer", "costings")).toBe(true)
    expect(canRead("viewer", "dashboard")).toBe(false)
  })

  it("only admin roles can view dashboard", () => {
    expect(canRead("admin", "dashboard")).toBe(true)
    expect(canRead("superadmin", "dashboard")).toBe(true)
    expect(canRead("viewer", "dashboard")).toBe(false)
    expect(canRead("costing_admin", "dashboard")).toBe(false)
    expect(canRead("operational_admin", "dashboard")).toBe(false)
  })

  it("only admin roles can view master data", () => {
    expect(canRead("admin", "masterData")).toBe(true)
    expect(canRead("superadmin", "masterData")).toBe(true)
    expect(canRead("viewer", "masterData")).toBe(false)
    expect(canRead("domestic_admin", "masterData")).toBe(false)
    expect(canRead("operational_admin", "masterData")).toBe(false)
  })

  it("costing roles can still load vendors for costing forms without master data access", () => {
    expect(canRead("costing_admin", "masterData")).toBe(false)
    expect(canReadVendorsForCosting("costing_admin")).toBe(true)
    expect(canReadVendorsForCosting("domestic_admin")).toBe(true)
  })
})
