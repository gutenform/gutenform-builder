/**
 * Providers & Actions section.
 *
 * Lists the feeds that run for this form. Required providers (the database
 * feed) always appear first as a locked entry -- they can't be removed, which
 * is the visible counterpart to FormRegistry putting them first server-side.
 */
import { useState } from '@wordpress/element';
import { Button, Modal } from '@wordpress/components';
import { Lock } from 'lucide-react';
import { __ } from '@/lib/i18n';
import { ProviderSelectModal } from '@/controls';
import { useProviders, useProviderTypes } from '@/hooks/useProviders';
import { useFormFieldList } from '@/hooks/useFormFieldList';
import { type FormAttributes, type ProviderOverride } from '@/blockTypes/form';
import { ProviderConditionalLogicPanel } from '@/blocks/form/ProviderConditionalLogicPanel';
import { FullscreenTemplateEditor } from '@/components/email-template-editor/FullscreenTemplateEditor';
import { FieldMapEditor } from '../FieldMapEditor';

type Props = {
	formClientId: string;
	attributes: FormAttributes;
	setAttributes: (next: Partial<FormAttributes>) => void;
	setProviderOverride: (providerId: number, override: ProviderOverride) => void;
};

export function ProvidersSection({ formClientId, attributes, setAttributes, setProviderOverride }: Props) {
	const [isSelectOpen, setIsSelectOpen] = useState(false);
	const [editingProviderId, setEditingProviderId] = useState<number | null>(null);

	const { providers } = useProviders({ is_active: true });
	const { types } = useProviderTypes();

	const providerIds = attributes.providerIds || [];
	const overrides = attributes.providerOverrides || {};

	const fieldList = useFormFieldList(formClientId, formClientId);
	const formPlaceholders = fieldList.map((f) => ({
		value: `{${f.name}}`,
		label: f.label || f.name,
		description: undefined,
		category: 'form' as const,
	}));

	const requiredSlugs = types.filter((t) => t.is_required).map((t) => t.slug);
	const requiredFeeds = providers.filter((p) => requiredSlugs.includes(p.provider_type));
	// Never list a required feed twice, even if it also sits in providerIds.
	const optionalFeeds = providers.filter(
		(p) => providerIds.includes(p.id) && !requiredSlugs.includes(p.provider_type)
	);

	const getOverride = (id: number): ProviderOverride =>
		overrides[String(id)] ?? { useProviderLayout: true, content: '', conditionalShow: null };

	return (
		<>
			<h3 className="gutenform-form-settings__section-title">
				{__('formSettingsProviders', 'Providers & Actions')}
			</h3>
			<p className="gutenform-form-settings__section-description">
				{__(
					'formSettingsProvidersDescription',
					'These run in order every time the form is submitted. Storage always runs first, so a failing integration can never lose a submission.'
				)}
			</p>

			{requiredFeeds.map((feed) => (
				<div
					key={feed.id}
					className="gutenform-form-settings__provider-row gutenform-form-settings__provider-row--locked"
				>
					<span className="gutenform-form-settings__provider-name">{feed.name}</span>
					<span className="gutenform-form-settings__lock">
						<Lock size={13} aria-hidden="true" />
						{__('alwaysOn', 'Always on')}
					</span>
				</div>
			))}

			{optionalFeeds.map((feed) => {
				const override = getOverride(feed.id);
				const type = types.find((t) => t.slug === feed.provider_type);
				const supportsFieldMap = !!type?.fields?.some(
					(f) => f.name === 'field_map' && f.allow_form_override
				);

				return (
					<div key={feed.id} className="gutenform-form-settings__provider-row">
						<div style={{ flex: '1 1 auto' }}>
							<div className="gutenform-form-settings__provider-name">{feed.name}</div>

							<div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
								<Button variant="secondary" onClick={() => setEditingProviderId(feed.id)}>
									{__('editTemplate', 'Edit template')}
								</Button>
							</div>

							<ProviderConditionalLogicPanel
								formBlockClientId={formClientId}
								conditionalShow={override.conditionalShow ?? undefined}
								onChange={(conditionalShow) =>
									setProviderOverride(feed.id, { ...override, conditionalShow: conditionalShow ?? null })
								}
							/>

							{supportsFieldMap && (
								<FieldMapEditor
									fields={fieldList}
									value={(override.settings?.field_map as Array<{ field: string; key: string }>) || []}
									onChange={(field_map) =>
										setProviderOverride(feed.id, {
											...override,
											settings: { ...(override.settings || {}), field_map },
										})
									}
								/>
							)}
						</div>
					</div>
				);
			})}

			<Button variant="secondary" onClick={() => setIsSelectOpen(true)} style={{ marginTop: 8 }}>
				{__('selectProviders', 'Select providers')}
			</Button>

			<ProviderSelectModal
				open={isSelectOpen}
				onClose={() => setIsSelectOpen(false)}
				selectedIds={providerIds}
				onChange={(ids) => setAttributes({ providerIds: ids })}
			/>

			<FullscreenTemplateEditor
				open={editingProviderId !== null}
				onOpenChange={(open) => !open && setEditingProviderId(null)}
				initialHtml={editingProviderId !== null ? getOverride(editingProviderId).content : ''}
				customPlaceholders={formPlaceholders}
				showUseProviderLayoutCheckbox={true}
				initialUseProviderLayout={
					editingProviderId !== null ? getOverride(editingProviderId).useProviderLayout : true
				}
				onSaveWithMeta={
					editingProviderId !== null
						? (data) => {
								const override = getOverride(editingProviderId);
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
		</>
	);
}
