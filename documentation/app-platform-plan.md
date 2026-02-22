# Projektplan: Gutenform Platform (Web App)

**Version:** 1.0
**Tech Stack:** Next.js 14 (App Router), Supabase (Auth, DB, Edge Functions, Vault), Vercel Hosting, Lemon Squeezy (Payments), OpenAI.

Dieser Plan beschreibt die Architektur der Web-Plattform, die als Marketing-Seite, Kunden-Dashboard und Admin-Interface fungiert.

### Domain & Anbindung des Plugins

Die Plattform läuft unter **einer festen Domain**. Das **WordPress-Plugin (Gutenform)** spricht ausschließlich mit dieser Plattform, sobald es um Lizenz, Credits, KI oder Marktplatz geht.

| Umgebung | Domain |
|----------|--------|
| **Produktion** | `https://gutenform.de` |
| **Entwicklung** | `https://gutenform.vercel.app` |

- Alle API-Endpoints (Lizenz-Status, KI-Generierung, Marktplatz, etc.) sind unter dieser Domain erreichbar.
- Das Plugin nutzt diese Basis-URL fest (Prod/Dev-Umschaltung), keine freie Eingabe einer anderen API-URL. Siehe auch `planned_features/ai-marketplace-plugin-extension.md`.

---

## 1. Architektur & Routing (Monorepo)

Wir nutzen **Next.js Route Groups**, um Marketing, App und Admin logisch zu trennen, aber in einer Codebase zu halten.

### Ordner-Struktur (`src/app`)

```text
src/app/
├── layout.tsx                  # Root Layout (Providers: Auth, Toast, Theme)
├── not-found.tsx               # Globale 404 Seite
├── api/                        # Next.js API Routes (falls nötig, sonst Edge Functions)
│
├── (marketing)/                # PUBLIC: Landingpage & Infos
│   ├── layout.tsx              # Marketing Navbar & Footer
│   ├── page.tsx                # Homepage (Hero, Features, CTA)
│   ├── pricing/page.tsx        # Preistabelle (Daten aus DB/Lemon Squeezy)
│   ├── features/page.tsx       # Detailseiten
│   ├── impressum/page.tsx      # Impressum
│   ├── datenschutz/page.tsx    # Datenschutzerklärung
│   └── docs/                   # (Existierende Doku-Integration)
│       └── api/page.tsx        # API-Dokumentation für Plugin-Entwickler
│
├── (dashboard)/                # USER: Geschützter Kundenbereich
│   ├── layout.tsx              # App Shell (Sidebar, Auth Guard)
│   ├── app/                    # URL: deinedomain.com/app
│   │   ├── page.tsx            # Dashboard Übersicht (Credits, Status)
│   │   ├── keys/page.tsx       # Lizenzschlüssel Verwaltung
│   │   ├── billing/page.tsx    # Rechnungen & Top-Ups
│   │   ├── shop/page.tsx       # Add-on Browser
│   │   ├── usage/page.tsx      # Nutzungshistorie (letzte AI-Anfragen, Credit-Verbrauch)
│   │   └── account/page.tsx    # Datenexport, Account löschen (DSGVO)
│
└── (admin)/                    # ADMIN: Verwaltung (Role: 'admin')
    ├── layout.tsx              # Admin Shell (Roter Header, Admin Guard)
    ├── admin/                  # URL: deinedomain.com/admin
        ├── page.tsx            # KPIs & Übersicht
        ├── users/page.tsx      # User Management (Bans, Gifts)
        ├── credits/page.tsx    # Credit-Usage Listen & Statistiken
        ├── payments/page.tsx   # Payments/Revenue Listen & Statistiken
        ├── audit/page.tsx      # Audit-Log (Wer hat wann was gemacht?)
        ├── prompts/page.tsx    # AI Master Prompt Editor
        ├── blocks/page.tsx     # Block Definitions Database
        └── webhooks/page.tsx   # Webhook-Status, Retry, manueller Sync (Lemon Squeezy)

```

---

## 2. Environment Variables & Security

Diese Variablen werden in **Vercel** (Production) und `.env.local` (Development) gespeichert.

