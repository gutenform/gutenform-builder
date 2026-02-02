import { registerBlockType } from '@wordpress/blocks';
import BlockIcon from '../../components/block-atoms/BlockIcon';
import './style.css';

import Edit from './edit'; 
import save from './save';
import metadata from './block.json';

import { Pilcrow } from 'lucide-react';
import { transformToInput, transformToSelect, transformToTextarea } from '../../lib/field-block-transforms';

registerBlockType( metadata.name as string, {
	...metadata,
	icon: (<BlockIcon icon={Pilcrow} />),
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
				blocks: ['gutenform/select'],
				transform: (attributes: any) => transformToSelect(attributes),
			},
		],
		from: [
			{
				type: 'block',
				blocks: ['gutenform/input'],
				transform: (attributes: any) => transformToTextarea(attributes),
			},
			{
				type: 'block',
				blocks: ['gutenform/select'],
				transform: (attributes: any) => transformToTextarea(attributes),
			},
		],
	},
} as any );

