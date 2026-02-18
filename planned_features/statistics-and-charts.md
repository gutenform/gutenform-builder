# Statistiken & Charts – Plan

Dieses Dokument beschreibt den Plan für das Feature **Statistiken & Charts**: eine neue Admin-Seite mit auswählbaren Formularen und aufbereiteten Charts zu Absendungen, Aufrufen und weiteren Kennzahlen.

---

## Phasen-Übersicht

| Phase | Inhalt | Reihenfolge |
|-------|--------|-------------|
| **Phase 1** | Datenbank & Backend: neue Tabelle(n), API für Aggregationen, View-Tracking beim Formular-Aufruf | Zuerst |
| **Phase 2** | Admin-Seite „Statistiken“: Menüpunkt, Route, Formular-Filter (Dropdown), Charts (Absendungen, Aufrufe, Completion) | Danach |
| **Phase 3** | Erweiterte Statistiken & Feinschliff: weitere Kennzahlen, Zeiträume, Export, Performance | Optional |

---

## 1. Übersicht

### Ziele

- **Neue Admin-Seite „Statistiken“** mit übersichtlichen Charts zu Formularen und Einträgen.
- **Formular-Filter:** Ein Dropdown (oder Multi-Select) zur Auswahl von **einem oder mehreren** Formularen (`form_identifier`). **Keine Auswahl** = Statistiken für **alle** Formulare.
- **Absendungen (Submissions) als Timeline (LineChart):**
  - Aggregation nach **Tag / Monat / Jahr** wählbar.
  - Zusätzlich eine Linie für **angefangene, nicht abgeschlossene** („Abandoned“) – basierend auf **angefangenen Einträgen (Drafts)**, nicht auf Views. So unterscheiden sich echte Starts (z. B. Nutzer hat Felder ausgefüllt) von reinen Seitenaufrufen (z. B. Form auf Startseite).
  - Optional **prozentuale Darstellung**: Completion Rate = Submissions/Started (Anteil der abgeschlossenen an den angefangenen Formularen).
- **Formular-Aufrufe (Views) als Timeline:**
  - Aufrufe pro Tag / Monat / Jahr (wählbar).
- **Aufrufe insgesamt:** Summe/Kennzahl (z. B. KPI-Karte).
- Weitere sinnvolle Statistiken (siehe Abschnitt 5) im Plan berücksichtigen.

### Abhängigkeiten zur bestehenden Architektur

- **Entries:** `wp_gutenform_entries` mit `form_identifier`, `date_created` – nur **abgeschlossene** Absendungen. **Inbox zeigt ausschließlich Einträge aus dieser Tabelle; angefangene (Draft-)Einträge erscheinen dort nie.**
- **Drafts:** Angefangene Formulare werden in einer **eigenen Tabelle** `wp_gutenform_form_drafts` gespeichert (nicht als `status = 'draft'` in Entries). Sie dienen der Statistik „Started“/Abandoned, dem Save-and-Continue-Block und dem „Weitermachen“-Banner.
- **Formulare:** Keine eigene „Forms“-Tabelle; Formulare werden über `form_identifier` (aus Einträgen und Block-Attributen) identifiziert. Liste der Formulare z. B. über `GET /entries/form-identifiers`.
- **Admin:** `includes/Admin/Menu.php` (Submenüs), `src/admin/routes.jsx`, `src/components/application-layout/LayoutOne.jsx` (Navigation). Es existiert bereits eine Platzhalter-Seite `src/admin/pages/charts/index.jsx` (Demo-Charts mit Recharts), die durch die echte Statistiken-Seite ersetzt bzw. erweitert wird.
- **API:** `includes/Routes/Api.php`, Controller unter `includes/Controllers/`.

---

## 2. Datenbank: Anpassungen und neue Tabellen

### 2.1 Bestehende Tabelle `wp_gutenform_entries`

- **Keine Schema-Änderung nötig** für reine Absendungs-Statistiken.
- Für Zeitreihen: Aggregation nach `DATE(date_created)` bzw. nach Monat/Jahr per SQL/Eloquent, gefiltert nach `form_identifier` (inkl. „alle“).

