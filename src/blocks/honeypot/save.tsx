import { HoneypotAttributes } from '@/blockTypes/honeypot';
import { useBlockProps } from '@wordpress/block-editor';
import { type BlockSaveProps } from '@wordpress/blocks';

// Server-side spam checks (Controllers\Submissions\Actions -> Core\SpamProtection)
// can't look up a given form's field schema yet, so every honeypot field's
// *submitted* name always carries this reserved prefix -- that's how the server
// recognizes it as a honeypot without needing to know the form. The
// name/fieldName attributes below stay purely cosmetic (shown to admins,
// bot-camouflage bait) and never affect what's actually checked.
const HONEYPOT_PREFIX = 'gutenform_honeypot_';

export default function save(props: BlockSaveProps<HoneypotAttributes>) {
	const bait = props.attributes.name || props.attributes.fieldName || 'field';
	return (
		<div { ...useBlockProps.save({
			className: 'gutenform-honeypot',
			style: { display: 'none', visibility: 'hidden', position: 'absolute', left: '-9999px' },
		}) }>
			<input
				type="text"
				name={HONEYPOT_PREFIX + bait}
				id={props.attributes.id}
				tabIndex={-1}
				autoComplete="off"
				aria-hidden="true"
			/>
		</div>
	);
}

