# Inbox: Ordnerstruktur & einklappbare Bereiche

Dieses Dokument beschreibt das Feature **Inbox-Ordnerstruktur** sowie **einklappbare Bereiche** für Form-IDs und Labels in der Inbox-Seite.

---

## Phasen-Übersicht

| Phase | Inhalt | Reihenfolge |
|-------|--------|-------------|
| **Phase 1** | Einklappbare Bereiche: Form-IDs und Labels in der Sidebar einklappbar, Standard: eingeklappt | Zuerst |
| **Phase 2** | Datenbank & Backend: Ordner-Tabelle, API für Ordner-CRUD, Erweiterung Entries (folder_id) | Danach |
| **Phase 3** | UI: Ordner unter dem Bereich der Hauptpunkte anzeigen (ein Block), verschachtelte Ordner, Anlegen/Verwalten/Verschieben | Danach |
| **Phase 4** | Filter & Drag & Drop: Einträge nach Ordner filtern, per Drag & Drop in Ordner verschieben | Optional |

---

## 1. Übersicht

### Ziele

- **Einheitliche Ordnerliste:** Die Hauptpunkte (Posteingang, Spam, Archiv, Papierkorb) sind **programmatische System-Ordner** – sie sind immer da und werden nicht vom Nutzer angelegt. **Darunter**, in einem gemeinsamen Bereich, kommen die **nutzerdefinierten Ordner** (eine Liste/Baum, nicht pro Hauptpunkt getrennt). Ordner können verschachtelt sein (wie bei einem E-Mail-Client).
- **Einklappbare Bereiche:** Der Bereich „Form-IDs“ (Filter nach Formular) und der Bereich „Labels“ sind einklappbar; **Standard: eingeklappt**.

### Konzept: System-Ordner vs. Nutzerordner

- **Hauptpunkte (Posteingang, Spam, Archiv, Papierkorb)** sind **Ordner**, die immer programmatisch da sind – „System-Ordner“. Sie werden nicht vom Nutzer angelegt oder gelöscht; sie filtern nach `status` (inbox, junk, archive, trash).
- **Nutzerordner** sind **unter dem Bereich dieser Hauptpunkte** in **einem gemeinsamen Block** angeordnet (eine Liste/Baum), nicht getrennt pro Hauptpunkt. Ein Nutzerordner kann Einträge mit beliebigem Status enthalten; beim Klick auf einen Nutzerordner werden alle Einträge dieses Ordners angezeigt.

### Abhängigkeiten zur bestehenden Architektur

- **Inbox-Seite:** `src/admin/pages/inbox/index.tsx` – baut `defaultNavLinks` (Posteingang, Spam, Archiv, Papierkorb), `additionalNavLinks` (Form-IDs), `labelNavLinks` (Labels) und übergibt sie an `MailComp`.
- **Mail-Komponente:** `src/components/inbox/mail.tsx` – Sidebar mit `AccountSwitcher`, drei `Nav`-Blöcken (Hauptpunkte, Form-IDs, Labels) und Separatorn. Keine Einklapp-Logik pro Bereich, nur die gesamte Sidebar ist kollabierbar.
- **Stores:** `src/admin/pages/inbox/stores.ts` – `InboxFilters` mit `status`, `form_identifier`, `labels`, etc. Erweiterung um `folder_id` geplant.
- **Entries:** `wp_gutenform_entries` mit `status` (inbox, junk, archive, trash). Erweiterung um optionales `folder_id` für Zuordnung zu Benutzerordnern.
- **API:** `includes/Routes/Api.php`, Controller unter `includes/Controllers/`.

---

## 2. Phase 1: Einklappbare Bereiche (Form-IDs & Labels)

### 2.1 Anforderungen

