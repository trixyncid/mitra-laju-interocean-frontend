export async function apiFetch(url: string, options: RequestInit = {}) {
    const isFormData = options.body instanceof FormData;

    const headers: HeadersInit = isFormData
        ? { ...options.headers as Record<string, string> }
        : { "Content-Type": "application/json", ...options.headers as Record<string, string> };

    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}${url}`, {
        ...options,
        headers,
        credentials: "include"
    });
    const result = await response.json().catch(() => ({}));

    if (!response.ok) {
        console.log("Error: ", result);
        throw new Error(result.error.message);
    }

    return result.data;
}

export const apiClient = {
    get: (endpoint: string) => apiFetch(endpoint),
    post: (endpoint: string, body: unknown) => apiFetch(endpoint, {
        method: "POST",
        body: body instanceof FormData ? body : JSON.stringify(body),
    }),
    put: (endpoint: string, body: unknown) => apiFetch(endpoint, {
        method: "PUT",
        body: body instanceof FormData ? body : JSON.stringify(body),
    }),
    delete: (endpoint: string) => apiFetch(endpoint, { method: "DELETE" }),
}