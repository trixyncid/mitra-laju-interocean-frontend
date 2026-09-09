import { signOutExpiredSession } from "@/lib/auth-client"
import { getBackendBaseUrl } from "@/lib/backend-url"

export class UnauthorizedError extends Error {
  constructor(message = "Unauthorized") {
    super(message)
    this.name = "UnauthorizedError"
  }
}

export function isUnauthorizedError(error: unknown): boolean {
  return (
    error instanceof UnauthorizedError ||
    (error instanceof Error && error.name === "UnauthorizedError")
  )
}

export type PaginationMeta = {
  page: number
  pageSize: number
  total: number
  totalPages: number
}

export type ApiEnvelope<T> = {
  data: T
  meta?: {
    pagination?: PaginationMeta
  }
}

function getErrorMessage(result: unknown, status: number) {
  const err = result as { error?: { code?: string; message?: string } } | null
  const code = err?.error?.code
  const message = err?.error?.message

  if (message) return message

  if (status === 401) return "Unauthorized. Please sign in again."
  if (status === 403) return "You do not have permission to access this resource."
  if (status === 409) {
    if (code === "USER_ALREADY_EXISTS") {
      return "This email is already registered to another account."
    }
    if (code === "FOREIGN_KEY_CONSTRAINT") {
      return "Cannot complete this action because related records still exist."
    }
    if (code?.endsWith("_ALREADY_EXISTS")) {
      return "A record with this value already exists. Please use a different value."
    }
    return "This action conflicts with existing data. Please check for duplicates."
  }
  if (status >= 500) return "Server error. Please try again later."
  return `Request failed (${status})`
}

export async function apiFetch<T>(url: string, options: RequestInit = {}): Promise<T> {
  const result = await apiFetchEnvelope<T>(url, options)
  return result.data
}

export async function apiFetchEnvelope<T>(
  url: string,
  options: RequestInit = {}
): Promise<ApiEnvelope<T>> {
  const isFormData = options.body instanceof FormData

  const headers: HeadersInit = isFormData
    ? { ...(options.headers as Record<string, string>) }
    : { "Content-Type": "application/json", ...(options.headers as Record<string, string>) }

  let response: Response
  try {
    response = await fetch(`${getBackendBaseUrl()}${url}`, {
      ...options,
      headers,
      credentials: "include",
    })
  } catch {
    throw new Error(
      "Cannot reach the API. Ensure the backend is running and NEXT_PUBLIC_BACKEND_URL is correct."
    )
  }

  const result = await response.json().catch(() => ({}))

  if (!response.ok) {
    console.error("API error:", response.status, result)
    if (response.status === 401) {
      void signOutExpiredSession()
      throw new UnauthorizedError()
    }
    throw new Error(getErrorMessage(result, response.status))
  }

  return result as ApiEnvelope<T>
}

export const apiClient = {
  get: <T = unknown>(endpoint: string) => apiFetch<T>(endpoint),
  getEnvelope: <T = unknown>(endpoint: string) => apiFetchEnvelope<T>(endpoint),
  post: <T = unknown>(endpoint: string, body: unknown) =>
    apiFetch<T>(endpoint, {
      method: "POST",
      body: body instanceof FormData ? body : JSON.stringify(body),
    }),
  put: <T = unknown>(endpoint: string, body: unknown) =>
    apiFetch<T>(endpoint, {
      method: "PUT",
      body: body instanceof FormData ? body : JSON.stringify(body),
    }),
  delete: <T = void>(endpoint: string) =>
    apiFetch<T>(endpoint, { method: "DELETE" }),
}
