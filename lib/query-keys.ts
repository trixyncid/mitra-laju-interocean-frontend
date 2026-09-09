/** TanStack Query key factories — list vs detail namespaces never collide. */

export const shipmentKeys = {
  all: ["shipments"] as const,
  lists: () => [...shipmentKeys.all, "list"] as const,
  list: (params: unknown) => [...shipmentKeys.lists(), params] as const,
  details: () => [...shipmentKeys.all, "detail"] as const,
  detail: (id: string) => [...shipmentKeys.details(), id] as const,
}

export const vendorKeys = {
  all: ["vendors"] as const,
  lists: () => [...vendorKeys.all, "list"] as const,
  list: (params: unknown) => [...vendorKeys.lists(), params] as const,
  details: () => [...vendorKeys.all, "detail"] as const,
  detail: (id: string) => [...vendorKeys.details(), id] as const,
}

export const customerKeys = {
  all: ["customers"] as const,
  lists: () => [...customerKeys.all, "list"] as const,
  list: (params: unknown) => [...customerKeys.lists(), params] as const,
  details: () => [...customerKeys.all, "detail"] as const,
  detail: (id: string) => [...customerKeys.details(), id] as const,
  locations: (customerId: string) =>
    [...customerKeys.detail(customerId), "locations"] as const,
  shippers: (customerId: string) =>
    [...customerKeys.detail(customerId), "shippers"] as const,
  search: (term: string) => [...customerKeys.all, "search", term] as const,
}

export const costingKeys = {
  all: ["costings"] as const,
  lists: () => [...costingKeys.all, "list"] as const,
  list: (params: unknown) => [...costingKeys.lists(), params] as const,
  details: () => [...costingKeys.all, "detail"] as const,
  detail: (id: string) => [...costingKeys.details(), id] as const,
}

export const sellingKeys = {
  all: ["sellings"] as const,
  lists: () => [...sellingKeys.all, "list"] as const,
  list: (params: unknown) => [...sellingKeys.lists(), params] as const,
  details: () => [...sellingKeys.all, "detail"] as const,
  detail: (id: string) => [...sellingKeys.details(), id] as const,
}

export const portKeys = {
  all: ["ports"] as const,
  lists: () => [...portKeys.all, "list"] as const,
  list: (params: unknown) => [...portKeys.lists(), params] as const,
}

export const vesselKeys = {
  all: ["vessels"] as const,
  lists: () => [...vesselKeys.all, "list"] as const,
  list: (params: unknown) => [...vesselKeys.lists(), params] as const,
}

export const userKeys = {
  all: ["users"] as const,
  lists: () => [...userKeys.all, "list"] as const,
  list: (params: unknown) => [...userKeys.lists(), params] as const,
  details: () => [...userKeys.all, "detail"] as const,
  detail: (id: string) => [...userKeys.details(), id] as const,
}

export const roleKeys = {
  all: ["roles"] as const,
  lists: () => [...roleKeys.all, "list"] as const,
  list: (params: unknown) => [...roleKeys.lists(), params] as const,
  details: () => [...roleKeys.all, "detail"] as const,
  detail: (id: string) => [...roleKeys.details(), id] as const,
  options: () => [...roleKeys.all, "options"] as const,
  modules: () => [...roleKeys.all, "modules"] as const,
  search: (term: string) => [...roleKeys.all, "search", term] as const,
}
