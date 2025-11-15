/**
 * React hook that is used to mark the block wrapper element.
 * It provides all the necessary props like the class name.
 *
 * @see https://developer.wordpress.org/block-editor/reference-guides/packages/packages-block-editor/#useblockprops
 */
import { InputAttributes } from '@/blockTypes/input';
import { useBlockProps } from '@wordpress/block-editor';
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
export default function save(props: BlockSaveProps<InputAttributes>) {
	return (
		<div { ...useBlockProps.save() }>
			<label htmlFor={props.attributes.id}>{props.attributes.label}</label>
			<input type={props.attributes.type} placeholder={props.attributes.placeholder} name={props.attributes.name} id={props.attributes.id} required={props.attributes.required} defaultValue={props.attributes.defaultValue} />
			{props.attributes.help && <p className="text-sm text-gray-500">{props.attributes.help}</p>}
		</div>
	);
}
