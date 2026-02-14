/**
 * React hook that is used to mark the block wrapper element.
 * It provides all the necessary props like the class name.
 *
 * @see https://developer.wordpress.org/block-editor/reference-guides/packages/packages-block-editor/#useblockprops
 */
import { FileAttributes } from '@/blockTypes/file';
import { hasConditionalShowToOutput } from '@/blockTypes/conditionalLogic';
import { useBlockProps } from '@wordpress/block-editor';
import { type BlockSaveProps } from '@wordpress/blocks';
import { getFieldClasses } from '../../lib/utils';

/**
 * The save function defines the way in which the different attributes should
 * be combined into the final markup, which is then serialized by the block
 * editor into `post_content`.
 *
 * @see https://developer.wordpress.org/block-editor/reference-guides/block-api/block-edit-save/#save
 *
 * @return {Element} Element to render.
 */
export default function save(props: BlockSaveProps<FileAttributes>) {
	const className = getFieldClasses(props.attributes);
	const conditionalShow = props.attributes.conditionalShow;
	const dataAttributes: Record<string, string | boolean | number> = {
		'data-multiple': props.attributes.multiple,
		'data-accept-types': props.attributes.acceptTypes,
		'data-max-file-size': props.attributes.maxFileSize,
		'data-max-files': props.attributes.maxFiles,
		'data-allow-url-upload': props.attributes.allowUrlUpload,
	};

	return (
		<div
			{...useBlockProps.save({
				className,
				...(hasConditionalShowToOutput(conditionalShow) && { 'data-conditional-show': JSON.stringify(conditionalShow) }),
			})}
		>
			<label htmlFor={props.attributes.id}>{props.attributes.label}</label>
			<div 
				className="gutenform-file-upload-field" 
				data-field-name={props.attributes.name}
				data-field-id={props.attributes.id}
				{...dataAttributes}
			>
				<div className="gutenform-file-upload-zone">
					<div className="gutenform-file-upload-icon">
						<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
							<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
							<polyline points="17 8 12 3 7 8" />
							<line x1="12" y1="3" x2="12" y2="15" />
						</svg>
					</div>
					<p className="gutenform-file-upload-text">
						<span className="gutenform-file-upload-text-primary">Select a file to upload</span>
						<span className="gutenform-file-upload-text-secondary">or drag and drop it here</span>
					</p>
					<input
						type="file"
						name={props.attributes.name}
						id={props.attributes.id}
						className="gutenform-file-input"
						multiple={props.attributes.multiple}
						accept={props.attributes.acceptTypes}
						required={props.attributes.required}
						aria-label={props.attributes.label || 'File upload'}
					/>
				</div>
				{props.attributes.allowUrlUpload && (
					<div className="gutenform-file-upload-url">
						<p>Or upload from URL</p>
						<div className="gutenform-file-upload-url-input">
							<input type="url" className="gutenform-file-url-input" placeholder="Add file URL" />
							<button type="button" className="gutenform-file-url-upload-btn">Upload</button>
						</div>
					</div>
				)}
				<div className="gutenform-file-upload-list"></div>
			</div>
			{props.attributes.help && <p className="gutenform-field__help">{props.attributes.help}</p>}
		</div>
	);
}

