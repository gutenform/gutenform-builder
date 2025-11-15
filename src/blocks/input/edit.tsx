import { useEffect } from 'react';
import { __ } from '@wordpress/i18n';
import { useBlockProps, InspectorControls } from '@wordpress/block-editor';
import { TextControl, PanelBody, TextareaControl } from '@wordpress/components';
import { type BlockEditProps } from '@wordpress/blocks';
import { type InputAttributes } from '../../blockTypes/input';
import './editor.css';

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
						label="Label" 
						value={attributes.label} 
						onChange={(label) => setAttributes({ label })}
						__next40pxDefaultSize={true}
						__nextHasNoMarginBottom={true}
					 />
					 <TextControl 
						label="Placeholder" 
						value={attributes.placeholder} 
						onChange={(placeholder) => setAttributes({ placeholder })}
						__next40pxDefaultSize={true}
						__nextHasNoMarginBottom={true}
					 />
					 <TextareaControl 
						label="Help" 
						value={attributes.help} 
						onChange={(help) => setAttributes({ help })}
						__nextHasNoMarginBottom={true}
					 />
				</PanelBody>
			</InspectorControls>
			<div { ...useBlockProps() }>
				<label htmlFor={attributes.id}>{attributes.label}</label>
				<input type={attributes.type} placeholder={attributes.placeholder} name={attributes.name} id={attributes.id} required={attributes.required} defaultValue={attributes.defaultValue} />
				{attributes.help && <p className="text-sm text-gray-500">{attributes.help}</p>}
			</div>
		</>
	);
}
