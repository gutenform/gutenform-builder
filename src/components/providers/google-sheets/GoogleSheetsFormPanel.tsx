import { useEffect, useState, useCallback, useMemo } from 'react';
import { __ } from '../../../lib/i18n';
import { Button, SelectControl, TextControl } from '@wordpress/components';
import {
  useGoogleStatus,
  useGoogleSheets,
  useGooglePickerConfig,
  useGoogleTestSubmission,
  type ColumnMapping,
  type GoogleSheetsSettings,
} from '../../../hooks/useGoogleSheets';
import { useFormFieldList } from '../../../hooks/useFormFieldList';
import { openGooglePicker } from '../../../lib/googlePicker';
import type { GoogleSheetsFormConfig } from '../../../blockTypes/form';

type GoogleSheetsFormPanelProps = {
  formClientId: string;
  formIdentifier?: string;
  config: GoogleSheetsFormConfig;
  onChange: (config: GoogleSheetsFormConfig) => void;
};

export function GoogleSheetsFormPanel({
  formClientId,
  formIdentifier,
  config,
  onChange,
}: GoogleSheetsFormPanelProps) {
  const { status } = useGoogleStatus();
  const { fetchPickerConfig } = useGooglePickerConfig();
  const spreadsheetId = config.spreadsheetId || '';
  const sheetName = config.sheetName || '';
  const columnMapping = config.columnMapping || [];
  const { sheets, fetchHeaders } = useGoogleSheets(spreadsheetId || null);
  const { testSubmission, loading: testLoading } = useGoogleTestSubmission();
  const formFields = useFormFieldList(formClientId, formClientId);
  const [existingHeaders, setExistingHeaders] = useState<string[]>([]);
  const [pickerLoading, setPickerLoading] = useState<'spreadsheet' | 'folder' | null>(null);
  const [testError, setTestError] = useState<string | null>(null);
  const [testSuccess, setTestSuccess] = useState(false);

  const metaFieldOptions = useMemo(
    () => [
      { name: '_submission_date', label: __('googleMetaSubmissionDate') },
      { name: '_form_identifier', label: __('googleMetaFormId') },
      { name: '_ip_address', label: __('googleMetaIp') },
      { name: '_site_name', label: __('googleMetaSite') },
    ],
    []
  );

  const allFieldOptions = useMemo(
    () => [
      ...formFields.map((f) => ({ name: f.name, label: f.label || f.name })),
      ...metaFieldOptions,
    ],
    [formFields, metaFieldOptions]
  );

  useEffect(() => {
    if (spreadsheetId && sheetName) {
      fetchHeaders(sheetName)
        .then(setExistingHeaders)
        .catch(() => setExistingHeaders([]));
    }
  }, [spreadsheetId, sheetName, fetchHeaders]);

  const patch = useCallback(
    (partial: Partial<GoogleSheetsFormConfig>) => {
      onChange({ ...config, ...partial });
    },
    [config, onChange]
  );

  const openPicker = async (mode: 'spreadsheet' | 'folder') => {
    setPickerLoading(mode);
    try {
      const pickerConfig = await fetchPickerConfig();
      const result = await openGooglePicker({
        accessToken: pickerConfig.access_token,
        apiKey: pickerConfig.api_key,
        appId: pickerConfig.client_id,
        mode,
        title: mode === 'spreadsheet' ? __('googlePickSpreadsheet') : __('googlePickDriveFolder'),
      });

      if (!result) return;

      if (mode === 'spreadsheet') {
        patch({
          spreadsheetId: result.id,
          spreadsheetName: result.name,
          sheetName: '',
          columnMapping: [],
        });
      } else {
        patch({
          driveFolderId: result.id,
          driveFolderName: result.name,
        });
      }
    } catch (err) {
      setTestError(err instanceof Error ? err.message : __('errorOccurred'));
    } finally {
      setPickerLoading(null);
    }
  };

  const updateMapping = (index: number, key: keyof ColumnMapping, value: string) => {
    const next = [...columnMapping];
    next[index] = { ...next[index], [key]: value };
    patch({ columnMapping: next });
  };

  const autoMapFromFields = () => {
    patch({
      columnMapping: allFieldOptions.map((f) => ({ field: f.name, column: f.label })),
    });
  };

  const linkToExistingHeaders = () => {
    if (!existingHeaders.length) return;
    patch({
      columnMapping: existingHeaders.map((header, index) => ({
        field: allFieldOptions[index]?.name || '',
        column: header,
      })),
    });
  };

  const handleTest = async () => {
    setTestError(null);
    setTestSuccess(false);
    try {
      const settings: GoogleSheetsSettings = {
        spreadsheet_id: spreadsheetId,
        spreadsheet_name: config.spreadsheetName,
        sheet_name: sheetName,
        column_mapping: columnMapping,
        drive_folder_id: config.driveFolderId,
        drive_folder_name: config.driveFolderName,
        form_identifier: formIdentifier,
      };
      await testSubmission(settings);
      setTestSuccess(true);
    } catch (err) {
      setTestError(err instanceof Error ? err.message : __('errorOccurred'));
    }
  };

  if (!status?.connected) {
    return (
      <p style={{ fontSize: 12, color: '#646970', marginBottom: 12 }}>
        {__('googleConnectInProviderSettings')}
      </p>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div>
        <p style={{ fontWeight: 600, marginBottom: 4 }}>{__('googleStepSpreadsheet')}</p>
        <p style={{ fontSize: 12, color: '#646970', marginTop: 0 }}>
          {config.spreadsheetName || __('googleNoSpreadsheetSelected')}
        </p>
        <Button
          variant="secondary"
          onClick={() => openPicker('spreadsheet')}
          disabled={pickerLoading === 'spreadsheet'}
          style={{ width: '100%' }}
        >
          {pickerLoading === 'spreadsheet' ? __('loading') : __('googlePickSpreadsheet')}
        </Button>
      </div>

      {spreadsheetId && (
        <SelectControl
          label={__('googleStepSheet')}
          value={sheetName}
          options={[
            { label: __('googleSelectSheet'), value: '' },
            ...sheets.map((s) => ({ label: s.name, value: s.name })),
          ]}
          onChange={(value) => patch({ sheetName: value })}
          __next40pxDefaultSize
          __nextHasNoMarginBottom
        />
      )}

      {spreadsheetId && sheetName && (
        <div>
          <p style={{ fontWeight: 600, marginBottom: 8 }}>{__('googleStepMapping')}</p>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
            <Button variant="secondary" onClick={autoMapFromFields}>
              {__('googleAutoMapFields')}
            </Button>
            {existingHeaders.length > 0 && (
              <Button variant="secondary" onClick={linkToExistingHeaders}>
                {__('googleLinkExistingHeaders')}
              </Button>
            )}
            <Button
              variant="secondary"
              onClick={() => patch({ columnMapping: [...columnMapping, { field: '', column: '' }] })}
            >
              {__('googleAddColumn')}
            </Button>
          </div>
          {columnMapping.map((map, index) => (
            <div key={index} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: 8, marginBottom: 8 }}>
              <SelectControl
                label={__('googleFormField')}
                value={map.field}
                options={[
                  { label: __('googleSelectField'), value: '' },
                  ...allFieldOptions.map((f) => ({ label: f.label, value: f.name })),
                ]}
                onChange={(value) => updateMapping(index, 'field', value)}
                __next40pxDefaultSize
                __nextHasNoMarginBottom
              />
              <TextControl
                label={__('googleSheetColumn')}
                value={map.column}
                onChange={(value) => updateMapping(index, 'column', value)}
                __next40pxDefaultSize
                __nextHasNoMarginBottom
              />
              <Button
                variant="secondary"
                isDestructive
                onClick={() => patch({ columnMapping: columnMapping.filter((_, i) => i !== index) })}
                style={{ alignSelf: 'end' }}
              >
                {__('delete')}
              </Button>
            </div>
          ))}
        </div>
      )}

      <div>
        <p style={{ fontWeight: 600, marginBottom: 4 }}>{__('googleStepDrive')}</p>
        <p style={{ fontSize: 12, color: '#646970', marginTop: 0 }}>
          {config.driveFolderName || __('googleNoDriveFolderSelected')}
        </p>
        <Button
          variant="secondary"
          onClick={() => openPicker('folder')}
          disabled={pickerLoading === 'folder'}
          style={{ width: '100%' }}
        >
          {pickerLoading === 'folder' ? __('loading') : __('googlePickDriveFolder')}
        </Button>
      </div>

      {spreadsheetId && sheetName && columnMapping.length > 0 && (
        <div>
          <Button variant="primary" onClick={handleTest} disabled={testLoading} style={{ width: '100%' }}>
            {testLoading ? __('loading') : __('googleSendTestRow')}
          </Button>
          {testSuccess && (
            <p style={{ color: '#008a20', fontSize: 12, marginTop: 8 }}>{__('googleTestSuccessDesc')}</p>
          )}
          {testError && (
            <p style={{ color: '#cc1818', fontSize: 12, marginTop: 8 }}>{testError}</p>
          )}
        </div>
      )}
    </div>
  );
}
