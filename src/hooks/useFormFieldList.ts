import { useSelect } from '@wordpress/data';

const FIELD_BLOCK_NAMES = [
	'gutenform/input',
	'gutenform/select',
	'gutenform/textarea',
	'gutenform/checkbox',
	'gutenform/radio',
	'gutenform/date-time',
	'gutenform/slider',
	'gutenform/file',
];

export type FormFieldOptionValue = { label: string; value: string };

export type FormFieldOption = {
	name: string;
	label: string;
	/** For select blocks: options to show in value dropdown */
	options?: FormFieldOptionValue[];
};

/**
 * Returns list of form fields (name + label, and options for select fields) from the parent form block.
 * Excludes the block with excludeClientId.
 */
export function useFormFieldList(clientId: string, excludeClientId?: string): FormFieldOption[] {
	return useSelect(
		(select: any) => {
			const { getBlockParents, getBlocks, getBlockName } = select('core/block-editor');
			const parents = getBlockParents(clientId);
			let formBlockId: string | null = null;
			for (const pid of parents) {
				if (getBlockName(pid) === 'gutenform/form') {
					formBlockId = pid;
					break;
				}
			}
			if (!formBlockId) return [];

			function collectFields(blocks: any[]): FormFieldOption[] {
				const out: FormFieldOption[] = [];
				for (const block of blocks) {
					if (FIELD_BLOCK_NAMES.includes(block.name) && block.attributes?.name) {
						if (block.clientId !== excludeClientId) {
							const item: FormFieldOption = {
								name: block.attributes.name,
								label: block.attributes.label || block.attributes.name || block.name,
							};
							if (
								(block.name === 'gutenform/select' ||
									block.name === 'gutenform/checkbox' ||
									block.name === 'gutenform/radio') &&
								Array.isArray(block.attributes?.options)
							) {
								item.options = block.attributes.options.map((o: { label?: string; value?: string }) => ({
									label: o.label ?? o.value ?? '',
									value: o.value ?? '',
								}));
							}
							out.push(item);
						}
					}
					if (block.innerBlocks?.length) {
						out.push(...collectFields(block.innerBlocks));
					}
				}
				return out;
			}

			const topBlocks = getBlocks(formBlockId);
			return collectFields(topBlocks);
		},
		[clientId, excludeClientId]
	);
}
