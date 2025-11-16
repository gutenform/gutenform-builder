/**
 * Gutenform Entries API Class
 * 
 * Provides a TypeScript class to interact with the Gutenform Entries API.
 * This class is available globally via window.gutenform.Entries
 * 
 * @example
 * // Create a new entry
 * const entry = await window.gutenform.Entries.create({
 *   mailbox_id: 1,
 *   form_identifier: 'contact-form',
 *   data: {
 *     name: 'John Doe',
 *     email: 'john@example.com',
 *     message: 'Hello World'
 *   }
 * });
 */

// Type definitions
interface GutenformEntriesConfig {
  apiUrl: string;
  nonce?: string;
  namespace?: string;
}

interface EntryData {
  [key: string]: unknown;
}

interface CreateEntryData {
  mailbox_id: number;
  form_identifier?: string;
  wp_post_id?: number;
  data: EntryData;
  ip_address?: string;
  is_read?: boolean;
}

interface UpdateEntryData {
  id: number;
  mailbox_id?: number;
  form_identifier?: string;
  wp_post_id?: number;
  data?: EntryData;
  ip_address?: string;
  is_read?: boolean;
}

interface EntryFilters {
  mailbox_id?: number;
  form_identifier?: string;
  is_read?: boolean;
  page?: number;
  per_page?: number;
}

interface ApiSuccessResponse<T = unknown> {
  success: true;
  data: T;
  message?: string;
}

interface ApiErrorResponse {
  success: false;
  message: string;
  data?: unknown;
}

type ApiResponse<T = unknown> = ApiSuccessResponse<T> | ApiErrorResponse;

interface Entry {
  id: number;
  mailbox_id: number;
  form_identifier?: string | null;
  wp_post_id?: number | null;
  data: EntryData;
  ip_address?: string | null;
  is_read: boolean;
  created_at: string;
  updated_at: string;
}

interface EntriesListResponse {
  data: Entry[];
  total: number;
  page: number;
  per_page: number;
}

interface DeleteResponse {
  success: true;
  message: string;
}

interface RequestOptions extends RequestInit {
  headers?: HeadersInit;
}

// Extend Window interface
declare global {
  interface Window {
    gutenform?: {
      apiUrl?: string;
      nonce?: string;
      namespace?: string;
      Entries?: GutenformEntries;
      EntriesClass?: typeof GutenformEntries;
    };
  }
}

/**
 * Gutenform Entries API Class
 */
class GutenformEntries {
  private apiUrl: string;
  private nonce: string;
  private namespace: string;

  /**
   * Constructor
   * 
   * @param config Configuration object
   */
  constructor(config: GutenformEntriesConfig) {
    if (!config || !config.apiUrl) {
      throw new Error('GutenformEntries: apiUrl is required');
    }
    
    this.apiUrl = config.apiUrl;
    this.nonce = config.nonce || '';
    this.namespace = config.namespace || 'gutenform/v1';
  }

  /**
   * Get the full API URL for an endpoint
   * 
   * @param endpoint API endpoint
   * @returns Full API URL
   */
  private getApiUrl(endpoint: string): string {
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
    return `${this.apiUrl}${this.namespace}/${cleanEndpoint}`;
  }

