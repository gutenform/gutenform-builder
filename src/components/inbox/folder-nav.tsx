"use client"

import * as React from "react"
import { ChevronRight, ChevronDown, Folder, FolderPlus } from "lucide-react"
import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { __ } from "@/lib/i18n"
import type { InboxFolderItem } from "@/admin/pages/inbox/use-inbox-folders"

interface FolderNavProps {
  foldersTree: InboxFolderItem[]
  activeFolderId: number | null
  isCollapsed: boolean
  onSelectFolder: (folderId: number | null) => void
  onCreateFolder: (params: { name: string; parent_id?: number | null }) => Promise<InboxFolderItem>
  onUpdateFolder: (params: { id: number; name?: string; parent_id?: number | null }) => Promise<InboxFolderItem>
  onDeleteFolder: (id: number) => Promise<void>
  onDropEntry?: (entryId: number, folderId: number) => void
}

export function FolderNav({
  foldersTree,
  activeFolderId,
  isCollapsed,
  onSelectFolder,
  onCreateFolder,
  onUpdateFolder,
  onDeleteFolder,
  onDropEntry,
}: FolderNavProps) {
  const [dragOverFolderId, setDragOverFolderId] = React.useState<number | null>(null)
  const [renameFolderId, setRenameFolderId] = React.useState<number | null>(null)
  const [renameValue, setRenameValue] = React.useState("")
  const [showCreateDialog, setShowCreateDialog] = React.useState(false)
  const [createParentId, setCreateParentId] = React.useState<number | null>(null)
  const [createValue, setCreateValue] = React.useState("")
  const [deletingId, setDeletingId] = React.useState<number | null>(null)
  const [confirmDeleteId, setConfirmDeleteId] = React.useState<number | null>(null)
  const [expandedIds, setExpandedIds] = React.useState<Set<number>>(() => new Set())
  const toggleExpanded = (id: number) => {
    setExpandedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const handleRenameSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (renameFolderId == null || !renameValue.trim()) return
    try {
      await onUpdateFolder({ id: renameFolderId, name: renameValue.trim() })
      setRenameFolderId(null)
      setRenameValue("")
    } catch {
      // caller/toast can show error
    }
  }

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!createValue.trim()) return
    try {
      await onCreateFolder({ name: createValue.trim(), parent_id: createParentId })
      setShowCreateDialog(false)
      setCreateValue("")
    } catch {
      // caller/toast can show error
    }
  }

  const handleDeleteConfirm = async () => {
    if (confirmDeleteId == null) return
    try {
      setDeletingId(confirmDeleteId)
      await onDeleteFolder(confirmDeleteId)
      if (activeFolderId === confirmDeleteId) {
        onSelectFolder(null)
      }
      setConfirmDeleteId(null)
    } catch {
      // caller/toast can show error
    } finally {
      setDeletingId(null)
    }
  }

  if (isCollapsed) {
    return (
      <div className="flex flex-col items-center py-2">
        <span className="text-muted-foreground text-xs" title={__("inboxFolders")}>
          {__("inboxFolders")}
        </span>
      </div>
    )
  }

  const handleFolderDragOver = (e: React.DragEvent, folderId: number) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
    setDragOverFolderId(folderId)
  }
  const handleFolderDragLeave = () => setDragOverFolderId(null)
  const handleFolderDrop = (e: React.DragEvent, folderId: number) => {
    e.preventDefault()
    setDragOverFolderId(null)
    const entryId = parseInt(e.dataTransfer.getData("text/plain"), 10)
    if (onDropEntry && !Number.isNaN(entryId)) {
      onDropEntry(entryId, folderId)
    }
  }

  const renderFolder = (folder: InboxFolderItem, depth: number) => {
    const hasChildren = folder.children && folder.children.length > 0
    const open = expandedIds.has(folder.id)
    const isActive = activeFolderId === folder.id
    const count = folder.entries_count ?? 0
    const isDragOver = dragOverFolderId === folder.id

    return (
      <div key={folder.id} className="flex flex-col gap-0.5">
        <ContextMenu>
          <ContextMenuTrigger asChild>
            <button
              type="button"
              onClick={() => onSelectFolder(folder.id)}
              onDragOver={onDropEntry ? (e) => handleFolderDragOver(e, folder.id) : undefined}
              onDragLeave={onDropEntry ? handleFolderDragLeave : undefined}
              onDrop={onDropEntry ? (e) => handleFolderDrop(e, folder.id) : undefined}
              className={cn(
                "flex w-full items-center gap-2 rounded-md px-3 py-1.5 text-left text-sm",
                "hover:bg-accent hover:text-accent-foreground",
                isActive &&
                  "bg-accent text-accent-foreground dark:bg-muted dark:text-white dark:hover:bg-muted dark:hover:text-white",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                isDragOver && "ring-2 ring-primary bg-accent"
              )}
              style={{ marginLeft: depth * 12 }}
            >
              {hasChildren ? (
                <button
                  type="button"
                  className="shrink-0 p-0 hover:bg-transparent"
                  onClick={(e) => {
                    e.stopPropagation()
                    toggleExpanded(folder.id)
                  }}
                  aria-label={open ? "Collapse" : "Expand"}
                >
                  {open ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </button>
              ) : null}
              <Folder className="h-4 w-4 shrink-0" />
              <span className="min-w-0 flex-1 truncate">{folder.name}</span>
              {count > 0 && (
                <span className="shrink-0 text-muted-foreground text-xs">{count}</span>
              )}
            </button>
          </ContextMenuTrigger>
          <ContextMenuContent>
            <ContextMenuItem
              onSelect={() => {
                setRenameFolderId(folder.id)
                setRenameValue(folder.name)
              }}
            >
              {__("renameFolder")}
            </ContextMenuItem>
            <ContextMenuItem
              onSelect={() => {
                setCreateParentId(folder.id)
                setCreateValue("")
                setShowCreateDialog(true)
              }}
            >
              {__("createSubfolder")}
            </ContextMenuItem>
            <ContextMenuItem
              className="text-destructive focus:text-destructive"
              onSelect={() => setConfirmDeleteId(folder.id)}
            >
              {__("deleteFolder")}
            </ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>
        {hasChildren && open && (
          <div className="flex flex-col">
            {folder.children!.map((child) => renderFolder(child, depth + 1))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-1 py-2 px-2">
      <div className="pl-3 text-xs font-medium text-muted-foreground">{__("inboxFolders")}</div>
      <nav className="grid gap-0.5">
        {foldersTree.map((folder) => renderFolder(folder, 0))}
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="mt-1 justify-start gap-2 px-3"
        onClick={() => {
          setCreateParentId(null)
          setCreateValue("")
          setShowCreateDialog(true)
        }}
      >
        <FolderPlus className="h-4 w-4" />
        {__("newFolder")}
      </Button>
      </nav>

      {/* Rename dialog */}
      <Dialog open={renameFolderId != null} onOpenChange={(open) => !open && setRenameFolderId(null)}>
        <DialogContent>
          <form onSubmit={handleRenameSubmit}>
            <DialogHeader>
              <DialogTitle>{__("renameFolder")}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="rename-folder-name">{__("folderName")}</Label>
                <Input
                  id="rename-folder-name"
                  value={renameValue}
                  onChange={(e) => setRenameValue(e.target.value)}
                  placeholder={__("folderName")}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setRenameFolderId(null)}>
                {__("cancel")}
              </Button>
              <Button type="submit" disabled={!renameValue.trim()}>
                {__("save")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Create folder dialog */}
      <Dialog open={showCreateDialog} onOpenChange={(open) => !open && setShowCreateDialog(false)}>
        <DialogContent>
          <form onSubmit={handleCreateSubmit}>
            <DialogHeader>
              <DialogTitle>{__("newFolder")}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="create-folder-name">{__("folderName")}</Label>
                <Input
                  id="create-folder-name"
                  value={createValue}
                  onChange={(e) => setCreateValue(e.target.value)}
                  placeholder={__("folderName")}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowCreateDialog(false)}>
                {__("cancel")}
              </Button>
              <Button type="submit" disabled={!createValue.trim()}>
                {__("create")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation dialog */}
      <Dialog open={confirmDeleteId != null} onOpenChange={(open) => !open && setConfirmDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{__("deleteFolder")}</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">{__("confirmDeleteFolder")}</p>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setConfirmDeleteId(null)}>
              {__("cancel")}
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={deletingId != null}
            >
              {deletingId != null ? __("loading") : __("delete")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