| Variable | Beschreibung | Ort |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | API URL der Supabase Instanz. | Public |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Client Key für Browser-Zugriffe. | Public |
| `SUPABASE_SERVICE_ROLE_KEY` | **Secret:** Admin-Rechte für Edge Functions & Build Scripts. | Vercel Env |
| `OPENAI_API_KEY` | **Secret:** Key für GPT-4o Zugriff. | Vercel Env |
| `LEMONSQUEEZY_API_KEY` | **Secret:** Für Backend-Calls an LS. | Vercel Env |
| `LEMONSQUEEZY_WEBHOOK_SECRET` | **Secret:** Zur Signatur-Prüfung von Webhooks. | Vercel Env |
| `LEMONSQUEEZY_STORE_ID` | ID des Stores. | Vercel Env |
| `RESEND_API_KEY` oder `SENDGRID_API_KEY` | **Secret:** E-Mail-Versand für Benachrichtigungen. | Vercel Env |

---

## 3. Datenbank Schema (Supabase SQL)

Führe dieses Skript im Supabase SQL Editor aus. Es aktiviert Verschlüsselung (`pgsodium`) und setzt die Rollenrechte (RLS).

```sql
-- 1. Extensions & Enums
create extension if not exists pgsodium; -- Verschlüsselung für Lizenz-Keys
create extension if not exists vector;   -- (Optional) Für RAG später
create type user_role as enum ('user', 'admin');
create type license_status as enum ('active', 'expired', 'banned');
create type plan_tier as enum ('free', 'starter', 'pro', 'agency');

-- 2. Profiles (User Daten)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  role user_role default 'user',
  lemon_squeezy_customer_id text,
  full_name text,
  created_at timestamptz default now()
);

-- 3. Licenses (Verschlüsselt gespeichert!)
create table public.licenses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id),
  
  -- Security Columns (pgsodium)
  key_prefix text, -- Die ersten 4 Zeichen (sichtbar)
  encrypted_key text not null, -- Der eigentliche Key
  key_id uuid not null references pgsodium.key(id),
  associated_data text, -- Nonce/Auth Data
  
  status license_status default 'active',
  tier plan_tier default 'free',
  credits_balance int default 0,
  credits_monthly_limit int default 500,
  activation_limit int default 1,
  current_activations int default 0,
  expires_at timestamptz
);

-- 4. Marketplace & Products
create table public.marketplace_items (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  description text,
  version text default '1.0.0',
  download_path text, -- Pfad im privaten Storage Bucket
  price_cents int default 0,
  required_tier plan_tier default 'free',
  is_active boolean default true
);

create table public.entitlements (
  id uuid primary key default gen_random_uuid(),
  license_id uuid references public.licenses(id),
  item_id uuid references public.marketplace_items(id),
  purchased_at timestamptz default now()
);

-- 5. AI Configuration (Admin Controlled)
create table public.system_prompts (
  id uuid primary key default gen_random_uuid(),
  name text not null, -- "generator_v1"
  prompt_text text not null,
  is_active boolean default false,
  created_at timestamptz default now()
);

create table public.block_definitions (
  id uuid primary key default gen_random_uuid(),
  block_slug text unique not null, -- "core/paragraph"
  description text, 
  attributes_schema jsonb, -- { "align": "string" }
  updated_at timestamptz default now()
);

-- 6. Logs & Audit
create table public.credit_logs (
  id uuid primary key default gen_random_uuid(),
  license_id uuid references public.licenses(id),
  amount int not null, 
  action text, 
  metadata jsonb,
  created_at timestamptz default now()
);

-- Audit-Log: Admin-Aktionen, Key-Generierung, Credit-Gifts, Lizenz-Geschenke
create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.profiles(id),
  action text not null,  -- 'key_generate', 'credit_gift', 'license_gift', 'credit_campaign', 'user_ban', ...
  target_type text,     -- 'user', 'license', 'entitlement'
  target_id text,
  metadata jsonb,
  created_at timestamptz default now()
);

-- Webhook-Verarbeitung: Fehlgeschlagene/Retry für Lemon Squeezy
create table public.webhook_events (
  id uuid primary key default gen_random_uuid(),
  source text not null,  -- 'lemon_squeezy'
  event_id text,
  payload jsonb,
  status text default 'pending',  -- 'pending', 'processed', 'failed', 'retry'
  error_message text,
  processed_at timestamptz,
  created_at timestamptz default now()
);

-- 7. RLS Policies (Security)
alter table profiles enable row level security;
alter table licenses enable row level security;
alter table system_prompts enable row level security;
alter table audit_logs enable row level security;
alter table webhook_events enable row level security;

-- Policy Beispiele:
-- Users sehen nur ihr Profil
create policy "Users view own profile" on profiles for select using (auth.uid() = id);
-- Admins sehen alles (Beispiel für system_prompts)
create policy "Admins manage prompts" on system_prompts for all 
using (auth.uid() in (select id from profiles where role = 'admin'));
-- Nur Admins: Audit-Log und Webhook-Events lesen/verwalten
create policy "Admins manage audit_logs" on audit_logs for all 
using (auth.uid() in (select id from profiles where role = 'admin'));
create policy "Admins manage webhook_events" on webhook_events for all 
using (auth.uid() in (select id from profiles where role = 'admin'));

```

