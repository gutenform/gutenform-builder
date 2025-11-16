/**
 * React hook that is used to mark the block wrapper element.
 * It provides all the necessary props like the class name.
 *
 * @see https://developer.wordpress.org/block-editor/reference-guides/packages/packages-block-editor/#useblockprops
 */
import { FormAttributes } from '@/blockTypes/form';
import { getFieldClasses } from '../../lib/utils';
import { InnerBlocks, useBlockProps } from '@wordpress/block-editor';
import { type BlockSaveProps } from '@wordpress/blocks';

/**
 * The save function defines the way in which the different attributes should
 * be combined into the final markup, which is then serialized by the block
 * editor into `post_content`.
 *
 * @see https://developer.wordpress.org/block-editor/reference-guides/block-api/block-edit-save/#save
 *
 * @return {Element} Element to render.
 */
export default function save(props: BlockSaveProps<FormAttributes>) {
	const options = {
		formTitle: props.attributes.formTitle,
		skin: props.attributes.skin || 'default',
		mailboxId: props.attributes.mailboxId || '1',
		formId: props.attributes.formId || '',
	};
	const className = getFieldClasses(props.attributes);
	return (
		<form { ...useBlockProps.save({
			className,
		}) } data-form-options={JSON.stringify(options)} data-skin={props.attributes.skin || 'default'}>
			<InnerBlocks.Content />
		</form>
	);
}