  /**
   * Make an API request
   * 
   * @param endpoint API endpoint
   * @param options Fetch options
   * @returns API response
   */
  private async request<T = unknown>(endpoint: string, options: RequestOptions = {}): Promise<ApiResponse<T>> {
    const url = this.getApiUrl(endpoint);
    
    const defaultHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Add WordPress REST API nonce if available
    if (this.nonce) {
      defaultHeaders['X-WP-Nonce'] = this.nonce;
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
      })) as { message?: string };
      throw new Error(error.message || `HTTP error! status: ${response.status}`);
    }

    return response.json() as Promise<ApiResponse<T>>;
  }

  /**
   * Create a new entry
   * 
   * @param entryData Entry data
   * @returns Created entry
   * 
   * @example
   * const entry = await entries.create({
   *   mailbox_id: 1,
   *   form_identifier: 'contact-form',
   *   data: {
   *     name: 'John Doe',
   *     email: 'john@example.com'
   *   }
   * });
   */
  async create(entryData: CreateEntryData): Promise<Entry> {
    if (!entryData || !entryData.mailbox_id) {
      throw new Error('mailbox_id is required');
    }
    
    if (!entryData.data) {
      throw new Error('data is required');
    }

    const response = await this.request<Entry>('entries/create', {
      method: 'POST',
      body: JSON.stringify(entryData),
    });

    if (!response.success) {
      throw new Error(response.message || 'Failed to create entry');
    }

    return response.data;
  }

  /**
   * Get entries with optional filters
   * 
   * @param filters Filter options
   * @returns Entries response with data, total, page, per_page
   */
  async get(filters: EntryFilters = {}): Promise<EntriesListResponse> {
    const queryParams = new URLSearchParams();
    
    if (filters.mailbox_id) {
      queryParams.append('mailbox_id', filters.mailbox_id.toString());
    }
    if (filters.form_identifier) {
      queryParams.append('form_identifier', filters.form_identifier);
    }
    if (filters.is_read !== undefined) {
      queryParams.append('is_read', filters.is_read ? '1' : '0');
    }
    if (filters.page) {
      queryParams.append('page', filters.page.toString());
    }
    if (filters.per_page) {
      queryParams.append('per_page', filters.per_page.toString());
    }

    const endpoint = 'entries/get' + (queryParams.toString() ? '?' + queryParams.toString() : '');
    const response = await this.request<EntriesListResponse>(endpoint, { method: 'GET' });
    
    if (!response.success) {
      throw new Error(response.message || 'Failed to get entries');
    }

    return response.data;
  }

  /**
   * Get a single entry by ID
   * 
   * @param id Entry ID
   * @returns Entry data
   */
  async getById(id: number): Promise<Entry> {
    if (!id) {
      throw new Error('Entry ID is required');
    }

    const response = await this.request<Entry>(`entries/get/${id}`, { method: 'GET' });
    
    if (!response.success) {
      throw new Error(response.message || 'Failed to get entry');
    }

    return response.data;
  }

  /**
   * Update an entry
   * 
   * @param entryData Entry data with id
   * @returns Updated entry
   */
  async update(entryData: UpdateEntryData): Promise<Entry> {
    if (!entryData || !entryData.id) {
      throw new Error('Entry ID is required');
    }

    const response = await this.request<Entry>('entries/update', {
      method: 'POST',
      body: JSON.stringify(entryData),
    });

    if (!response.success) {
      throw new Error(response.message || 'Failed to update entry');
    }

    return response.data;
  }

  /**
   * Delete an entry
   * 
   * @param id Entry ID
   * @returns Success response
   */
  async delete(id: number): Promise<DeleteResponse> {
    if (!id) {
      throw new Error('Entry ID is required');
    }

    const response = await this.request<DeleteResponse>('entries/delete', {
      method: 'POST',
      body: JSON.stringify({ id }),
    });

    if (!response.success) {
      throw new Error(response.message || 'Failed to delete entry');
    }

    return response.data as DeleteResponse;
  }

  /**
   * Mark an entry as read or unread
   * 
   * @param id Entry ID
   * @param is_read Whether to mark as read (default: true)
   * @returns Updated entry
   */
  async markRead(id: number, is_read: boolean = true): Promise<Entry> {
    if (!id) {
      throw new Error('Entry ID is required');
    }

    const response = await this.request<Entry>('entries/mark-read', {
      method: 'POST',
      body: JSON.stringify({ id, is_read }),
    });

    if (!response.success) {
      throw new Error(response.message || 'Failed to update entry');
    }

    return response.data;
  }
}

// Initialize and expose to window object
if (typeof window !== 'undefined') {
  // Ensure gutenform object exists
  window.gutenform = window.gutenform || {};
  
  // Initialize Entries class if config is available
  if (window.gutenform.apiUrl) {
    window.gutenform.Entries = new GutenformEntries({
      apiUrl: window.gutenform.apiUrl,
      nonce: window.gutenform.nonce || '',
      namespace: window.gutenform.namespace || 'gutenform/v1',
    });
  } else {
    // Store constructor for later initialization
    window.gutenform.EntriesClass = GutenformEntries;
    
    // Initialize when config is available
    const initEntries = (): void => {
      if (window.gutenform?.apiUrl) {
        window.gutenform.Entries = new GutenformEntries({
          apiUrl: window.gutenform.apiUrl,
          nonce: window.gutenform.nonce || '',
          namespace: window.gutenform.namespace || 'gutenform/v1',
        });
      }
    };
    
    // Try to initialize on DOM ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initEntries);
    } else {
      initEntries();
    }
  }
}

export type {
  GutenformEntriesConfig,
  EntryData,
  CreateEntryData,
  UpdateEntryData,
  EntryFilters,
  Entry,
  EntriesListResponse,
  ApiResponse,
  ApiSuccessResponse,
  ApiErrorResponse,
  DeleteResponse,
};

export { GutenformEntries };

