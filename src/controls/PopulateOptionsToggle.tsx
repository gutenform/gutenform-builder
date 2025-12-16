import { __ } from '@wordpress/i18n';
import { PanelRow, ToggleControl, Button, Tooltip } from '@wordpress/components';

interface PopulateOptionsToggleProps {
	checked: boolean;
	onChange: (checked: boolean) => void;
	onInfoClick?: () => void;
}

export const PopulateOptionsToggle = ({
	checked,
	onChange,
	onInfoClick,
}: PopulateOptionsToggleProps) => {
	return (
		<PanelRow>
			<div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%' }}>
				<ToggleControl
					label={__('Populate Options')}
					checked={checked}
					onChange={onChange}
					help={__('Options werden zur Laufzeit aus Code geladen')}
					__nextHasNoMarginBottom={true}
					style={{ flex: 1 }}
				/>
				<Tooltip text={__('Info zur Population (später)')}>
					<Button
						icon="editor-help"
						isSmall
						variant="tertiary"
						onClick={onInfoClick || (() => {
							// Später: Modal oder Tooltip öffnen
						})}
					/>
				</Tooltip>
			</div>
		</PanelRow>
	);
};

