/**
 * Advanced section.
 */
import { TextControl } from '@wordpress/components';
import { __ } from '@/lib/i18n';
import { type FormSettings } from '@/blockTypes/form';

type Props = {
	formSettings: FormSettings;
	setFormSettings: <K extends keyof FormSettings>(
		group: K,
		value: Partial<NonNullable<FormSettings[K]>>
	) => void;
};

export function AdvancedSection({ formSettings, setFormSettings }: Props) {
	const advanced = formSettings.advanced || {};

	return (
		<>
			<h3 className="gutenform-form-settings__section-title">
				{__('formSettingsAdvanced', 'Advanced')}
			</h3>

			<div className="gutenform-form-settings__field">
				<TextControl
					label={__('additionalCssClass', 'Additional CSS class')}
					value={advanced.cssClass || ''}
					onChange={(cssClass) => setFormSettings('advanced', { cssClass })}
					help={__(
						'additionalCssClassHelp',
						'Added to the form element, for targeting this specific form from your theme.'
					)}
					__next40pxDefaultSize={true}
					__nextHasNoMarginBottom={true}
				/>
			</div>
		</>
	);
}
