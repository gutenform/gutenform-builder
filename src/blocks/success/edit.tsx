import { __ } from "@/lib/i18n";
import { useBlockProps, InnerBlocks } from '@wordpress/block-editor';
import { useDispatch } from '@wordpress/data';
import { type BlockEditProps } from '@wordpress/blocks';
import { type SuccessAttributes } from '@/blockTypes/success';
import './editor.css';
import { useEffect, useRef, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useFormBlock } from './use-form-block';
import { ModalCloseButton } from './modal-close-button';

export default function Edit(props: BlockEditProps<SuccessAttributes>) {
	const { clientId } = props;
	const successRef = useRef<HTMLDivElement>(null);
	const modalRef = useRef<HTMLDivElement>(null);
	const contentRef = useRef<HTMLDivElement>(null);
	const [form, setForm] = useState<HTMLDivElement | null>(null);
	
	const formBlock = useFormBlock(clientId);
	const { updateBlockAttributes } = useDispatch('core/block-editor');
	const successView = formBlock?.attributes?.successView ?? false;

	const closeModal = useCallback(() => {
		if (formBlock) {
			updateBlockAttributes(formBlock.clientId, { successView: false });
		}
	}, [formBlock, updateBlockAttributes]);

	// Find the form element in the DOM
	useEffect(() => {
		if (successRef.current) {
			const formElement = successRef.current.closest('.wp-block-gutenform-form');
			if (formElement) {
				setForm(formElement as HTMLDivElement);
			}
		}
	}, []);

	// Handle modal click events
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

	// Hidden state when success view is not active
	if (!successView) {
		return (
			<div ref={successRef}>
				<div style={{ padding: '1rem', border: '1px dashed #ccc', textAlign: 'center' }}>
					{__('successModalHiddenInPreview')}
				</div>
			</div>
		);
	}

	// Success modal content
	const SuccessContent = (
		<div { ...useBlockProps() }>
			<InnerBlocks
				allowedBlocks={['core/heading', 'core/paragraph']}
				template={[
					['core/heading', { content: 'Thank you for your submission!' }],
					['core/paragraph', { content: 'We will get back to you as soon as possible.' }],
				]}
			/>
		</div>
	);

	return (
		<div ref={successRef}>
			{form && createPortal((
				<div ref={modalRef} className="gutenform-success-modal">
					<div ref={contentRef} className="gutenform-success-modal-content">
						<ModalCloseButton onClose={closeModal} />
						{SuccessContent}
					</div>
				</div>
			), form)}
			{!form && <div>No form found</div>}
		</div>
	);
}
