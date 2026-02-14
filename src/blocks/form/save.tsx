/**
 * React hook that is used to mark the block wrapper element.
 * It provides all the necessary props like the class name.
 *
 * @see https://developer.wordpress.org/block-editor/reference-guides/packages/packages-block-editor/#useblockprops
 */
import { FormAttributes } from '@/blockTypes/form';
import { getFormClasses } from '../../lib/utils';
import { 
	InnerBlocks, 
	useBlockProps,
	/** @ts-expect-error */
	__experimentalGetBorderClassesAndStyles as getBorderClassesAndStyles,
	/** @ts-expect-error */
	__experimentalGetColorClassesAndStyles as getColorClassesAndStyles,
} from '@wordpress/block-editor';
import { type BlockSaveProps } from '@wordpress/blocks';
import clsx from 'clsx';

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
		providerIds: props.attributes.providerIds || [],
		providerOverrides: props.attributes.providerOverrides || {},
	};
	const borderProps = getBorderClassesAndStyles( props.attributes );
	const colorProps = getColorClassesAndStyles( props.attributes );
	
	const className = clsx(
		getFormClasses(props.attributes),
		borderProps.className,
		colorProps.className,
	);

	const style = {
		...borderProps.style,
		...colorProps.style,
	};
	return (
		<form { ...useBlockProps.save({
			className,
			style,
		}) } data-form-options={JSON.stringify(options)} data-skin={props.attributes.skin || 'default'}>
			<InnerBlocks.Content />
		</form>
	);
}
