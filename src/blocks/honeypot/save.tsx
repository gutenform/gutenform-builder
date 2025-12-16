import { HoneypotAttributes } from '@/blockTypes/honeypot';
import { useBlockProps } from '@wordpress/block-editor';
import { type BlockSaveProps } from '@wordpress/blocks';

export default function save(props: BlockSaveProps<HoneypotAttributes>) {
	return (
		<div { ...useBlockProps.save({
			className: 'gutenform-honeypot',
			style: { display: 'none', visibility: 'hidden', position: 'absolute', left: '-9999px' },
		}) }>
			<input
				type="text"
				name={props.attributes.name || props.attributes.fieldName}
				id={props.attributes.id}
				tabIndex={-1}
				autoComplete="off"
				aria-hidden="true"
			/>
		</div>
	);
}

