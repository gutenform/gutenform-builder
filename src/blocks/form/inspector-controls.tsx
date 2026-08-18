import { useState } from 'react';
import { __ } from "@/lib/i18n";
import { InspectorControls } from '@wordpress/block-editor';
import { TextControl, PanelBody, SelectControl, Button, Modal } from '@wordpress/components';
import { type BlockEditProps } from '@wordpress/blocks';
import { type FormAttributes, type ProviderOverride } from '@/blockTypes/form';
import { MailboxSelect, ProviderSelectModal } from '../../controls';
import skins from '../../skins';
import { useProviderValidation } from '../../hooks/useProviderValidation';
import { useProviders } from '../../hooks/useProviders';
import { useFormFieldList } from '../../hooks/useFormFieldList';
import { MissingFieldsDialog } from '../../components/block-atoms/MissingFieldsDialog';
import { ProviderConditionalLogicPanel } from './ProviderConditionalLogicPanel';
import { GoogleSheetsFormPanel } from '../../components/providers/google-sheets/GoogleSheetsFormPanel';
import { FullscreenTemplateEditor } from '../../components/email-template-editor/FullscreenTemplateEditor';

type FormInspectorControlsProps = BlockEditProps<FormAttributes>;

export const FormInspectorControls = ({ attributes, setAttributes, clientId }: FormInspectorControlsProps) => {
	const {
		missingFields,
		shouldShowDialog,
		setShouldShowDialog,
	} = useProviderValidation(attributes.providerIds || [], clientId || '');

	const [isProviderSelectOpen, setIsProviderSelectOpen] = useState(false);
	const [editingProviderId, setEditingProviderId] = useState<number | null>(null);

	const { providers } = useProviders({ is_active: true });
	const providerIds = attributes.providerIds || [];
	const providerOverrides = attributes.providerOverrides || {};
	const fieldList = useFormFieldList(clientId || '', clientId || '');
	const formPlaceholders = fieldList.map((f) => ({
		value: `{${f.name}}`,
		label: f.label || f.name,
		description: undefined,
		category: 'form' as const,
	}));

	const getProviderName = (id: number) => {
		const p = providers.find((pr) => pr.id === id);
		return p ? p.name : `Provider #${id}`;
	};

	const setProviderOverride = (providerId: number, override: ProviderOverride) => {
		setAttributes({
			providerOverrides: {
				...providerOverrides,
				[String(providerId)]: override,
			},
		});
	};

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
					<div style={{ marginTop: 8 }}>
						<Button variant="secondary" isSecondary onClick={() => setIsProviderSelectOpen(true)} style={{ width: '100%' }}>
							{__('selectProviders')}
						</Button>
					</div>
				</PanelBody>
				{providerIds.length > 0 &&
					providerIds.map((providerId) => {
						const override = providerOverrides[String(providerId)] ?? {
							useProviderLayout: true,
							content: '',
							conditionalShow: undefined,
							googleSheets: undefined,
						};
						const provider = providers.find((p) => p.id === providerId);
						return (
							<PanelBody key={providerId} title={getProviderName(providerId)} initialOpen={true}>
								{provider?.provider_type === 'google-sheets' && (
									<GoogleSheetsFormPanel
										formClientId={clientId || ''}
										formIdentifier={attributes.formId}
										config={override.googleSheets || {}}
										onChange={(googleSheets) =>
											setProviderOverride(providerId, {
												...override,
												googleSheets,
											})
										}
									/>
								)}
								{provider?.provider_type !== 'google-sheets' && (
								<Button
									variant="secondary"
									isSecondary
									onClick={() => setEditingProviderId(providerId)}
									style={{ width: '100%', marginBottom: 12 }}
								>
									{__('editTemplate')}
								</Button>
								)}
								{provider?.provider_type !== 'google-sheets' && (
								<ProviderConditionalLogicPanel
									formBlockClientId={clientId || ''}
									conditionalShow={override.conditionalShow ?? undefined}
									onChange={(conditionalShow) =>
										setProviderOverride(providerId, {
											...override,
											conditionalShow: conditionalShow ?? null,
										})
									}
								/>
								)}
							</PanelBody>
						);
					})}
			</InspectorControls>
			<ProviderSelectModal
				open={isProviderSelectOpen}
				onClose={() => setIsProviderSelectOpen(false)}
				selectedIds={providerIds}
				onChange={(providerIds) => setAttributes({ providerIds })}
			/>
			<FullscreenTemplateEditor
				open={editingProviderId !== null}
				onOpenChange={(open) => !open && setEditingProviderId(null)}
				initialHtml={editingProviderId !== null ? (providerOverrides[String(editingProviderId)]?.content ?? '') : ''}
				onSave={() => {}}
				customPlaceholders={formPlaceholders}
				showUseProviderLayoutCheckbox={true}
				initialUseProviderLayout={editingProviderId !== null ? (providerOverrides[String(editingProviderId)]?.useProviderLayout ?? true) : true}
				onSaveWithMeta={
					editingProviderId !== null
						? (data) => {
								const override = providerOverrides[String(editingProviderId)] ?? {
									useProviderLayout: true,
									content: '',
									conditionalShow: undefined,
								};
								setProviderOverride(editingProviderId, {
									...override,
									content: data.html,
									useProviderLayout: data.useProviderLayout,
								});
								setEditingProviderId(null);
							}
						: undefined
				}
				hideTemplateSelection={true}
				ModalComponent={Modal}
			/>
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

