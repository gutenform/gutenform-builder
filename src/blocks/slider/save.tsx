import { SliderAttributes } from '@/blockTypes/slider';
import { hasConditionalShowToOutput } from '@/blockTypes/conditionalLogic';
import { useBlockProps } from '@wordpress/block-editor';
import { type BlockSaveProps } from '@wordpress/blocks';
import { getFieldClasses } from '../../lib/utils';

export default function save(props: BlockSaveProps<SliderAttributes>) {
	const className = getFieldClasses(props.attributes);
	const {
		min = 0,
		max = 100,
		step = 1,
		range = false,
		name,
		id,
		required,
		label,
		help,
		conditionalShow,
		defaultValue,
		defaultValueStart,
		defaultValueEnd,
	} = props.attributes;

	const singleValue = defaultValue !== '' ? Number(defaultValue) : min;
	const startVal = defaultValueStart ?? min;
	const endVal = defaultValueEnd ?? max;

	return (
		<div
			{...useBlockProps.save({
				className,
				...(hasConditionalShowToOutput(conditionalShow) && {
					'data-conditional-show': JSON.stringify(conditionalShow),
				}),
				'data-slider-range': range ? 'true' : 'false',
			})}
		>
			{label && (
				<label htmlFor={id} className="gutenform-field__label">
					{label}
				</label>
			)}
			<div className="gutenform-slider-wrapper">
				{range ? (
					<>
						<input
							type="hidden"
							name={`${name}_min`}
							defaultValue={String(startVal)}
							className="gutenform-slider-hidden-min"
						/>
						<input
							type="hidden"
							name={`${name}_max`}
							defaultValue={String(endVal)}
							className="gutenform-slider-hidden-max"
						/>
						<input
							type="range"
							min={min}
							max={max}
							step={step}
							defaultValue={String(startVal)}
							className="gutenform-slider-input gutenform-slider-input--min"
							aria-label={`${label} ${label ? '–' : ''} min`}
						/>
						<span className="gutenform-slider-separator" aria-hidden="true">
							–
						</span>
						<input
							type="range"
							min={min}
							max={max}
							step={step}
							defaultValue={String(endVal)}
							className="gutenform-slider-input gutenform-slider-input--max"
							aria-label={`${label} ${label ? '–' : ''} max`}
						/>
					</>
				) : (
					<>
						<input
							type="hidden"
							name={name}
							defaultValue={String(singleValue)}
							className="gutenform-slider-hidden"
							required={required}
						/>
						<input
							type="range"
							min={min}
							max={max}
							step={step}
							defaultValue={String(singleValue)}
							className="gutenform-slider-input"
							aria-label={label || undefined}
						/>
					</>
				)}
			</div>
			{help && <p className="gutenform-field__help">{help}</p>}
		</div>
	);
}
