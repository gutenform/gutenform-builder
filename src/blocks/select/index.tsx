import { registerBlockType, registerBlockVariation } from '@wordpress/blocks';
import { __ } from "@/lib/i18n";
import BlockIcon from '../../components/block-atoms/BlockIcon';
import './style.css';

import Edit from './edit'; 
import save from './save';
import metadata from './block.json';

import { ListChecks } from 'lucide-react';
import { getSelectPresets } from './presets';

registerBlockType( metadata.name as string, {
	...metadata,
	icon: (<BlockIcon icon={ListChecks} />),
	edit: Edit,
	save,
} as any );

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

