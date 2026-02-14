import { useBlockProps } from '@wordpress/block-editor';
import { type BlockSaveProps } from '@wordpress/blocks';
import { type StepNavigationAttributes } from '@/blockTypes/step-navigation';

export default function save(props: BlockSaveProps<StepNavigationAttributes>) {
	const { attributes } = props;

	const justifyMap: Record<string, string> = {
		'left': 'flex-start',
		'center': 'center',
		'right': 'flex-end',
		'space-between': 'space-between',
	};

	const blockProps = useBlockProps.save({
		className: 'gutenform-step-navigation',
		style: {
			justifyContent: justifyMap[attributes.justification] || 'flex-start',
		},
	});

	return (
		<div { ...blockProps }>
			{attributes.showPrev && (
				<button
					type="button"
					className="gutenform-step-prev"
					data-action="prev"
				>
					<span>{attributes.prevLabel}</span>
				</button>
			)}
			<button
				type="button"
				className="gutenform-step-next"
				data-action="next"
			>
				<span>{attributes.nextLabel}</span>
			</button>
			<button
				type="submit"
				className="gutenform-step-submit"
				data-action="submit"
				style={{ display: 'none', pointerEvents: 'none' }}
			>
				<span>{attributes.submitLabel}</span>
			</button>
		</div>
	);
}