### 2.2 Neue Tabelle: Formular-Aufrufe (Views)

Um **Aufrufe** (Views) pro Formular und Tag zu zählen, wird eine neue Tabelle eingeführt. Frontend sendet beim Anzeigen eines Formulars einen Request; Backend erhöht den Zähler für `(form_identifier, view_date)`.

**Tabelle: `wp_gutenform_form_views`**

| Spalte | Typ | Beschreibung |
|--------|-----|--------------|
| `id` | BIGINT(20) UNSIGNED, AUTO_INCREMENT | Primärschlüssel |
| `form_identifier` | VARCHAR(100) NOT NULL | Slug des Formulars (wie in Entries) |
| `view_date` | DATE NOT NULL | Datum (Tag), auf das der View gezählt wird |
| `view_count` | INT UNSIGNED DEFAULT 0 | Anzahl Aufrufe an diesem Tag |
| `date_updated` | DATETIME | Letzte Aktualisierung (für optionales Cleanup) |

- **Indizes:** PRIMARY (`id`), UNIQUE (`form_identifier`, `view_date`), KEY (`view_date`).
- **Logik:** Beim Aufruf „Form angezeigt“ entweder `INSERT` einer Zeile mit `view_count = 1` oder `ON DUPLICATE KEY UPDATE view_count = view_count + 1` (empfohlen).

**Migration:** `database/Migrations/FormViews.php` anlegen, in `Install` bzw. Migrations-Routine einbinden.

### 2.3 Angefangene Formulare (Drafts): eigene Tabelle – nicht Entries

**Entscheidung: angefangene Einträge in einer eigenen Tabelle speichern, nicht als `status = 'draft'` in `wp_gutenform_entries`.**

**Gründe:**

- **Inbox bleibt unverändert:** Die Inbox listet nur echte Absendungen aus `wp_gutenform_entries`. Es muss nirgends `WHERE status != 'draft'` ergänzt werden – Drafts existieren in einer anderen Tabelle und erscheinen in der Inbox nie.
- **Klar getrennte Semantik:** Entries = abgeschlossene Submissions (mit Mailbox, ggf. Versand). Drafts = Teil-Daten, oft anonym, ohne Mailbox, mit anderer Lebensdauer (z. B. TTL/Cleanup).
- **Eine Tabelle für mehrere Features:** Dieselbe Tabelle wird genutzt für:
  - **Statistik „Started“:** Nutzer hat mit dem Formular interagiert (erster Fokus/Input oder explizit „Speichern & Weiter“) → Abandoned = Started − Submissions.
  - **Save-and-Continue-Block:** Fortschritt serverseitig speichern, optional Resume-Link (Token) zum Weitermachen auf anderem Gerät.
  - **„Weitermachen“-Banner:** Wenn ein Draft existiert (Session oder Token), Banner anzeigen und Felder vorausfüllen.

**Tabelle: `wp_gutenform_form_drafts`**

| Spalte | Typ | Beschreibung |
|--------|-----|--------------|
| `id` | BIGINT(20) UNSIGNED, AUTO_INCREMENT | Primärschlüssel |
| `form_identifier` | VARCHAR(100) NOT NULL | Formular-Slug |
| `resume_token` | VARCHAR(64) NULL | Optional: Token für „Link zum Weitermachen“ (Save & Continue); NULL wenn nur Session-basiert |
| `session_id` | VARCHAR(64) NULL | Optional: Session-Kennung (z. B. aus Cookie), um Drafts pro Session zuzuordnen |
| `data` | LONGTEXT NOT NULL | Feldwerte als JSON (wie bei Entries) |
| `current_step` | SMALLINT UNSIGNED DEFAULT 0 | Aktueller Step-Index (für Multi-Step) |
| `wp_post_id` | BIGINT(20) UNSIGNED NULL | Optional: Seite, auf der das Formular gestartet wurde |
| `date_created` | DATETIME NOT NULL | Erster „Started“-Zeitpunkt (für Statistik) |
| `date_updated` | DATETIME NOT NULL | Letzte Änderung |
| `expires_at` | DATETIME NULL | Optional: Ablauf für Cleanup (z. B. 30 Tage) |

