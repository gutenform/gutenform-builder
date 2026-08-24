"use client"

import "./fullscreen-template-editor.css"
import { useState, useEffect, useCallback, useRef, lazy, Suspense } from "react"
import { Dialog, DialogContent } from "@/components/ui/dialog.jsx"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area.jsx"
import { PlaceholderDraggable } from "@/components/ui/placeholder-draggable"
import { CustomFieldInput } from "@/components/ui/custom-field-input"
import { __ } from "@/lib/i18n"
import { apiGet, type ApiResponse } from "@/lib/api"
// CodeMirror 6 replaces Monaco here. Monaco's React wrapper fetches the actual
// editor from cdn.jsdelivr.net at runtime, which is executable third-party code
// from a CDN -- a WordPress.org guideline 8 exclusion reason. CodeMirror is
// bundled locally, and is roughly an order of magnitude smaller. Still lazily
// imported so it stays out of the main admin chunk.
const HtmlCodeEditor = lazy(() => import("./HtmlCodeEditor"))
import { useDebounce } from "@/hooks/useDebounce"
import { X, Save } from "lucide-react"
import type { Placeholder } from "@/components/ui/placeholder-draggable"
import { Checkbox } from "@/components/ui/checkbox"

interface EmailTemplate {
  name: string
  title: string
  description: string
}

export interface FullscreenTemplateEditorProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialHtml?: string
  /**
   * Called on save in the plain case. Optional because callers that pass
   * onSaveWithMeta (the form-context editor) never reach this path -- they
   * previously had to pass a do-nothing onSave just to satisfy the type.
   */
  onSave?: (html: string) => void
  /** When provided, form fields etc. are shown in the placeholder list */
  customPlaceholders?: Placeholder[]
  /** When true, show "Use provider layout" checkbox and call onSaveWithMeta on save */
  showUseProviderLayoutCheckbox?: boolean
  initialUseProviderLayout?: boolean
  onSaveWithMeta?: (data: { html: string; useProviderLayout: boolean }) => void
  /** When true, hide the template selection section (e.g. for form-context editor) */
  hideTemplateSelection?: boolean
  /** When provided, use this component instead of Radix Dialog (e.g. WordPress Modal for block editor) */
  ModalComponent?: React.ComponentType<{
    title: string
    onRequestClose: () => void
    children: React.ReactNode
    className?: string
    style?: React.CSSProperties
  }>
}

