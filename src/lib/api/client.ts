const RAW_API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api"
).replace(/\/+$/, "");

export interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>;
  revalidate?: number | false;
  tags?: string[];
}

export interface ApiResponse<T = any> {
  data: T;
  status: number;
  success: boolean;
  message?: string;
}

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
  const qs = searchParams.toString();
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
async function apiRequest<T = any>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<ApiResponse<T>> {
  const { params, revalidate, tags, headers, ...rest } = options;
  const queryString = buildQueryString(params);
  const url = resolveUrl(endpoint, queryString);

  // --- REQUEST INTERCEPTOR ---
  const defaultHeaders: HeadersInit = {
    "Content-Type": "application/json",
  };

  // Attach auth token if present in browser storage
  if (typeof window !== "undefined") {
    try {
      const token = localStorage.getItem("token");
      if (token) {
        (defaultHeaders as Record<string, string>)["Authorization"] = token;
      }
    } catch {
      // Storage access may be restricted in some iframe / sandboxed environments
    }
  }

  const fetchConfig: RequestInit & { next?: { revalidate?: number | false; tags?: string[] } } = {
    ...rest,
    headers: {
      ...defaultHeaders,
      ...headers,
    },
  };

  // Next.js ISR & caching config
  if (revalidate !== undefined || tags !== undefined) {
    fetchConfig.next = {
      ...(revalidate !== undefined ? { revalidate } : {}),
      ...(tags !== undefined ? { tags } : {}),
    };
  }

  // --- EXECUTE REQUEST & RESPONSE INTERCEPTOR ---
  try {
    const res = await fetch(url, fetchConfig);
    const data = await res.json().catch(() => ({}));

    // Standardized response envelope
    return {
      data: data as T,
      status: res.status,
      success: res.ok && (data?.success !== false),
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
  get: <T = any>(endpoint: string, options?: RequestOptions) =>
    apiRequest<T>(endpoint, { method: "GET", ...options }),

  post: <T = any>(endpoint: string, body?: any, options?: RequestOptions) =>
    apiRequest<T>(endpoint, {
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
      ...options,
    }),

  put: <T = any>(endpoint: string, body?: any, options?: RequestOptions) =>
    apiRequest<T>(endpoint, {
      method: "PUT",
      body: body ? JSON.stringify(body) : undefined,
      ...options,
    }),

  delete: <T = any>(endpoint: string, options?: RequestOptions) =>
    apiRequest<T>(endpoint, { method: "DELETE", ...options }),

  baseURL: RAW_API_BASE_URL,
};

export default api;
