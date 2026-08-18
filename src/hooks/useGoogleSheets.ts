import { useState, useEffect, useCallback } from 'react';
import { apiGet, apiPost, ApiResponse } from '@/lib/api';

export interface GoogleConnectionStatus {
  has_credentials: boolean;
  has_api_key: boolean;
  client_id: string;
  connected: boolean;
  email: string;
  name: string;
  redirect_uri: string;
  scopes: string[];
}

export interface GoogleSpreadsheet {
  id: string;
  name: string;
  modified_time: string;
}

export interface GoogleSheetTab {
  id: number;
  name: string;
  index: number;
}

export interface GoogleDriveFolder {
  id: string;
  name: string;
}

export interface GoogleFormField {
  name: string;
  label: string;
  type: string;
}

export interface ColumnMapping {
  field: string;
  column: string;
}

export interface GoogleSheetsSettings {
  spreadsheet_id?: string;
  spreadsheet_name?: string;
  sheet_name?: string;
  drive_folder_id?: string;
  drive_folder_name?: string;
  column_mapping?: ColumnMapping[];
}

export function useGoogleStatus() {
  const [status, setStatus] = useState<GoogleConnectionStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchStatus = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiGet<ApiResponse<GoogleConnectionStatus>>('google/status');
      if (response.success && response.data) {
        setStatus(response.data);
      } else {
        throw new Error(response.message || 'Failed to fetch Google status');
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
      setStatus(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  return { status, loading, error, refetch: fetchStatus };
}

export function useGoogleCredentials() {
  const [loading, setLoading] = useState(false);

  const saveCredentials = useCallback(async (clientId: string, clientSecret: string, apiKey = '') => {
    setLoading(true);
    try {
      const response = await apiPost<ApiResponse<GoogleConnectionStatus>>('google/credentials', {
        client_id: clientId,
        client_secret: clientSecret,
        api_key: apiKey,
      });
      if (!response.success) {
        throw new Error(response.message || 'Failed to save credentials');
      }
      return response.data;
    } finally {
      setLoading(false);
    }
  }, []);

  return { saveCredentials, loading };
}

export function useGoogleAuth() {
  const [loading, setLoading] = useState(false);

  const getAuthUrl = useCallback(async () => {
    setLoading(true);
    try {
      const response = await apiGet<ApiResponse<{ url: string; state: string }>>('google/auth-url');
      if (response.success && response.data?.url) {
        return response.data.url;
      }
      throw new Error(response.message || 'Failed to get auth URL');
    } finally {
      setLoading(false);
    }
  }, []);

  const disconnect = useCallback(async () => {
    setLoading(true);
    try {
      const response = await apiPost<ApiResponse<GoogleConnectionStatus>>('google/disconnect');
      if (!response.success) {
        throw new Error(response.message || 'Failed to disconnect');
      }
      return response.data;
    } finally {
      setLoading(false);
    }
  }, []);

  return { getAuthUrl, disconnect, loading };
}

export function useGoogleSpreadsheets() {
  const [spreadsheets, setSpreadsheets] = useState<GoogleSpreadsheet[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchSpreadsheets = useCallback(async (search = '') => {
    setLoading(true);
    try {
      const params = search ? `?search=${encodeURIComponent(search)}` : '';
      const response = await apiGet<ApiResponse<GoogleSpreadsheet[]>>(`google/spreadsheets${params}`);
      if (response.success && response.data) {
        setSpreadsheets(response.data);
      } else {
        throw new Error(response.message || 'Failed to fetch spreadsheets');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const createSpreadsheet = useCallback(async (title: string) => {
    setLoading(true);
    try {
      const response = await apiPost<
        ApiResponse<{ id: string; name: string; default_sheet: string }>
      >('google/spreadsheets', { title });
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.message || 'Failed to create spreadsheet');
    } finally {
      setLoading(false);
    }
  }, []);

  return { spreadsheets, loading, fetchSpreadsheets, createSpreadsheet };
}

export function useGoogleSheets(spreadsheetId: string | null) {
  const [sheets, setSheets] = useState<GoogleSheetTab[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchSheets = useCallback(async () => {
    if (!spreadsheetId) {
      setSheets([]);
      return;
    }
    setLoading(true);
    try {
      const response = await apiGet<
        ApiResponse<{ sheets: GoogleSheetTab[]; headers: string[] }>
      >(`google/sheets?spreadsheet_id=${encodeURIComponent(spreadsheetId)}`);
      if (response.success && response.data) {
        setSheets(response.data.sheets);
        return response.data;
      }
      throw new Error(response.message || 'Failed to fetch sheets');
    } finally {
      setLoading(false);
    }
  }, [spreadsheetId]);

  useEffect(() => {
    fetchSheets();
  }, [fetchSheets]);

  const fetchHeaders = useCallback(
    async (sheetName: string) => {
      if (!spreadsheetId || !sheetName) return [];
      const response = await apiGet<ApiResponse<string[]>>(
        `google/sheet-headers?spreadsheet_id=${encodeURIComponent(spreadsheetId)}&sheet_name=${encodeURIComponent(sheetName)}`
      );
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.message || 'Failed to fetch headers');
    },
    [spreadsheetId]
  );

  const createSheet = useCallback(
    async (sheetName: string, headers: string[] = []) => {
      if (!spreadsheetId) {
        throw new Error('Spreadsheet ID is required');
      }
      setLoading(true);
      try {
        const response = await apiPost<ApiResponse<{ id: number; name: string }>>(
          'google/sheets',
          {
            spreadsheet_id: spreadsheetId,
            sheet_name: sheetName,
            headers,
          }
        );
        if (response.success && response.data) {
          await fetchSheets();
          return response.data;
        }
        throw new Error(response.message || 'Failed to create sheet');
      } finally {
        setLoading(false);
      }
    },
    [spreadsheetId, fetchSheets]
  );

  return { sheets, loading, fetchSheets, fetchHeaders, createSheet };
}

export function useGoogleDriveFolders() {
  const [folders, setFolders] = useState<GoogleDriveFolder[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchFolders = useCallback(async (search = '', parentId = 'root') => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (parentId) params.append('parent_id', parentId);
      const query = params.toString();
      const response = await apiGet<ApiResponse<GoogleDriveFolder[]>>(
        `google/drive-folders${query ? `?${query}` : ''}`
      );
      if (response.success && response.data) {
        setFolders(response.data);
      } else {
        throw new Error(response.message || 'Failed to fetch folders');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  return { folders, loading, fetchFolders };
}

export function useGoogleFormFields(formIdentifier: string | null) {
  const [fields, setFields] = useState<GoogleFormField[]>([]);
  const [metaFields, setMetaFields] = useState<GoogleFormField[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchFields = useCallback(async () => {
    if (!formIdentifier) {
      setFields([]);
      setMetaFields([]);
      return;
    }
    setLoading(true);
    try {
      const response = await apiGet<
        ApiResponse<{ fields: GoogleFormField[]; meta_fields: GoogleFormField[] }>
      >(`google/form-fields?form_identifier=${encodeURIComponent(formIdentifier)}`);
      if (response.success && response.data) {
        setFields(response.data.fields);
        setMetaFields(response.data.meta_fields);
      } else {
        throw new Error(response.message || 'Failed to fetch form fields');
      }
    } finally {
      setLoading(false);
    }
  }, [formIdentifier]);

  useEffect(() => {
    fetchFields();
  }, [fetchFields]);

  return { fields, metaFields, loading, refetch: fetchFields };
}

export function useGoogleTestSubmission() {
  const [loading, setLoading] = useState(false);

  const testSubmission = useCallback(async (settings: GoogleSheetsSettings & { form_identifier?: string }) => {
    setLoading(true);
    try {
      const response = await apiPost<ApiResponse<{ row: string[] }>>('google/test-submission', {
        settings,
      });
      if (response.success) {
        return response;
      }
      throw new Error(response.message || 'Test submission failed');
    } finally {
      setLoading(false);
    }
  }, []);

  return { testSubmission, loading };
}

export function useGooglePickerConfig() {
  const fetchPickerConfig = useCallback(async () => {
    const response = await apiGet<
      ApiResponse<{ access_token: string; api_key: string; client_id: string }>
    >('google/picker-config');
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.message || 'Failed to load Google Picker configuration');
  }, []);

  return { fetchPickerConfig };
}