- **Indizes:** PRIMARY (`id`), UNIQUE (`resume_token`) wo nicht NULL, KEY (`form_identifier`), KEY (`session_id`), KEY (`date_created`), KEY (`expires_at`) für Cleanup-Jobs.
- **Statistik „Started“:** Pro Tag zählen wir Zeilen aus `form_drafts` nach `DATE(date_created)` und `form_identifier`. **Abandoned** = Started − Submissions (pro Zeitraum).
- **Inbox:** Liest ausschließlich aus `wp_gutenform_entries`. **Drafts erscheinen in der Inbox nie** – es ist keine Anpassung der Inbox- oder Entry-Abfragen nötig, da Drafts in einer anderen Tabelle liegen.

**Workflow:**

- **Erste Interaktion („Started“):** Beim ersten Fokus/Input in einem Formularfeld → Backend: Draft anlegen oder aktualisieren (z. B. anhand `session_id` + `form_identifier`). Erhöht „Started“-Zählung für Statistik.
- **Save & Continue:** Block speichert aktuellen Stand in diese Tabelle; optional wird `resume_token` erzeugt und als Link ausgegeben. Session Storage kann weiterhin für sofortiges Weitermachen in derselben Session genutzt werden; Backend dient für geräteübergreifendes Weitermachen.
- **Absenden:** Beim erfolgreichen Submit wird der Eintrag in `wp_gutenform_entries` erstellt; der zugehörige Draft wird gelöscht oder als „completed“ markiert (optionales Flag), damit er nicht mehr in „Started“ zählt und nicht doppelt erscheint.
- **Banner „Weitermachen“:** Beim Laden der Seite prüfen (Session Storage und/oder API mit `session_id`/`resume_token`): Gibt es einen Draft für dieses Formular? Wenn ja, Banner anzeigen („Formular fortsetzen?“), bei Klick Felder aus Draft vorausfüllen (und ggf. Session Storage abgleichen).

---

## 3. Backend (API & Controller)

### 3.1 View-Tracking

- **Route:** `POST /gutenform/v1/stats/form-view`  
  Parameter: `form_identifier` (string, erforderlich), optional `wp_post_id`.  
  Berechtigung: keine Login-Pflicht (öffentliche Formulare), aber Rate-Limit und ggf. Nonce/CORS beachten.
- **Controller:** z. B. `Gutenform\Controllers\Statistics\Actions@record_form_view`.  
  Aktion: für heutiges Datum (Site-Zeitzone) `form_views`-Zeile einfügen oder `view_count` um 1 erhöhen.

### 3.2 Statistiken abrufen

- **Route:** `GET /gutenform/v1/stats/overview`  
  Query-Parameter:
  - `form_identifiers[]` (optional): Array von `form_identifier`; fehlt oder leer = alle Formulare.
  - `group_by`: `day` | `month` | `year`.
  - `from` (optional): Datum (YYYY-MM-DD).
  - `to` (optional): Datum (YYYY-MM-DD).

- **Response-Struktur (Vorschlag):**
  - `submissions`: Zeitreihe `[{ date, count }]` aus `gutenform_entries` (nach `date_created` gruppiert).
  - `started`: Zeitreihe `[{ date, count }]` aus `wp_gutenform_form_drafts` (nach `date_created` gruppiert) – Nutzer haben das Formular angefangen.
  - `views`: Zeitreihe `[{ date, count }]` aus `wp_gutenform_form_views` (nach `view_date` gruppiert).
  - `totals`: `{ submissions, views, started, abandoned, completion_rate }`. Dabei **abandoned = started − submissions** (nicht views − submissions), **completion_rate** = submissions/started in % (sinnvoller als submissions/views, da nur Nutzer, die wirklich angefangen haben).
  - Optional pro `form_identifier` aufgeschlüsselt.

- **Controller:** `Gutenform\Controllers\Statistics\Actions@get_overview`.  
  Entries und Form Views wie gehabt; **Started** aus `form_drafts` nach `date_created` und `form_identifier` aggregieren; Abandoned und Completion Rate daraus ableiten.

### 3.3 Weitere Endpoints (optional)

