import { registerBlockType } from '@wordpress/blocks';

import './style.css';

import Edit from './edit'; 
import save from './save';
import metadata from './block.json';

registerBlockType( metadata.name as string, {
	...metadata,
	edit: Edit,
	save,
} as any );
