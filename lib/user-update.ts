import type { UserRole } from "@/lib/permissions"
import type { UpdateUserPayload } from "@/services/users.service"

type UserSnapshot = {
  name: string
  email: string
  role?: UserRole | string
  emailVerified?: boolean
  isActive?: boolean
}

/** Build a PATCH-style payload with only fields that actually changed. */
export function buildUserUpdatePayload(
  current: UserSnapshot,
  next: Partial<UserSnapshot>
): UpdateUserPayload | null {
  const payload: UpdateUserPayload = {}

  if (next.name !== undefined && next.name.trim() !== current.name) {
    payload.name = next.name.trim()
  }
  if (next.email !== undefined && next.email.trim() !== current.email) {
    payload.email = next.email.trim()
  }
  if (next.role !== undefined && next.role !== current.role) {
    const parsed =
      typeof next.role === "string"
        ? (next.role as UserRole)
        : next.role
    payload.role = parsed
  }
  if (next.emailVerified !== undefined && next.emailVerified !== current.emailVerified) {
    payload.emailVerified = next.emailVerified
  }
  if (next.isActive !== undefined && next.isActive !== current.isActive) {
    payload.isActive = next.isActive
  }

  return Object.keys(payload).length > 0 ? payload : null
}