- `GET /gutenform/v1/stats/summary` – nur Gesamtzahlen (Submissions gesamt, Views gesamt, Completion Rate), mit optionalem Filter `form_identifiers[]`.
- Liste der verfügbaren Formulare für das Dropdown kommt weiterhin von `GET /entries/form-identifiers`.

---

## 4. Frontend: Admin-Seite „Statistiken“

### 4.1 Menü & Routing

- **Menü:** In `includes/Admin/Menu.php` eine weitere Submenu-Page „Statistiken“ (oder „Charts“) mit `menu_slug` z. B. `gutenform-statistics`, Callback wie andere Admin-Seiten (React-Root).
- **Route:** In `src/admin/routes.jsx` Route z. B. `path: "statistics"` (oder bestehende `charts`-Route umwidmen) auf die neue Statistiken-Seite.
- **Navigation:** In `LayoutOne.jsx` einen neuen Eintrag in `navigation` (z. B. „statistics“, Icon z. B. BarChart2/LineChart), Link auf `#/statistics` bzw. `?page=gutenform-statistics#/statistics`.

### 4.2 Formular-Filter

- **Dropdown / Multi-Select:** Liste der Formulare aus `GET /entries/form-identifiers` laden.
- Option „Alle Formulare“ (oder keine Auswahl) = keine Filterung; ansonsten ein oder mehrere `form_identifier` auswählbar.
- Auswahl in lokalem State (z. B. React state oder Jotai); bei Änderung API `GET /stats/overview` mit `form_identifiers[]` und gewähltem `group_by`/Zeitraum neu aufrufen.

### 4.3 Charts (Recharts)

Die bestehende `src/admin/pages/charts/index.jsx` nutzt bereits Recharts und shadcn Chart-Container. Diese Seite wird zur echten Statistiken-Seite umgebaut:

1. **Absendungen (Submissions) – LineChart**
   - X-Achse: Datum (Tag/Monat/Jahr je nach `group_by`).
   - Y-Achse: Anzahl.
   - Linie 1: **Abgeschlossene Absendungen** (aus API `submissions`).
   - Linie 2: **Angefangen, nicht abgeschlossen (Abandoned)** = Started − Submissions pro Zeitpunkt (Daten aus `form_drafts` bzw. API `started`).
   - Optional: Umschaltbar auf **prozentuale Darstellung** (Completion Rate: Submissions/Started in %), oder zweites kleines Chart/KPI.

2. **Formular-Aufrufe (Views) – Timeline**
   - LineChart oder AreaChart: Aufrufe pro Tag/Monat/Jahr (Daten aus API `views`).
   - Zeitraum- und Gruppierungswahl wie oben.

3. **Aufrufe insgesamt**
   - KPI-Karte oder großer Zahl-Block: Summe aller Views (im gewählten Zeitraum bzw. gesamt), abhängig von Filter (alle/ausgewählte Formulare).

4. **Zeitraum & Gruppierung**
   - Steuerung: „Gruppierung: Tag / Monat / Jahr“ (z. B. Tabs oder Select).
   - Optional: Datumsbereich „Von – Bis“ (from/to) für alle Charts einheitlich.

5. **Weitere Charts (Phase 2/3, siehe Abschnitt 5)**
   - Conversion Rate (Completion Rate): Submissions/Views in % (pro Zeitraum oder pro Formular) – bereits in Totals/KPI vorgesehen.
   - **Durchschnittliche Absendungen** (und **Started/Drafts**): Bar Chart mit Zeitraum-Auswahl; optional kombiniert mit Wochentag/Tageszeit (5.3).
   - **Nach Wochentag / Tageszeit:** Started vs. Submissions pro Wochentag oder Stunde; **Completion Rate pro Gruppe** (z. B. „Freitags werden mehr % abgeschlossen“, „Abends höhere Completion“).
   - Top-Formulare: Liste Top 5/10 nach Absendungen oder nach Aufrufen.
   - Einträge nach Mailbox: Verteilung der Absendungen auf Mailboxes (Pie/Bar).
   - Latenz „View → Submit“: Durchschnittszeit bis zur Absendung (erfordert Session-/Satz-Tracking, siehe Abschnitt 5).
   - Export: CSV/Excel der Zeitreihen oder Gesamtzahlen.

