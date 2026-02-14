import { __ } from '@/lib/i18n';
import { type Option } from '../../controls/OptionsRepeater';

export type CheckboxPreset = {
	name: string;
	title: string;
	options: Option[];
	required?: boolean;
	isConsent?: boolean;
	label?: string;
};

export const getCheckboxPresets = (): CheckboxPreset[] => [
	{
		name: 'consent',
		title: __('consent'),
		options: [
			{ label: __('iAgreeToPrivacyPolicy'), value: 'agreed' },
		],
		required: true,
		isConsent: true,
		label: __('iAgreeToPrivacyPolicy'),
	},
	{
		name: 'newsletter',
		title: __('newsletter'),
		options: [
			{ label: __('subscribeToNewsletter'), value: 'subscribed' },
		],
		required: false,
		isConsent: false,
		label: __('subscribeToNewsletter'),
	},
];