- **Form-IDs-Bereich:** Einklappbar (z. B. Überschrift „Formulare“ oder „Nach Formular“ mit Chevron). **Standard: eingeklappt.**
- **Labels-Bereich:** Einklappbar (z. B. Überschrift „Labels“ mit Chevron). **Standard: eingeklappt.**
- Zustand (offen/zu) pro Bereich persistent (z. B. `localStorage` oder Cookie), damit die Einstellung beim nächsten Besuch erhalten bleibt.

### 2.2 Umsetzung

- **Neue UI-Bausteine in der Sidebar:** Statt zwei festen `Nav`-Blöcken für Form-IDs und Labels jeweils ein **Collapsible**-Block:
  - Sichtbare Kopfzeile mit Titel („Formulare“ / „Labels“) und Chevron-Icon.
  - Klick auf Kopfzeile klappt den Bereich auf/zu.
  - Inhalt: die bestehenden `Nav`-Links (Form-IDs bzw. Labels).
- **Props für MailComp:** Optional neue Props, z. B. `formIdsSectionCollapsed?: boolean`, `labelsSectionCollapsed?: boolean`, mit Default `true` (eingeklappt). Oder die Persistenz liegt komplett in `MailComp` (localStorage-Keys wie `gutenform-inbox-form-ids-collapsed`, `gutenform-inbox-labels-collapsed`).
- **i18n:** Neue Strings in `includes/Assets/Strings.php` für „Formulare“ (oder „Nach Formular“) und „Labels“, falls noch nicht vorhanden.

### 2.3 Betroffene Dateien

- `src/components/inbox/mail.tsx` – Sidebar-Struktur: Collapsible um die beiden unteren Nav-Blöcke, Persistenz für eingeklappt/aufgeklappt.
- `src/components/ui/collapsible.tsx` – falls noch nicht vorhanden (shadcn/ui Collapsible nutzen).
- `includes/Assets/Strings.php` – ggf. neue Übersetzungskeys.

---

## 3. Phase 2: Datenbank & Backend für Ordner

### 3.1 Ordner-Tabelle

Nutzerdefinierte Ordner sind **pro Mailbox** eine **einzige Baumstruktur** (ein Block unter den Hauptpunkten). Es gibt **keinen** `status_context` pro Ordner – Nutzerordner sind reine Organisation; Einträge in einem Ordner behalten ihren `status` (inbox/junk/archive/trash).

**Tabelle: `wp_gutenform_inbox_folders`**

| Spalte | Typ | Beschreibung |
|--------|-----|--------------|
| `id` | BIGINT(20) UNSIGNED, AUTO_INCREMENT | Primärschlüssel |
| `mailbox_id` | BIGINT(20) UNSIGNED NOT NULL | Mailbox (Ordner pro „Konto“) |
| `parent_id` | BIGINT(20) UNSIGNED NULL | Übergeordneter Nutzerordner; NULL = Top-Level (direkt unter dem Hauptpunkte-Bereich) |
| `name` | VARCHAR(255) NOT NULL | Anzeigename des Ordners |
| `sort_order` | INT UNSIGNED DEFAULT 0 | Sortierung unter Geschwister (kleiner = weiter oben) |
| `date_created` | DATETIME NOT NULL | Erstellungszeitpunkt |

- **Indizes:** PRIMARY (`id`), KEY (`mailbox_id`), KEY (`parent_id`).
- **Fremdschlüssel:** `mailbox_id` → `wp_gutenform_mailboxes.id`, `parent_id` → `wp_gutenform_inbox_folders.id` (optional).

**Migration:** `database/Migrations/InboxFolders.php` anlegen und in die Migrations-Routine einbinden.

### 3.2 Erweiterung Entries

Einträge können optional einem Nutzerordner zugeordnet werden. Der Eintrag behält seinen `status` (inbox/junk/archive/trash); der Ordner ist nur eine zusätzliche Zuordnung. Ein Eintrag in „Ordner A“ kann also z. B. `status = inbox` oder `status = archive` haben – beim Klick auf „Ordner A“ werden alle Einträge mit diesem `folder_id` angezeigt (unabhängig vom Status).

