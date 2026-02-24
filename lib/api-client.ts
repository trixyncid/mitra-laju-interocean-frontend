export async function apiFetch(url: string, options: RequestInit = {}) {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}${url}`, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            ...options.headers,
        },
        credentials: "include"
    });
    const result = await response.json().catch(() => ({}));

    if (!response.ok) {
        throw new Error(result.error.message);
    }

    return result.data;
}

export const apiClient = {
    get: (endpoint: string) => apiFetch(endpoint),
    post: (endpoint: string, body: unknown) => apiFetch(endpoint, { method: "POST", body: JSON.stringify(body) }),
    put: (endpoint: string, body: unknown) => apiFetch(endpoint, { method: "PUT", body: JSON.stringify(body) }),
    delete: (endpoint: string) => apiFetch(endpoint, { method: "DELETE" }),
}