"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { __ } from "@/lib/i18n"

interface EmailFieldProps {
  value?: string
  onChange: (value: string) => void
  placeholder?: string
  required?: boolean
}

const EMAIL_PLACEHOLDERS = [
  { value: '{form_primary_mail}', label: 'Primary Mail', description: 'Primary email from form' },
]

export function EmailField({
  value = '',
  onChange,
  placeholder,
  required,
}: EmailFieldProps) {
  const [usePlaceholder, setUsePlaceholder] = useState(() => {
    // Check if current value is a placeholder
    return EMAIL_PLACEHOLDERS.some(p => value === p.value) || value.startsWith('{') && value.endsWith('}')
  })

  const handleModeChange = (checked: boolean) => {
    setUsePlaceholder(checked)
    if (checked && !EMAIL_PLACEHOLDERS.some(p => value === p.value)) {
      // Set default placeholder when switching to placeholder mode
      onChange(EMAIL_PLACEHOLDERS[0].value)
    } else if (!checked) {
      // Clear value when switching to free text
      onChange('')
    }
  }

  const handlePlaceholderChange = (placeholderValue: string) => {
    onChange(placeholderValue)
  }

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value)
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label className="text-sm text-muted-foreground">
          {__("usePlaceholder")}
        </Label>
        <Switch
          checked={usePlaceholder}
          onCheckedChange={handleModeChange}
        />
      </div>
      
      {usePlaceholder ? (
        <Select
          value={value}
          onValueChange={handlePlaceholderChange}
        >
          <SelectTrigger>
            <SelectValue placeholder={__("selectPlaceholder")} />
          </SelectTrigger>
          <SelectContent className="!z-[100000]">
            {EMAIL_PLACEHOLDERS.map((placeholder) => (
              <SelectItem key={placeholder.value} value={placeholder.value}>
                <div>
                  <div className="font-medium">{placeholder.label}</div>
                  <div className="text-xs text-muted-foreground">
                    {placeholder.value}
                  </div>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : (
        <Input
          type="email"
          value={value}
          onChange={handleTextChange}
          placeholder={placeholder}
          required={required}
        />
      )}
    </div>
  )
}

