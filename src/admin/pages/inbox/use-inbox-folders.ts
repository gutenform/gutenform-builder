import { useState, useCallback, useEffect } from "react"
import { apiGet, apiPost, ApiResponse } from "@/lib/api"
import { useStore } from "@nanostores/react"
import { $inboxFilters } from "./stores"

export interface InboxFolderItem {
  id: number
  mailbox_id: number
  parent_id: number | null
  name: string
  sort_order: number
  date_created: string
  entries_count?: number
  children?: InboxFolderItem[]
}

function buildFolderTree(flat: InboxFolderItem[]): InboxFolderItem[] {
  const byId = new Map<number, InboxFolderItem>()
  flat.forEach((f) => {
    byId.set(f.id, { ...f, children: [] })
  })
  const roots: InboxFolderItem[] = []
  flat.forEach((f) => {
    const node = byId.get(f.id)!
    if (f.parent_id == null) {
      roots.push(node)
    } else {
      const parent = byId.get(f.parent_id)
      if (parent) {
        parent.children = parent.children || []
        parent.children.push(node)
      } else {
        roots.push(node)
      }
    }
  })
  const sort = (list: InboxFolderItem[]) => {
    list.sort((a, b) => a.sort_order - b.sort_order || a.id - b.id)
    list.forEach((n) => n.children?.length && sort(n.children))
  }
  sort(roots)
  return roots
}

export function useInboxFolders() {
  const filter = useStore($inboxFilters)
  const mailboxId = filter.mailbox_id
  const [foldersFlat, setFoldersFlat] = useState<InboxFolderItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchFolders = useCallback(async () => {
    const requestedMailboxId = mailboxId
    if (!requestedMailboxId || requestedMailboxId <= 0) {
      setFoldersFlat([])
      setLoading(false)
      return
    }
    try {
      setLoading(true)
      setError(null)
      const response = await apiGet<ApiResponse<InboxFolderItem[]>>(
        `inbox-folders/get?mailbox_id=${requestedMailboxId}`
      )
      // Only apply result if still viewing this mailbox (avoid wrong folders on reload when URL sync runs after first fetch)
      if ($inboxFilters.get().mailbox_id !== requestedMailboxId) {
        return
      }
      if (response.success && response.data) {
        setFoldersFlat(response.data)
      } else {
        throw new Error(response.message || "Failed to fetch folders")
      }
    } catch (err) {
      if ($inboxFilters.get().mailbox_id !== requestedMailboxId) return
      setError(err instanceof Error ? err : new Error("Unknown error"))
      setFoldersFlat([])
    } finally {
      if ($inboxFilters.get().mailbox_id === requestedMailboxId) {
        setLoading(false)
      }
    }
  }, [mailboxId])

  useEffect(() => {
    fetchFolders()
  }, [fetchFolders])

  const foldersTree = buildFolderTree(foldersFlat)

  const createFolder = useCallback(
    async (params: { name: string; parent_id?: number | null; sort_order?: number }) => {
      const response = await apiPost<ApiResponse<InboxFolderItem>>("inbox-folders/create", {
        mailbox_id: mailboxId,
        name: params.name,
        parent_id: params.parent_id ?? null,
        sort_order: params.sort_order ?? 0,
      })
      if (!response.success || !response.data) {
        throw new Error(response.message || "Failed to create folder")
      }
      await fetchFolders()
      return response.data
    },
    [mailboxId, fetchFolders]
  )

  const updateFolder = useCallback(
    async (params: { id: number; name?: string; parent_id?: number | null; sort_order?: number }) => {
      const body: Record<string, unknown> = { id: params.id }
      if (params.name !== undefined) body.name = params.name
      if (params.parent_id !== undefined) body.parent_id = params.parent_id
      if (params.sort_order !== undefined) body.sort_order = params.sort_order
      const response = await apiPost<ApiResponse<InboxFolderItem>>("inbox-folders/update", body)
      if (!response.success || !response.data) {
        throw new Error(response.message || "Failed to update folder")
      }
      await fetchFolders()
      return response.data
    },
    [fetchFolders]
  )

  const deleteFolder = useCallback(
    async (id: number) => {
      const response = await apiPost<ApiResponse>("inbox-folders/delete", { id })
      if (!response.success) {
        throw new Error(response.message || "Failed to delete folder")
      }
      await fetchFolders()
    },
    [fetchFolders]
  )

  return {
    foldersFlat,
    foldersTree,
    loading,
    error,
    refetch: fetchFolders,
    createFolder,
    updateFolder,
    deleteFolder,
  }
}
