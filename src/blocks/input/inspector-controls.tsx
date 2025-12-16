import { __ } from "@/lib/i18n";
import { InspectorControls } from '@wordpress/block-editor';
import { PanelBody, SelectControl } from '@wordpress/components';
import { FieldControls } from '../../components/block-atoms/FieldControls';

import { type BlockEditProps } from '@wordpress/blocks';
import { type InputAttributes } from '@/blockTypes/input';

type InputInspectorControlsProps = BlockEditProps<InputAttributes>;

export const InputInspectorControls = ({ attributes, setAttributes }: InputInspectorControlsProps) => {
	return (
		<>
			<InspectorControls>
				<PanelBody title="Input Field Settings">
					<SelectControl
						label="Type"
						value={attributes.type as 'text' | 'number' | 'email' | 'tel' | 'url' | 'search' | undefined}
						onChange={(type) => setAttributes({ type: type as 'text' | 'number' | 'email' | 'tel' | 'url' | 'search' | undefined })}
						options={[
							{ label: __('text'), value: 'text' },
							{ label: __('number'), value: 'number' },
							{ label: __('email'), value: 'email' },
							{ label: __('phone'), value: 'tel' },
							{ label: __('url'), value: 'url' },
							{ label: __('search'), value: 'search' },
						]}
						__next40pxDefaultSize={true}
						__nextHasNoMarginBottom={true}
					/>
					
				</PanelBody>
			</InspectorControls>
			<FieldControls
				attributes={attributes}
				setAttributes={setAttributes}
			/>	
		</>
	);
};