**Änderung an `wp_gutenform_entries`:**

| Spalte | Typ | Beschreibung |
|--------|-----|--------------|
| `folder_id` | BIGINT(20) UNSIGNED NULL | Optional: Zuordnung zu einem Nutzerordner aus `wp_gutenform_inbox_folders` |

- **Index:** KEY (`folder_id`).

**Migration:** Neue Migration (z. B. `AddFolderIdToEntries.php`) oder Erweiterung der bestehenden Entries-Migration.

### 3.3 API für Ordner

- **GET** `/inbox-folders` (oder `/entries/folders`)  
  Query: `mailbox_id`.  
  Response: Baum aller Nutzerordner dieser Mailbox (mit `parent_id`, `children` oder flache Liste; Frontend baut Baum).

- **POST** `/inbox-folders`  
  Body: `mailbox_id`, `name`, optional `parent_id`, optional `sort_order`.  
  Erstellt einen neuen Ordner.

- **POST** `/inbox-folders/update` (oder PATCH `/inbox-folders/{id}`)  
  Body: `id`, optional `name`, `parent_id`, `sort_order`.  
  Aktualisiert Ordner (Umbenennen, Verschieben, Sortierung).

- **POST** `/inbox-folders/delete`  
  Body: `id`.  
  Löscht Ordner: Einträge in dem Ordner auf `folder_id = NULL` setzen (Status bleibt); Unterordner nach oben verschieben (`parent_id = parent des gelöschten`) oder rekursiv löschen.

- **POST** `/entries/update` (bestehend)  
  Erweiterung: Body darf `folder_id` enthalten (optional). Ordner muss zur gleichen Mailbox gehören.

- **GET** `/entries/get` (bestehend)  
  Erweiterung: Query-Parameter `folder_id` (optional). Wenn gesetzt: nur Einträge mit diesem `folder_id` zurückgeben (Status irrelevant).

### 3.4 Controller & Modelle

- **Model:** `includes/Models/InboxFolder.php` (Eloquent), Tabelle `inbox_folders`, Beziehungen zu `Mailbox` und `parent`/`children` (self-referencing).
- **Controller:** z. B. `includes/Controllers/InboxFolders/Actions.php` mit Methoden für list, create, update, delete; Berechtigung: gleiche Capability wie Inbox (z. B. `manage_options` oder plugin-eigene Cap). Kein `status_context` – Ordner sind pro Mailbox eine einzige Baumstruktur.

---

## 4. Phase 3: UI – Ordner unter dem Bereich der Hauptpunkte

### 4.1 Struktur in der Sidebar

- **Oben:** Die vier **System-Ordner** (programmatisch, immer vorhanden): Posteingang, Spam, Archiv, Papierkorb. Sie werden wie bisher gerendert (z. B. `defaultNavLinks`), sind konzeptionell aber „Ordner“ mit festem `status`.
- **Darunter, in einem Block:** Alle **nutzerdefinierten Ordner** in einer gemeinsamen Liste/Baum (verschachtelt mit Einrückung). Es gibt keine Aufteilung „Ordner unter Posteingang“ / „Ordner unter Archiv“ – es ist eine einzige Ordnerliste unter den Hauptpunkten.
- **Interaktion:** Klick auf einen System-Ordner (z. B. Posteingang) → alle Einträge mit diesem `status` (wie bisher, `folder_id` ignoriert). Klick auf einen Nutzerordner → alle Einträge mit diesem `folder_id` (unabhängig vom Status).

### 4.2 Anlegen & Verwalten

- **Neuer Ordner:** Kontextmenü oder Button „Neuer Ordner“ (unter dem Hauptpunkte-Bereich) bzw. beim Rechtsklick auf einen Ordner „Unterordner erstellen“. Dialog: Name, optional übergeordneter Ordner.
- **Bearbeiten:** Ordner umbenennen (Inline oder Dialog).
- **Löschen:** Kontextmenü „Löschen“; Bestätigung, Hinweis dass Einträge aus dem Ordner entfernt werden (folder_id = NULL), Status bleibt.
- **Verschieben:** Drag & Drop von Ordner auf anderen Ordner (als Unterordner) oder auf Top-Level. Optional: Sortierung per Drag & Drop unter Geschwistern.

