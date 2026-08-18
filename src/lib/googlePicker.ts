export type GooglePickerResult = {
  id: string;
  name: string;
  mimeType: string;
};

type GooglePickerDoc = {
  id: string;
  name: string;
  mimeType: string;
};

declare global {
  interface Window {
    gapi?: {
      load: (api: string, callback: () => void) => void;
    };
    google?: {
      picker: {
        Action: { PICKED: string; CANCEL: string };
        ViewId: { SPREADSHEETS: string; FOLDERS: string };
        DocsView: new (viewId: string) => {
          setIncludeFolders: (include: boolean) => unknown;
          setSelectFolderEnabled: (enabled: boolean) => unknown;
          setMimeTypes: (mimeTypes: string) => unknown;
        };
        PickerBuilder: new () => {
          setAppId: (appId: string) => unknown;
          setOAuthToken: (token: string) => unknown;
          setDeveloperKey: (key: string) => unknown;
          addView: (view: unknown) => unknown;
          setTitle: (title: string) => unknown;
          setCallback: (callback: (data: { action: string; docs?: GooglePickerDoc[] }) => void) => unknown;
          build: () => { setVisible: (visible: boolean) => void };
        };
      };
    };
  }
}

let pickerLoadPromise: Promise<void> | null = null;

export function loadGooglePickerApi(): Promise<void> {
  if (window.google?.picker) {
    return Promise.resolve();
  }

  if (pickerLoadPromise) {
    return pickerLoadPromise;
  }

  pickerLoadPromise = new Promise((resolve, reject) => {
    const onReady = () => {
      window.gapi?.load('picker', () => resolve());
    };

    if (window.gapi) {
      onReady();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://apis.google.com/js/api.js';
    script.async = true;
    script.onload = onReady;
    script.onerror = () => reject(new Error('Failed to load Google Picker API'));
    document.head.appendChild(script);
  });

  return pickerLoadPromise;
}

export async function openGooglePicker(options: {
  accessToken: string;
  apiKey: string;
  appId: string;
  mode: 'spreadsheet' | 'folder';
  title?: string;
}): Promise<GooglePickerResult | null> {
  await loadGooglePickerApi();

  const google = window.google;
  if (!google?.picker) {
    throw new Error('Google Picker is not available');
  }

  return new Promise((resolve) => {
    const view =
      options.mode === 'spreadsheet'
        ? new google.picker.DocsView(google.picker.ViewId.SPREADSHEETS)
            .setIncludeFolders(true)
            .setSelectFolderEnabled(false)
        : new google.picker.DocsView(google.picker.ViewId.FOLDERS)
            .setIncludeFolders(true)
            .setSelectFolderEnabled(true)
            .setMimeTypes('application/vnd.google-apps.folder');

    const picker = new google.picker.PickerBuilder()
      .setAppId(options.appId)
      .setOAuthToken(options.accessToken)
      .setDeveloperKey(options.apiKey)
      .addView(view)
      .setTitle(options.title || '')
      .setCallback((data) => {
        if (data.action === google.picker.Action.PICKED && data.docs?.[0]) {
          resolve({
            id: data.docs[0].id,
            name: data.docs[0].name,
            mimeType: data.docs[0].mimeType,
          });
          return;
        }
        resolve(null);
      })
      .build();

    picker.setVisible(true);
  });
}
