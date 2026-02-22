# Launch Checklist

## Domain (gutenform.de)

1. In Vercel: Projekt mit diesem Repo verbinden (documentation/ als Root oder Monorepo-Subpath).
2. Domain hinzufügen: Vercel Dashboard → Settings → Domains → `gutenform.de` und `www.gutenform.de`.
3. DNS bei deinem Provider: CNAME für `www` auf `cname.vercel-dns.com`; A-Record für Root auf Vercel-IPs (wie in Vercel angezeigt).
4. Environment Variables in Vercel für Production setzen (siehe `.env.example`).

## Supabase

1. SQL-Schema ausführen: `supabase/schema.sql` im Supabase SQL Editor.
2. Ersten Admin anlegen: In `profiles` die Zeile deines Users auf `role = 'admin'` setzen.
3. Optional: pgsodium Key für Lizenz-Verschlüsselung anlegen und `licenses.key_id` nutzen.

## Lemon Squeezy

1. Webhook in Lemon Squeezy anlegen: URL `https://gutenform.de/api/webhooks/lemon-squeezy`, Signing Secret in Vercel als `LEMONSQUEEZY_WEBHOOK_SECRET`.
2. Custom Data: Bei Checkout `user_id` (Supabase User UUID) mitgeben, damit Credits und Lizenzen zugeordnet werden.

## Nach dem Launch

- Smoke-Tests: Registrieren, Login, Key generieren, Dashboard, Admin (als Admin).
- E2E mit `npm run test:e2e` (lokal mit laufendem Dev-Server).