### 4.4 i18n

- Alle neuen UI-Texte in `includes/Assets/Strings.php` mit camelCase-Keys anlegen und im Frontend über `__('key')` nutzen (siehe Projektregeln).

---

## 5. Weitere Statistiken (im Plan aufgenommen)

Die folgenden Kennzahlen sind fest eingeplant und werden schrittweise in Phase 2/3 umgesetzt.

### 5.1 Conversion Rate (Completion Rate)

- **Submissions / Views in %** (pro Zeitraum oder pro Formular).
- Bereits in Totals und KPI vorgesehen; optional zusätzlich pro Formular oder als kleines Chart darstellbar.

### 5.2 Durchschnittliche Absendungen pro Tag/Monat (inkl. Drafts)

- **Ø Absendungen pro Einheit** (Tag, Monat oder Jahr) im gewählten Zeitraum.
- **Darstellung:** Bar Chart mit Auswahl des Zeitraums (from/to) und der Einheit (Tag/Monat/Jahr).
- **Kombination mit Drafts:** Dieselbe Darstellung kann **parallel für Submissions und für Started (Drafts)** angeboten werden (z. B. zwei Balken pro Einheit oder zwei Charts). So sieht man sowohl „wie viele abgeschlossen“ als auch „wie viele angefangen“ pro Tag/Monat/Jahr. Optional kombiniert mit Wochentag/Tageszeit (siehe 5.3).
- **Datenbasis:** Submissions aus `wp_gutenform_entries` (`date_created`); Started aus `wp_gutenform_form_drafts` (`date_created`).

### 5.3 Nach Wochentag / Tageszeit (Submissions + Drafts + Completion Rate)

- **Ziel:** Der Nutzer sieht z. B. **„Mittwochs fangen viele an, Formulare auszufüllen; freitags wird ein höherer Anteil tatsächlich abgeschickt.“** Entsprechend bei **Tageszeit:** z. B. mittags viele Starts, abends höhere Completion Rate – je nach gewählter Ansicht (Wochentag oder Stunde).
- **Gruppierung:** Nach **Wochentag** (Mo–So) oder nach **Stunde** (0–23).
- **Daten pro Gruppe (Wochentag oder Stunde):**
  - **Started (Drafts):** Anzahl aus `wp_gutenform_form_drafts` nach `date_created` (Wochentag/Stunde) – „wo/wann fangen Nutzer an?“.
  - **Submissions:** Anzahl aus `wp_gutenform_entries` nach `date_created` (Wochentag/Stunde) – „wo/wann schicken Nutzer ab?“.
  - **Completion Rate pro Gruppe:** Submissions / Started in % für diesen Wochentag bzw. diese Stunde – „an welchem Tag / zu welcher Uhrzeit wird prozentual am meisten abgeschlossen?“.
- **Darstellung:** Bar Chart(s) mit Umschaltung „Pro Tag“ / „Pro Wochentag“ / „Pro Stunde“; optional zwei Reihen (Started vs. Submissions) oder ein kombiniertes Chart plus kleine Kennzahl „Completion Rate“ pro Balken/Zeile. Kann mit 5.2 (Durchschnittliche Absendungen) in einer gemeinsamen Sektion kombiniert werden.
- **Datenbasis:** `wp_gutenform_entries` und `wp_gutenform_form_drafts`, jeweils `date_created`; keine neue Tabelle nötig.

### 5.4 Top-Formulare

- **Sortierte Liste** (Top 5 oder Top 10) nach:
  - **Absendungen** (Anzahl Einträge pro `form_identifier`), oder
  - **Aufrufen** (Summe Views pro `form_identifier`).
- Darstellung: Tabelle oder kompaktes Bar Chart; Filter Zeitraum optional.

### 5.5 Einträge nach Mailbox

- **Verteilung der Absendungen auf Mailboxes** (wenn mehrere Mailboxes genutzt werden).
- Darstellung: Pie Chart oder Bar Chart (Mailbox-Name vs. Anzahl Einträge).
- Datenbasis: `wp_gutenform_entries` mit `mailbox_id`, Join zu Mailboxes für Anzeigename.