---

## 4. API Spezifikation (Edge Functions)

Diese Funktionen liegen in `/supabase/functions`. Sie bilden das Backend für das Plugin und die App.

### A. `POST /v1/ai/generate` (Core Feature)

* **Zweck:** Nimmt User Prompt entgegen und liefert Block-JSON zurück.
* **Header:** `x-license-key`
* **Rate Limiting:** Pro Lizenz/Key Limits (z. B. Requests/Minute, Token/Tag) in Edge Function prüfen; bei Überschreitung 429 zurückgeben.
* **Workflow:**
1. Rate-Limit-Check (z. B. pro Key: X Requests/Minute).
2. Validiert Lizenz (Entschlüsselung on-the-fly).
3. Lädt **aktiven System Prompt** aus DB (`system_prompts`).
4. Lädt **Block Definitionen** aus DB (`block_definitions`).
5. Kombiniert alles und sendet Request an OpenAI (`OPENAI_API_KEY` aus Env).
6. Berechnet Token-Kosten & Update Credits in DB.
7. Optional: Eintrag für User-Nutzungshistorie (für Dashboard „Letzte AI-Anfragen“).



### B. `POST /v1/license/generate` (Internal)

* **Zweck:** Erstellt neuen Key für User im Dashboard.
* **Workflow:** Generiert Random String -> Verschlüsselt mit `pgsodium` -> Speichert in DB -> Eintrag in `audit_logs` (action `key_generate`) -> Gibt Raw Key **einmalig** zurück.

### C. `POST /v1/market/install` (Plugin Downloader)

* **Zweck:** Sichere URL für Add-ons generieren.
* **Workflow:** Checkt `entitlements` -> Generiert Signed URL für Supabase Storage (5 Min).

### D. `POST /webhooks/lemon-squeezy` (Payments)

* **Zweck:** Sync zwischen Geld und DB.
* **Robustheit:** Bei Fehler Event in `webhook_events` speichern (Status `failed`/`retry`), Retry-Logik (Cron/Edge Function) oder Dead-Letter; Admin kann in `/admin/webhooks` fehlgeschlagene Events sehen und manuell „Sync“ auslösen.
* **Workflow:**
  1. Signatur prüfen (`LEMONSQUEEZY_WEBHOOK_SECRET`).
  2. Event in `webhook_events` als `pending` anlegen (Idempotenz über `event_id`).
  3. `order_created` -> Credits aufladen; `subscription_created` -> Lizenz Status auf `active` / Tier Update.
  4. Bei Erfolg Status `processed`, bei Fehler `failed` + `error_message`; Retry-Job kann später erneut verarbeiten.

### E. Admin-only: Credits & Lizenzen verschenken (Internal)

* **Gift Credits (einzelne Nutzer):** Bereits in Users: „Gift Credits“ pro User (Betrag eingeben → `credit_logs` + Balance-Update, Eintrag in `audit_logs`).
* **Gift Credits (Aktion / an alle):** Z. B. Weihnachtsaktion: Admin wählt „Credits an alle User“ oder „an alle mit Tier X“, Betrag, optional Enddatum. Edge Function oder API Route erhöht alle betroffenen Lizenzen + schreibt `credit_logs` + `audit_logs` (action z. B. `credit_campaign`).
* **Gift License (bestimmte Nutzer):** Bestimmten Nutzern eine Lizenz „schenken“, z. B. alle Pro-Addons freischalten. Umsetzung: Für User/Lizenz Einträge in `entitlements` für die gewünschten `marketplace_items` anlegen (oder temporären Tier-Upgrade / „gifted_tier“). Eintrag in `audit_logs` (action `license_gift`).

