import { __ } from "@/lib/i18n";
import { InspectorControls } from '@wordpress/block-editor';
import { TextControl, PanelBody, SelectControl } from '@wordpress/components';
import { type BlockEditProps } from '@wordpress/blocks';
import { type FormAttributes } from '@/blockTypes/form';
import skins from '../../skins';
import { useProviderValidation } from '../../hooks/useProviderValidation';
import { MissingFieldsDialog } from '../../components/block-atoms/MissingFieldsDialog';

type FormInspectorControlsProps = BlockEditProps<FormAttributes>;

/**
 * The sidebar keeps only identity and presentation. Everything configurable
 * about *behaviour* (mailbox, providers, templates, conditional logic, spam
 * protection, privacy) moved into the Form Settings modal, reachable from the
 * toolbar at any nesting depth -- as stacked PanelBodys this had become
 * unusable, and it was only reachable when the form block itself was selected.
 */
export const FormInspectorControls = ({ attributes, setAttributes, clientId }: FormInspectorControlsProps) => {
	const {
		missingFields,
		shouldShowDialog,
		setShouldShowDialog,
	} = useProviderValidation(attributes.providerIds || [], clientId || '');

	return (
		<>
			<InspectorControls>
				<PanelBody title={__('formSettings', 'Form Settings')}>
					<TextControl
						label={__('formTitle', 'Form Title')}
						value={attributes.formTitle}
						onChange={(formTitle) => setAttributes({ formTitle })}
						help={__('formTitleHelp', 'Shown as the title of this form in the admin and in notifications.')}
						__next40pxDefaultSize={true}
						__nextHasNoMarginBottom={true}
					/>
					<TextControl
						label={__('formIdentifier', 'Form Identifier')}
						value={attributes.formId}
						onChange={(formId) => setAttributes({ formId })}
						help={__('formIdentifierHelp', 'Used to identify this form and its entries. Changing it separates new entries from existing ones.')}
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
				</PanelBody>
			</InspectorControls>
			<MissingFieldsDialog
				open={shouldShowDialog}
				onOpenChange={setShouldShowDialog}
				missingFields={missingFields}
				formClientId={clientId || ''}
				onFieldsAdded={() => {}}
			/>
		</>
	);
};
