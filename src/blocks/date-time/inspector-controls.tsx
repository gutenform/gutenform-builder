import { InspectorControls } from '@wordpress/block-editor';
import { PanelBody, SelectControl, ToggleControl } from '@wordpress/components';
import { __ } from '@/lib/i18n';
import { FieldControls } from '../../components/block-atoms/FieldControls';
import { ConditionalLogicControls } from '../../components/block-atoms/ConditionalLogicControls';
import { type BlockEditProps } from '@wordpress/blocks';
import { type DateTimeAttributes } from '@/blockTypes/date-time';

type DateTimeInspectorControlsProps = BlockEditProps<DateTimeAttributes>;

const MODE_OPTIONS = [
	{ value: 'date', label: __('date') },
	{ value: 'time', label: __('time') },
	{ value: 'datetime', label: __('dateTime') },
];

export const DateTimeInspectorControls = ({
	attributes,
	setAttributes,
	clientId,
}: DateTimeInspectorControlsProps) => {
	return (
		<>
			<InspectorControls>
				<PanelBody title={__('dateTimeFieldSettings')}>
					<SelectControl
						label={__('mode')}
						value={attributes.mode || 'date'}
						options={MODE_OPTIONS}
						onChange={(mode: DateTimeAttributes['mode']) =>
							setAttributes({ mode })
						}
					/>
					<ToggleControl
						label={__('range')}
						checked={attributes.range || false}
						onChange={(range) => setAttributes({ range })}
					/>
				</PanelBody>
			</InspectorControls>
			{clientId && (
				<ConditionalLogicControls
					clientId={clientId}
					conditionalShow={attributes.conditionalShow}
					setAttributes={setAttributes}
				/>
			)}
			<FieldControls attributes={attributes} setAttributes={setAttributes} />
		</>
	);
};