### F. Benachrichtigungen (E-Mails)

* **Kanal:** Supabase Edge Function (Cron oder nach Webhook/DB-Trigger) + Resend oder SendGrid (`RESEND_API_KEY` / `SENDGRID_API_KEY`).
* **Anlässe:** Niedriger Credit-Stand (z. B. unter X %), bevorstehendes Abo-Ende, Bestätigung nach Zahlungseingang. E-Mail-Templates und Logik in Edge Function(s).

---

## 5. Frontend Features (Next.js Pages)

### Marketing Area `(marketing)`

* **Home:** Hero Section ("Formulare bauen mit KI"), Feature Grid, Testimonials.
* **Pricing:** 3 Spalten (Free, Pro, Agency). Daten dynamisch oder hardcoded. Buttons führen zum Login/Register.
* **Impressum (`/impressum`), Datenschutz (`/datenschutz`):** Rechtlich erforderliche Seiten (Marketing-Footer verlinkt).
* **Docs:** Integration der Dokumentation (MDX).
* **API-Dokumentation (`/docs/api`):** Öffentlich oder nach Login. Doku für Plugin-Entwickler: Endpoints (`/v1/ai/generate`, `/v1/license/generate`, …), Header (`x-license-key`), Beispiele, Rate-Limits, Fehlercodes.

### User Dashboard `(dashboard)`

* **Auth Guard:** Middleware prüft Session.
* **Home (`/app`):**
* "Willkommen, [Name]".
* Großes Chart: Credits verbraucht / Limit.
* Quick Actions: "Key kopieren", "Doku lesen".


* **Keys (`/app/keys`):**
* Anzeige des aktiven Lizenz-Prefix (`sk_...829a`).
* Button: "Neuen Key generieren" (Warnung: Alter Key wird ungültig).
* Liste der verbundenen Domains.


* **Billing (`/app/billing`):**
  * Iframe/Link zum Lemon Squeezy Customer Portal.
  * Kauf-History der One-Time-Packs.
* **Usage (`/app/usage`):** Nutzungshistorie für den User: „Letzte AI-Anfragen“ (falls geloggt), Credit-Verbrauch pro Tag/Woche (aus `credit_logs`), damit Nutzer eigenen Usage nachvollziehen können.
* **Account (`/app/account`):** DSGVO: Datenexport (Profil, Lizenzen, Logs als Download), Option „Account löschen“ (mit Bestätigung; löscht Profil/Lizenzen oder anonymisiert je nach Policy).



### Admin Dashboard `(admin)`

* **Role Guard:** Middleware + Layout Check (`role === 'admin'`).
* **Users (`/admin/users`):** Tabelle aller User. Actions: Ban, **Gift Credits** (einzelner User), **Gift License** (bestimmten Nutzern z. B. alle Pro-Addons freischalten via `entitlements`), View Logs. Optional: **Credits-Aktion** (z. B. Weihnachtsaktion: Credits an ausgewählte User oder „an alle“ / alle mit Tier X) – führt zu Credit-Gutschrift + Eintrag in `audit_logs`.
* **Credits (`/admin/credits`):** Listen & Statistiken zum Credit-Usage:
  * Aggregierte Nutzung (gesamt, pro Tag/Woche/Monat).
  * Liste der letzten Credit-Transaktionen (`credit_logs`), filterbar nach User/Lizenz.
  * Top-Nutzer, Verbrauch pro Tier.
* **Payments (`/admin/payments`):** Listen & Statistiken zu Zahlungen:
  * Revenue-Übersicht (MRR, One-Time, Zeiträume).
  * Liste Orders/Subscriptions (aus DB oder Lemon Squeezy API), Status, Beträge.
  * Optional: Export (CSV) für Buchhaltung.
