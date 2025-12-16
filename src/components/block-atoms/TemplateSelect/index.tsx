import { __ } from "@/lib/i18n";
import { type TemplateArray } from '@wordpress/blocks';

const templates: Array<{ label: string; value: TemplateArray }> = [
	{
		label: __('basicForm'),
		value: [
			['gutenform/input', {}], 
			['gutenform/textarea', {}], 
			['gutenform/submit', {}], 
			['gutenform/success', {}],
		],
	},
];

type TemplateSelectProps = {
	onSelect: (value: TemplateArray) => void;
};

const TemplateSelect = ({onSelect}: TemplateSelectProps) => {
	return (
		<div>
			{templates.map((template, index) => (
				<SelectBox 
					key={index} 
					label={template.label} 
					value={template.value} 
					onClick={() => onSelect(template.value)}
				/>
			))}
		</div>
	);
};

type SelectBoxProps = {
	label: string;
	value?: TemplateArray;
	onClick: (value: TemplateArray) => void;
}

const SelectBox = ({label, value, onClick}: SelectBoxProps) => {
	return (
		<button onClick={() => value && onClick(value)} className="w-full">
			<p>{label}</p>
		</button>
	);
};

export default TemplateSelect;