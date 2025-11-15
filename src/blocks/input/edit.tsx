import { useEffect } from 'react';
import { __ } from '@wordpress/i18n';
import { useBlockProps, InspectorControls, RichText } from '@wordpress/block-editor';
import { TextControl, PanelBody } from '@wordpress/components';
import { type BlockEditProps } from '@wordpress/blocks';
import { type InputAttributes } from '@/blockTypes/input';
import './editor.css';
import { getFieldClasses } from '../../lib/utils';

export default function Edit(props: BlockEditProps<InputAttributes>) {
	const { attributes, setAttributes, clientId } = props;

	useEffect(() => {
		setAttributes({ id: `gutenform-input-${clientId}` });
	}, [clientId]);

	return (
		<>
			<InspectorControls>
				<PanelBody title="Form Settings">
					 <TextControl 
						label="Placeholder" 
						value={attributes.placeholder} 
						onChange={(placeholder) => setAttributes({ placeholder })}
						__next40pxDefaultSize={true}
						__nextHasNoMarginBottom={true}
					 />
				</PanelBody>
			</InspectorControls>
			<div { ...useBlockProps({
				className: getFieldClasses(attributes),
			}) }>
				<RichText
					tagName="label"
					value={attributes.label}
					onChange={(label) => setAttributes({ label })}
					placeholder={__('Enter label', 'gutenform')}
				/>
				<input type={attributes.type} placeholder={attributes.placeholder} name={attributes.name} id={attributes.id} required={attributes.required} defaultValue={attributes.defaultValue} />
				<RichText
					tagName="p"
					value={attributes.help}
					onChange={(help) => setAttributes({ help })}
					className="gutenform-field__help"
					placeholder={__('Enter help text', 'gutenform')}
				/>
			</div>
		</>
	);
}
