"use client"

import { Button } from "@/components/ui/button"
import { Trash2, Archive, Tag } from "lucide-react"
import { __ } from "@/lib/i18n"

interface BulkActionsProps {
  selectedCount: number
  onDelete: () => void
  onMove?: (status: string) => void
  onAddLabel?: () => void
}

export function BulkActions({ selectedCount, onDelete, onMove, onAddLabel }: BulkActionsProps) {
  if (selectedCount === 0) {
    return null
  }

  return (
    <div className="flex items-center gap-2 px-4 py-2 border-b bg-muted/50">
      <span className="text-sm text-muted-foreground">
        {selectedCount} {selectedCount === 1 ? __('selected') : __('selectedPlural')}
      </span>
      <div className="ml-auto flex items-center gap-2">
        {onAddLabel && (
          <Button
            variant="outline"
            size="sm"
            onClick={onAddLabel}
          >
            <Tag className="h-4 w-4 mr-2" />
            {__('addLabel')}
          </Button>
        )}
        {onMove && (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onMove('archive')}
            >
              <Archive className="h-4 w-4 mr-2" />
              {__('moveToArchive')}
            </Button>
          </>
        )}
        <Button
          variant="destructive"
          size="sm"
          onClick={onDelete}
        >
          <Trash2 className="h-4 w-4 mr-2" />
          {__('delete')}
        </Button>
      </div>
    </div>
  )
}

