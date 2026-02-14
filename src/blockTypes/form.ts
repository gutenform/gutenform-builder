import type { ConditionalShow } from './conditionalLogic';

export type ProviderOverride = {
	useProviderLayout: boolean;
	content: string;
	conditionalShow?: ConditionalShow | null;
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