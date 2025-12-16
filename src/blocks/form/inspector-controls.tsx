import { __ } from "@/lib/i18n";
import { InspectorControls } from '@wordpress/block-editor';
import { TextControl, PanelBody, SelectControl } from '@wordpress/components';
import { type BlockEditProps } from '@wordpress/blocks';
import { type FormAttributes } from '@/blockTypes/form';
import { MailboxSelect, ProviderMultiSelect } from '../../controls';
import skins from '../../skins';

type FormInspectorControlsProps = BlockEditProps<FormAttributes>;

export const FormInspectorControls = ({ attributes, setAttributes }: FormInspectorControlsProps) => {
	return (
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
					label={__('skin')}
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
	);
};

