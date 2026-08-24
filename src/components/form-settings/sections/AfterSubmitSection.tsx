/**
 * After Submit section: what the visitor sees once the form is sent.
 */
import { TextControl, TextareaControl, Notice } from '@wordpress/components';
import { __ } from '@/lib/i18n';
import { type FormAttributes } from '@/blockTypes/form';

type Props = {
	attributes: FormAttributes;
	setAttributes: (next: Partial<FormAttributes>) => void;
};

export function AfterSubmitSection({ attributes, setAttributes }: Props) {
	const redirectUrl = attributes.redirectUrl || '';

	return (
		<>
			<h3 className="gutenform-form-settings__section-title">
				{__('formSettingsAfterSubmit', 'After Submit')}
			</h3>
			<p className="gutenform-form-settings__section-description">
				{__(
					'formSettingsAfterSubmitDescription',
					'If the form contains a Success block, that is shown on success. Otherwise the message below is displayed inline.'
				)}
			</p>

			<div className="gutenform-form-settings__field">
				<TextareaControl
					label={__('successMessage', 'Success message')}
					value={attributes.successMessage || ''}
					onChange={(successMessage) => setAttributes({ successMessage })}
					placeholder={__('successMessageDefault', 'Thank you! Your submission has been received.')}
					rows={2}
					__nextHasNoMarginBottom={true}
				/>
			</div>

			<div className="gutenform-form-settings__field">
				<TextareaControl
					label={__('errorMessage', 'Error message')}
					value={attributes.errorMessage || ''}
					onChange={(errorMessage) => setAttributes({ errorMessage })}
					placeholder={__(
						'errorMessageDefault',
						'Your submission could not be sent. Please try again.'
					)}
					rows={2}
					__nextHasNoMarginBottom={true}
				/>
			</div>

			<div className="gutenform-form-settings__field">
				<TextControl
					label={__('redirectUrl', 'Redirect URL')}
					value={redirectUrl}
					onChange={(value) => setAttributes({ redirectUrl: value })}
					placeholder="https://example.com/thank-you"
					help={__(
						'redirectUrlHelp',
						'If set, the visitor is sent here after a successful submission instead of seeing a message.'
					)}
					__next40pxDefaultSize={true}
					__nextHasNoMarginBottom={true}
				/>
			</div>

			{redirectUrl !== '' && !/^https?:\/\//i.test(redirectUrl) && !redirectUrl.startsWith('/') && (
				<Notice status="warning" isDismissible={false}>
					{__(
						'redirectUrlInvalid',
						'Enter an absolute URL (https://…) or a path starting with a slash.'
					)}
				</Notice>
			)}
		</>
	);
}
