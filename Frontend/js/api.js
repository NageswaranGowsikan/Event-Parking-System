const API_BASE_URL = "http://localhost:5157/api";

export class ApiError extends Error {
    constructor(message, status, errors = null) {
        super(message);

        this.name = "ApiError";
        this.status = status;
        this.errors = errors;
    }
}

export function getAuthToken() {
    return (
        localStorage.getItem("token") ||
        localStorage.getItem("authToken")
    );
}

export function setAuthToken(token) {
    localStorage.setItem("token", token);
}

export function removeAuthToken() {
    localStorage.removeItem("token");
    localStorage.removeItem("authToken");
}

async function readResponse(response) {
    if (response.status === 204) {
        return null;
    }

    const contentType =
        response.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
        return await response.json();
    }

    return await response.text();
}

export async function apiRequest(
    endpoint,
    options = {}
) {
    const token = getAuthToken();

    const requestHeaders = {
        Accept: "application/json",
        ...(options.headers || {})
    };

    if (
        options.body &&
        !(options.body instanceof FormData)
    ) {
        requestHeaders["Content-Type"] =
            "application/json";
    }

    if (token) {
        requestHeaders.Authorization =
            `Bearer ${token}`;
    }

    const url = endpoint.startsWith("/")
        ? `${API_BASE_URL}${endpoint}`
        : `${API_BASE_URL}/${endpoint}`;

    try {
        const response = await fetch(url, {
            ...options,
            headers: requestHeaders
        });

        const result = await readResponse(response);

        if (!response.ok) {
            const message =
                result?.message ||
                result?.Message ||
                result?.title ||
                (typeof result === "string"
                    ? result
                    : "Request failed.");

            throw new ApiError(
                message,
                response.status,
                result?.errors || null
            );
        }

        return result;
    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }

        throw new ApiError(
            "Unable to connect to the server. Please check whether the API is running.",
            0
        );
    }
}

export const api = {
    get(endpoint) {
        return apiRequest(endpoint, {
            method: "GET"
        });
    },

    post(endpoint, data) {
        return apiRequest(endpoint, {
            method: "POST",
            body: JSON.stringify(data)
        });
    },

    put(endpoint, data) {
        return apiRequest(endpoint, {
            method: "PUT",
            body: JSON.stringify(data)
        });
    },

    delete(endpoint) {
        return apiRequest(endpoint, {
            method: "DELETE"
        });
    }
};

export { API_BASE_URL };