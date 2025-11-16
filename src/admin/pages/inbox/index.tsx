import { MailComp } from "@/components/inbox/mail"
import { StatusCount, useEntries, useEntryLabels, useFormIdentifiers, useStatuses } from "@/hooks";
import { File, Inbox, ArchiveX, Trash2, Archive } from "lucide-react";
import { useStore } from "@nanostores/react";
import { $inboxFilters, setInboxFilters } from "./stores";
import { NavLink } from "@/components/inbox/nav";

const getStatusCount = (statuses: StatusCount[], status: string = 'new') => {
  return statuses.find((s) => s.status === status)?.count || 0;
}

export default function MailPage() {
  const filter = useStore($inboxFilters);
  const { entries, loading, error, total } = useEntries(filter);
  const { formIdentifiers } = useFormIdentifiers();
  const {statuses} = useStatuses(); 
  const { labels } = useEntryLabels();

  console.log(labels);

  /* @ts-ignore */
  const makeDataToReadableString = (data) => {
    if (typeof data !== 'object') {
      return data?.toString() || 'No data';
    }
    return Object.entries(data || {}).map(([key, value]) => {
      return `${key.charAt(0).toUpperCase() + key.slice(1)}: ${value}`;
    }).join('\n') || 'No data';
  }

  const entriesListing = entries?.map((entry) => {
    return {
      date: new Date(entry.date_created).toDateString(),
      read: entry.is_read,
      labels: entry.labels?.map((label) => label.name) || [],
      id: entry.id.toString(),
      name: entry.data?.name || '',
      email: entry.data?.email || '',
      subject: entry.data?.subject || '',
      text: makeDataToReadableString(entry.data),
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

  const defaultNavLinks: NavLink[] = [
    {
      title: "Inbox",
      label: getStatusCount(statuses, 'inbox').toString(),
      icon: Inbox,
      variant: filter.status === 'inbox' ? "default" : "ghost",
      onClick: () => {
        setInboxFilters({ labels: [], is_read: undefined, status: 'inbox' });
      },
    },
    {
      title: "Drafts",
      label: getStatusCount(statuses, 'draft').toString(),
      icon: File,
      variant: filter.status === 'draft' ? "default" : "ghost",
      onClick: () => {
        setStatus('draft');
      },
    },
    {
      title: "Junk",
      label: getStatusCount(statuses, 'junk').toString(),
      icon: ArchiveX,
      variant: filter.status === 'junk' ? "default" : "ghost",
      onClick: () => {
        setStatus('junk');
      },
    },
    {
      title: "Trash",
      label: getStatusCount(statuses, 'trash').toString(),
      icon: Trash2,
      variant: filter.status === 'trash' ? "default" : "ghost",
      onClick: () => {
        setStatus('trash');
      },
    },
    {
      title: "Archive",
      label: getStatusCount(statuses, 'archive').toString(),
      icon: Archive,
      variant: filter.status === 'archive' ? "default" : "ghost",
      onClick: () => {
        setStatus('archive');
      },
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
    }
  })

  return (
    <>
     
      <div className="hidden dark:bg-gray-900 flex-col md:flex">
        {loading && <div>Loading...</div>}
        {error && <div dangerouslySetInnerHTML={{ __html: error.message }} />}
        <MailComp
          defaultNavLinks={defaultNavLinks}
          additionalNavLinks={additionalNavLinks}
          labelNavLinks={labelNavLinks}
          mails={entriesListing}
          defaultLayout={[265, 440, 655]}
          defaultCollapsed={false}
          navCollapsedSize={4}
        />
      </div>
    </>
  )
}