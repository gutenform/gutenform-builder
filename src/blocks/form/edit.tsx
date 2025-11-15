import { __ } from '@wordpress/i18n';
import { useBlockProps, InspectorControls } from '@wordpress/block-editor';
import { TextControl, PanelBody } from '@wordpress/components';
import { type BlockEditProps } from '@wordpress/blocks';
import { type FormAttributes } from '../../blockTypes/form';
import './editor.scss';

export default function Edit(props: BlockEditProps<FormAttributes>) {
	const { attributes, setAttributes } = props;
	return (
		<>
			<InspectorControls>
				<PanelBody title="Form Settings">
					<TextControl 
						label="Form Title" 
						value={attributes.formTitle} 
						onChange={(formTitle) => setAttributes({ formTitle })}
						help="This is the title of the form that will be displayed in the frontend."
					 />
				</PanelBody>
			</InspectorControls>
			<p { ...useBlockProps() }>
				{ __( 'Hello from the editor! test', 'gutenform' ) }
			</p>
		</>
	);
}
