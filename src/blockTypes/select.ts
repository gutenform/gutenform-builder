import { type GlobalFieldAttributes } from './globalField';

export type SelectAttributes = GlobalFieldAttributes & {
	options: Array<{
		label: string;
		value: string;
	}>;
	optionsPopulated: boolean;
	syncLabelValue: boolean;
	/** Name of another field whose current value is used as the select default (dynamic preselection). */
	defaultValueFromField?: string;
};

