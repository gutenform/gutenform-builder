import { RadioAttributes } from '@/blockTypes/radio';
import { hasConditionalShowToOutput } from '@/blockTypes/conditionalLogic';
import { useBlockProps } from '@wordpress/block-editor';
import { type BlockSaveProps } from '@wordpress/blocks';
import { getFieldClasses, cn } from '../../lib/utils';

export default function save(props: BlockSaveProps<RadioAttributes>) {
	const {
		options,
		name,
		id,
		required,
		label,
		help,
		conditionalShow,
		defaultValue,
		styleVariant = 'default',
		layout = 'vertical',
	} = props.attributes;
	const className = cn(
		getFieldClasses(props.attributes),
		'gutenform-field--radio',
		`gutenform-field--radio-${styleVariant}`,
		`gutenform-field--layout-${layout}`
	);

	return (
		// A group of radios is a native fieldset/legend, so the group's own
		// label is announced before the options instead of floating loose next
		// to them. aria-describedby ties the help text to the whole group.
		<fieldset
			{...useBlockProps.save({
				className,
				...(hasConditionalShowToOutput(conditionalShow) && {
					'data-conditional-show': JSON.stringify(conditionalShow),
				}),
			})}
			aria-describedby={help ? `${id}-help` : undefined}
			aria-required={required ? 'true' : undefined}
		>
			{label && <legend className="gutenform-field__label">{label}</legend>}
			<div
				className={cn(
					'gutenform-radio-options',
					`gutenform-radio--${styleVariant}`,
					`gutenform-radio--layout-${layout}`
				)}
			>
				{options.map((option, index) => {
					const inputId = `${id}-${index}`;
					const checked = defaultValue === option.value;

					return (
						<label
							key={index}
							className="gutenform-radio-option"
							htmlFor={inputId}
						>
							<input
								type="radio"
								name={name}
								value={option.value}
								id={inputId}
								required={required}
								defaultChecked={checked}
							/>
							<span className="gutenform-radio-option-content">
								<span className="gutenform-radio-option-label">
									{option.label}
								</span>
								{option.description && (
									<span className="gutenform-radio-option-description">
										{option.description}
									</span>
								)}
							</span>
						</label>
					);
				})}
			</div>
			{help && <p className="gutenform-field__help" id={`${id}-help`}>{help}</p>}
		</fieldset>
	);
}
