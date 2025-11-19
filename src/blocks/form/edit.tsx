import { __ } from '@wordpress/i18n';
import { useBlockProps, InspectorControls, InnerBlocks } from '@wordpress/block-editor';
import { dispatch } from '@wordpress/data';
import { TextControl, PanelBody, SelectControl, Spinner, CheckboxControl } from '@wordpress/components';
import { type BlockEditProps, createBlocksFromInnerBlocksTemplate } from '@wordpress/blocks';
import { type FormAttributes } from '@/blockTypes/form';
import { useEffect } from 'react';
import TemplateSelect from '../../components/block-atoms/TemplateSelect';
import { allowedBlocks } from './allowedBlocks';
import './editor.css';
import { getFieldClasses } from '../../lib/utils';
import skins from '../../skins';
import { useMailboxes } from '../../hooks/useMailboxes';
import { useProviders } from '../../hooks/useProviders';

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

const ProviderMultiSelect = ({value, onChange}: {value: number[], onChange: (value: number[]) => void}) => {
	const { providers, loading, error } = useProviders({ is_active: true });

	if (loading) return <Spinner />;
	if (error) return <p>Error: {error.message}</p>;
	
	if (providers.length === 0) {
		return (
			<div>
				<p style={{ marginTop: 0, marginBottom: '8px', fontSize: '13px' }}>
					{__('No active providers found.', 'gutenform')}
				</p>
				<p style={{ marginTop: 0, fontSize: '12px', color: '#757575' }}>
					{__('Create providers in Settings → Providers first.', 'gutenform')}
				</p>
			</div>
		);
	}

	const handleChange = (providerId: number, checked: boolean) => {
		if (checked) {
			onChange([...value, providerId]);
		} else {
			onChange(value.filter(id => id !== providerId));
		}
	};

	return (
		<div>
			<label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 500 }}>
				{__('Providers', 'gutenform')}
			</label>
			<div style={{ marginBottom: '8px', fontSize: '12px', color: '#757575' }}>
				{__('Select which providers should process form submissions. Database provider runs automatically.', 'gutenform')}
			</div>
			<div style={{ 
				border: '1px solid #ddd', 
				borderRadius: '2px', 
				padding: '8px',
				maxHeight: '200px',
				overflowY: 'auto'
			}}>
				{providers.map((provider) => (
					<CheckboxControl
						key={provider.id}
						label={`${provider.name} (${provider.provider_type})${provider.form_identifier ? ` - ${provider.form_identifier}` : ' - Global'}`}
						checked={value.includes(provider.id)}
						onChange={(checked) => handleChange(provider.id, checked)}
						__nextHasNoMarginBottom={true}
					/>
				))}
			</div>
		</div>
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
					<ProviderMultiSelect
						value={attributes.providerIds || []}
						onChange={(providerIds) => setAttributes({ providerIds })}
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
