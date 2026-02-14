import { registerBlockType } from '@wordpress/blocks';
import BlockIcon from '../../components/block-atoms/BlockIcon';
import './style.css';

import Edit from './edit';
import save from './save';
import metadata from './block.json';

import { Calendar } from 'lucide-react';
import {
	transformToInput,
	transformToTextarea,
	transformToSelect,
	transformToCheckbox,
	transformToRadio,
	transformToDateTime,
} from '../../lib/field-block-transforms';

registerBlockType(metadata.name as string, {
	...metadata,
	icon: <BlockIcon icon={Calendar} />,
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
				blocks: ['gutenform/checkbox'],
				transform: (attributes: any) => transformToCheckbox(attributes),
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
				transform: (attributes: any) => transformToDateTime(attributes),
			},
			{
				type: 'block',
				blocks: ['gutenform/textarea'],
				transform: (attributes: any) => transformToDateTime(attributes),
			},
			{
				type: 'block',
				blocks: ['gutenform/select'],
				transform: (attributes: any) => transformToDateTime(attributes),
			},
			{
				type: 'block',
				blocks: ['gutenform/checkbox'],
				transform: (attributes: any) => transformToDateTime(attributes),
			},
			{
				type: 'block',
				blocks: ['gutenform/radio'],
				transform: (attributes: any) => transformToDateTime(attributes),
			},
		],
	},
} as any);
