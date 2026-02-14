import { DateTimeAttributes } from '@/blockTypes/date-time';
import { hasConditionalShowToOutput } from '@/blockTypes/conditionalLogic';
import { useBlockProps } from '@wordpress/block-editor';
import { type BlockSaveProps } from '@wordpress/blocks';
import { getFieldClasses } from '../../lib/utils';

export default function save(props: BlockSaveProps<DateTimeAttributes>) {
	const className = getFieldClasses(props.attributes);
	const {
		mode,
		range,
		name,
		id,
		required,
		label,
		help,
		conditionalShow,
		defaultValue,
		defaultValueEnd,
		min,
		max,
	} = props.attributes;

	const inputType =
		mode === 'datetime' ? 'datetime-local' : (mode as 'date' | 'time');

	return (
		<div
			{...useBlockProps.save({
				className,
				...(hasConditionalShowToOutput(conditionalShow) && {
					'data-conditional-show': JSON.stringify(conditionalShow),
				}),
			})}
		>
			{label && (
				<label htmlFor={id} className="gutenform-field__label">
					{label}
				</label>
			)}
			<div className="gutenform-datetime-inputs">
				<input
					type={inputType}
					name={name}
					id={id}
					required={required}
					defaultValue={defaultValue}
					{...(min && { min })}
					{...(max && !range && { max })}
					className="gutenform-datetime-input"
				/>
				{range && (
					<>
						<span className="gutenform-datetime-separator" aria-hidden="true">
							–
						</span>
						<input
							type={inputType}
							name={`${name}_end`}
							id={`${id}-end`}
							required={required}
							defaultValue={defaultValueEnd}
							{...(min && { min })}
							{...(max && { max })}
							className="gutenform-datetime-input"
						/>
					</>
				)}
			</div>
			{help && <p className="gutenform-field__help">{help}</p>}
		</div>
	);
}
