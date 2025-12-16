import { __ } from "@/lib/i18n";
import { BlockControls } from '@wordpress/block-editor';
import { ToolbarGroup, ToolbarButton } from '@wordpress/components';
import { type BlockEditProps } from '@wordpress/blocks';
import { type FormAttributes } from '@/blockTypes/form';
import { Eye, EyeOff } from 'lucide-react';
import BlockIcon from '../../components/block-atoms/BlockIcon';

type FormBlockControlsProps = BlockEditProps<FormAttributes>;

export const FormBlockControls = ({ attributes, setAttributes }: FormBlockControlsProps) => {
	return (
		<BlockControls>
			<ToolbarGroup>
				<ToolbarButton
					icon={attributes.successView ? <BlockIcon icon={Eye} /> : <BlockIcon icon={EyeOff} />}
					label={__('toggleSuccessView')}
					onClick={() => setAttributes({ successView: !attributes.successView })}
					isActive={attributes.successView}
				/>
			</ToolbarGroup>
		</BlockControls>
	);
};