### 4.3 Darstellung

- System-Ordner: wie bisher (Icon + Titel + Zähler). Nutzerordner: Ordner-Icon (z. B. Folder) + Name; bei Unterordnern Einrückung (margin-left) oder Tree-View mit Chevron zum Auf-/Zuklappen.
- Einträge-Anzahl pro Nutzerordner anzeigen; API: Ordner-Liste mit `entry_count` oder separater Count-Endpoint.

### 4.4 Filter-State & URL

- **Store:** `InboxFilters` um `folder_id: number | null` erweitern. Bei Klick auf einen System-Ordner: `folder_id = null`, `status` wie gewählt. Bei Klick auf Nutzerordner: `folder_id = id`, `status` kann unverändert bleiben oder ignoriert werden (Anzeige nur nach folder_id).
- **URL:** Optional `?folder=123` für Deep-Links; beim Laden `folder_id` aus URL in Store übernehmen.

---

## 5. Phase 4: Filter & Drag & Drop (optional)

- **Filter:** Wenn ein Nutzerordner ausgewählt ist, `GET /entries/get?folder_id=…` aufrufen (Status wird nicht eingeschränkt).
- **Drag & Drop:** Eintrag auf Nutzerordner droppen → `POST /entries/update` mit `id` und `folder_id`. Eintrag auf System-Ordner (z. B. Posteingang) droppen → wie bisher Status setzen; optional `folder_id = null`, damit der Eintrag „aus dem Nutzerordner“ in den System-Ordner wechselt.

---

## 6. Kurzfassung UX-Änderungen

| Bereich | Änderung |
|---------|----------|
| Form-IDs | Einklappbar, **Standard: zu**. Persistenz des Zustands (localStorage/Cookie). |
| Labels | Einklappbar, **Standard: zu**. Persistenz des Zustands. |
| Unter dem Bereich der Hauptpunkte | Ein Block mit allen Nutzerordnern (verschachtelt), Anlegen/Bearbeiten/Löschen/Verschieben. Hauptpunkte = System-Ordner (immer da). |
| Einträge | Optional einem Ordner zugeordnet; Filter und Move per Ordnerauswahl bzw. Drag & Drop. |

---

## 7. Betroffene Dateien (Überblick)

- **Phase 1:** `src/components/inbox/mail.tsx`, ggf. `src/components/ui/collapsible.tsx`, `includes/Assets/Strings.php`.
- **Phase 2:** `database/Migrations/InboxFolders.php`, Migration für `folder_id` in Entries, `includes/Models/InboxFolder.php`, `includes/Controllers/InboxFolders/`, `includes/Routes/Api.php`, `includes/Controllers/Entries/Actions.php` (get, update).
- **Phase 3:** `src/admin/pages/inbox/index.tsx`, `src/components/inbox/mail.tsx`, `src/components/inbox/nav.tsx` oder neue Tree-Nav-Komponente, Hooks für Ordner (z. B. `useInboxFolders`), `stores.ts` (folder_id).
- **Phase 4:** Wie Phase 3 plus Drag & Drop für Einträge auf Ordner, `useEntries`/API-Aufrufe mit `folder_id`.

---

## 8. i18n (Beispiele)

- `inboxFolders` – „Ordner“
- `newFolder` – „Neuer Ordner“
- `editFolder` – „Ordner bearbeiten“
- `deleteFolder` – „Ordner löschen“
- `folderName` – „Ordnername“
- `formulare` / `byForm` – „Formulare“ (für Collapsible-Überschrift Form-IDs)
- `labels` – „Labels“ (falls noch nicht vorhanden)

Ende des Dokuments.
