import { atom } from "nanostores";

export interface InboxFilters {
  mailbox_id: number;
  status: string;
  search: string;
  form_identifier: string;
  labels: number[]; 
  is_read: number | undefined;
  page: number;
  per_page: number;
}

export const $inboxFilters = atom<InboxFilters>({
  mailbox_id: 1,
  status: 'inbox',
  search: '',
  form_identifier: '',
  labels: [],
  is_read: undefined,
  page: 1,
  per_page: 10,
});

export const setInboxFilters = (data: Partial<InboxFilters>) => {
  const current = $inboxFilters.get();
  $inboxFilters.set({
    ...current,
    ...data,
  });
}

export const useInboxFilters = () => {
  const { useStore } = require('@nanostores/react');
  return useStore($inboxFilters);
}