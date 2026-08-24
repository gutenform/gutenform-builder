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

/**
 * Everything added by the Form Settings modal lives in this one object
 * attribute rather than a dozen top-level attributes, so save.tsx and any
 * future deprecations stay manageable. mailboxId / providerIds /
 * providerOverrides deliberately stay top-level for backwards compatibility
 * with forms saved before this existed.
 */
export type FormSettings = {
	spamProtection?: {
		honeypot?: boolean;
		captcha?: boolean;
		captchaType?: 'friendlycaptcha' | 'recaptcha';
	};
	privacy?: {
		storeIp?: boolean;
		retentionDays?: number;
	};
	advanced?: {
		cssClass?: string;
	};
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
	formSettings?: FormSettings;
};