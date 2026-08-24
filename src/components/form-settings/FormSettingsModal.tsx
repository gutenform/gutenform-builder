/**
 * Form Settings Modal
 *
 * A standalone dialog for everything that used to be stacked into the form
 * block's inspector sidebar. It is deliberately independent of the block that
 * opened it: it receives only the *form* block's clientId, reads that block's
 * attributes itself, and writes back to it via updateBlockAttributes.
 *
 * That indirection is what makes the toolbar button work from a nested inner
 * block -- calling the inner block's own setAttributes there would write the
 * form's settings onto the input/step/group the user happens to have selected.
 */
import { useState } from '@wordpress/element';
import { Modal, Button } from '@wordpress/components';
import { useSelect, useDispatch } from '@wordpress/data';
import { __ } from '@/lib/i18n';
import { type FormAttributes, type FormSettings, type ProviderOverride } from '@/blockTypes/form';
import { Lock } from 'lucide-react';
import './form-settings.css';

import { StorageSection } from './sections/StorageSection';
import { ProvidersSection } from './sections/ProvidersSection';
import { SpamSection } from './sections/SpamSection';
import { AfterSubmitSection } from './sections/AfterSubmitSection';
import { PrivacySection } from './sections/PrivacySection';
import { AdvancedSection } from './sections/AdvancedSection';

export type SectionId =
	| 'storage'
	| 'providers'
	| 'spam'
	| 'after-submit'
	| 'privacy'
	| 'advanced';

const SECTIONS: Array<{ id: SectionId; label: string }> = [
	{ id: 'storage', label: __('formSettingsStorage', 'Storage & Inbox') },
	{ id: 'providers', label: __('formSettingsProviders', 'Providers & Actions') },
	{ id: 'spam', label: __('formSettingsSpam', 'Spam Protection') },
	{ id: 'after-submit', label: __('formSettingsAfterSubmit', 'After Submit') },
	{ id: 'privacy', label: __('formSettingsPrivacy', 'Privacy') },
	{ id: 'advanced', label: __('formSettingsAdvanced', 'Advanced') },
];

export type FormSettingsModalProps = {
	/** clientId of the gutenform/form block being edited (never an inner block). */
	formClientId: string;
	onClose: () => void;
};

export function FormSettingsModal({ formClientId, onClose }: FormSettingsModalProps) {
	const [activeSection, setActiveSection] = useState<SectionId>('storage');

	const attributes = useSelect(
		(select: any) => select('core/block-editor').getBlockAttributes(formClientId) as FormAttributes | null,
		[formClientId]
	);

	const { updateBlockAttributes } = useDispatch('core/block-editor');

	if (!attributes) {
		return null;
	}

	const setAttributes = (next: Partial<FormAttributes>) => {
		updateBlockAttributes(formClientId, next);
	};

	const formSettings: FormSettings = attributes.formSettings || {};

	/** Merges a partial update into one group of the formSettings object. */
	const setFormSettings = <K extends keyof FormSettings>(group: K, value: Partial<NonNullable<FormSettings[K]>>) => {
		setAttributes({
			formSettings: {
				...formSettings,
				[group]: {
					...(formSettings[group] || {}),
					...value,
				},
			},
		});
	};

	const setProviderOverride = (providerId: number, override: ProviderOverride) => {
		setAttributes({
			providerOverrides: {
				...(attributes.providerOverrides || {}),
				[String(providerId)]: override,
			},
		});
	};

	return (
		<Modal
			title={__('formSettings', 'Form Settings')}
			onRequestClose={onClose}
			className="gutenform-form-settings-modal"
			size="large"
		>
			<div className="gutenform-ui" data-theme="auto">
				<div className="gutenform-form-settings__layout">
					<nav className="gutenform-form-settings__nav" aria-label={__('formSettings', 'Form Settings')}>
						{SECTIONS.map((section) => (
							<button
								key={section.id}
								type="button"
								className="gutenform-form-settings__nav-item"
								aria-current={activeSection === section.id}
								onClick={() => setActiveSection(section.id)}
							>
								{section.label}
							</button>
						))}
					</nav>

					<div className="gutenform-form-settings__panel">
						{activeSection === 'storage' && (
							<StorageSection
								attributes={attributes}
								setAttributes={setAttributes}
								setProviderOverride={setProviderOverride}
							/>
						)}
						{activeSection === 'providers' && (
							<ProvidersSection
								formClientId={formClientId}
								attributes={attributes}
								setAttributes={setAttributes}
								setProviderOverride={setProviderOverride}
							/>
						)}
						{activeSection === 'spam' && (
							<SpamSection
								formSettings={formSettings}
								setFormSettings={setFormSettings}
							/>
						)}
						{activeSection === 'after-submit' && (
							<AfterSubmitSection attributes={attributes} setAttributes={setAttributes} />
						)}
						{activeSection === 'privacy' && (
							<PrivacySection
								formSettings={formSettings}
								setFormSettings={setFormSettings}
							/>
						)}
						{activeSection === 'advanced' && (
							<AdvancedSection
								formSettings={formSettings}
								setFormSettings={setFormSettings}
							/>
						)}
					</div>
				</div>
			</div>
		</Modal>
	);
}

/** Shared lock indicator for provider entries a form may not switch off. */
export function LockedIndicator() {
	return (
		<span className="gutenform-form-settings__lock">
			<Lock size={13} aria-hidden="true" />
			{__('alwaysOn', 'Always on')}
		</span>
	);
}