### 5.6 Latenz „View → Submit“ (Durchschnittszeit bis zur Absendung)

- **Metrik:** Durchschnittliche Zeit, die ein Nutzer vom **ersten View** (oder ersten Start) bis zum **Submit** braucht.
- **Anzeige:** z. B. „Ø 4:32 Min.“ pro Formular oder gesamt.
- **Voraussetzung:** Pro Session bzw. pro Absendung muss ein **View-Zeitpunkt** mit dem späteren Submit verknüpft sein. Dafür ist entweder:
  - **Option A:** Session-basiert: Beim View eine `session_id` speichern; beim Submit die `session_id` am Entry mitspeichern (oder in einer Zwischentabelle View-Zeitpunkt + Entry verknüpfen). Dann Zeitdifferenz zwischen erstem View und `date_created` des Entries berechnen.
  - **Option B:** Pro Entry: In `form_views` oder neuer Tabelle **einzelne View-Events** mit `session_id` speichern; beim Submit Entry mit `session_id` verknüpfen und ältesten View der Session für dieses Formular als Startzeit nutzen.
- **Aufwand:** Erweiterung View-Tracking (session_id), ggf. neue Tabelle oder Spalte für View-Events mit Zeitstempel + session_id; beim Submit session_id am Entry speichern. Aggregation in Stats-API: Durchschnitt der Differenzen (submit_time − first_view_time).
- **Einordnung:** Wichtig für Nutzerwert; Umsetzung in Phase 3 nach Klärung des Session-/View-Modells.

### 5.7 Export

- **CSV/Excel** der Zeitreihen (Submissions, Views, Started pro Tag/Monat/Jahr) oder der Gesamtzahlen (Totals, Top-Formulare, Mailbox-Verteilung).
- Optional: Filter (Formulare, Zeitraum) wie in der Statistik-Seite übernehmen.
- Phase 3.

---

## 6. Reihenfolge & Meilensteine

### Phase 1: Datenbank & Backend

| Schritt | Inhalt | Abhängigkeit |
|---------|--------|--------------|
| 1.1 | Migration `FormViews.php` anlegen und in Install/Migration-Runner einbinden | – |
| 1.2 | Migration `FormDrafts.php` anlegen (Tabelle `wp_gutenform_form_drafts`), in Install einbinden | – |
| 1.3 | Model `FormViews` (Eloquent), nur bei Bedarf; Model `FormDrafts` für Draft-CRUD | 1.1, 1.2 |
| 1.4 | Controller `Statistics\Actions`: `record_form_view` (POST), `get_overview` (GET inkl. Aggregation aus `form_drafts` für „started“) | 1.1, 1.2 |
| 1.5 | Controller `Drafts\Actions` (oder unter Statistics): `save`, `get`, `delete`; beim Submit (Submissions/Handler) Draft löschen | 1.3 |
| 1.6 | API-Routen: `/stats/form-view`, `/stats/overview`; `/drafts/save`, `/drafts/get`, `/drafts/delete` | 1.4, 1.5 |
| 1.7 | Frontend Form-Block: beim Anzeigen einmalig `POST /stats/form-view`; bei erster Interaktion (Fokus/Input) einmalig `POST /drafts/save` (minimaler Draft für „Started“-Statistik) | 1.6 |

### Phase 2: Admin-Seite & Charts

| Schritt | Inhalt | Abhängigkeit |
|---------|--------|--------------|
| 2.1 | Menüpunkt „Statistiken“, Route `statistics`, Navigation in LayoutOne | – |
| 2.2 | Formular-Dropdown (Multi-Select), Daten von `form-identifiers`; State für ausgewählte Formulare | – |
| 2.3 | API-Anbindung: `get_overview` mit `group_by`, `form_identifiers`, optional `from`/`to` (inkl. `started`/`abandoned`) | Phase 1 |
| 2.4 | Chart „Absendungen“: LineChart (Submissions + Abandoned aus Started), Gruppierung Tag/Monat/Jahr | 2.3 |
| 2.5 | Chart „Aufrufe“: Timeline (Views), gleiche Gruppierung | 2.3 |
| 2.6 | Karte „Aufrufe insgesamt“ + optional Completion Rate (prozentual) | 2.3 |
| 2.7 | i18n für alle neuen Texte | 2.1–2.6 |

