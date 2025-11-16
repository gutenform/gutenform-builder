import { useEffect } from 'react';
import { __ } from '@wordpress/i18n';
import { useBlockProps, InspectorControls, RichText } from '@wordpress/block-editor';
import { TextControl, PanelBody, ToggleControl, RangeControl } from '@wordpress/components';
import { type BlockEditProps } from '@wordpress/blocks';
import { type TextareaAttributes } from '@/blockTypes/textarea';
import './editor.css';
import { getFieldClasses } from '../../lib/utils';
import { cleanForSlug } from '@wordpress/url';

export default function Edit(props: BlockEditProps<TextareaAttributes>) {
	const { attributes, setAttributes, clientId } = props;

	useEffect(() => {
		if (attributes.id) return;
		setAttributes({ id: `gutenform-input-${clientId}` });
	}, [clientId]);

	//name -> label sanitize
	useEffect(() => {
		if (attributes.name || !attributes.label) return;
		setAttributes({ name: cleanForSlug(attributes.label) || '' });
	}, [attributes.name, attributes.label]);

	return (
		<>
			<InspectorControls>
				<PanelBody title="Form Settings">
					<TextControl
						label="Name"
						value={attributes.name}
						onChange={(name) => setAttributes({ name })}
						__next40pxDefaultSize={true}
						__nextHasNoMarginBottom={true}
					/>
					<TextControl
						label="ID"
						value={attributes.id}
						onChange={(id) => setAttributes({ id })}
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
					<ToggleControl
						label="Required"
						checked={attributes.required}
						onChange={(required: boolean) => setAttributes({ required })}
						__nextHasNoMarginBottom={true}
					/>
					<RangeControl
						label="Rows"
						value={attributes.rows}
						onChange={(rows?: number) => setAttributes({ rows })}
						min={1}
						max={10}
						step={1}
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
				<textarea disabled rows={attributes.rows} placeholder={attributes.placeholder} name={attributes.name} id={attributes.id} required={attributes.required} defaultValue={attributes.defaultValue} />
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
