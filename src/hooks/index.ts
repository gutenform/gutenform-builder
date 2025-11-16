/**
 * Hooks index - Export all hooks from a single entry point
 */

// Entries hooks
export {
  useEntries,
  useEntry,
  useCreateEntry,
  useUpdateEntry,
  useDeleteEntry,
  useMarkEntryRead,
  useFormIdentifiers,
  useStatuses,
  type Entry,
  type EntryFilters,
  type CreateEntryData,
  type UpdateEntryData,
  type FormIdentifierCount,
  type StatusCount,
} from './useEntries';

// Mailboxes hooks
export {
  useMailboxes,
  useMailbox,
  useCreateMailbox,
  useUpdateMailbox,
  useDeleteMailbox,
  type Mailbox,
  type MailboxFilters,
  type CreateMailboxData,
  type UpdateMailboxData,
} from './useMailboxes';

// Providers hooks
export {
  useProviders,
  useProvider,
  useProviderByType,
  useCreateProvider,
  useUpdateProvider,
  useDeleteProvider,
  type Provider,
  type ProviderFilters,
  type CreateProviderData,
  type UpdateProviderData,
} from './useProviders';

// Entry Labels hooks
export {
  useEntryLabels,
  useEntryLabel,
  useCreateEntryLabel,
  useUpdateEntryLabel,
  useDeleteEntryLabel,
  useAttachLabel,
  useDetachLabel,
  type EntryLabel,
  type CreateEntryLabelData,
  type UpdateEntryLabelData,
  type AttachLabelData,
} from './useEntryLabels';

