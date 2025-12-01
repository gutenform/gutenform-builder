import { __ } from '@wordpress/i18n';
import { useBlockProps, InnerBlocks } from '@wordpress/block-editor';
import { type BlockEditProps } from '@wordpress/blocks';
import { type SuccessAttributes } from '@/blockTypes/success';
import './editor.css';
import { useEffect, useRef, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';

export default function Edit(_props: BlockEditProps<SuccessAttributes>) {
	const { clientId } = _props;
	const successRef = useRef<HTMLDivElement>(null);
	const modalRef = useRef<HTMLDivElement>(null);
	const contentRef = useRef<HTMLDivElement>(null);
	const [form, setForm] = useState<HTMLDivElement | null>(null);
	
	// Get parent form block's attributes
	// eslint-disable-next-line @typescript-eslint/no-var-requires
	const { useSelect, useDispatch } = require('@wordpress/data');
	const formBlock = useSelect(
		(select: any) => {
			const { getBlockParents, getBlock } = select('core/block-editor');
			const parentIds = getBlockParents(clientId);
			// Find the form block parent
			for (const parentId of parentIds) {
				const parentBlock = getBlock(parentId);
				if (parentBlock?.name === 'gutenform/form') {
					return parentBlock;
				}
			}
			return null;
		},
		[clientId]
	);
	
	const { updateBlockAttributes } = useDispatch('core/block-editor');
	const successView = formBlock?.attributes?.successView ?? false;

	const Block = (
		<>
			<div { ...useBlockProps() }>
				<InnerBlocks allowedBlocks={['core/heading', 'core/paragraph']} template={[
					['core/heading', { content: 'Thank you for your submission!' }],
					['core/paragraph', { content: 'We will get back to you as soon as possible.' }],
				]} />
			</div>
		</>
	);

	useEffect(() => {
		if (successRef.current) {
			const form = successRef.current.closest('.wp-block-gutenform-form');
			if(!form) return;
			setForm(form as unknown as HTMLDivElement);
		}
	}, []);

	const closeModal = useCallback(() => {
		if (formBlock) {
			updateBlockAttributes(formBlock.clientId, { successView: false });
		}
	}, [formBlock, updateBlockAttributes]);

	useEffect(() => {
		if (!modalRef.current || !successView) return;

		const modal = modalRef.current;
		const content = contentRef.current;

		const handleModalClick = (e: MouseEvent) => {
			if (e.target === modal) {
				closeModal();
			}
		};

		const handleContentClick = (e: MouseEvent) => {
			e.stopPropagation();
		};

		modal.addEventListener('click', handleModalClick);
		if (content) {
			content.addEventListener('click', handleContentClick);
		}

		return () => {
			modal.removeEventListener('click', handleModalClick);
			if (content) {
				content.removeEventListener('click', handleContentClick);
			}
		};
	}, [successView, closeModal]);

	if (!successView) {
		return (
			<div ref={successRef}>
				<div style={{ padding: '1rem', border: '1px dashed #ccc', textAlign: 'center' }}>
					{__('Success modal (hidden in preview)', 'gutenform')}
				</div>
			</div>
		);
	}

	return (
		<div ref={successRef}>
			{form && createPortal((
				<div 
					ref={modalRef}
					className="gutenform-success-modal"
				>
					<div 
						ref={contentRef}
						className="gutenform-success-modal-content"
					>
						<button
							type="button"
							className="gutenform-success-modal-close"
							onClick={(e) => {
								e.preventDefault();
								e.stopPropagation();
								closeModal();
							}}
							aria-label={__('Close', 'gutenform')}
						>
							×
						</button>
						{Block}
					</div>
				</div>
			), form)}
			{!form && <div>No form found</div>}
		</div>
	);
}
