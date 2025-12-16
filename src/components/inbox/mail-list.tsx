import { useState } from "react"
import formatDistanceToNow from "date-fns/formatDistanceToNow"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Checkbox } from "@/components/ui/checkbox"
import { BulkActions } from "@/components/inbox/bulk-actions"
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu"

import { useMail } from "@/admin/pages/inbox/use-mail"
import { Mail as MailType } from "@/components/inbox/mail-display"
import { __ } from "@/lib/i18n"

interface MailListProps {
  items: MailType[]
  onBulkDelete?: (ids: number[]) => void
  onBulkMove?: (ids: number[], status: string) => void
  onMarkRead?: (id: number, read: boolean) => void
  onDelete?: (id: number) => void
  onMoveTo?: (id: number, status: string) => void
}

export function MailList({ items, onBulkDelete, onBulkMove, onMarkRead, onDelete, onMoveTo }: MailListProps) {
  const [mail, setMail] = useMail()
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())
  const [draggedItem, setDraggedItem] = useState<MailType | null>(null)

  const handleSelectAll = () => {
    if (selectedIds.size === items.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(items.map(item => item.id)))
    }
  }

  const handleSelectItem = (id: number) => {
    const newSelected = new Set(selectedIds)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedIds(newSelected)
  }

  const handleBulkDelete = () => {
    if (onBulkDelete && selectedIds.size > 0) {
      onBulkDelete(Array.from(selectedIds))
      setSelectedIds(new Set())
    }
  }

  const handleBulkMove = (status: string) => {
    if (onBulkMove && selectedIds.size > 0) {
      onBulkMove(Array.from(selectedIds), status)
      setSelectedIds(new Set())
    }
  }

  const handleDragStart = (e: React.DragEvent, item: MailType) => {
    setDraggedItem(item)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragEnd = () => {
    setDraggedItem(null)
  }

  return (
    <>
      <BulkActions
        selectedCount={selectedIds.size}
        onDelete={handleBulkDelete}
        onMove={handleBulkMove}
      />
      <ScrollArea className="h-screen">
        <div className="flex flex-col gap-2 p-4 pt-0">
          {items.length > 0 && (
            <div className="flex items-center gap-2 p-2 border-b">
              <Checkbox
                checked={selectedIds.size === items.length && items.length > 0}
                onCheckedChange={handleSelectAll}
              />
              <span className="text-sm text-muted-foreground">
                {__('selectAll')}
              </span>
            </div>
          )}
          {items.map((item) => (
            <MailItem
              key={item.id}
              item={item}
              mail={mail}
              isSelected={mail.selected === item.id.toString()}
              isChecked={selectedIds.has(item.id)}
              onSelect={() => handleSelectItem(item.id)}
              setMail={setMail}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              onMarkRead={onMarkRead}
              onDelete={onDelete}
              onMoveTo={onMoveTo}
            />
          ))}
        </div>
      </ScrollArea>
    </>
  )
}

const MailItem = ({ item, mail, isSelected, isChecked, onSelect, setMail, onDragStart, onDragEnd, onMarkRead, onDelete, onMoveTo }: { 
  item: MailType
  mail: MailType
  isSelected: boolean
  isChecked: boolean
  onSelect: () => void
  setMail: (mail: MailType) => void
  onDragStart?: (e: React.DragEvent, item: MailType) => void
  onDragEnd?: (e: React.DragEvent) => void
  onMarkRead?: (id: number, read: boolean) => void
  onDelete?: (id: number) => void
  onMoveTo?: (id: number, status: string) => void
}) => {
  //fix the date to be in the correct timezone
  const date = new Date(item.date);
  date.setHours(date.getHours() + 1);
  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <div
          key={item.id}
          className={cn(
            "flex items-start gap-2 rounded-lg border p-3 text-left text-sm transition-all hover:bg-accent",
            isSelected && "bg-muted"
          )}
          draggable
          onDragStart={(e) => {
            if (onDragStart) {
              onDragStart(e, item)
            }
            e.dataTransfer.effectAllowed = 'move'
            e.dataTransfer.setData('text/plain', item.id.toString())
          }}
          onDragEnd={(e) => {
            if (onDragEnd) {
              onDragEnd(e)
            }
          }}
        >
      <Checkbox
        checked={isChecked}
        onCheckedChange={onSelect}
        onClick={(e) => e.stopPropagation()}
        className="mt-1"
      />
      <button
        className="flex-1 flex flex-col items-start gap-2 text-left"
        onClick={() =>
          setMail({
            ...mail,
            selected: item.id,
          })
        }
      >
      <div className="flex w-full flex-col gap-1">
        <div className="flex items-center">
          <div className="flex items-center gap-2">
            <div className="font-semibold">{item.name}</div>
            {!item.read && (
              <span className="flex h-2 w-2 rounded-full bg-blue-600" />
            )}
          </div>
          <div
            className={cn(
              "ml-auto text-xs",
              isSelected
                ? "text-foreground"
                : "text-muted-foreground"
            )}
          >
            {formatDistanceToNow(date, {
              addSuffix: true,
            })}
          </div>
        </div>
        <div className="text-xs font-medium">{item.subject}</div>
      </div>
      <div className="line-clamp-2 text-xs text-muted-foreground">
        {item.text.substring(0, 300)}
      </div>
      {item.labels.length ? (
        <div className="flex items-center gap-2">
          {item.labels.map((label) => (
            <Badge key={label.id} variant="default" style={{ backgroundColor: label.color }}>
              {label.name}
            </Badge>
          ))}
        </div>
      ) : null}
      </button>
      </div>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem onClick={() => onMarkRead && onMarkRead(item.id, !item.read)}>
          {item.read ? __('markAsUnread') : __('markAsRead')}
        </ContextMenuItem>
        <ContextMenuItem onClick={() => onMoveTo && onMoveTo(item.id, 'archive')}>
          {__('moveToArchive')}
        </ContextMenuItem>
        <ContextMenuItem onClick={() => onMoveTo && onMoveTo(item.id, 'trash')}>
          {__('moveToTrash')}
        </ContextMenuItem>
        <ContextMenuItem 
          onClick={() => onDelete && onDelete(item.id)}
          className="text-destructive focus:text-destructive"
        >
          {__('delete')}
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  )
}