import { __ } from "@/lib/i18n";
import { InspectorControls } from '@wordpress/block-editor';
import { PanelBody, TextControl } from '@wordpress/components';
import { type BlockEditProps } from '@wordpress/blocks';
import { type SubmitAttributes } from '@/blockTypes/submit';

type SubmitInspectorControlsProps = BlockEditProps<SubmitAttributes>;

export const SubmitInspectorControls = ({ attributes, setAttributes }: SubmitInspectorControlsProps) => {
	return (
		<InspectorControls>
			<PanelBody title={__('submitSettings', 'Submit Settings')}>
				<TextControl
					label={__('buttonLabel')}
					value={attributes.label}
					onChange={(label) => setAttributes({ label })}
					__next40pxDefaultSize={true}
					__nextHasNoMarginBottom={true}
				/>
				<TextControl
					label={__('id', 'ID')}
					value={attributes.id}
					onChange={(id) => setAttributes({ id })}
					__next40pxDefaultSize={true}
					__nextHasNoMarginBottom={true}
				/>
			</PanelBody>
		</InspectorControls>
	);
};

