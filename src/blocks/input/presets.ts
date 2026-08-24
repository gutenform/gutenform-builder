import { __ } from '@/lib/i18n';
import {
	Hash,
	Link,
	Mail,
	Phone,
	Search,
	TextCursorInput,
} from 'lucide-react';
import { type FieldVariationPreset } from '@/lib/field-variations';
import { type InputAttributes } from '@/blockTypes/input';

export type InputPreset = FieldVariationPreset<InputAttributes>;

export const getInputPresets = (): InputPreset[] => [
	{
		name: 'text',
		title: __('text'),
		description: __('inputVariationTextDescription'),
		icon: TextCursorInput,
		attributes: {
			type: 'text',
			label: __('text'),
			placeholder: __('enterText'),
		},
		isDefault: true,
		isActive: (attributes) => attributes.type === 'text',
	},
	{
		name: 'email',
		title: __('email'),
		description: __('inputVariationEmailDescription'),
		icon: Mail,
		attributes: {
			type: 'email',
			label: __('email'),
			placeholder: __('enterEmail'),
		},
		isActive: (attributes) => attributes.type === 'email',
	},
	{
		name: 'phone',
		title: __('phone'),
		description: __('inputVariationPhoneDescription'),
		icon: Phone,
		attributes: {
			type: 'tel',
			label: __('phone'),
			placeholder: __('enterPhone'),
		},
		isActive: (attributes) => attributes.type === 'tel',
	},
	{
		name: 'url',
		title: __('url'),
		description: __('inputVariationUrlDescription'),
		icon: Link,
		attributes: {
			type: 'url',
			label: __('url'),
			placeholder: __('enterUrl'),
		},
		isActive: (attributes) => attributes.type === 'url',
	},
	{
		name: 'number',
		title: __('number'),
		description: __('inputVariationNumberDescription'),
		icon: Hash,
		attributes: {
			type: 'number',
			label: __('number'),
			placeholder: __('enterNumber'),
		},
		isActive: (attributes) => attributes.type === 'number',
	},
	{
		name: 'search',
		title: __('search'),
		description: __('inputVariationSearchDescription'),
		icon: Search,
		attributes: {
			type: 'search',
			label: __('search'),
			placeholder: __('enterSearch'),
		},
		isActive: (attributes) => attributes.type === 'search',
	},
];