### Phase 2b: Drafts, Save & Continue, Banner (parallel oder nach 2.1)

| Schritt | Inhalt | Abhängigkeit |
|---------|--------|-------------|
| 2b.1 | Save-and-Continue-Block: optional Backend-Speicherung (`POST /drafts/save`), Resume-Link mit `resume_token` anzeigen; Session Storage weiterhin für gleiche Session | Phase 1 (Drafts-API) |
| 2b.2 | Form-View: bei erster Feld-Interaktion Draft anlegen/aktualisieren („Started“ für Statistik) | Phase 1 |
| 2b.3 | „Weitermachen“-Banner: Komponente/Skript, prüft Session Storage + optional API auf vorhandenen Draft; bei Klick Felder vorausfüllen, zum Step springen | 2b.1 |
| 2b.4 | Nach erfolgreichem Submit: Draft löschen (Aufruf `POST /drafts/delete` oder im Backend im Submit-Handler) | 1.5 |

### Phase 3: Erweiterte Statistiken

| Schritt | Inhalt | Abhängigkeit |
|---------|--------|-------------|
| 3.1 | **Conversion Rate:** Pro Formular / Zeitraum (bereits in KPI; ggf. kleines Chart oder Tabelle) | Phase 2 |
| 3.2 | **Durchschnittliche Absendungen (inkl. Started/Drafts):** Bar Chart mit Zeitraum-Auswahl; Submissions und Started pro Einheit, optional mit 3.3 kombinierbar | Phase 2 |
| 3.3 | **Nach Wochentag / Tageszeit:** Started vs. Submissions pro Wochentag oder Stunde; **Completion Rate pro Gruppe** (z. B. „Freitags mehr % abgeschlossen“); mit 3.2 kombinierbar | Phase 2 |
| 3.4 | **Top-Formulare:** Liste Top 5/10 nach Absendungen oder nach Aufrufen (Tabelle oder Bar Chart) | Phase 2 |
| 3.5 | **Einträge nach Mailbox:** Verteilung als Pie/Bar Chart (Entries mit mailbox_id) | Phase 2 |
| 3.6 | **Latenz View → Submit:** Durchschnittszeit bis zur Absendung; erfordert Session-Tracking (View + session_id, Entry mit session_id oder View-Event-Tabelle) – Backend-Erweiterung + Aggregation | Phase 2, 2b |
| 3.7 | **Export:** CSV/Excel der Zeitreihen und Gesamtzahlen (Filter wie Statistik-Seite) | Phase 2 |
| 3.8 | Optional: Caching/Aggregation für große Datenmengen (Performance) | 3.1–3.7 |
| 3.9 | Optional: Cleanup-Job für abgelaufene Drafts (`expires_at`) | Phase 2b |

---

## 7. Technische Schnittstellen (Kurz)

### 7.1 View-Tracking (Frontend → Backend)

- Beim Rendern des Formulars (z. B. in `src/blocks/form/view.ts` nach DOMContentLoaded oder beim ersten sichtbaren Rendern): einmal pro Seite/Session einen Request `POST /gutenform/v1/stats/form-view` mit `{ form_identifier: formOptions.formId }`. Optional: Cookie/LocalStorage „already_sent_view_&lt;form_identifier&gt;_&lt;date&gt;“, um pro Tag nur einmal zu zählen (falls gewünscht).

### 7.2 Statistiken-API

- **GET** `/gutenform/v1/stats/overview?group_by=day|month|year&form_identifiers[]=id1&form_identifiers[]=id2&from=...&to=...`
- Response: `{ submissions: [...], started: [...], views: [...], totals: { submissions, views, started, abandoned, completion_rate } }`. Abandoned = started − submissions; completion_rate = submissions/started in %.

### 7.3 Bestehende Komponenten

- Recharts + `ChartContainer`, `ChartTooltip` aus `@/components/ui/chart` (bereits in `charts/index.jsx` genutzt).
- Shadcn Card, Select, Buttons für Filter und KPI-Karten.

