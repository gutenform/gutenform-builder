import { registerBlockType, registerBlockVariation } from '@wordpress/blocks';
import BlockIcon from '../../components/block-atoms/BlockIcon';
import './style.css';

import Edit from './edit'; 
import save from './save';
import metadata from './block.json';

import { TextCursorInput } from 'lucide-react';
import { getInputPresets } from './presets';
import {
	transformToTextarea,
	transformToSelect,
	transformToInput,
	transformToCheckbox,
	transformToRadio,
	transformToDateTime,
	transformToSlider,
} from '../../lib/field-block-transforms';

registerBlockType(metadata.name as string, {
	...metadata,
	icon: <BlockIcon icon={TextCursorInput} />,
	edit: Edit,
	save,
	transforms: {
		to: [
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
				blocks: ['gutenform/checkbox'],
				transform: (attributes: any) => transformToCheckbox(attributes),
			},
			{
				type: 'block',
				blocks: ['gutenform/radio'],
				transform: (attributes: any) => transformToRadio(attributes),
			},
			{
				type: 'block',
				blocks: ['gutenform/date-time'],
				transform: (attributes: any) => transformToDateTime(attributes),
			},
			{
				type: 'block',
				blocks: ['gutenform/slider'],
				transform: (attributes: any) => transformToSlider(attributes),
			},
		],
		from: [
			{
				type: 'block',
				blocks: ['gutenform/textarea'],
				transform: (attributes: any) => transformToInput(attributes, 'text'),
			},
			{
				type: 'block',
				blocks: ['gutenform/select'],
				transform: (attributes: any) => transformToInput(attributes, 'text'),
			},
			{
				type: 'block',
				blocks: ['gutenform/checkbox'],
				transform: (attributes: any) => transformToInput(attributes, 'text'),
			},
			{
				type: 'block',
				blocks: ['gutenform/radio'],
				transform: (attributes: any) => transformToInput(attributes, 'text'),
			},
			{
				type: 'block',
				blocks: ['gutenform/date-time'],
				transform: (attributes: any) => transformToInput(attributes, 'text'),
			},
			{
				type: 'block',
				blocks: ['gutenform/slider'],
				transform: (attributes: any) => transformToInput(attributes, 'text'),
			},
		],
	},
} as any);

// Block Variations (Presets)
const presets = getInputPresets();

presets.forEach((preset) => {
	registerBlockVariation('gutenform/input', {
		name: preset.name,
		title: preset.title,
		attributes: {
			type: preset.type,
			label: preset.label || preset.title,
			placeholder: preset.placeholder || '',
		},
	});
});

