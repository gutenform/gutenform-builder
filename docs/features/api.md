# API Routes

Gutenform exposes a REST API under the `gutenform/v1` namespace. All routes require authentication (WordPress nonce) for admin operations.

## Posts

- `GET /posts/get` - List posts
- `GET /posts/get/{id}` - Get single post

## Database

- `POST /database/seed-demo` - Seed demo data
- `GET /database/check-demo-data` - Check if demo data exists
- `POST /database/remove` - Remove demo data

## Entries

- `POST /entries/create` - Create entry
- `GET /entries/get` - List entries (supports filters: mailbox_id, form_identifier, is_read, labels, status, search, page, per_page)
- `GET /entries/get/{id}` - Get single entry
- `GET /entries/form-identifiers` - Get form identifiers with counts
- `GET /entries/statuses` - Get status counts
- `POST /entries/update` - Update entry
- `POST /entries/delete` - Delete entry
- `POST /entries/mark-read` - Mark entry as read/unread
- `POST /entries/empty-trash` - Permanently delete trashed entries

## Mailboxes

- `POST /mailboxes/create` - Create mailbox
- `GET /mailboxes/get` - List mailboxes
- `GET /mailboxes/get/{id}` - Get single mailbox
- `POST /mailboxes/update` - Update mailbox
- `POST /mailboxes/delete` - Delete mailbox

## Providers

- `POST /providers/create` - Create provider
- `GET /providers/get` - List providers
- `GET /providers/get/{id}` - Get single provider
- `GET /providers/get-by-type/{provider_type}` - Get providers by type
- `GET /providers/types` - Get available provider types
- `POST /providers/update` - Update provider
- `POST /providers/delete` - Delete provider

## Entry Labels

- `POST /entry-labels/create` - Create label
- `GET /entry-labels/get` - List labels
- `GET /entry-labels/get/{id}` - Get single label
- `POST /entry-labels/update` - Update label
- `POST /entry-labels/delete` - Delete label
- `POST /entry-labels/attach` - Attach label to entry
- `POST /entry-labels/detach` - Detach label from entry

## Submissions

- `POST /submit` - Public endpoint for form submission (used by frontend forms)

## File Upload

- `POST /upload` - Upload file
- `POST /upload-from-url` - Upload from URL

## Settings

- `GET /settings/smtp` - Get SMTP settings
- `POST /settings/smtp` - Save SMTP settings
- `POST /settings/smtp/test` - Test SMTP connection
- `GET /settings/debug` - Get debug status
- `POST /settings/debug` - Update debug status
- `GET /settings/skip-first-steps` - Get skip first steps preference
- `POST /settings/skip-first-steps` - Update skip first steps preference
- `GET /settings/charts-visible` - Get charts visibility preference
- `POST /settings/charts-visible` - Update charts visibility preference

## Email Logs

- `GET /email-logs/get` - List email logs
- `GET /email-logs/get/{id}` - Get single email log
- `POST /email-logs/delete` - Delete email log
- `POST /email-logs/delete-all` - Delete all email logs

## Email Templates

- `GET /email-templates` - List available templates
- `GET /email-templates/{name}` - Get template by name
- `POST /email-templates/preview` - Preview template with data
