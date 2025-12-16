"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog.jsx"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area.jsx"
import { PlaceholderDraggable } from "@/components/ui/placeholder-draggable"
import { __ } from "@/lib/i18n"
import { apiGet, type ApiResponse } from "@/lib/api"
import Editor from "@monaco-editor/react"
import { useDebounce } from "@/hooks/useDebounce"
import { X, Save } from "lucide-react"

interface EmailTemplate {
  name: string
  title: string
  description: string
}

interface FullscreenTemplateEditorProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialHtml?: string
  onSave: (html: string) => void
}



export function FullscreenTemplateEditor({
  open,
  onOpenChange,
  initialHtml = '',
  onSave,
}: FullscreenTemplateEditorProps) {
  const [html, setHtml] = useState<string>(String(initialHtml || ''))
  const [templates, setTemplates] = useState<EmailTemplate[]>([])
  const [loadingTemplates, setLoadingTemplates] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<string>('')
  const [previewHtml, setPreviewHtml] = useState('')
  const editorRef = useRef<any>(null)

  // Load templates on mount
  useEffect(() => {
    if (open) {
      loadTemplates()
      setHtml(String(initialHtml || ''))
    }
  }, [open, initialHtml])

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
    onSave(htmlString)
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] w-[95vw] h-[95vh] max-h-[95vh] p-0 flex flex-col !translate-x-[-50%] !translate-y-[-50%]">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <DialogTitle>{__("emailTemplateEditor") || "Email Template Editor"}</DialogTitle>
          <DialogDescription>
            {__("emailTemplateEditorDescription") || "Edit your email template HTML with live preview"}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 flex overflow-hidden">
          {/* Sidebar */}
          <div className="w-80 border-r flex flex-col overflow-hidden">
            <ScrollArea className="flex-1">
              <div className="p-4 space-y-6">
                {/* Template Selection */}
                <div className="space-y-2">
                  <Label>{__("selectTemplate") || "Select Template"}</Label>
                  <Select
                    value={selectedTemplate || 'blank'}
                    onValueChange={handleTemplateSelect}
                    disabled={loadingTemplates}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={__("selectTemplate") || "Select Template"} />
                    </SelectTrigger>
                    <SelectContent className="!z-[100000]">
                      <SelectItem value="blank">{__("blank") || "Blank"}</SelectItem>
                      {templates.map((template) => (
                        <SelectItem key={template.name} value={template.name}>
                          <div>
                            <div className="font-medium">{template.title}</div>
                            {template.description && (
                              <div className="text-xs text-muted-foreground">
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

                {/* Placeholders Section */}
                <PlaceholderDraggable onPlaceholderSelect={handlePlaceholderInsert} />
              </div>
            </ScrollArea>
          </div>

          {/* Main Content Area - Editor and Preview */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="flex-1 flex border-b">
              {/* HTML Editor */}
              <div className="flex-1 flex flex-col">
                <div className="px-4 py-2 border-b bg-muted/50">
                  <Label className="text-sm font-semibold">
                    {__("htmlEditor") || "HTML Editor"}
                  </Label>
                </div>
                <div className="flex-1">
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

              {/* Preview */}
              <div className="flex-1 flex flex-col border-l">
                <div className="px-4 py-2 border-b bg-muted/50">
                  <Label className="text-sm font-semibold">
                    {__("preview") || "Preview"}
                  </Label>
                </div>
                <div className="flex-1 overflow-auto bg-muted/20 p-4">
                  {previewHtml ? (
                    <iframe
                      srcDoc={previewHtml}
                      className="w-full h-full border rounded-lg bg-white"
                      title={__("emailPreview") || "Email Preview"}
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                      {__("noPreviewAvailable") || "No preview available"}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="px-6 py-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {__("cancel") || "Cancel"}
          </Button>
          <Button onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            {__("save") || "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

