import { __ } from '@/lib/i18n';
import { PanelRow, ToggleControl } from '@wordpress/components';

interface PopulateOptionsToggleProps {
	checked: boolean;
	onChange: (checked: boolean) => void;
}

export const PopulateOptionsToggle = ({
	checked,
	onChange,
}: PopulateOptionsToggleProps) => {
	return (
		<PanelRow>
			<ToggleControl
				label={__('populateOptions')}
				checked={checked}
				onChange={onChange}
				__nextHasNoMarginBottom={true}
			/>
		</PanelRow>
	);
};
