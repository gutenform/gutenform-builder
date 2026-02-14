import { InnerBlocks, useBlockProps } from '@wordpress/block-editor';
import { type BlockSaveProps } from '@wordpress/blocks';
import { type StepAttributes } from '@/blockTypes/step';

export default function save(props: BlockSaveProps<StepAttributes>) {
	const blockProps = useBlockProps.save({
		className: 'gutenform-step',
		'data-step-title': props.attributes.title || 'Step',
	});

	return (
		<div { ...blockProps }>
			<InnerBlocks.Content />
		</div>
	);
}
