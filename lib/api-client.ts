/**
 * VendLex Kenya — Universal Production API Client
 * Seamlessly routes API requests to Render Backend (https://api.vendlex.co.ke)
 * or Vercel Next.js routes (/api) with credentials and error handling.
 */

export function getApiBaseUrl(): string {
  if (typeof window !== "undefined") {
    // Browser environment
    if (process.env.NEXT_PUBLIC_API_URL) {
      return process.env.NEXT_PUBLIC_API_URL.replace(/\/$/, "");
    }
    return ""; // Relative path /api on same-origin (Vercel)
  }

  // Server-side (SSR / ISR / Route Handlers)
  if (process.env.API_URL) {
    return process.env.API_URL.replace(/\/$/, "");
  }
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL.replace(/\/$/, "");
  }
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "");
  }
  return process.env.NODE_ENV === "production" ? "https://vendlex.co.ke" : "http://localhost:3000";
}

export interface ApiFetchOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined | null>;
}

export async function apiFetch<T = any>(endpoint: string, options: ApiFetchOptions = {}): Promise<{
  success: boolean;
  data?: T;
  error?: string;
  status: number;
}> {
  const { params, headers, ...restOptions } = options;
  const baseUrl = getApiBaseUrl();
  const normalizedEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;

  let url = `${baseUrl}${normalizedEndpoint}`;

  if (params) {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== "") {
        query.append(key, String(val));
      }
    });
    const queryString = query.toString();
    if (queryString) {
      url += (url.includes("?") ? "&" : "?") + queryString;
    }
  }

  try {
    const response = await fetch(url, {
      ...restOptions,
      credentials: "include", // Required for cross-origin session cookies (Vercel <-> Render)
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...headers,
      },
    });

    const status = response.status;
    let data: any = null;

    try {
      data = await response.json();
    } catch {
      data = null;
    }

    if (!response.ok) {
      return {
        success: false,
        error: data?.error || data?.message || `Request failed with status ${status}`,
        status,
        data,
      };
    }

    return {
      success: true,
      data: data?.data ?? data,
      status,
    };
  } catch (err: any) {
    console.error(`[API Fetch Error] ${endpoint}:`, err?.message);
    return {
      success: false,
      error: err?.message || "Network error. Failed to connect to VendLex API.",
      status: 0,
    };
  }
}
