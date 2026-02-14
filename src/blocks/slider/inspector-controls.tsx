import { InspectorControls } from '@wordpress/block-editor';
import {
	PanelBody,
	RangeControl,
	TextControl,
	ToggleControl,
	SelectControl,
} from '@wordpress/components';
import { __ } from '@/lib/i18n';
import { FieldControls } from '../../components/block-atoms/FieldControls';
import { ConditionalLogicControls } from '../../components/block-atoms/ConditionalLogicControls';
import { type BlockEditProps } from '@wordpress/blocks';
import { type SliderAttributes } from '@/blockTypes/slider';

type SliderInspectorControlsProps = BlockEditProps<SliderAttributes>;

const ORIENTATION_OPTIONS = [
	{ value: 'horizontal', label: __('orientationHorizontal') },
	{ value: 'vertical', label: __('orientationVertical') },
];

const DIRECTION_OPTIONS = [
	{ value: 'ltr', label: __('directionLtr') },
	{ value: 'rtl', label: __('directionRtl') },
];

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
					<TextControl
						label={__('min')}
						type="number"
						value={String(min)}
						onChange={(value) =>
							setAttributes({ min: value !== '' ? Number(value) : 0 })
						}
					/>
					<TextControl
						label={__('max')}
						type="number"
						value={String(max)}
						onChange={(value) =>
							setAttributes({ max: value !== '' ? Number(value) : 100 })
						}
					/>
					<TextControl
						label={__('step')}
						type="number"
						value={String(step)}
						onChange={(value) =>
							setAttributes({ step: value !== '' ? Number(value) : 1 })
						}
					/>
					<ToggleControl
						label={__('range')}
						checked={range}
						onChange={(value) => setAttributes({ range: value })}
					/>
					{range ? (
						<>
							<RangeControl
								label={__('defaultValueStart')}
								value={attributes.defaultValueStart ?? min}
								onChange={(value) =>
									setAttributes({
										defaultValueStart: value !== undefined ? value : min,
									})
								}
								min={min}
								max={max}
								step={step}
							/>
							<RangeControl
								label={__('defaultValueEnd')}
								value={attributes.defaultValueEnd ?? max}
								onChange={(value) =>
									setAttributes({
										defaultValueEnd: value !== undefined ? value : max,
									})
								}
								min={min}
								max={max}
								step={step}
							/>
						</>
					) : (
						<RangeControl
							label={__('defaultValue')}
							value={
								attributes.defaultValue !== ''
									? Number(attributes.defaultValue)
									: min
							}
							onChange={(value) =>
								setAttributes({
									defaultValue: value !== undefined ? String(value) : '',
								})
							}
							min={min}
							max={max}
							step={step}
						/>
					)}
				</PanelBody>
				<PanelBody title={__('sliderDisplayOptions')} initialOpen={false}>
					<SelectControl
						label={__('orientation')}
						value={attributes.orientation ?? 'horizontal'}
						options={ORIENTATION_OPTIONS}
						onChange={(orientation: SliderAttributes['orientation']) =>
							setAttributes({ orientation })
						}
					/>
					<SelectControl
						label={__('direction')}
						value={attributes.direction ?? 'ltr'}
						options={DIRECTION_OPTIONS}
						onChange={(direction: SliderAttributes['direction']) =>
							setAttributes({ direction })
						}
					/>
					<ToggleControl
						label={__('tooltips')}
						checked={attributes.tooltips ?? false}
						onChange={(value) => setAttributes({ tooltips: value })}
					/>
					{range && (
						<ToggleControl
							label={__('connectHandles')}
							checked={attributes.connect ?? true}
							onChange={(value) => setAttributes({ connect: value })}
						/>
					)}
					{range && (
						<>
							<RangeControl
								label={__('margin')}
								value={attributes.margin ?? 0}
								onChange={(value) =>
									setAttributes({ margin: value !== undefined ? value : 0 })
								}
								min={0}
								max={max - min}
								step={step}
							/>
							<RangeControl
								label={__('limit')}
								value={attributes.limit ?? 0}
								onChange={(value) =>
									setAttributes({ limit: value !== undefined ? value : 0 })
								}
								min={0}
								max={max - min}
								step={step}
							/>
						</>
					)}
					<RangeControl
						label={__('paddingStart')}
						value={attributes.paddingStart ?? 0}
						onChange={(value) =>
							setAttributes({
								paddingStart: value !== undefined ? value : 0,
							})
						}
						min={0}
						max={50}
					/>
					<RangeControl
						label={__('paddingEnd')}
						value={attributes.paddingEnd ?? 0}
						onChange={(value) =>
							setAttributes({
								paddingEnd: value !== undefined ? value : 0,
							})
						}
						min={0}
						max={50}
					/>
					<ToggleControl
						label={__('animate')}
						checked={attributes.animate ?? true}
						onChange={(value) => setAttributes({ animate: value })}
					/>
					<RangeControl
						label={__('animationDuration')}
						value={attributes.animationDuration ?? 300}
						onChange={(value) =>
							setAttributes({
								animationDuration: value !== undefined ? value : 300,
							})
						}
						min={0}
						max={2000}
						step={50}
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
