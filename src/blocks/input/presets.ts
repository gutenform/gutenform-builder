import { __ } from "@/lib/i18n";

export const getInputPresets = (): Array<{
	name: string;
	title: string;
	type: string;
	label?: string;
	placeholder?: string;
}> => [
	{
		name: 'text',
		title: __('text'),
		type: 'text',
		label: __('text'),
		placeholder: __('enterText'),
	},
	{
		name: 'email',
		title: __('email'),
		type: 'email',
		label: __('email'),
		placeholder: __('enterEmail'),
	},
	{
		name: 'phone',
		title: __('phone'),
		type: 'tel',
		label: __('phone'),
		placeholder: __('enterPhone'),
	},
	{
		name: 'url',
		title: __('url'),
		type: 'url',
		label: __('url'),
		placeholder: __('enterUrl'),
	},
	{
		name: 'number',
		title: __('number'),
		type: 'number',
		label: __('number'),
		placeholder: __('enterNumber'),
	},
	{
		name: 'search',
		title: __('search'),
		type: 'search',
		label: __('search'),
		placeholder: __('enterSearch'),
	},
];

