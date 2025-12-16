import { MailComp } from "@/components/inbox/mail"
import { StatusCount, useEntries, useEntryLabels, useFormIdentifiers, useStatuses, useBulkEntryOperations, useMarkEntryRead, useDeleteEntry, useUpdateEntry } from "@/hooks";
import { File, Inbox, ArchiveX, Trash2, Archive } from "lucide-react";
import { useStore } from "@nanostores/react";
import { $inboxFilters, setInboxFilters } from "./stores";
import { NavLink } from "@/components/inbox/nav";
import { useEffect } from "react";
import { __ } from "@/lib/i18n";
import { toast } from "sonner"

const getStatusCount = (statuses: StatusCount[], status: string = 'new') => {
  return statuses.find((s) => s.status === status)?.count || 0;
}

export default function MailPage() {
  const filter = useStore($inboxFilters);
  const { entries, refetch: refetchEntries } = useEntries();
  const { formIdentifiers, refetch: refetchFormIdentifiers } = useFormIdentifiers();
  const {statuses, refetch: refetchStatuses} = useStatuses(); 
  const { labels, refetch: refetchLabels } = useEntryLabels();
  const { bulkDelete, bulkMove, loading: bulkLoading } = useBulkEntryOperations();
  const { markRead } = useMarkEntryRead();
  const { deleteEntry } = useDeleteEntry();
  const { updateEntry: updateEntryFn } = useUpdateEntry();

  //refresh every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      refetchEntries();
      refetchFormIdentifiers();
      refetchStatuses();
      refetchLabels();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  /* @ts-ignore */
  const makeDataToReadableString = (data) => {
    if (typeof data !== 'object') {
      return data?.toString() || __('noData');
    }
    return Object.entries(data || {}).map(([key, value]) => {
      return `${key.charAt(0).toUpperCase() + key.slice(1)}: ${value}`;
    }).join('\n') || __('noData');
  }

  const entriesListing = entries?.map((entry) => {
    return {
      date: entry.date_created,
      read: entry.is_read,
      labels: entry.labels || [],
      id: entry.id,
      name: entry.data?.name || '',
      email: entry.from_mail || entry.data?.email || '',
      subject: entry.subject || entry.data?.subject || '',
      status: entry.status || 'inbox',
      text: makeDataToReadableString(entry.data),
      entry: entry, // Pass full entry for body rendering
    }
  }) || [];

  const additionalNavLinks: NavLink[] = formIdentifiers?.map((formIdentifier) => {
    return {
      title: formIdentifier.form_identifier,
      label: formIdentifier.count.toString(),
      variant: filter.form_identifier === formIdentifier.form_identifier ? "default" : "ghost",
      onClick: () => {
        if(filter.form_identifier === formIdentifier.form_identifier) {
          setInboxFilters({ form_identifier: '' });
        } else {
          setInboxFilters({ form_identifier: formIdentifier.form_identifier });
        }
      },
    }
  }) || [];

  const setStatus = (nextStatus: string) => {
    if(filter.status === nextStatus) {
      setInboxFilters({ status: 'inbox' });
    } else {
      setInboxFilters({ status: nextStatus });
    }
  }

  const handleDropOnStatus = async (entryId: number, status: string) => {
    try {
      await updateEntryFn({ id: entryId, status })
      toast({
        title: __('entryMoved'),
        description: __('entryMovedDescription'),
      })
      refetchEntries()
    } catch (err: any) {
      toast({
        title: __('error'),
        description: err.message || __('errorOccurred'),
        variant: 'destructive',
      })
    }
  }

  const handleDropOnLabel = async (entryId: number, labelId: number) => {
    try {
      await apiPost('entry-labels/attach', { entry_id: entryId, label_id: labelId })
      toast({
        title: __('labelAdded'),
        description: __('labelAddedDescription'),
      })
      refetchEntries()
    } catch (err: any) {
      toast({
        title: __('error'),
        description: err.message || __('errorOccurred'),
        variant: 'destructive',
      })
    }
  }

  const defaultNavLinks: NavLink[] = [
    {
      title: __('inbox'),
      label: getStatusCount(statuses, 'inbox').toString(),
      icon: Inbox,
      variant: filter.status === 'inbox' ? "default" : "ghost",
      onClick: () => {
        setInboxFilters({ labels: [], is_read: undefined, status: 'inbox' });
      },
      onDrop: (entryId) => handleDropOnStatus(entryId, 'inbox'),
      dropType: 'status',
      dropValue: 'inbox',
    },
    {
      title: __('junk'),
      label: getStatusCount(statuses, 'junk').toString(),
      icon: ArchiveX,
      variant: filter.status === 'junk' ? "default" : "ghost",
      onClick: () => {
        setStatus('junk');
      },
      onDrop: (entryId) => handleDropOnStatus(entryId, 'junk'),
      dropType: 'status',
      dropValue: 'junk',
    },
    {
      title: __('archive'),
      label: getStatusCount(statuses, 'archive').toString(),
      icon: Archive,
      variant: filter.status === 'archive' ? "default" : "ghost",
      onClick: () => {
        setStatus('archive');
      },
      onDrop: (entryId) => handleDropOnStatus(entryId, 'archive'),
      dropType: 'status',
      dropValue: 'archive',
    },
    {
      title: __('trash'),
      label: getStatusCount(statuses, 'trash').toString(),
      icon: Trash2,
      variant: filter.status === 'trash' ? "default" : "ghost",
      onClick: () => {
        setStatus('trash');
      },
      onDrop: (entryId) => handleDropOnStatus(entryId, 'trash'),
      dropType: 'status',
      dropValue: 'trash',
    },
  ]

  // @ts-expect-error - icon is a function that returns a React element
  const labelNavLinks: NavLink[] = labels.map((label) => {
    return {
      title: label.name,
      icon: () => <span style={{ backgroundColor: label.color }} className="w-2 h-2 rounded-full mr-2" />,
      variant: filter.labels.includes(label.id) ? "default" : "ghost",
      onClick: () => {
        if(filter.labels.includes(label.id)) {
          setInboxFilters({ labels: filter.labels.filter((l) => l !== label.id) });
        } else {
          setInboxFilters({ labels: [...filter.labels, label.id] });
        }
      },
      onDrop: (entryId) => handleDropOnLabel(entryId, label.id),
      dropType: 'label',
      dropValue: label.id,
    }
  })

  return (
    <>
     
      <div className="hidden dark:bg-gray-900 flex-col md:flex h-full">
        <MailComp
          defaultNavLinks={defaultNavLinks}
          additionalNavLinks={additionalNavLinks}
          labelNavLinks={labelNavLinks}
          mails={entriesListing}
          defaultLayout={[265, 440, 655]}
          defaultCollapsed={false}
          navCollapsedSize={4}
          onBulkDelete={async (ids) => {
            try {
              await bulkDelete(ids)
              toast({
                title: __('entriesDeleted'),
                description: __('entriesDeletedDescription'),
              })
              refetchEntries()
            } catch (err: any) {
              toast({
                title: __('error'),
                description: err.message || __('errorOccurred'),
                variant: 'destructive',
              })
            }
          }}
          onBulkMove={async (ids, status) => {
            try {
              await bulkMove(ids, status)
              toast({
                title: __('entriesMoved'),
                description: __('entriesMovedDescription'),
              })
              refetchEntries()
            } catch (err: any) {
              toast({
                title: __('error'),
                description: err.message || __('errorOccurred'),
                variant: 'destructive',
              })
            }
          }}
          onMarkRead={async (id, read) => {
            try {
              await markRead(id, read)
              toast({
                title: __('entryUpdated'),
                description: read ? __('entryMarkedAsRead') : __('entryMarkedAsUnread'),
              })
              refetchEntries()
            } catch (err: any) {
              toast({
                title: __('error'),
                description: err.message || __('errorOccurred'),
                variant: 'destructive',
              })
            }
          }}
          onDelete={async (id) => {
            try {
              await deleteEntry(id)
              toast({
                title: __('entryDeleted'),
                description: __('entryDeletedDescription'),
              })
              refetchEntries()
            } catch (err: any) {
              toast({
                title: __('error'),
                description: err.message || __('errorOccurred'),
                variant: 'destructive',
              })
            }
          }}
          onMoveTo={async (id, status) => {
            try {
              await updateEntryFn({ id, status })
              toast({
                title: __('entryMoved'),
                description: __('entryMovedDescription'),
              })
              refetchEntries()
            } catch (err: any) {
              toast({
                title: __('error'),
                description: err.message || __('errorOccurred'),
                variant: 'destructive',
              })
            }
          }}
          onEmptyTrash={refetchEntries}
        />
      </div>
    </>
  )
}