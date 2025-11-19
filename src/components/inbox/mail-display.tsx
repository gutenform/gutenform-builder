import format from "date-fns/format"
import {
  Archive,
  ArchiveX,
  MoreVertical,
  Trash2,
} from "lucide-react"

import {
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { EntryLabel, useEntryLabels, useUpdateEntry, Entry } from "@/hooks"
import { useProviderByType } from "@/hooks/useProviders"
import { useEffect, useMemo } from "react"

export interface Mail {
  id: number;
  name: string;
  status: string;
  email: string;
  subject: string;
  text: string;
  date: string;
  read: boolean;
  labels: EntryLabel[];
  entry?: Entry; // Full entry object for body rendering
}

interface MailDisplayProps {
  mail: Mail | null
}

// Helper function to format all fields as HTML table
function formatAllFields(data: Record<string, any>): string {
  if (!data || Object.keys(data).length === 0) {
    return '';
  }

  let rows = '';
  Object.entries(data).forEach(([key, value]) => {
    // Format value
    let formattedValue: string;
    if (Array.isArray(value)) {
      formattedValue = value.join(', ');
    } else if (typeof value === 'boolean') {
      formattedValue = value ? 'Yes' : 'No';
    } else {
      formattedValue = String(value || '');
    }

    // Escape HTML to prevent XSS
    const escapedKey = key.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
    const escapedValue = formattedValue.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');

    rows += `<tr class="border-b border-gray-200"><td class="px-2.5 py-1.5 font-semibold text-left">${escapedKey}</td><td class="px-2.5 py-1.5 text-left">${escapedValue}</td></tr>`;
  });

  const table = `<table class="border-collapse w-full bg-gray-50 border border-gray-200 font-sans text-sm my-2.5"><thead><tr class="bg-gray-100"><th class="px-2.5 py-2 text-left border-b-2 border-gray-200">Field</th><th class="px-2.5 py-2 text-left border-b-2 border-gray-200">Value</th></tr></thead><tbody>${rows}</tbody></table>`;

  console.log(table);
  return table;
}

export function MailDisplay({ mail }: MailDisplayProps) {
  const {updateEntry} = useUpdateEntry();
  const {labels, refetch: refetchLabels} = useEntryLabels();
  const { provider: databaseProvider } = useProviderByType('database');
  
  // Render body with placeholders replaced
  const renderedBody = useMemo(() => {
    console.log('renderedBody', databaseProvider);
    if (!mail?.entry || !databaseProvider) {
      return mail?.text || '';
    }

    const bodyTemplate = databaseProvider.settings?.body || '{all_fields}';
    const submissionData = mail.entry.data || {};
    const formIdentifier = mail.entry.form_identifier || '';

    // Replace placeholders
    let rendered = bodyTemplate;

    // Replace field placeholders {field_name}
    Object.entries(submissionData).forEach(([key, value]) => {
      const placeholder = `{${key}}`;
      const replacement = Array.isArray(value) ? value.join(', ') : String(value || '');
      rendered = rendered.replace(new RegExp(placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), replacement);
    });

    // Replace standard placeholders
    const replacements: Record<string, string> = {
      '{form_identifier}': formIdentifier,
      '{form_title}': formIdentifier || 'Form',
      '{site_name}': window.location.hostname,
      '{date}': new Date(mail.entry.date_created).toLocaleDateString(),
      '{time}': new Date(mail.entry.date_created).toLocaleTimeString(),
      '{ip_address}': mail.entry.ip_address || '',
      '{all_fields}': formatAllFields(submissionData),
    };

    Object.entries(replacements).forEach(([placeholder, replacement]) => {
      rendered = rendered.replace(new RegExp(placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), replacement);
    });

    // Convert newlines to <br> tags for proper HTML rendering (but preserve table HTML)
    // Only convert newlines that are not part of HTML tags
    rendered = rendered.replace(/\n(?!<)/g, '<br>');


    return rendered;
  }, [JSON.stringify(mail?.entry), JSON.stringify(databaseProvider)]);
  //set as read when mail is rendered (small delay to avoid flickering)
  useEffect(() => {
    if (!mail || mail.read) return;
    setTimeout(() => {
      updateEntry({
        id: mail.id,
        is_read: true,
      });
    }, 100);
  }, [mail]);

  useEffect(() => {
    refetchLabels();
  }, [mail?.id]);

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center p-2">
        <div className="flex items-center gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant={mail?.status === 'archive' ? 'default' : 'ghost'} size="icon" disabled={!mail} onClick={() => {
                if(!mail) return;
                updateEntry({
                  id: mail.id,
                  status: mail?.status === 'archive' ? 'inbox' : 'archive',
                });
              }}>
                <Archive className="h-4 w-4" />
                <span className="sr-only">Archive</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">Archive</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant={mail?.status === 'junk' ? 'default' : 'ghost'} size="icon" disabled={!mail} onClick={() => {
                if(!mail) return;
                updateEntry({
                  id: mail.id,
                  status: mail?.status === 'junk' ? 'inbox' : 'junk',
                });
              }}>
                <ArchiveX className="h-4 w-4" />
                <span className="sr-only">Move to junk</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">Move to junk</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant={mail?.status === 'trash' ? 'default' : 'ghost'} size="icon" disabled={!mail} onClick={() => {
                if(!mail) return;
                updateEntry({
                  id: mail.id,
                  status: mail?.status === 'trash' ? 'inbox' : 'trash',
                });
              }}>
                <Trash2 className="h-4 w-4" />
                <span className="sr-only">Move to trash</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">Move to trash</TooltipContent>
          </Tooltip>
          <Separator orientation="vertical" className="mx-1 h-6" />
        </div>
        <div className="ml-auto flex items-center gap-2">
          
        </div>
        <Separator orientation="vertical" className="mx-2 h-6" />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" disabled={!mail}>
              <span className="text-xs">Labels</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {labels.map((label) => (
              <DropdownMenuItem 
              key={label.id}
              className={mail?.labels?.includes(label.id) ? 'bg-accent' : ''}
              onClick={() => {
                if(!mail) return;
                const labelIds = mail.labels.map((l) => l.id);
                if(labelIds.includes(label.id)) {
                  labelIds.splice(labelIds.indexOf(label.id), 1);
                } else {
                  labelIds.push(label.id);
                }
                updateEntry({
                  id: mail.id,
                  labels: labelIds as number[],
                });
              }}
              >{label.name}</DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" disabled={!mail}>
              <MoreVertical className="h-4 w-4" />
              <span className="sr-only">More</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => {
              if(!mail) return;
              updateEntry({
                id: mail.id,
                is_read: !mail.read,
              });
            }}>{mail?.read ? 'Mark as unread' : 'Mark as read'}</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <Separator />
      {mail ? (
        <div className="flex flex-1 flex-col">
          <div className="flex items-start p-4">
            <div className="flex items-start gap-4 text-sm">
              <Avatar>
                <AvatarImage alt={mail.name} />
                <AvatarFallback>
                  {mail.name
                    .split(" ")
                    .map((chunk) => chunk[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div className="grid gap-1">
                <div className="font-semibold">{mail.name}</div>
                <div className="line-clamp-1 text-xs">{mail.subject}</div>
                <div className="line-clamp-1 text-xs">
                  <span className="font-medium">Reply-To:</span> {mail.email}
                </div>
              </div>
            </div>
            {mail.date && (
              <div className="ml-auto text-xs text-muted-foreground">
                {format(new Date(mail.date), "PPpp")}
              </div>
            )}
          </div>
          <Separator />
          <div 
            className="flex-1 p-4 text-sm prose prose-sm max-w-none dark:prose-invert"
            dangerouslySetInnerHTML={{ __html: renderedBody }}
          />
          <Separator className="mt-auto" />
          <div className="p-4">
            <form>
              <div className="grid gap-4">
                <Textarea
                  className="p-4"
                  placeholder={`Reply ${mail.name}...`}
                />
                <div className="flex items-center">
                  <Label
                    htmlFor="mute"
                    className="flex items-center gap-2 text-xs font-normal"
                  >
                    <Switch id="mute" aria-label="Mute thread" /> Mute this
                    thread
                  </Label>
                  <Button
                    onClick={(e) => e.preventDefault()}
                    size="sm"
                    className="ml-auto"
                  >
                    Send
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      ) : (
        <div className="p-8 text-center text-muted-foreground">
          No message selected
        </div>
      )}
    </div>
  )
}