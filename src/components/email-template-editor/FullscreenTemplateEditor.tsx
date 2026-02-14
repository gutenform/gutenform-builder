"use client"

import "./fullscreen-template-editor.css"
import { useState, useEffect, useCallback, useRef } from "react"
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
import Editor from "@monaco-editor/react"
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
  onSave: (html: string) => void
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
      onSave(htmlString)
    }
    onOpenChange(false)
  }

  const handlePlaceholderInsert = (placeholder: string) => {
    if (editorRef.current) {
      const editor = editorRef.current
      const selection = editor.getSelection()
      if (selection) {
        const range = {
          startLineNumber: selection.startLineNumber,
          startColumn: selection.startColumn,
          endLineNumber: selection.endLineNumber,
          endColumn: selection.endColumn,
        }
        editor.executeEdits('insert-placeholder', [{
          range: range,
          text: placeholder,
          forceMoveMarkers: true,
        }])
        // Set cursor after inserted text
        editor.setPosition({
          lineNumber: selection.startLineNumber,
          column: selection.startColumn + placeholder.length,
        })
        editor.focus()
      } else {
        // No selection, append at end
        const model = editor.getModel()
        const lineCount = model.getLineCount()
        const lastLine = model.getLineContent(lineCount)
        const range = {
          startLineNumber: lineCount,
          startColumn: lastLine.length + 1,
          endLineNumber: lineCount,
          endColumn: lastLine.length + 1,
        }
        editor.executeEdits('insert-placeholder', [{
          range: range,
          text: placeholder,
          forceMoveMarkers: true,
        }])
        editor.setPosition({
          lineNumber: lineCount,
          column: lastLine.length + placeholder.length + 1,
        })
        editor.focus()
      }
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

    const editor = editorRef.current
    const htmlString = String(html || '')
    
    // Get the drop position relative to the preview container
    const previewContainer = e.currentTarget
    const rect = previewContainer.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    // Try to find the best insertion point in the HTML
    // This is a heuristic approach: we'll try to find the nearest text node or element
    const insertionPoint = findInsertionPointInHtml(htmlString, x, y, rect.width, rect.height)
    
    if (insertionPoint) {
      // Insert at the found position
      const range = {
        startLineNumber: insertionPoint.line,
        startColumn: insertionPoint.column,
        endLineNumber: insertionPoint.line,
        endColumn: insertionPoint.column,
      }
      editor.executeEdits('drop-placeholder-preview', [{
        range: range,
        text: data,
        forceMoveMarkers: true,
      }])
      editor.setPosition({
        lineNumber: insertionPoint.line,
        column: insertionPoint.column + data.length,
      })
      editor.focus()
    } else {
      // Fallback: insert at cursor position or end
      const selection = editor.getSelection()
      if (selection) {
        const range = {
          startLineNumber: selection.startLineNumber,
          startColumn: selection.startColumn,
          endLineNumber: selection.endLineNumber,
          endColumn: selection.endColumn,
        }
        editor.executeEdits('drop-placeholder-preview', [{
          range: range,
          text: data,
          forceMoveMarkers: true,
        }])
        editor.setPosition({
          lineNumber: selection.startLineNumber,
          column: selection.startColumn + data.length,
        })
        editor.focus()
      } else {
        // Append at end
        const model = editor.getModel()
        const lineCount = model.getLineCount()
        const lastLine = model.getLineContent(lineCount)
        const range = {
          startLineNumber: lineCount,
          startColumn: lastLine.length + 1,
          endLineNumber: lineCount,
          endColumn: lastLine.length + 1,
        }
        editor.executeEdits('drop-placeholder-preview', [{
          range: range,
          text: data,
          forceMoveMarkers: true,
        }])
        editor.setPosition({
          lineNumber: lineCount,
          column: lastLine.length + data.length + 1,
        })
        editor.focus()
      }
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

  const handleEditorDidMount = (editor: any, monaco: any) => {
    editorRef.current = editor
    // Store monaco globally for drag and drop
    ;(window as any).monaco = monaco
    
    // Handle drag and drop from placeholder list
    const editorContainer = editor.getContainerDomNode()
    
    const handleDrop = (e: DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      
      const data = e.dataTransfer?.getData('text/plain')
      if (!data || !data.startsWith('{') || !data.endsWith('}')) {
        return
      }
      
      // Get current cursor position or use mouse position
      let position = editor.getPosition()
      
      if (!position) {
        // Fallback: try to get position from mouse coordinates
        const rect = editorContainer.getBoundingClientRect()
        const x = e.clientX - rect.left
        const y = e.clientY - rect.top
        
        // Monaco's getTargetAtClientPoint method
        if (monaco && monaco.editor) {
          const target = editor.getTargetAtClientPoint({ clientX: e.clientX, clientY: e.clientY })
          if (target && target.position) {
            position = target.position
          }
        }
      }
      
      // If still no position, use line 1, column 1
      if (!position) {
        position = { lineNumber: 1, column: 1 }
      }
      
      const range = {
        startLineNumber: position.lineNumber,
        startColumn: position.column,
        endLineNumber: position.lineNumber,
        endColumn: position.column,
      }
      
      editor.executeEdits('drop-placeholder', [{
        range: range,
        text: data,
      }])
      
      editor.setPosition({
        lineNumber: position.lineNumber,
        column: position.column + data.length,
      })
      editor.focus()
    }
    
    editorContainer.addEventListener('drop', handleDrop, true)
    editorContainer.addEventListener('dragover', (e: DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      e.dataTransfer!.dropEffect = 'copy'
    }, true)
    
    // Cleanup function
    return () => {
      editorContainer.removeEventListener('drop', handleDrop, true)
    }
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
                  <Editor
                    height="100%"
                    defaultLanguage="html"
                    value={String(html || '')}
                    onChange={(value) => setHtml(String(value || ''))}
                    onMount={handleEditorDidMount}
                    theme="vs-dark"
                    options={{
                      minimap: { enabled: false },
                      fontSize: 14,
                      wordWrap: 'on',
                      automaticLayout: true,
                    }}
                  />
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

