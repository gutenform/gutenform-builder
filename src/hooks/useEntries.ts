import { useState, useEffect, useCallback } from 'react';
import { apiGet, apiPost, ApiResponse } from '@/lib/api';
import { $inboxFilters, InboxFilters } from '@/admin/pages/inbox/stores';
import { useStore } from '@nanostores/react';

export interface EntryLabel {
  id: number;
  name: string;
  description?: string;
  color: string;
  date_created: string;
}

export interface Entry {
  id: number;
  mailbox_id: number;
  form_identifier?: string;
  wp_post_id?: number;
  data: Record<string, any>;
  ip_address?: string;
  is_read: boolean;
  date_created: string;
  labels?: EntryLabel[];
  status?: string;
}

export interface CreateEntryData {
  mailbox_id: number;
  form_identifier?: string;
  wp_post_id?: number;
  data: Record<string, any>;
  ip_address?: string;
  is_read?: boolean;
  status?: string;
}

export interface UpdateEntryData {
  id: number;
  mailbox_id?: number;
  form_identifier?: string;
  wp_post_id?: number;
  data?: Record<string, any>;
  ip_address?: string;
  is_read?: boolean;
  status?: string;
  labels?: number[];
}

/**
 * Hook to fetch all entries with filters
 */
export function useEntries(inboxFilters?: (InboxFilters | undefined)) {
  const defaultFilters = useStore($inboxFilters);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(inboxFilters?.page || 1);
  const [perPage, setPerPage] = useState(inboxFilters?.per_page || 10);

  const fetchEntries = useCallback(async () => {
    const filters = $inboxFilters.get();
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (filters?.mailbox_id) params.append('mailbox_id', filters.mailbox_id.toString());
      if (filters?.form_identifier) params.append('form_identifier', filters.form_identifier);
      if (filters?.is_read !== undefined) params.append('is_read', filters.is_read.toString());
      if (filters?.labels && filters.labels.length > 0) params.append('labels', filters.labels.join(','));
      if (filters?.status) params.append('status', filters.status);
      if (filters?.search) params.append('search', filters.search);
      params.append('page', page.toString());
      params.append('per_page', perPage.toString());

      const response = await apiGet<ApiResponse<Entry[]>>(`entries/get?${params.toString()}`);
      
      if (response.success && response.data) {
        setEntries(response.data);
        setTotal(response.total || 0);
      } else {
        throw new Error(response.message || 'Failed to fetch entries');
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
      setEntries([]);
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(defaultFilters), page, perPage]);

  useEffect(() => {
    fetchEntries();
  }, [JSON.stringify(defaultFilters), page, perPage]);

  return {
    entries,
    loading,
    error,
    total,
    page,
    perPage,
    setPage,
    setPerPage,
    refetch: fetchEntries,
  };
}

/**
 * Hook to fetch a single entry
 */
export function useEntry(id: number | null) {
  const [entry, setEntry] = useState<Entry | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchEntry = useCallback(async () => {
    if (!id) {
      setEntry(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await apiGet<ApiResponse<Entry>>(`entries/get/${id}`);
      
      if (response.success && response.data) {
        setEntry(response.data);
      } else {
        throw new Error(response.message || 'Failed to fetch entry');
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
      setEntry(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchEntry();
  }, [fetchEntry]);

  return {
    entry,
    loading,
    error,
    refetch: fetchEntry,
  };
}

/**
 * Hook to create an entry
 */
export function useCreateEntry() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const createEntry = useCallback(async (data: CreateEntryData) => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiPost<ApiResponse<Entry>>('entries/create', data);
      
      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to create entry');
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    createEntry,
    loading,
    error,
  };
}

/**
 * Hook to update an entry
 */
export function useUpdateEntry() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const updateEntry = useCallback(async (data: UpdateEntryData) => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiPost<ApiResponse<Entry>>('entries/update', data);

      console.log('response', response);
      
      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to update entry');
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    updateEntry,
    loading,
    error,
  };
}

/**
 * Hook to delete an entry
 */
export function useDeleteEntry() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const deleteEntry = useCallback(async (id: number) => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiPost<ApiResponse>('entries/delete', { id });
      
      if (response.success) {
        return true;
      } else {
        throw new Error(response.message || 'Failed to delete entry');
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    deleteEntry,
    loading,
    error,
  };
}

/**
 * Hook to mark an entry as read/unread
 */
export function useMarkEntryRead() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const markRead = useCallback(async (id: number, isRead: boolean = true) => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiPost<ApiResponse<Entry>>('entries/mark-read', {
        id,
        is_read: isRead,
      });
      
      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to mark entry');
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    markRead,
    loading,
    error,
  };
}

export interface FormIdentifierCount {
  form_identifier: string;
  count: number;
}

/**
 * Hook to fetch all unique form identifiers with their entry counts
 */
export function useFormIdentifiers() {
  const [formIdentifiers, setFormIdentifiers] = useState<FormIdentifierCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchFormIdentifiers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiGet<ApiResponse<FormIdentifierCount[]>>('entries/form-identifiers');
      
      if (response.success && response.data) {
        setFormIdentifiers(response.data);
      } else {
        throw new Error(response.message || 'Failed to fetch form identifiers');
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
      setFormIdentifiers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFormIdentifiers();
  }, [fetchFormIdentifiers]);

  return {
    formIdentifiers,
    loading,
    error,
    refetch: fetchFormIdentifiers,
  };
}

export interface StatusCount {
  status: string;
  count: number;
}

/**
 * Hook to fetch all unique statuses with their entry counts
 */
export function useStatuses() {
  const defaultFilters = useStore($inboxFilters);
  const [statuses, setStatuses] = useState<StatusCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchStatuses = useCallback(async () => {
    try {
      const filters = $inboxFilters.get();
      setLoading(true);
      setError(null);

      const response = await apiGet<ApiResponse<StatusCount[]>>(`entries/statuses?mailbox_id=${filters.mailbox_id}`);
      
      if (response.success && response.data) {
        setStatuses(response.data);
      } else {
        throw new Error(response.message || 'Failed to fetch statuses');
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
      setStatuses([]);
    } finally {
      setLoading(false);
    }
  }, [defaultFilters.mailbox_id]);

  useEffect(() => {
    fetchStatuses();
  }, [defaultFilters.mailbox_id]);

  return {
    statuses,
    loading,
    error,
    refetch: fetchStatuses,
  };
}

