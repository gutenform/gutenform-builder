import { registerBlockType } from '@wordpress/blocks';
import BlockIcon from '../../components/block-atoms/BlockIcon';
import './style.css';

import Edit from './edit';
import save from './save';
import metadata from './block.json';

import { Save } from 'lucide-react';

registerBlockType( metadata.name as string, {
	...metadata,
	icon: (<BlockIcon icon={Save} />),
	edit: Edit,
	save,
} as any );
