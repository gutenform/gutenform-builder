import { __ } from '@/lib/i18n';
import { Notice } from '@wordpress/components';

export const PopulatedOptionsMessage = () => {
	return (
		<Notice status="info" isDismissible={false} className="gutenform-populated-options-notice">
			<p>{__('populatedOptionsDescription')}</p>
			<p>{__('populatedOptionsHint')}</p>
		</Notice>
	);
};
