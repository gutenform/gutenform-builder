import { registerBlockType, registerBlockVariation } from '@wordpress/blocks';
import { __ } from "@/lib/i18n";
import BlockIcon from '../../components/block-atoms/BlockIcon';
import './style.css';

import Edit from './edit'; 
import save from './save';
import metadata from './block.json';

import { ListChecks } from 'lucide-react';
import { getSelectPresets } from './presets';
import {
	transformToInput,
	transformToTextarea,
	transformToSelect,
	transformToCheckbox,
	transformToRadio,
	transformToDateTime,
	transformToSlider,
} from '../../lib/field-block-transforms';

registerBlockType(metadata.name as string, {
	...metadata,
	icon: <BlockIcon icon={ListChecks} />,
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
				blocks: ['gutenform/input'],
				transform: (attributes: any) => transformToSelect(attributes),
			},
			{
				type: 'block',
				blocks: ['gutenform/textarea'],
				transform: (attributes: any) => transformToSelect(attributes),
			},
			{
				type: 'block',
				blocks: ['gutenform/checkbox'],
				transform: (attributes: any) => transformToSelect(attributes),
			},
			{
				type: 'block',
				blocks: ['gutenform/radio'],
				transform: (attributes: any) => transformToSelect(attributes),
			},
			{
				type: 'block',
				blocks: ['gutenform/date-time'],
				transform: (attributes: any) => transformToSelect(attributes),
			},
			{
				type: 'block',
				blocks: ['gutenform/slider'],
				transform: (attributes: any) => transformToSelect(attributes),
			},
		],
	},
} as any);

// Block Variations (Presets)
const presets = getSelectPresets();

presets.forEach((preset) => {
	registerBlockVariation('gutenform/select', {
		name: preset.name,
		title: preset.title,
		attributes: {
			label: preset.title,
			optionsPopulated: false,
			options: preset.options,
		},
	});
});

