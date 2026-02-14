import { registerBlockType } from '@wordpress/blocks';
import { addFilter } from '@wordpress/hooks';
import BlockIcon from '../../components/block-atoms/BlockIcon';
import './style.css';

import Edit from './edit';
import save from './save';
import metadata from './block.json';
import withStepToolbar from './with-step-toolbar';

import { LayoutDashboard } from 'lucide-react';

registerBlockType( metadata.name as string, {
	...metadata,
	icon: (<BlockIcon icon={LayoutDashboard} />),
	edit: Edit,
	save,
} as any );

// Register the step toolbar filter so it shows on ALL blocks inside a stepped form
addFilter('editor.BlockEdit', 'gutenform/with-step-toolbar', withStepToolbar);