* **Audit (`/admin/audit`):** Zentrale Ansicht „Wer hat wann was gemacht?“ – Liste aus `audit_logs`: Admin-Aktionen, Key-Generierung, Credit-Gifts, Lizenz-Geschenke, Credit-Aktionen (z. B. Weihnachtsaktion). Filterbar nach Aktion, User, Datum.
* **Webhooks (`/admin/webhooks`):** Status der Lemon-Squeezy-Webhook-Verarbeitung: Liste fehlgeschlagener/retry Events aus `webhook_events`, manueller „Sync“-Button zum erneuten Verarbeiten.
* **Prompts (`/admin/prompts`):**
  * Textarea für den System-Prompt.
  * Versionierung (Dropdown alter Versionen).
  * "Test Run" Button (Simuliert Request ohne Kosten).
* **Blocks (`/admin/blocks`):**
  * JSON-Editor, um das Schema der Blöcke anzupassen, die die KI kennt.
  * Ermöglicht Updates der KI-Logik ohne Plugin-Update.



---

## 6. Implementierungs-Roadmap

### Phase 1: Setup & Database (Woche 1)

* [ ] Next.js Projekt init & Vercel Deploy.
* [ ] Supabase Projekt erstellen & Env Vars setzen.
* [ ] SQL Schema ausführen (inkl. `pgsodium`).
* [ ] Admin User manuell in DB setzen (`role = 'admin'`).

### Phase 2: Marketing & Auth (Woche 2)

* [ ] Landingpage bauen (Shadcn UI Landing Page Components).
* [ ] Supabase Auth Integration (Login/Signup Pages).
* [ ] Route Groups & Layouts einrichten (Marketing vs. App Trennung).

### Phase 3: Dashboard Logic (Woche 3)

* [ ] **Billing:** Lemon Squeezy Webhook Handler schreiben & testen.
* [ ] **Keys:** API Endpoint `/license/generate` bauen & UI verbinden.
* [ ] **Credits:** Anzeige der Balance im Dashboard.

### Phase 4: Admin & AI Core (Woche 4)

* [ ] Admin Route Protection bauen.
* [ ] Admin-Übersicht & Listen: Credits (`/admin/credits`), Payments (`/admin/payments`) mit Statistiken und Tabellen.
* [ ] Prompt-Editor Page bauen (CRUD auf `system_prompts`).
* [ ] Edge Function `/v1/ai/generate` implementieren (Verbindung DB -> OpenAI).

### Phase 5: Compliance, Doku & Gifts (Woche 5)

* [ ] **DSGVO / Rechtliches:** Impressum, Datenschutz (Marketing). Account-Seite: Datenexport, Account löschen.
* [ ] **API-Dokumentation:** Seite `/docs/api` mit Endpoints, Headern, Beispielen, Rate-Limits.
* [ ] **Gift-Funktionen:** Gift Credits (einzelner User + Aktion „an alle“/nach Tier). Gift License: bestimmten Nutzern Addons/Pro freischalten; alles in `audit_logs` protokollieren.
* [ ] **Audit-Log:** Tabelle `audit_logs`, Schreibungen bei Key-Generierung, Credit-Gift, Lizenz-Gift, Aktionen; Admin-Seite `/admin/audit`.

### Phase 6: Robustheit & Benachrichtigungen (Woche 6)

* [ ] **Rate Limiting:** In Edge Function `/v1/ai/generate` (und ggf. andere) pro Key/Lizenz Limits prüfen (429 bei Überschreitung).
* [ ] **Webhook-Robustheit:** `webhook_events` befüllen bei Lemon-Squeezy-Webhooks; Retry-Logik oder Cron; Admin-Seite `/admin/webhooks` mit manuellem Sync.
* [ ] **Benachrichtigungen:** Edge Function(s) + Resend/SendGrid: E-Mails bei niedrigem Credit-Stand, bevorstehendem Abo-Ende, nach Zahlungseingang.
* [ ] **User-Nutzungshistorie:** Dashboard `/app/usage` mit „Letzte AI-Anfragen“ (falls geloggt) und Credit-Verbrauch pro Tag/Woche.

### Phase 7: Polish & Launch

* [ ] SEO Optimierung (Metadata).
* [ ] End-to-End Test: Registrieren -> Kaufen -> Key generieren -> AI Request -> Gifts -> Audit.
* [ ] Domain aufschalten.