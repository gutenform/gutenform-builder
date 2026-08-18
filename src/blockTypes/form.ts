import type { ConditionalShow } from './conditionalLogic';

export type GoogleSheetsFormConfig = {
	spreadsheetId?: string;
	spreadsheetName?: string;
	sheetName?: string;
	columnMapping?: Array<{ field: string; column: string }>;
	driveFolderId?: string;
	driveFolderName?: string;
};

export type ProviderOverride = {
	useProviderLayout: boolean;
	content: string;
	conditionalShow?: ConditionalShow | null;
	googleSheets?: GoogleSheetsFormConfig;
};

export type FormAttributes = {
	layout?: any;
	mailboxId: string;
	formTitle: string;
	formId: string;
	skin?: string;
	providerIds?: number[];
	providerOverrides?: Record<string, ProviderOverride>;
	successView?: boolean;
	activeStep?: number;
};