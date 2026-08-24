import type { ConditionalShow } from './conditionalLogic';

export type ProviderOverride = {
	useProviderLayout: boolean;
	content: string;
	conditionalShow?: ConditionalShow | null;
	/**
	 * Per-form overrides of a provider feed's own settings. Only keys the
	 * provider marked `allow_form_override` survive server-side validation
	 * (see AbstractProvider::filter_form_settings_overrides).
	 */
	settings?: Record<string, unknown>;
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
	successMessage?: string;
	errorMessage?: string;
	redirectUrl?: string;
};