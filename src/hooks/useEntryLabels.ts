import { useState, useEffect, useCallback } from 'react';
import { apiGet, apiPost, ApiResponse } from '@/lib/api';

export interface EntryLabel {
  id: number;
  name: string;
  description?: string;
  color: string;
  date_created: string;
}

export interface CreateEntryLabelData {
  name: string;
  description?: string;
  color?: string;
}

export interface UpdateEntryLabelData {
  id: number;
  name?: string;
  description?: string;
  color?: string;
}

export interface AttachLabelData {
  entry_id: number;
  label_id: number;
}

/**
 * Hook to fetch all entry labels
 */
export function useEntryLabels() {
  const [labels, setLabels] = useState<EntryLabel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchLabels = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiGet<ApiResponse<EntryLabel[]>>('entry-labels/get');
      
      if (response.success && response.data) {
        setLabels(response.data);
      } else {
        throw new Error(response.message || 'Failed to fetch labels');
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
      setLabels([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLabels();
  }, [fetchLabels]);

  return {
    labels,
    loading,
    error,
    refetch: fetchLabels,
  };
}

/**
 * Hook to fetch a single entry label
 */
export function useEntryLabel(id: number | null) {
  const [label, setLabel] = useState<EntryLabel | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchLabel = useCallback(async () => {
    if (!id) {
      setLabel(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await apiGet<ApiResponse<EntryLabel>>(`entry-labels/get/${id}`);
      
      if (response.success && response.data) {
        setLabel(response.data);
      } else {
        throw new Error(response.message || 'Failed to fetch label');
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
      setLabel(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchLabel();
  }, [fetchLabel]);

  return {
    label,
    loading,
    error,
    refetch: fetchLabel,
  };
}

/**
 * Hook to create an entry label
 */
export function useCreateEntryLabel() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const createLabel = useCallback(async (data: CreateEntryLabelData) => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiPost<ApiResponse<EntryLabel>>('entry-labels/create', data);
      
      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to create label');
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
    createLabel,
    loading,
    error,
  };
}

/**
 * Hook to update an entry label
 */
export function useUpdateEntryLabel() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const updateLabel = useCallback(async (data: UpdateEntryLabelData) => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiPost<ApiResponse<EntryLabel>>('entry-labels/update', data);
      
      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to update label');
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
    updateLabel,
    loading,
    error,
  };
}

/**
 * Hook to delete an entry label
 */
export function useDeleteEntryLabel() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const deleteLabel = useCallback(async (id: number) => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiPost<ApiResponse>('entry-labels/delete', { id });
      
      if (response.success) {
        return true;
      } else {
        throw new Error(response.message || 'Failed to delete label');
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
    deleteLabel,
    loading,
    error,
  };
}

/**
 * Hook to attach a label to an entry
 */
export function useAttachLabel() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const attachLabel = useCallback(async (data: AttachLabelData) => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiPost<ApiResponse>('entry-labels/attach', data);
      
      if (response.success) {
        return true;
      } else {
        throw new Error(response.message || 'Failed to attach label');
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
    attachLabel,
    loading,
    error,
  };
}

/**
 * Hook to detach a label from an entry
 */
export function useDetachLabel() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const detachLabel = useCallback(async (data: AttachLabelData) => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiPost<ApiResponse>('entry-labels/detach', data);
      
      if (response.success) {
        return true;
      } else {
        throw new Error(response.message || 'Failed to detach label');
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
    detachLabel,
    loading,
    error,
  };
}

