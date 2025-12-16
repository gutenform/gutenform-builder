import { registerBlockType, registerBlockVariation } from '@wordpress/blocks';
import BlockIcon from '../../components/block-atoms/BlockIcon';
import './style.css';

import Edit from './edit'; 
import save from './save';
import metadata from './block.json';

import { TextCursorInput } from 'lucide-react';
import { getInputPresets } from './presets';

registerBlockType( metadata.name as string, {
	...metadata,
	icon: (<BlockIcon icon={TextCursorInput} />),
	edit: Edit,
	save,
} as any );

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

