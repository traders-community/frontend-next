const RAW_API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api"
).replace(/\/+$/, "");

export interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>;
  revalidate?: number | false;
  tags?: string[];
}

export interface ApiClientResponse<T = unknown> {
  data: T;
  status: number;
  success: boolean;
  message?: string;
}

// Backward-compatibility alias
export type ApiResponse<T = unknown> = ApiClientResponse<T>;

/**
 * Builds a clean query string from an object of parameters.
 */
function buildQueryString(params?: Record<string, string | number | boolean | undefined>): string {
  if (!params) return "";
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      searchParams.append(key, String(value));
    }
  });
  const qs = searchParams.toString().replace(/\+/g, "%20");
  return qs ? `?${qs}` : "";
}

/**
 * Normalizes the endpoint against the base URL:
 * Handles cases where NEXT_PUBLIC_API_URL has "/api" and callers pass either "/api/blog" or "/blog".
 * Prevents accidental double prefixes like "/api/api/...".
 */
function resolveUrl(endpoint: string, queryString: string): string {
  let cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;

  // If base already ends with "/api" and endpoint also starts with "/api/", remove duplicate
  if (RAW_API_BASE_URL.endsWith("/api") && cleanEndpoint.startsWith("/api/")) {
    cleanEndpoint = cleanEndpoint.replace(/^\/api/, "");
  }

  // If base does not end with "/api" and endpoint does not start with "/api/", add "/api"
  if (!RAW_API_BASE_URL.endsWith("/api") && !cleanEndpoint.startsWith("/api/")) {
    cleanEndpoint = `/api${cleanEndpoint}`;
  }

  return `${RAW_API_BASE_URL}${cleanEndpoint}${queryString}`;
}

/**
 * Centralized Fetch Wrapper with Request & Response Interceptors.
 * Compatible with Next.js SSR / ISR and Client Components.
 */
async function apiRequest<T = unknown>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<ApiClientResponse<T>> {
  const { params, revalidate, tags, headers, ...rest } = options;
  const queryString = buildQueryString(params);
  const url = resolveUrl(endpoint, queryString);

  // --- REQUEST INTERCEPTOR ---
  const isFormData = typeof FormData !== "undefined" && rest.body instanceof FormData;

  const defaultHeaders: Record<string, string> = {};
  if (!isFormData && rest.body) {
    defaultHeaders["Content-Type"] = "application/json";
  }

  // Attach auth token if present in browser storage (with standard Bearer prefix)
  if (typeof window !== "undefined") {
    try {
      const token = localStorage.getItem("token");
      if (token) {
        defaultHeaders["Authorization"] = token.startsWith("Bearer ")
          ? token
          : `Bearer ${token}`;
      }
    } catch {
      // Storage access may be restricted in some iframe / sandboxed environments
    }
  }

  // Clean custom headers if sending FormData so browser automatically assigns boundary
  const customHeaders = { ...((headers as Record<string, string>) || {}) };
  if (isFormData) {
    delete customHeaders["Content-Type"];
    delete customHeaders["content-type"];
  }

  const fetchConfig: RequestInit & { next?: { revalidate?: number | false; tags?: string[] } } = {
    ...rest,
    headers: {
      ...defaultHeaders,
      ...customHeaders,
    },
  };

  // Next.js ISR & caching config (only applicable on server)
  if (typeof window === "undefined") {
    if (revalidate === 0 || revalidate === false) {
      fetchConfig.cache = "no-store";
      fetchConfig.next = { revalidate: 0 };
    } else if (revalidate !== undefined || tags !== undefined) {
      fetchConfig.next = {
        ...(revalidate !== undefined ? { revalidate } : {}),
        ...(tags !== undefined ? { tags } : {}),
      };
    }
  } else {
    // In browser: standard fetch with cache: "no-store"
    fetchConfig.cache = "no-store";
  }

  // --- EXECUTE REQUEST & RESPONSE INTERCEPTOR ---
  try {
    const res = await fetch(url, fetchConfig);
    const data = await res.json().catch(() => ({}));

    // 401 Session Expiry Interceptor
    if (res.status === 401 && typeof window !== "undefined") {
      try {
        localStorage.removeItem("token");
        if (!window.location.pathname.includes("/login")) {
          import("react-toastify").then(({ toast }) => {
            toast.error("Session expired. Please log in again.", {
              toastId: "session-expired",
            });
          });
          setTimeout(() => {
            window.location.href = "/login";
          }, 600);
        }
      } catch {
        // Storage access may be restricted
      }
    }

    // Standardized response envelope
    return {
      data: data as T,
      status: res.status,
      success: res.ok && data?.success !== false,
      message: data?.message,
    };
  } catch (error: any) {
    console.error(`API Request Failed [${options.method || "GET"} ${url}]:`, error);
    return {
      data: { success: false, message: error?.message || "Network error" } as unknown as T,
      status: 500,
      success: false,
      message: error?.message || "Network error",
    };
  }
}

/**
 * Standardized HTTP Client with typed helper methods.
 */
export const api = {
  get: <T = unknown>(endpoint: string, options?: RequestOptions) =>
    apiRequest<T>(endpoint, { method: "GET", ...options }),

  post: <T = unknown>(endpoint: string, body?: unknown, options?: RequestOptions) => {
    const isFormData = typeof FormData !== "undefined" && body instanceof FormData;
    return apiRequest<T>(endpoint, {
      method: "POST",
      body: isFormData ? (body as FormData) : body !== undefined ? JSON.stringify(body) : undefined,
      ...options,
    });
  },

  put: <T = unknown>(endpoint: string, body?: unknown, options?: RequestOptions) => {
    const isFormData = typeof FormData !== "undefined" && body instanceof FormData;
    return apiRequest<T>(endpoint, {
      method: "PUT",
      body: isFormData ? (body as FormData) : body !== undefined ? JSON.stringify(body) : undefined,
      ...options,
    });
  },

  delete: <T = unknown>(endpoint: string, options?: RequestOptions) =>
    apiRequest<T>(endpoint, { method: "DELETE", ...options }),

  baseURL: RAW_API_BASE_URL,
};

export default api;
