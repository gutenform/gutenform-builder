import { __ } from "@/lib/i18n";
import { useState } from '@wordpress/element';
import { BlockControls } from '@wordpress/block-editor';
import { ToolbarGroup, ToolbarButton, Modal } from '@wordpress/components';
import { type BlockEditProps } from '@wordpress/blocks';
import { type FormAttributes } from '@/blockTypes/form';
import { type TemplateArray } from '@wordpress/blocks';
import { Eye, EyeOff, LayoutTemplate } from 'lucide-react';
import BlockIcon from '../../components/block-atoms/BlockIcon';
import TemplateSelect from '../../components/block-atoms/TemplateSelect';

type FormBlockControlsProps = BlockEditProps<FormAttributes> & {
	hasBlocks?: boolean;
	onReplaceWithTemplate?: (template: TemplateArray) => void;
};

export const FormBlockControls = ({
	attributes,
	setAttributes,
	hasBlocks = false,
	onReplaceWithTemplate,
}: FormBlockControlsProps) => {
	const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);

	const handleTemplateSelect = (template: TemplateArray) => {
		onReplaceWithTemplate?.(template);
		setIsTemplateModalOpen(false);
	};

	return (
		<>
			<BlockControls>
				<ToolbarGroup>
					{hasBlocks && (
						<ToolbarButton
							icon={<BlockIcon icon={LayoutTemplate} clean={true} />}
							label={__('changeTemplate')}
							onClick={() => setIsTemplateModalOpen(true)}
						/>
					)}
					<ToolbarButton
						icon={attributes.successView ? <BlockIcon icon={Eye} clean={true} /> : <BlockIcon icon={EyeOff} clean={true} />}
						label={__('toggleSuccessView')}
						onClick={() => setAttributes({ successView: !attributes.successView })}
						isActive={attributes.successView}
					/>
				</ToolbarGroup>
			</BlockControls>
			{isTemplateModalOpen && (
				<Modal
					title={__('changeTemplate')}
					onRequestClose={() => setIsTemplateModalOpen(false)}
					className="gutenform-change-template-modal"
					style={{ maxWidth: '720px' }}
				>
					<p className="gutenform-change-template-modal__warning">
						{__('templateResetWarning')}
					</p>
					<TemplateSelect onSelect={handleTemplateSelect} />
				</Modal>
			)}
		</>
	);
};
