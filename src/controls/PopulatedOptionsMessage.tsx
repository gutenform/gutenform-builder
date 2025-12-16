import { __ } from '@wordpress/i18n';
import { PanelRow } from '@wordpress/components';

export const PopulatedOptionsMessage = () => {
	return (
		<PanelRow>
			<p style={{ fontSize: '13px', color: '#646970', margin: 0 }}>
				{__('Optionen werden dynamisch geladen')}
			</p>
		</PanelRow>
	);
};

