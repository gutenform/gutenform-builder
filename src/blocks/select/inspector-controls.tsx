import { InspectorControls } from '@wordpress/block-editor';
import { PanelBody } from '@wordpress/components';
import { __ } from "@/lib/i18n";
import { FieldControls } from '../../components/block-atoms/FieldControls';
import { type BlockEditProps } from '@wordpress/blocks';
import { type SelectAttributes } from '@/blockTypes/select';
import { OptionsRepeater } from '../../controls/OptionsRepeater';
import { PopulateOptionsToggle } from '../../controls/PopulateOptionsToggle';
import { PopulatedOptionsMessage } from '../../controls/PopulatedOptionsMessage';
import { getSelectPresets } from './presets';

type SelectInspectorControlsProps = BlockEditProps<SelectAttributes>;

export const SelectInspectorControls = ({ attributes, setAttributes }: SelectInspectorControlsProps) => {
	const options = attributes.options || [];
	const syncLabelValue = attributes.syncLabelValue || false;

	const handleOptionsChange = (newOptions: typeof options) => {
		setAttributes({ options: newOptions });
	};

	const handlePopulateToggle = (optionsPopulated: boolean) => {
		setAttributes({ optionsPopulated });
	};

	const handleSyncLabelValueChange = (syncLabelValue: boolean) => {
		setAttributes({ syncLabelValue });
	};

	return (
		<>
			<InspectorControls>
				<PanelBody title={__('selectFieldSettings')}>
					<PopulateOptionsToggle
						checked={attributes.optionsPopulated}
						onChange={handlePopulateToggle}
					/>

					{attributes.optionsPopulated ? (
						<PopulatedOptionsMessage />
					) : (
						<OptionsRepeater
							options={options}
							syncLabelValue={syncLabelValue}
							onChange={handleOptionsChange}
							onSyncLabelValueChange={handleSyncLabelValueChange}
							presets={getSelectPresets()}
						/>
					)}
				</PanelBody>
			</InspectorControls>
			<FieldControls attributes={attributes} setAttributes={setAttributes} />
		</>
	);
};
