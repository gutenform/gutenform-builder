import { registerBlockType, registerBlockVariation } from '@wordpress/blocks';
import { __ } from '@/lib/i18n';
import BlockIcon from '../../components/block-atoms/BlockIcon';
import './style.css';

import Edit from './edit';
import save from './save';
import metadata from './block.json';

import { CheckSquare } from 'lucide-react';
import { getCheckboxPresets } from './presets';
import {
	transformToInput,
	transformToTextarea,
	transformToSelect,
	transformToRadio,
	transformToCheckbox,
} from '../../lib/field-block-transforms';

registerBlockType(metadata.name as string, {
	...metadata,
	icon: <BlockIcon icon={CheckSquare} />,
	edit: Edit,
	save,
	transforms: {
		to: [
			{
				type: 'block',
				blocks: ['gutenform/input'],
				transform: (attributes: any) => transformToInput(attributes, 'text'),
			},
			{
				type: 'block',
				blocks: ['gutenform/textarea'],
				transform: (attributes: any) => transformToTextarea(attributes),
			},
			{
				type: 'block',
				blocks: ['gutenform/select'],
				transform: (attributes: any) => transformToSelect(attributes),
			},
			{
				type: 'block',
				blocks: ['gutenform/radio'],
				transform: (attributes: any) => transformToRadio(attributes),
			},
		],
		from: [
			{
				type: 'block',
				blocks: ['gutenform/input'],
				transform: (attributes: any) => transformToCheckbox(attributes),
			},
			{
				type: 'block',
				blocks: ['gutenform/textarea'],
				transform: (attributes: any) => transformToCheckbox(attributes),
			},
			{
				type: 'block',
				blocks: ['gutenform/select'],
				transform: (attributes: any) => transformToCheckbox(attributes),
			},
			{
				type: 'block',
				blocks: ['gutenform/radio'],
				transform: (attributes: any) => transformToCheckbox(attributes),
			},
		],
	},
} as any);

// Block Variations (Presets including Consent)
const presets = getCheckboxPresets();

presets.forEach((preset) => {
	registerBlockVariation('gutenform/checkbox', {
		name: preset.name,
		title: preset.title,
		attributes: {
			label: preset.label || preset.title,
			options: preset.options,
			required: preset.required ?? false,
			isConsent: preset.isConsent ?? false,
			styleVariant: 'default',
			layout: 'vertical',
		},
	});
});
