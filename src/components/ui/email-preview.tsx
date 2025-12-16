"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Eye, X } from "lucide-react"
import { __ } from "@/lib/i18n"

interface EmailPreviewProps {
  body: string
  subject?: string
  fromEmail?: string
  fromName?: string
  sideBySide?: boolean
  onToggleSideBySide?: (enabled: boolean) => void
}

export function EmailPreview({ 
  body, 
  subject, 
  fromEmail, 
  fromName,
  sideBySide = false,
  onToggleSideBySide
}: EmailPreviewProps) {
  const [isOpen, setIsOpen] = useState(false)

  // Escape HTML
  const escapeHtml = (text: string): string => {
    const map: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;',
    }
    return text.replace(/[&<>"']/g, (m) => map[m])
  }

  // Create HTML content for iframe
  const getHtmlContent = () => {
    const escapedSubject = subject ? escapeHtml(subject) : ''
    const escapedFromName = fromName ? escapeHtml(fromName) : ''
    const escapedFromEmail = fromEmail ? escapeHtml(fromEmail) : ''
    
    // Process body: escape HTML but highlight placeholders
    let processedBody = escapeHtml(body)
    processedBody = processedBody.replace(/\{([^}]+)\}/g, '<span class="placeholder">{$1}</span>')
    
    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      margin: 0;
      padding: 20px;
      background-color: #f5f5f5;
    }
    .email-container {
      max-width: 600px;
      margin: 0 auto;
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      overflow: hidden;
    }
    .email-header {
      background: #f9fafb;
      padding: 20px;
      border-bottom: 1px solid #e5e7eb;
    }
    .email-meta {
      font-size: 12px;
      color: #6b7280;
      margin-bottom: 8px;
    }
    .email-subject {
      font-size: 18px;
      font-weight: 600;
      color: #111827;
      margin: 0;
    }
    .email-body {
      padding: 20px;
      line-height: 1.6;
      color: #374151;
    }
    .placeholder {
      background-color: #fef3c7;
      padding: 2px 4px;
      border-radius: 3px;
      font-family: monospace;
      font-size: 0.9em;
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="email-header">
      ${fromName || fromEmail ? `
        <div class="email-meta">
          From: ${escapedFromName ? `${escapedFromName} <${escapedFromEmail}>` : escapedFromEmail}
        </div>
      ` : ''}
      ${escapedSubject ? `<h1 class="email-subject">${escapedSubject}</h1>` : ''}
    </div>
    <div class="email-body">
      ${processedBody}
    </div>
  </div>
</body>
</html>`
  }

  // If side-by-side mode, render inline
  if (sideBySide) {
    return (
      <div className="flex-1 border rounded-lg overflow-hidden">
        <iframe
          srcDoc={getHtmlContent()}
          className="w-full h-full border-0 min-h-[400px]"
          title={__("emailPreview")}
        />
      </div>
    )
  }

  // Default: Dialog mode
  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="ml-2"
      >
        <Eye className="h-4 w-4 mr-2" />
        {__("preview")}
      </Button>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>{__("emailPreview")}</DialogTitle>
            <DialogDescription>
              {__("emailPreviewDescription")}
            </DialogDescription>
          </DialogHeader>
          <div className="relative w-full h-[600px] border rounded-lg overflow-hidden">
            <iframe
              srcDoc={getHtmlContent()}
              className="w-full h-full border-0"
              title={__("emailPreview")}
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

