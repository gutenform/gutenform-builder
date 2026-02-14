import { useState, useEffect, useCallback } from 'react';
import { __ } from '@/lib/i18n';
import { Modal, Button, CheckboxControl, TextareaControl } from '@wordpress/components';
import { type ProviderOverride } from '@/blockTypes/form';
import { useFormFieldList } from '@/hooks/useFormFieldList';
import { PlaceholderPills } from '@/components/ui/placeholder-pills';

const STANDARD_PLACEHOLDER_ITEMS = [
	{ value: '{form_identifier}', label: 'Form Identifier' },
	{ value: '{form_title}', label: 'Form Title' },
	{ value: '{site_name}', label: 'Site Name' },
	{ value: '{date}', label: 'Date' },
	{ value: '{time}', label: 'Time' },
	{ value: '{ip_address}', label: 'IP Address' },
	{ value: '{all_fields}', label: 'All Fields' },
	{ value: '{form_primary_mail}', label: 'Primary Mail' },
];

export type FormProviderTemplateModalProps = {
	open: boolean;
	onClose: () => void;
	providerId: number | null;
	override?: ProviderOverride;
	onSave: (override: ProviderOverride) => void;
	formBlockClientId: string;
};

export function FormProviderTemplateModal({
	open,
	onClose,
	override,
	onSave,
	formBlockClientId,
}: FormProviderTemplateModalProps) {
	const [useProviderLayout, setUseProviderLayout] = useState(true);
	const [content, setContent] = useState('');
	const [isDraggingOver, setIsDraggingOver] = useState(false);

	const fieldList = useFormFieldList(formBlockClientId, formBlockClientId);
	const formFieldPlaceholders = fieldList.map((f) => ({
		value: `{${f.name}}`,
		label: f.label || f.name,
	}));
	const allPlaceholders = [...STANDARD_PLACEHOLDER_ITEMS, ...formFieldPlaceholders];

	useEffect(() => {
		if (open && override) {
			setUseProviderLayout(override.useProviderLayout ?? true);
			setContent(override.content ?? '');
		}
	}, [open, override]);

	const insertPlaceholder = useCallback((placeholder: string) => {
		setContent((prev) => prev + placeholder);
	}, []);

	const handleDragStart = useCallback((e: React.DragEvent, placeholder: string) => {
		e.dataTransfer.setData('text/plain', placeholder);
		e.dataTransfer.effectAllowed = 'copy';
		e.dataTransfer.setData('text/html', placeholder);
	}, []);

	const handleDrop = useCallback((e: React.DragEvent) => {
		e.preventDefault();
		const placeholder = e.dataTransfer?.getData('text/plain');
		if (placeholder && /^\{[^}]+\}$/.test(placeholder)) {
			setContent((prev) => prev + placeholder);
		}
	}, []);

	const handleDragOver = useCallback((e: React.DragEvent) => {
		e.preventDefault();
		e.dataTransfer.dropEffect = 'copy';
		setIsDraggingOver(true);
	}, []);

	const handleDragLeave = useCallback((e: React.DragEvent) => {
		e.preventDefault();
		if (!e.currentTarget.contains(e.relatedTarget as Node)) {
			setIsDraggingOver(false);
		}
	}, []);

	const handleDragEnd = useCallback(() => {
		setIsDraggingOver(false);
	}, []);

	const handleSave = () => {
		onSave({
			useProviderLayout,
			content,
			conditionalShow: override?.conditionalShow ?? undefined,
		});
		onClose();
	};

	// Preview: highlight placeholders in HTML
	const previewHtml = content.replace(/\{([^}]+)\}/g, '<span class="placeholder">{$1}</span>');
	const previewDoc = `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>body{font-family:sans-serif;margin:12px;font-size:14px;} .placeholder{background:#e0e7ff;color:#3730a3;padding:2px 4px;border-radius:2px;}</style></head><body>${previewHtml || '<em>No content</em>'}</body></html>`;

	if (!open) return null;

	return (
		<Modal
			title={__('editTemplate')}
			onRequestClose={onClose}
			className="gutenform-form-provider-template-modal"
			style={{ maxWidth: 720, minHeight: 400 }}
		>
			<div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: '8px 0' }}>
				<CheckboxControl
					label={__('useProviderLayout')}
					help={__('useProviderLayoutHelp')}
					checked={useProviderLayout}
					onChange={setUseProviderLayout}
				/>
				<div
					onDrop={(e) => { handleDrop(e); setIsDraggingOver(false); }}
					onDragOver={handleDragOver}
					onDragLeave={handleDragLeave}
					style={{
						border: isDraggingOver ? '2px dashed var(--wp-admin-theme-color, #007cba)' : '1px dashed #ddd',
						borderRadius: 4,
						backgroundColor: isDraggingOver ? 'rgba(0, 124, 186, 0.05)' : 'transparent',
						padding: isDraggingOver ? 3 : 0,
						transition: 'border-color 0.15s, background-color 0.15s',
					}}
					className="gutenform-template-drop-zone"
				>
					<label style={{ display: 'block', marginBottom: 8, fontSize: 13, fontWeight: 500 }}>
						{useProviderLayout ? __('contentPlaceholder', 'Content (replaces {content})') : __('fullEmailBody', 'Full email body (HTML)')}
					</label>
					<TextareaControl
						value={content}
						onChange={setContent}
						rows={10}
						__nextHasNoMarginBottom
					/>
				</div>
				<div>
					<div style={{ fontSize: 12, fontWeight: 500, marginBottom: 8 }}>
						{__('availablePlaceholders')} ({__('dragPlaceholderToInsert') || 'Drag into content or click to append'})
					</div>
					<div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, maxHeight: 120, overflowY: 'auto' }}>
						{allPlaceholders.map((p, index) => (
							<Button
								key={`${p.value}-${index}`}
								variant="secondary"
								isSmall
								onClick={() => insertPlaceholder(p.value)}
								draggable
								onDragStart={(e: React.DragEvent) => handleDragStart(e, p.value)}
								onDragEnd={handleDragEnd}
								style={{ cursor: 'grab' }}
							>
								{p.value}
							</Button>
						))}
					</div>
				</div>
				<PlaceholderPills
					content={content}
					onChange={setContent}
					availablePlaceholders={allPlaceholders}
				/>
				<div>
					<div style={{ fontSize: 12, fontWeight: 500, marginBottom: 8 }}>{__('preview')}</div>
					<div
						style={{
							border: '1px solid #ddd',
							borderRadius: 4,
							overflow: 'hidden',
							height: 200,
							background: '#f9fafb',
						}}
					>
						<iframe
							title="Preview"
							srcDoc={previewDoc}
							style={{ width: '100%', height: '100%', border: 0 }}
							sandbox="allow-same-origin"
						/>
					</div>
				</div>
				<div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 8 }}>
					<Button variant="tertiary" onClick={onClose}>
						{__('cancel')}
					</Button>
					<Button variant="primary" onClick={handleSave}>
						{__('save')}
					</Button>
				</div>
			</div>
		</Modal>
	);
}
