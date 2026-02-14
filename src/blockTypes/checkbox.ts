import { type GlobalFieldAttributes } from './globalField';

export type CheckboxAttributes = GlobalFieldAttributes & {
	options: Array<{
		label: string;
		value: string;
		description?: string;
	}>;
	styleVariant: 'default' | 'toggle' | 'cards' | 'badges';
	layout: 'horizontal' | 'vertical';
	/** Single consent checkbox (e.g. privacy policy); uses single name, not name[]. */
	isConsent?: boolean;
};