---

## 8. Drafts-API & „Weitermachen“-Banner

### 8.1 Drafts-Endpoints

- **POST `/gutenform/v1/drafts/save`**  
  Body: `form_identifier`, `data` (Feldwerte), `current_step`, optional `session_id`, optional `wp_post_id`.  
  Aktion: Draft anlegen oder aktualisieren (z. B. anhand `session_id` + `form_identifier`). Optional `resume_token` generieren und zurückgeben (für Save & Continue Link). Kein Login nötig; Rate-Limit und Sanitization.

- **GET `/gutenform/v1/drafts/get`**  
  Query: `form_identifier`, plus entweder `resume_token` oder `session_id`.  
  Response: `{ data, current_step, saved_at }` oder 404. Für Banner und Weitermachen: Felder vorausfüllen.

- **POST `/gutenform/v1/drafts/delete`** (oder beim Submit automatisch)  
  Query/Body: `form_identifier`, `resume_token` oder `session_id`. Nach erfolgreichem Absenden aufrufen, damit der Draft entfernt wird und nicht doppelt in der Statistik zählt.

### 8.2 „Started“-Tracking (erste Interaktion)

- Beim **ersten Fokus oder ersten Input** in einem Formularfeld: einmalig **POST `/gutenform/v1/drafts/save`** mit minimalen Daten (z. B. nur `form_identifier`, `session_id`, leeres oder erstes Feld). Erzeugt oder aktualisiert einen Draft und zählt für die Statistik „Started“ (Zeile in `form_drafts` mit `date_created`).

### 8.3 Save-and-Continue-Block

- **Aktuell:** Nur Session Storage (`gutenform_progress_${formId}`).  
- **Erweiterung:** Optional Backend-Speicherung in `wp_gutenform_form_drafts`. Nach Speichern optional **Resume-Link** anzeigen (URL mit `?resume_token=...`), der beim Öffnen den Draft lädt und Felder vorausfüllt. Session Storage kann für dieselbe Session weiterhin genutzt werden; Backend für geräteübergreifendes Weitermachen.

### 8.4 Banner „Formular fortsetzen“

- **Trigger:** Beim Laden einer Seite, die ein Gutenform-Formular enthält (oder global im Theme): Prüfen, ob für **dieses** Formular ein Draft existiert – entweder in **Session Storage** (`gutenform_progress_${formId}`) oder per **API** (GET drafts mit `session_id` oder Cookie).
- **Anzeige:** Kleines Banner (z. B. oben oder über dem Formular): „Sie haben dieses Formular angefangen. Jetzt fortsetzen?“ + Button „Weitermachen“.
- **Aktion:** Bei Klick Felder aus Draft (Session Storage oder API-Response) vorausfüllen, ggf. zum richtigen Step springen. Kein neuer Eintrag; es wird derselbe Draft weiterbearbeitet bis zum finalen Submit (dann Entry anlegen, Draft löschen).
- **Verknüpfung:** Dieselbe Datenquelle wie der Save-and-Continue-Block (Session Storage + optional Backend-Draft), damit „Weitermachen“ und „Save & Continue“ konsistent sind.

---

## 9. Zusammenfassung Datenbank

| Tabelle | Aktion | Zweck |
|---------|--------|--------|
| `wp_gutenform_entries` | unverändert | Nur **abgeschlossene** Absendungen. Inbox listet ausschließlich diese; **keine** Drafts. |
| `wp_gutenform_form_views` | **neu** | Zähler Aufrufe pro `form_identifier` und Tag (Views-Timeline). |
| `wp_gutenform_form_drafts` | **neu** | Angefangene Formulare: Teil-Daten (JSON), optional `resume_token`/`session_id`. Basis für Statistik „Started“, Abandoned, Save & Continue und „Weitermachen“-Banner. |

---

*Stand: Februar 2026. Bei Umsetzung die bestehende i18n-Strategie (PHP-Strings, camelCase-Keys in JS), Projektstruktur (admin pages, hooks, API) und Sicherheit (Capability-Checks für Admin-API, Rate-Limit/Sanitization für form-view) beibehalten.*
