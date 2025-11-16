import { useState, useEffect, useCallback } from 'react';
import { apiGet, apiPost, ApiResponse } from '../lib/api';

export interface Mailbox {
  id: number;
  title: string;
  is_default: boolean;
  date_created: string;
  user_id?: number;
}

export interface MailboxFilters {
  user_id?: number;
  is_default?: boolean;
}

export interface CreateMailboxData {
  title: string;
  is_default?: boolean;
  user_id?: number;
}

export interface UpdateMailboxData {
  id: number;
  title?: string;
  is_default?: boolean;
  user_id?: number;
}

/**
 * Hook to fetch all mailboxes with filters
 */
export function useMailboxes(filters?: MailboxFilters) {
  const [mailboxes, setMailboxes] = useState<Mailbox[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchMailboxes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (filters?.user_id) params.append('user_id', filters.user_id.toString());
      if (filters?.is_default !== undefined) params.append('is_default', filters.is_default.toString());

      const queryString = params.toString();
      const endpoint = queryString ? `mailboxes/get?${queryString}` : 'mailboxes/get';
      
      const response = await apiGet<ApiResponse<Mailbox[]>>(endpoint);
      
      if (response.success && response.data) {
        setMailboxes(response.data);
      } else {
        throw new Error(response.message || 'Failed to fetch mailboxes');
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
      setMailboxes([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchMailboxes();
  }, [fetchMailboxes]);

  return {
    mailboxes,
    loading,
    error,
    refetch: fetchMailboxes,
  };
}

/**
 * Hook to fetch a single mailbox
 */
export function useMailbox(id: number | null) {
  const [mailbox, setMailbox] = useState<Mailbox | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchMailbox = useCallback(async () => {
    if (!id) {
      setMailbox(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await apiGet<ApiResponse<Mailbox>>(`mailboxes/get/${id}`);
      
      if (response.success && response.data) {
        setMailbox(response.data);
      } else {
        throw new Error(response.message || 'Failed to fetch mailbox');
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
      setMailbox(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchMailbox();
  }, [fetchMailbox]);

  return {
    mailbox,
    loading,
    error,
    refetch: fetchMailbox,
  };
}

/**
 * Hook to create a mailbox
 */
export function useCreateMailbox() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const createMailbox = useCallback(async (data: CreateMailboxData) => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiPost<ApiResponse<Mailbox>>('mailboxes/create', data);
      
      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to create mailbox');
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
    createMailbox,
    loading,
    error,
  };
}

/**
 * Hook to update a mailbox
 */
export function useUpdateMailbox() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const updateMailbox = useCallback(async (data: UpdateMailboxData) => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiPost<ApiResponse<Mailbox>>('mailboxes/update', data);
      
      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to update mailbox');
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
    updateMailbox,
    loading,
    error,
  };
}

/**
 * Hook to delete a mailbox
 */
export function useDeleteMailbox() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const deleteMailbox = useCallback(async (id: number) => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiPost<ApiResponse>('mailboxes/delete', { id });
      
      if (response.success) {
        return true;
      } else {
        throw new Error(response.message || 'Failed to delete mailbox');
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
    deleteMailbox,
    loading,
    error,
  };
}

