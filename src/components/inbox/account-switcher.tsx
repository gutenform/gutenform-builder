"use client"

import { cn } from "@/lib/utils"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useStore } from "@nanostores/react"
import { setInboxFilters, $inboxFilters } from "@/admin/pages/inbox/stores"
import { useMailboxes } from "@/hooks"
import { Inbox, LucideIcon } from "lucide-react"

interface AccountSwitcherProps {
  isCollapsed: boolean
}

export function AccountSwitcher({
  isCollapsed,
}: AccountSwitcherProps) {
  const { mailboxes } = useMailboxes();
  const filter = useStore($inboxFilters);
  const selectedAccount = filter.mailbox_id.toString();

  const setSelectedAccount = (id: string) => {
    setInboxFilters({ mailbox_id: parseInt(id) });
  }
  const accounts = mailboxes?.map((mailbox) => {
    return {
      id: mailbox.id.toString(),
      label: mailbox.title,
      icon: Inbox,
    } as {
      id: string
      label: string
      icon?: LucideIcon
    }
  }) || [];

  if (accounts.length === 0) {
    return null;
  }

  return (
    <Select value={selectedAccount} onValueChange={setSelectedAccount}>
      <SelectTrigger
        className={cn(
          "flex items-center gap-2 [&>span]:line-clamp-1 [&>span]:flex [&>span]:w-full [&>span]:items-center [&>span]:gap-1 [&>span]:truncate [&_svg]:h-4 [&_svg]:w-4 [&_svg]:shrink-0",
          isCollapsed &&
            "flex h-9 w-9 shrink-0 items-center justify-center p-0 [&>span]:w-auto [&>svg]:hidden"
        )}
        aria-label="Select account"
      >
        <SelectValue placeholder="Select an account" />
      </SelectTrigger>
      <SelectContent>
        {accounts.map((account) => (
          <SelectItem key={account.id} value={account.id}>
            <div className="flex items-center gap-3 [&_svg]:h-4 [&_svg]:w-4 [&_svg]:shrink-0 [&_svg]:text-foreground">
              {account.icon && <account.icon />}
              {account.label as string}
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}