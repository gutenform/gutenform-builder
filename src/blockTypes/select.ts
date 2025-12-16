import { type GlobalFieldAttributes } from './globalField';

export type SelectAttributes = GlobalFieldAttributes & {
	options: Array<{
		label: string;
		value: string;
	}>;
	optionsPopulated: boolean;
	syncLabelValue: boolean;
};

