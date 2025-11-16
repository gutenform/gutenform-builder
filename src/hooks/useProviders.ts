import { useState, useEffect, useCallback } from 'react';
import { apiGet, apiPost, ApiResponse } from '@/lib/api';

export interface Provider {
  id: number;
  name: string;
  provider_type: string;
  settings: Record<string, any>;
  is_active: boolean;
  date_created: string;
}

export interface ProviderFilters {
  is_active?: boolean;
  provider_type?: string;
}

export interface CreateProviderData {
  name: string;
  provider_type: string;
  settings?: Record<string, any>;
  is_active?: boolean;
}

export interface UpdateProviderData {
  id: number;
  name?: string;
  provider_type?: string;
  settings?: Record<string, any>;
  is_active?: boolean;
}

/**
 * Hook to fetch all providers with filters
 */
export function useProviders(filters?: ProviderFilters) {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchProviders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (filters?.is_active !== undefined) params.append('is_active', filters.is_active.toString());
      if (filters?.provider_type) params.append('provider_type', filters.provider_type);

      const queryString = params.toString();
      const endpoint = queryString ? `providers/get?${queryString}` : 'providers/get';
      
      const response = await apiGet<ApiResponse<Provider[]>>(endpoint);
      
      if (response.success && response.data) {
        setProviders(response.data);
      } else {
        throw new Error(response.message || 'Failed to fetch providers');
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
      setProviders([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchProviders();
  }, [fetchProviders]);

  return {
    providers,
    loading,
    error,
    refetch: fetchProviders,
  };
}

/**
 * Hook to fetch a single provider
 */
export function useProvider(id: number | null) {
  const [provider, setProvider] = useState<Provider | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchProvider = useCallback(async () => {
    if (!id) {
      setProvider(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await apiGet<ApiResponse<Provider>>(`providers/get/${id}`);
      
      if (response.success && response.data) {
        setProvider(response.data);
      } else {
        throw new Error(response.message || 'Failed to fetch provider');
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
      setProvider(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchProvider();
  }, [fetchProvider]);

  return {
    provider,
    loading,
    error,
    refetch: fetchProvider,
  };
}

/**
 * Hook to fetch a provider by type
 */
export function useProviderByType(providerType: string | null) {
  const [provider, setProvider] = useState<Provider | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchProvider = useCallback(async () => {
    if (!providerType) {
      setProvider(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await apiGet<ApiResponse<Provider>>(`providers/get-by-type/${providerType}`);
      
      if (response.success && response.data) {
        setProvider(response.data);
      } else {
        throw new Error(response.message || 'Failed to fetch provider');
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
      setProvider(null);
    } finally {
      setLoading(false);
    }
  }, [providerType]);

  useEffect(() => {
    fetchProvider();
  }, [fetchProvider]);

  return {
    provider,
    loading,
    error,
    refetch: fetchProvider,
  };
}

/**
 * Hook to create a provider
 */
export function useCreateProvider() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const createProvider = useCallback(async (data: CreateProviderData) => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiPost<ApiResponse<Provider>>('providers/create', data);
      
      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to create provider');
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
    createProvider,
    loading,
    error,
  };
}

/**
 * Hook to update a provider
 */
export function useUpdateProvider() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const updateProvider = useCallback(async (data: UpdateProviderData) => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiPost<ApiResponse<Provider>>('providers/update', data);
      
      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to update provider');
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
    updateProvider,
    loading,
    error,
  };
}

/**
 * Hook to delete a provider
 */
export function useDeleteProvider() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const deleteProvider = useCallback(async (id: number) => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiPost<ApiResponse>('providers/delete', { id });
      
      if (response.success) {
        return true;
      } else {
        throw new Error(response.message || 'Failed to delete provider');
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
    deleteProvider,
    loading,
    error,
  };
}

