import { InspectorControls } from '@wordpress/block-editor';
import { PanelBody, RangeControl, ToggleControl } from '@wordpress/components';
import { __ } from '@/lib/i18n';
import { FieldControls } from '../../components/block-atoms/FieldControls';
import { ConditionalLogicControls } from '../../components/block-atoms/ConditionalLogicControls';
import { type BlockEditProps } from '@wordpress/blocks';
import { type SliderAttributes } from '@/blockTypes/slider';

type SliderInspectorControlsProps = BlockEditProps<SliderAttributes>;

export const SliderInspectorControls = ({
	attributes,
	setAttributes,
	clientId,
}: SliderInspectorControlsProps) => {
	const min = attributes.min ?? 0;
	const max = attributes.max ?? 100;
	const step = attributes.step ?? 1;
	const range = attributes.range || false;

	return (
		<>
			<InspectorControls>
				<PanelBody title={__('sliderFieldSettings')}>
					<RangeControl
						label={__('min')}
						value={min}
						onChange={(value) => setAttributes({ min: value ?? 0 })}
						min={-1000}
						max={max - 1}
					/>
					<RangeControl
						label={__('max')}
						value={max}
						onChange={(value) => setAttributes({ max: value ?? 100 })}
						min={min + 1}
						max={10000}
					/>
					<RangeControl
						label={__('step')}
						value={step}
						onChange={(value) => setAttributes({ step: value ?? 1 })}
						min={0.1}
						max={Math.max(1, (max - min) / 2)}
						step={0.1}
					/>
					<ToggleControl
						label={__('range')}
						checked={range}
						onChange={(value) => setAttributes({ range: value })}
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
