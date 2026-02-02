"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { cleanForSlug } from "@wordpress/url"
import { __ } from "@/lib/i18n"
import { Plus } from "lucide-react"

interface CustomFieldInputProps {
  onFieldAdd: (fieldName: string) => void
}

export function CustomFieldInput({ onFieldAdd }: CustomFieldInputProps) {
  const [fieldLabel, setFieldLabel] = useState("")

  const handleSlugify = (label: string): string => {
    if (!label) return ""
    return cleanForSlug(label) || label.toLowerCase().replace(/[^a-z0-9_]/g, "_")
  }

  const slugifiedName = handleSlugify(fieldLabel)

  const handleAdd = () => {
    if (!fieldLabel.trim() || !slugifiedName) {
      return
    }

    onFieldAdd(`{${slugifiedName}}`)
    setFieldLabel("")
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && fieldLabel.trim() && slugifiedName) {
      e.preventDefault()
      handleAdd()
    }
  }

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    if (!slugifiedName) return
    e.dataTransfer.setData("text/plain", `{${slugifiedName}}`)
    e.dataTransfer.effectAllowed = "copy"
  }

  return (
    <div className="space-y-2">
      <Label>{__("fieldLabel") || "Field Label"}</Label>
      <Input
        type="text"
        value={fieldLabel}
        onChange={(e) => setFieldLabel(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={__("fieldLabel") || "Field Label"}
        className="text-sm"
      />
      {slugifiedName && (
        <div className="text-xs text-muted-foreground">
          <span className="font-medium">{__("fieldNamePreview") || "Field Name"}:</span>{" "}
          <code className="px-1 py-0.5 bg-muted rounded">{`{${slugifiedName}}`}</code>
        </div>
      )}
      <div className="flex gap-2">
        <Button
          type="button"
          onClick={handleAdd}
          disabled={!fieldLabel.trim() || !slugifiedName}
          size="sm"
          className="flex-1"
        >
          <Plus className="h-4 w-4 mr-2" />
          {__("addCustomField") || "Add Field"}
        </Button>
        {slugifiedName && (
          <div
            draggable
            onDragStart={handleDragStart}
            className="flex items-center justify-center px-3 py-2 border rounded-md cursor-grab hover:bg-accent text-sm"
            title={__("dragToInsert") || "Drag to insert"}
          >
            <span className="text-muted-foreground">⋮⋮</span>
          </div>
        )}
      </div>
    </div>
  )
}

