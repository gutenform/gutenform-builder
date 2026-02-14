import { type BlockEditProps } from '@wordpress/blocks';
import { type SliderAttributes } from '@/blockTypes/slider';
import './editor.css';
import { useUniqueID } from '../../lib/use-unique-id';
import { useNameFromLabel } from '../../lib/use-name-from-label';
import { SliderInspectorControls } from './inspector-controls';
import { FieldWrapper } from '../../components/block-atoms/FieldWrapper';

export default function Edit(props: BlockEditProps<SliderAttributes>) {
	const { attributes, setAttributes, clientId } = props;

	useUniqueID(attributes.id, clientId, setAttributes);

	useNameFromLabel(
		attributes.label,
		attributes.name,
		(name) => setAttributes({ name }),
		attributes.useCustomName || false
	);

	const min = attributes.min ?? 0;
	const max = attributes.max ?? 100;
	const step = attributes.step ?? 1;
	const range = attributes.range || false;
	const defaultValue = attributes.defaultValue
		? Number(attributes.defaultValue)
		: min;
	const defaultValueStart = attributes.defaultValueStart ?? min;
	const defaultValueEnd = attributes.defaultValueEnd ?? max;

	return (
		<>
			<SliderInspectorControls {...props} />
			<FieldWrapper
				label={attributes.label}
				onLabelChange={(label) => setAttributes({ label })}
				help={attributes.help}
				onHelpChange={(help) => setAttributes({ help })}
				attributes={attributes}
			>
				<div className="gutenform-slider-wrapper">
					<input
						type="range"
						disabled
						min={min}
						max={max}
						step={step}
						value={range ? defaultValueStart : defaultValue}
						className="gutenform-slider-input"
					/>
					{range && (
						<>
							<span className="gutenform-slider-separator">–</span>
							<input
								type="range"
								disabled
								min={min}
								max={max}
								step={step}
								value={defaultValueEnd}
								className="gutenform-slider-input"
							/>
						</>
					)}
				</div>
			</FieldWrapper>
		</>
	);
}
