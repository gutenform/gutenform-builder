import { useEffect } from 'react';
import { __ } from '@wordpress/i18n';
import { useBlockProps, RichText } from '@wordpress/block-editor';
import { type BlockEditProps } from '@wordpress/blocks';
import { type SubmitAttributes } from '@/blockTypes/submit';
import './editor.css';

export default function Edit(props: BlockEditProps<SubmitAttributes>) {
	const { attributes, setAttributes, clientId } = props;

	useEffect(() => {
		setAttributes({ id: `gutenform-submit-${clientId}` });
	}, [clientId]);

	return (
		<>
			<div { ...useBlockProps() }>
				<button type="submit" id={attributes.id}>
					<RichText
						tagName="span"
						value={attributes.label}
						onChange={(label) => setAttributes({ label })}
						placeholder={__('Enter label', 'gutenform')}
					/>
				</button>
			</div>
		</>
	);
}
