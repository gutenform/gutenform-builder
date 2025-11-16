import { __ } from '@wordpress/i18n';
import { useBlockProps, InspectorControls, InnerBlocks } from '@wordpress/block-editor';
import { dispatch } from '@wordpress/data';
import { TextControl, PanelBody, SelectControl, Spinner } from '@wordpress/components';
import { type BlockEditProps, createBlocksFromInnerBlocksTemplate } from '@wordpress/blocks';
import { type FormAttributes } from '@/blockTypes/form';
import { useEffect } from 'react';
import TemplateSelect from '../../components/block-atoms/TemplateSelect';
import { allowedBlocks } from './allowedBlocks';
import './editor.css';
import { getFieldClasses } from '../../lib/utils';
import skins from '../../skins';
import { useMailboxes } from '../../hooks/useMailboxes';

const MailboxSelect = ({value, onChange}: {value: string, onChange: (value: string) => void}) => {
	const { mailboxes, loading, error } = useMailboxes();

	useEffect(() => {
		if(mailboxes.length === 0) return;
		if(!mailboxes.some((mailbox) => mailbox.id === parseInt(value))) {
			onChange(mailboxes[0].id.toString());
		}
	}, [mailboxes, value]);

	if (loading) return <Spinner />;
	if (error) return <p>Error: {error.message}</p>;	
	return (
		<SelectControl
			label={__('Mailbox', 'gutenform')}
			value={value}
			onChange={onChange}
			options={mailboxes.map((mailbox) => ({
				label: mailbox.title,
				value: mailbox.id.toString(),
			}))}
			__next40pxDefaultSize={true}
			__nextHasNoMarginBottom={true}
		/>
	);
};

export default function Edit(props: BlockEditProps<FormAttributes>) {
	const { attributes, setAttributes, clientId } = props;

	// Get all inner blocks using useSelect
	// eslint-disable-next-line @typescript-eslint/no-var-requires
	const { useSelect } = require('@wordpress/data');
	const innerBlockItems = useSelect(
		(select: any) => select('core/block-editor').getBlocks(clientId),
		[clientId]
	);

	useEffect(() => {
		if (attributes.formId) return;
		setAttributes({ formId: `gutenform-${clientId}` });
	}, [clientId]);

	return (
		<>
			<InspectorControls>
				<PanelBody title="Form Settings">
					<MailboxSelect 
						value={attributes.mailboxId}
						onChange={(mailboxId) => setAttributes({ mailboxId })} 
					 />
					<TextControl 
						label="Form Title" 
						value={attributes.formTitle} 
						onChange={(formTitle) => setAttributes({ formTitle })}
						help="This is the title of the form that will be displayed in the frontend."
						__next40pxDefaultSize={true}
						__nextHasNoMarginBottom={true}
					 />
					 <TextControl
						label="Form Identifier"
						value={attributes.formId}
						onChange={(formId) => setAttributes({ formId })}
						help="This is the identifier of the form that will be used to identify the form in the database."
						__next40pxDefaultSize={true}
						__nextHasNoMarginBottom={true}
					/>
					<SelectControl
						label={__('Skin', 'gutenform')}
						value={attributes.skin || 'default'}
						onChange={(skin) => setAttributes({ skin })}
						options={skins.map((skin) => ({
							label: skin.label,
							value: skin.name,
						}))}
						__next40pxDefaultSize={true}
						__nextHasNoMarginBottom={true}
					/>
				</PanelBody>
			</InspectorControls>
			<div { ...useBlockProps({
				className: getFieldClasses(attributes),
			}) }>
				{innerBlockItems?.length > 0 ? (
					<InnerBlocks
						allowedBlocks={allowedBlocks}
						renderAppender={InnerBlocks.ButtonBlockAppender}
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
