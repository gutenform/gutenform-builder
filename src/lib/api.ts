/**
 * API utility functions for Gutenform
 */

declare const gutenForm: {
  apiUrl: string;
};

const API_BASE_URL = gutenForm?.apiUrl || '';
const API_NAMESPACE = 'gutenform/v1';

/**
 * Get the full API URL for an endpoint
 */
export function getApiUrl(endpoint: string): string {
  // Remove leading slash if present
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  return `${API_BASE_URL}${API_NAMESPACE}/${cleanEndpoint}`;
}

/**
 * Make an API request
 */
export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = getApiUrl(endpoint);
  
  // Get WordPress REST API nonce
  const nonce = (window as any).wpApiSettings?.nonce || (window as any).gutenForm?.nonce || '';
  
  const defaultHeaders: HeadersInit = {
    'Content-Type': 'application/json',
  };

  // Add nonce header if available
  if (nonce) {
    (defaultHeaders as Record<string, string>)['X-WP-Nonce'] = nonce;
  }

  const response = await fetch(url, {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({
      message: `HTTP error! status: ${response.status}`,
    }));
    
    // WordPress REST API error format: { code, message, data: { status } }
    // WP_Error objects are returned as: { code: string, message: string, data: { status: number } }
    const errorMessage = error.message || error.code || `HTTP error! status: ${response.status}`;
    const apiError = new Error(errorMessage);
    (apiError as any).response = response;
    (apiError as any).errorData = error;
    (apiError as any).status = response.status;
    throw apiError;
  }

  return response.json();
}

/**
 * GET request
 */
export async function apiGet<T = any>(endpoint: string): Promise<T> {
  return apiRequest<T>(endpoint, { method: 'GET' });
}

/**
 * POST request
 */
export async function apiPost<T = any>(
  endpoint: string,
  data?: any
): Promise<T> {
  return apiRequest<T>(endpoint, {
    method: 'POST',
    body: data ? JSON.stringify(data) : undefined,
  });
}

/**
 * API Response types
 */
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  total?: number;
  page?: number;
  per_page?: number;
}

export interface ApiError {
  code: string;
  message: string;
  data?: {
    status?: number;
  };
}

