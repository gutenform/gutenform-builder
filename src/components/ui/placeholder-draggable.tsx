"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { __ } from "@/lib/i18n"
import { GripVertical } from "lucide-react"

export interface Placeholder {
  value: string
  label: string
  description?: string
  category?: string
}

const STANDARD_PLACEHOLDERS: Placeholder[] = [
  { 
    value: '{form_identifier}', 
    label: 'Form Identifier', 
    description: 'The form identifier',
    category: 'system'
  },
  { 
    value: '{form_title}', 
    label: 'Form Title', 
    description: 'The form title',
    category: 'system'
  },
  { 
    value: '{site_name}', 
    label: 'Site Name', 
    description: 'The site name',
    category: 'system'
  },
  { 
    value: '{date}', 
    label: 'Date', 
    description: 'Current date (Y-m-d)',
    category: 'system'
  },
  { 
    value: '{time}', 
    label: 'Time', 
    description: 'Current time (H:i:s)',
    category: 'system'
  },
  { 
    value: '{ip_address}', 
    label: 'IP Address', 
    description: 'Client IP address',
    category: 'system'
  },
  { 
    value: '{all_fields}', 
    label: 'All Fields', 
    description: 'All form fields as a formatted list',
    category: 'system'
  },
  { 
    value: '{form_primary_mail}', 
    label: 'Primary Mail', 
    description: 'Primary email address from form',
    category: 'system'
  },
]

interface PlaceholderDraggableProps {
  onPlaceholderSelect?: (placeholder: string) => void
  customPlaceholders?: Placeholder[]
  searchable?: boolean
}

export function PlaceholderDraggable({
  onPlaceholderSelect,
  customPlaceholders = [],
  searchable = true,
}: PlaceholderDraggableProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [draggedPlaceholder, setDraggedPlaceholder] = useState<string | null>(null)

  const allPlaceholders = [...STANDARD_PLACEHOLDERS, ...customPlaceholders]

  const filteredPlaceholders = searchTerm
    ? allPlaceholders.filter(
        (p) =>
          p.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.value.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.description?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : allPlaceholders

  const groupedPlaceholders = filteredPlaceholders.reduce((acc, placeholder) => {
    const category = placeholder.category || 'other'
    if (!acc[category]) {
      acc[category] = []
    }
    acc[category].push(placeholder)
    return acc
  }, {} as Record<string, Placeholder[]>)

  const handleDragStart = (e: React.DragEvent, placeholder: string) => {
    setDraggedPlaceholder(placeholder)
    e.dataTransfer.effectAllowed = 'copy'
    e.dataTransfer.setData('text/plain', placeholder)
    e.dataTransfer.setData('text/html', placeholder)
    // Prevent default to avoid browser's default drag behavior
    e.stopPropagation()
  }

  const handleDragEnd = (e: React.DragEvent) => {
    setDraggedPlaceholder(null)
    e.preventDefault()
    e.stopPropagation()
  }

  const handleClick = (e: React.MouseEvent, placeholder: string) => {
    e.preventDefault()
    e.stopPropagation()
    if (onPlaceholderSelect) {
      onPlaceholderSelect(placeholder)
    }
  }

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      system: __('systemPlaceholders') || 'System',
      form: __('formFields') || 'Form Fields',
      other: __('otherPlaceholders') || 'Other',
    }
    return labels[category] || category
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">{__("availablePlaceholders") || "Available Placeholders"}</CardTitle>
        <CardDescription className="text-xs">
          {__("dragPlaceholderToInsert") || "Drag and drop or click to insert placeholders"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {searchable && (
          <Input
            placeholder={__("searchPlaceholders") || "Search placeholders..."}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="text-sm"
          />
        )}

        <div className="space-y-4 max-h-[400px] overflow-y-auto">
          {Object.entries(groupedPlaceholders).map(([category, placeholders]) => (
            <div key={category}>
              <div className="text-xs font-semibold text-muted-foreground mb-2">
                {getCategoryLabel(category)}
              </div>
              <div className="space-y-1">
                {placeholders.map((placeholder) => (
                  <div
                    key={placeholder.value}
                    draggable
                    onDragStart={(e) => handleDragStart(e, placeholder.value)}
                    onDragEnd={(e) => handleDragEnd(e)}
                    onClick={(e) => handleClick(e, placeholder.value)}
                    onMouseDown={(e) => e.stopPropagation()}
                    className={`
                      flex items-center gap-2 p-2 rounded-md cursor-move
                      hover:bg-accent transition-colors
                      ${draggedPlaceholder === placeholder.value ? 'opacity-50' : ''}
                    `}
                    title={placeholder.description}
                  >
                    <GripVertical className="h-4 w-4 text-muted-foreground shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">
                        {placeholder.label}
                      </div>
                      <div className="text-xs text-muted-foreground font-mono truncate">
                        {placeholder.value}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {Object.keys(groupedPlaceholders).indexOf(category) < Object.keys(groupedPlaceholders).length - 1 && (
                <Separator className="mt-2" />
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

