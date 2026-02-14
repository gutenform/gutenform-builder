import { type GlobalFieldAttributes } from './globalField';

export type RadioAttributes = GlobalFieldAttributes & {
	options: Array<{
		label: string;
		value: string;
		description?: string;
	}>;
	styleVariant: 'default' | 'badges' | 'cards';
	layout: 'horizontal' | 'vertical';
};
