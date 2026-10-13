export type ContainerLookup = {
  id?: string
  name: string
  isActive: boolean
  updatedBy?: { name?: string } | string
  updatedAt?: string
}
