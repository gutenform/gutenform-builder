import type { ConditionalShow } from './conditionalLogic';

type GlobalFieldAttributes = {
	label: string;
	name: string;
	id: string;
	placeholder: string;
	help: string;
	required: boolean;
	useCustomName: boolean | undefined;
	useCustomId: boolean | undefined;
	/** When set, this field is only shown when the condition is met. */
	conditionalShow?: ConditionalShow;
};

type GlobalFieldControlsProps = {	
	attributes: GlobalFieldAttributes;
	setAttributes: (attributes: Partial<GlobalFieldAttributes>) => void;
};

export type { GlobalFieldAttributes, GlobalFieldControlsProps };