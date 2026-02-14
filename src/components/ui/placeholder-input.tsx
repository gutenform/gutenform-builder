"use client"

import { useState, useRef, ReactElement, cloneElement, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Code } from "lucide-react"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { __ } from "@/lib/i18n"

interface Placeholder {
  value: string
  label: string
  description?: string
}

const STANDARD_PLACEHOLDERS: Placeholder[] = [
  { value: '{form_identifier}', label: 'Form Identifier', description: 'The form identifier' },
  { value: '{form_title}', label: 'Form Title', description: 'The form title' },
  { value: '{site_name}', label: 'Site Name', description: 'The site name' },
  { value: '{date}', label: 'Date', description: 'Current date (Y-m-d)' },
  { value: '{time}', label: 'Time', description: 'Current time (H:i:s)' },
  { value: '{ip_address}', label: 'IP Address', description: 'Client IP address' },
  { value: '{all_fields}', label: 'All Fields', description: 'All form fields as a formatted list' },
  { value: '{form_primary_mail}', label: 'Primary Mail', description: 'Primary email address from form' },
]

interface PlaceholderInputProps {
  children: ReactElement
  onValueChange?: (value: string) => void
  value?: string
  placeholders?: Placeholder[]
  showPlaceholderSelect?: boolean
}

export function PlaceholderInput({
  children,
  onValueChange,
  value,
  placeholders = STANDARD_PLACEHOLDERS,
  showPlaceholderSelect = true,
}: PlaceholderInputProps) {
  const [open, setOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null)

  const insertPlaceholder = useCallback((placeholder: string) => {
    const input = inputRef.current
    if (!input) return

    const start = (input as HTMLInputElement).selectionStart ?? input.value.length
    const end = (input as HTMLInputElement).selectionEnd ?? start
    const currentValue = value ?? input.value ?? ''

    // Insert placeholder at cursor position
    const newValue =
      currentValue.substring(0, start) +
      placeholder +
      currentValue.substring(end)

    // Update value via onChange if provided
    if (onValueChange) {
      onValueChange(newValue)
    } else {
      // Direct update via input element
      input.value = newValue
      // Trigger change event
      const event = new Event('input', { bubbles: true })
      input.dispatchEvent(event)
    }

    // Set cursor position after inserted placeholder
    setTimeout(() => {
      const newPosition = start + placeholder.length
      if (input.setSelectionRange) {
        input.setSelectionRange(newPosition, newPosition)
        input.focus()
      }
    }, 0)

    // Close popover
    setOpen(false)
  }, [value, onValueChange])

  // Merge refs callback
  const setRefs = useCallback((node: HTMLInputElement | HTMLTextAreaElement | null) => {
    inputRef.current = node
    // Preserve original ref if it exists
    const originalRef = (children as any).ref
    if (typeof originalRef === 'function') {
      originalRef(node)
    } else if (originalRef && typeof originalRef === 'object') {
      originalRef.current = node
    }
  }, [children])

  // Clone the child element and add ref and props
  const childWithRef = cloneElement(children, {
    ref: setRefs,
    value: value ?? children.props.value ?? '',
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      if (onValueChange) {
        onValueChange(e.target.value)
      }
      // Call original onChange if it exists
      if (children.props.onChange) {
        children.props.onChange(e)
      }
    },
  } as any)

  if (!showPlaceholderSelect) {
    return childWithRef
  }

  return (
    <div className="flex gap-2">
      <div className="flex-1">
        {childWithRef}
      </div>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="shrink-0"
          >
            <Code className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[300px] p-0 z-[999999]" align="end" sideOffset={4}>
          <div className="p-2">
            <div className="px-2 py-1.5 text-sm font-semibold">
              {__("insertPlaceholder")}
            </div>
          </div>
          <div className="max-h-[300px] overflow-y-auto">
            {placeholders.map((placeholder, index) => (
              <button
                key={`${placeholder.value}-${index}`}
                type="button"
                onClick={() => {
                  insertPlaceholder(placeholder.value)
                }}
                className="w-full px-4 py-2 text-left hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none"
              >
                <div className="font-medium">{placeholder.label}</div>
                {placeholder.description && (
                  <div className="text-xs text-muted-foreground">
                    {placeholder.value}
                  </div>
                )}
              </button>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}

