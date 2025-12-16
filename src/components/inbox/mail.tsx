"use client"
import * as React from "react"
import {
  Search,
  LucideIcon,
} from "lucide-react"

import { AccountSwitcher } from "@/components/inbox/account-switcher"
import { MailDisplay } from "@/components/inbox/mail-display"
import { MailList } from "@/components/inbox/mail-list"
import { Nav } from "@/components/inbox/nav"
import { Mail as MailType } from "@/components/inbox/mail-display"
import { useMail } from "@/admin/pages/inbox/use-mail"
import { cn } from "@/lib/utils"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { TooltipProvider } from "@/components/ui/tooltip"
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable"
import { setInboxFilters } from "@/admin/pages/inbox/stores"
import { useStore } from "@nanostores/react"
import { $inboxFilters } from "@/admin/pages/inbox/stores"
import { Trash2 } from "lucide-react"
import { useState } from "react"
import { apiPost } from "@/lib/api"
import { __ } from "@/lib/i18n"
import { toast } from "sonner"
type NavLink = {
  title: string
  label?: string
  icon?: React.ReactNode | LucideIcon
  variant: "default" | "ghost"
  onClick: () => void
}
interface MailProps {
  mails: MailType[]
  defaultNavLinks: NavLink[]
  additionalNavLinks: NavLink[]
  labelNavLinks: NavLink[]
  defaultLayout: number[] | undefined
  defaultCollapsed?: boolean
  navCollapsedSize: number
  onBulkDelete?: (ids: number[]) => void
  onBulkMove?: (ids: number[], status: string) => void
  onMarkRead?: (id: number, read: boolean) => void
  onDelete?: (id: number) => void
  onMoveTo?: (id: number, status: string) => void
  onEmptyTrash?: () => void
}

export function MailComp({
  mails,
  defaultNavLinks = [],  
  additionalNavLinks = [],
  labelNavLinks = [],
  defaultLayout = [265, 440, 655],
  defaultCollapsed = false,
  navCollapsedSize,
  onBulkDelete,
  onBulkMove,
  onMarkRead,
  onDelete,
  onMoveTo,
  onEmptyTrash,
}: MailProps) {
  const [isCollapsed, setIsCollapsed] = React.useState(defaultCollapsed)
  const [mail] = useMail()
  const filter = useStore($inboxFilters)
  const [showEmptyTrashDialog, setShowEmptyTrashDialog] = useState(false)
  const [emptying, setEmptying] = useState(false)

  return (
    <TooltipProvider delayDuration={0}>
      <ResizablePanelGroup
        direction="horizontal"
        onLayout={(sizes: number[]) => {
          document.cookie = `react-resizable-panels:layout=${JSON.stringify(
            sizes
          )}`
        }}
        className="h-full items-stretch"
      >
        <ResizablePanel
          defaultSize={defaultLayout[0]}
          collapsedSize={navCollapsedSize}
          collapsible={true}
          minSize={15}
          maxSize={20}
          onCollapse={(collapsed: boolean) => {
            setIsCollapsed(collapsed)
            document.cookie = `react-resizable-panels:collapsed=${JSON.stringify(
              collapsed
            )}`
          }}
          className={cn('h-full overflow-y-auto', isCollapsed && "min-w-[50px] transition-all duration-300 ease-in-out")}
        >
          <div className={cn("flex h-[52px] items-center justify-center", isCollapsed ? 'h-[52px]': 'px-2')}>
            <AccountSwitcher isCollapsed={isCollapsed} />
          </div>
          <Separator />
          <Nav
            isCollapsed={isCollapsed}
            links={defaultNavLinks}
          />
          <Separator />
          <Nav
            isCollapsed={isCollapsed}
            links={additionalNavLinks}
          />
          <Separator />
          <Nav
            isCollapsed={isCollapsed}
            links={labelNavLinks}
          />
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={defaultLayout[1]} minSize={30} className="h-full overflow-y-auto"
        >
          <Tabs defaultValue="all">
            <div className="flex items-center px-4 py-1.5">
              <h1 className="text-xl dark:text-white font-bold">Inbox</h1>
              <div className="ml-auto flex items-center gap-2">
                {filter.status === 'trash' && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setShowEmptyTrashDialog(true)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    {__('emptyTrash')}
                  </Button>
                )}
                <TabsList>
                  <TabsTrigger onClick={() => setInboxFilters({ is_read: undefined })} value="all" className="text-zinc-600 dark:text-zinc-200">All mail</TabsTrigger>
                  <TabsTrigger onClick={() => setInboxFilters({ is_read: 0 })} value="unread" className="text-zinc-600 dark:text-zinc-200">Unread</TabsTrigger>
                </TabsList>
              </div>
            </div>
            <Separator />
            <div className="bg-background/95 p-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
              <form>
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search" className="pl-8" />
                </div>
              </form>
            </div>
            <MailList 
              items={mails} 
              onBulkDelete={onBulkDelete}
              onBulkMove={onBulkMove}
              onMarkRead={onMarkRead}
              onDelete={onDelete}
              onMoveTo={onMoveTo}
            />
          </Tabs>
          
          <Dialog open={showEmptyTrashDialog} onOpenChange={setShowEmptyTrashDialog}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{__('emptyTrash')}</DialogTitle>
                <DialogDescription>
                  {__('emptyTrashConfirmation')}
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setShowEmptyTrashDialog(false)}
                  disabled={emptying}
                >
                  {__('cancel')}
                </Button>
                <Button
                  variant="destructive"
                  onClick={async () => {
                    try {
                      setEmptying(true)
                      await apiPost('/entries/empty-trash', {})
                      toast({
                        title: __('trashEmptied'),
                        description: __('trashEmptiedDescription'),
                      })
                      setShowEmptyTrashDialog(false)
                      if (onEmptyTrash) {
                        onEmptyTrash()
                      }
                    } catch (err: any) {
                      toast({
                        title: __('error'),
                        description: err.message || __('errorOccurred'),
                        variant: 'destructive',
                      })
                    } finally {
                      setEmptying(false)
                    }
                  }}
                  disabled={emptying}
                >
                  {emptying ? __('emptying') : __('emptyTrash')}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </ResizablePanel>
        <ResizableHandle className={""} withHandle />
        <ResizablePanel defaultSize={defaultLayout[2]}>
          <MailDisplay
            mail={mails.find((item) => item.id === mail.selected) || null}
          />
        </ResizablePanel>
      </ResizablePanelGroup>
    </TooltipProvider>
  )
}