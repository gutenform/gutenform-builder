type GlobalFieldAttributes = {
	label: string;
	name: string;
	id: string;
	placeholder: string;
	help: string;
	required: boolean;
	useCustomName: boolean | undefined;
	useCustomId: boolean | undefined;
};

type GlobalFieldControlsProps = {	
	attributes: GlobalFieldAttributes;
	setAttributes: (attributes: Partial<GlobalFieldAttributes>) => void;
};

export type { GlobalFieldAttributes, GlobalFieldControlsProps };