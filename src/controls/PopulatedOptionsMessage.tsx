import { __ } from '@/lib/i18n';
import { Notice } from '@wordpress/components';
import './PopulatedOptionsMessage.css';

export const PopulatedOptionsMessage = () => {
	return (
		<Notice status="info" isDismissible={false} className="gutenform-populated-options-notice">
			<p>{__('populatedOptionsDescription')}</p>
			<div className="gutenform-populated-options-notice__example">
				<span className="gutenform-populated-options-notice__example-label">
					{__('populatedOptionsExampleLabel')}
				</span>
				<pre className="gutenform-populated-options-notice__code">
					<code>{__('populatedOptionsExampleCode')}</code>
				</pre>
			</div>
		</Notice>
	);
};
