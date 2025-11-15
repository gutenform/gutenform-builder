import { __ } from '@wordpress/i18n';
import { useBlockProps, InspectorControls, InnerBlocks } from '@wordpress/block-editor';
import { dispatch } from '@wordpress/data';
import { TextControl, PanelBody } from '@wordpress/components';
import { type BlockEditProps, createBlocksFromInnerBlocksTemplate } from '@wordpress/blocks';
import { type FormAttributes } from '../../blockTypes/form';
import TemplateSelect from '../../components/block-atoms/TemplateSelect';
import './editor.css';

export default function Edit(props: BlockEditProps<FormAttributes>) {
	const { attributes, setAttributes, clientId } = props;

	// Get all inner blocks using useSelect
	// eslint-disable-next-line @typescript-eslint/no-var-requires
	const { useSelect } = require('@wordpress/data');
	const innerBlockItems = useSelect(
		(select: any) => select('core/block-editor').getBlocks(clientId),
		[clientId]
	);

	return (
		<>
			<InspectorControls>
				<PanelBody title="Form Settings">
					<TextControl 
						label="Form Title" 
						value={attributes.formTitle} 
						onChange={(formTitle) => setAttributes({ formTitle })}
						help="This is the title of the form that will be displayed in the frontend."
						__next40pxDefaultSize={true}
						__nextHasNoMarginBottom={true}
					 />
				</PanelBody>
			</InspectorControls>
			<div { ...useBlockProps() }>
				{innerBlockItems?.length > 0 ? (
					<InnerBlocks
						template={[
							['core/columns', {}, [
								['core/column', {}, [
									['core/heading', {}],
								]],
							]]
						]}
					/>
				) : (
					<TemplateSelect onSelect={(template) => {
						const blocks = createBlocksFromInnerBlocksTemplate(template as any);
						dispatch('core/block-editor').replaceInnerBlocks(clientId, blocks);
					}} />
				)}
			</div>
		</>
	);
}
