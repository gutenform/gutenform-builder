import { useBlockProps } from '@wordpress/block-editor';
import { type BlockSaveProps } from '@wordpress/blocks';
import { type SaveProgressAttributes } from '@/blockTypes/save-progress';

export default function save(props: BlockSaveProps<SaveProgressAttributes>) {
	const blockProps = useBlockProps.save({
		className: 'gutenform-save-progress',
	});

	return (
		<div { ...blockProps }>
			<button
				type="button"
				className="gutenform-save-progress-btn"
				data-action="save-progress"
			>
				<span>{props.attributes.label}</span>
			</button>
		</div>
	);
}