export function FullscreenTemplateEditor({
  open,
  onOpenChange,
  initialHtml = '',
  onSave,
  customPlaceholders = [],
  showUseProviderLayoutCheckbox = false,
  initialUseProviderLayout = true,
  onSaveWithMeta,
  hideTemplateSelection = false,
  ModalComponent: WpModal = undefined,
}: FullscreenTemplateEditorProps) {
  const [html, setHtml] = useState<string>(String(initialHtml || ''))
  const [useProviderLayout, setUseProviderLayout] = useState(initialUseProviderLayout)
  const [templates, setTemplates] = useState<EmailTemplate[]>([])
  const [loadingTemplates, setLoadingTemplates] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<string>('')
  const [previewHtml, setPreviewHtml] = useState('')
  const editorRef = useRef<any>(null)

  // Load templates on mount (skip when hiding template selection)
  useEffect(() => {
    if (open) {
      setHtml(String(initialHtml || ''))
      setUseProviderLayout(initialUseProviderLayout)
      if (!hideTemplateSelection) {
        loadTemplates()
      }
    }
  }, [open, initialHtml, initialUseProviderLayout, hideTemplateSelection])

  // Update preview when HTML changes (debounced)
  const debouncedHtml = useDebounce(html, 300)
  useEffect(() => {
    if (debouncedHtml) {
      updatePreview()
    }
  }, [debouncedHtml])

  const loadTemplates = async () => {
    try {
      setLoadingTemplates(true)
      const response = await apiGet<ApiResponse<EmailTemplate[]>>('email-templates')
      if (response.success && response.data) {
        setTemplates(response.data)
      }
    } catch (error) {
      console.error('Failed to load templates:', error)
    } finally {
      setLoadingTemplates(false)
    }
  }

  const handleTemplateSelect = async (templateName: string) => {
    if (templateName === 'blank' || !templateName) {
      setHtml('')
      setSelectedTemplate('')
      return
    }

    try {
      const response = await apiGet<ApiResponse<{ name: string; title: string; description: string; content: string }>>(`email-templates/${templateName}`)
      if (response.success && response.data) {
        // API returns { name, title, description, content }
        const templateContent = typeof response.data === 'string' 
          ? response.data 
          : (response.data as any).content || ''
        
        // Ensure it's a string
        const htmlString = String(templateContent || '')
        setHtml(htmlString)
        setSelectedTemplate(templateName)
      }
    } catch (error) {
      console.error('Failed to load template:', error)
    }
  }

  const updatePreview = () => {
    const htmlString = String(html || '')
    setPreviewHtml(htmlString)
  }

  const handleSave = () => {
    const htmlString = String(html || '')
    if (onSaveWithMeta && showUseProviderLayoutCheckbox) {
      onSaveWithMeta({ html: htmlString, useProviderLayout })
    } else {
      onSave?.(htmlString)
    }
    onOpenChange(false)
  }

  const handlePlaceholderInsert = (placeholder: string) => {
    if (editorRef.current) {
      // Replaces the selection, or inserts at the caret when nothing is selected.
      editorApi.insertAtSelection(placeholder)
    } else {
      // Fallback: append to end
      setHtml((prev) => String(prev || '') + placeholder)
    }
  }

  /**
   * Handles drop events on the preview area.
   * Tries to find the best insertion point in the HTML based on the drop position.
   */
  const handlePreviewDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()

    const data = e.dataTransfer?.getData('text/plain')
    if (!data || !data.startsWith('{') || !data.endsWith('}')) {
      return
    }

    if (!editorRef.current) {
      // Fallback: append to end
      setHtml((prev) => String(prev || '') + data)
      return
    }

    const htmlString = String(html || '')

    // Get the drop position relative to the preview container
    const previewContainer = e.currentTarget
    const rect = previewContainer.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    // Heuristic mapping from preview coordinates to a position in the source.
    const insertionPoint = findInsertionPointInHtml(htmlString, x, y, rect.width, rect.height)

    if (insertionPoint) {
      const offset = editorApi.offsetAt(insertionPoint.line, insertionPoint.column)
      editorApi.insertAt(offset, offset, data)
    } else {
      // Fallback: insert at the caret / replace the selection.
      editorApi.insertAtSelection(data)
    }
  }

  /**
   * Finds the best insertion point in HTML based on drop coordinates.
   * This is a heuristic that tries to map preview coordinates to HTML positions.
   */
  const findInsertionPointInHtml = (
    html: string,
    dropX: number,
    dropY: number,
    containerWidth: number,
    containerHeight: number
  ): { line: number; column: number } | null => {
    if (!html || !editorRef.current) {
      return null
    }

    // Calculate approximate line based on Y position
    // This is a rough estimate - we assume each line is about 20px high
    const estimatedLine = Math.max(1, Math.floor((dropY / containerHeight) * html.split('\n').length) + 1)
    
    const lines = html.split('\n')
    const targetLine = Math.min(estimatedLine, lines.length)
    const lineContent = lines[targetLine - 1] || ''
    
    // Calculate approximate column based on X position
    // This is also rough - we assume average character width of 8px
    const estimatedColumn = Math.max(1, Math.floor((dropX / containerWidth) * lineContent.length) + 1)
    const targetColumn = Math.min(estimatedColumn, lineContent.length + 1)

    return {
      line: targetLine,
      column: targetColumn,
    }
  }

  /**
   * Minimal adapter over the CodeMirror view.
   *
   * The call sites below were written against Monaco's line/column + range API;
   * CodeMirror addresses the document by flat character offset instead. Rather
   * than sprinkle conversions through every handler, everything goes through
   * these three operations.
   */
  const editorApi = {
    /** Absolute offset for a 1-based line/column pair, clamped to the document. */
    offsetAt(line: number, column: number): number {
      const view = editorRef.current
      if (!view) return 0
      const doc = view.state.doc
      const safeLine = Math.min(Math.max(1, line), doc.lines)
      const lineInfo = doc.line(safeLine)
      return Math.min(lineInfo.from + Math.max(0, column - 1), lineInfo.to)
    },

    /** Replaces the given range (or the selection) and puts the caret after it. */
    insertAt(from: number, to: number, text: string) {
      const view = editorRef.current
      if (!view) return
      view.dispatch({
        changes: { from, to, insert: text },
        selection: { anchor: from + text.length },
      })
      view.focus()
    },

    /** Replaces the current selection, or inserts at the caret. */
    insertAtSelection(text: string) {
      const view = editorRef.current
      if (!view) return
      const range = view.state.selection.main
      this.insertAt(range.from, range.to, text)
    },

    /** Appends at the very end of the document. */
    appendAtEnd(text: string) {
      const view = editorRef.current
      if (!view) return
      const end = view.state.doc.length
      this.insertAt(end, end, text)
    },
  }

  const handleEditorCreated = (view: any) => {
    editorRef.current = view
  }

  /**
   * Drag & drop of a placeholder onto the code editor itself. CodeMirror
   * exposes posAtCoords(), so the drop lands where the pointer actually is.
   */
  const handleEditorDrop = (e: React.DragEvent<HTMLDivElement>) => {
    const data = e.dataTransfer?.getData('text/plain')
    if (!data || !data.startsWith('{') || !data.endsWith('}')) {
      return
    }

    e.preventDefault()
    e.stopPropagation()

    const view = editorRef.current
    if (!view) {
      setHtml((prev) => String(prev || '') + data)
      return
    }

    const pos = view.posAtCoords({ x: e.clientX, y: e.clientY })
    if (pos === null || pos === undefined) {
      editorApi.insertAtSelection(data)
      return
    }

    editorApi.insertAt(pos, pos, data)
  }

  const handleEditorDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    e.dataTransfer.dropEffect = 'copy'
  }

  if (!open) return null

  const onClose = () => onOpenChange(false)

  const modalContent = (
    <div className="gutenform-te">
        <div className="gutenform-te__header">
          <h2 className="gutenform-te__title">
            {__("emailTemplateEditor") || __("editTemplate") || "Edit template"}
          </h2>
          <p className="gutenform-te__description">
            {__("emailTemplateEditorDescription") || "Edit your email template HTML with live preview"}
          </p>
          {showUseProviderLayoutCheckbox && (
            <div className="gutenform-te__checkbox-row">
              <div className="gutenform-te__checkbox-inner">
                <Checkbox
                  id="use-provider-layout"
                  checked={useProviderLayout}
                  onCheckedChange={(checked) => setUseProviderLayout(checked === true)}
                />
                <label htmlFor="use-provider-layout" className="gutenform-te__checkbox-label">
                  {__("useProviderLayout")}
                </label>
              </div>
              <p className="gutenform-te__checkbox-help">
                {__("useProviderLayoutHelp")}
              </p>
            </div>
          )}
        </div>

        <div className="gutenform-te__main">
          {/* Sidebar */}
          <div className="gutenform-te__sidebar">
            <ScrollArea className="gutenform-te__scroll-area">
              <div className="gutenform-te__sidebar-inner">
                {/* Template Selection (hidden in form context) */}
                {!hideTemplateSelection && (
                  <>
                    <div className="gutenform-te__section">
                      <Label>{__("selectTemplate") || "Select Template"}</Label>
                      <Select
                        value={selectedTemplate || 'blank'}
                        onValueChange={handleTemplateSelect}
                        disabled={loadingTemplates}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={__("selectTemplate") || "Select Template"} />
                        </SelectTrigger>
                        <SelectContent className="gutenform-te__select-content">
                          <SelectItem value="blank">{__("blank") || "Blank"}</SelectItem>
                          {templates.map((template) => (
                            <SelectItem key={template.name} value={template.name}>
                              <div>
                                <div className="gutenform-te__template-title">{template.title}</div>
                                {template.description && (
                                  <div className="gutenform-te__template-desc">
                                    {template.description}
                                  </div>
                                )}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <Separator />
                  </>
                )}

                {/* Custom Fields (only when not using custom placeholders from form) */}
                {customPlaceholders.length === 0 && (
                  <>
                    <div className="gutenform-te__section">
                      <div className="gutenform-te__section-title">
                        {__("customFields") || "Custom Fields"}
                      </div>
                      <CustomFieldInput onFieldAdd={handlePlaceholderInsert} />
                    </div>
                    <Separator />
                  </>
                )}

                {/* Placeholders Section (includes form fields when customPlaceholders provided) */}
                <PlaceholderDraggable
                  className="gutenform-te__placeholders"
                  onPlaceholderSelect={handlePlaceholderInsert}
                  customPlaceholders={customPlaceholders}
                />
              </div>
            </ScrollArea>
          </div>

          {/* Main Content Area - Preview and Editor */}
          <div className="gutenform-te__main-area">
            <div className="gutenform-te__content-row">
              {/* Preview */}
              <div className="gutenform-te__preview-col">
                <div className="gutenform-te__panel-header">
                  <Label>{__("preview") || "Preview"}</Label>
                </div>
                <div
                  className="gutenform-te__preview-box"
                  onDragOver={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    e.dataTransfer.dropEffect = 'copy'
                  }}
                  onDrop={handlePreviewDrop}
                >
                  {previewHtml ? (
                    <div
                      dangerouslySetInnerHTML={{ __html: previewHtml }}
                      className="gutenform-te__preview-inner"
                      style={{ pointerEvents: 'auto' }}
                    />
                  ) : (
                    <div className="gutenform-te__preview-empty">
                      {__("noPreviewAvailable") || "No preview available"}
                    </div>
                  )}
                </div>
              </div>

              {/* HTML Editor */}
              <div className="gutenform-te__editor-col">
                <div className="gutenform-te__panel-header">
                  <Label>{__("htmlEditor") || "HTML Editor"}</Label>
                </div>
                <div className="gutenform-te__editor-inner">
                  <div
                    className="gutenform-te__editor-dropzone"
                    onDrop={handleEditorDrop}
                    onDragOver={handleEditorDragOver}
                  >
                    <Suspense fallback={<div className="gutenform-te__editor-loading">{__("loading") || "Loading…"}</div>}>
                      <HtmlCodeEditor
                        value={String(html || '')}
                        onChange={(value: string) => setHtml(String(value || ''))}
                        onCreateEditor={handleEditorCreated}
                      />
                    </Suspense>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="gutenform-te__footer">
          <button type="button" className="gutenform-te__btn gutenform-te__btn--outline" onClick={onClose}>
            {__("cancel") || "Cancel"}
          </button>
          <button type="button" className="gutenform-te__btn gutenform-te__btn--primary" onClick={handleSave}>
            <Save className="h-4 w-4" style={{ marginRight: 8 }} />
            {__("save") || "Save"}
          </button>
        </div>
    </div>
  )

  if (WpModal) {
    return (
      <WpModal
        title={__("emailTemplateEditor") || __("editTemplate") || "Edit template"}
        onRequestClose={onClose}
        className="gutenform-fullscreen-template-editor-wp"
        style={{
          maxWidth: '95vw',
          width: '95vw',
          height: '95vh',
          maxHeight: '95vh',
          padding: 0,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        <div className="gutenform-te__wp-wrap">
          {modalContent}
        </div>
      </WpModal>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] w-[95vw] h-[95vh] max-h-[95vh] p-0 flex flex-col !translate-x-[-50%] !translate-y-[-50%]">
        {modalContent}
      </DialogContent>
    </Dialog>
  )
}

