# AI & Marketplace – Plugin-Erweiterung (Plan)

Dieses Dokument beschreibt die **Anpassungen und Erweiterungen im WordPress-Plugin (Gutenform)**, die nötig sind, damit das Plugin nahtlos mit der Cloud-Plattform (Web App, siehe `documentation/app-platform-plan.md`) zusammenarbeitet. Ziel: **Plugin installieren und Lizenz hinzufügen soll funktionieren, ohne aus dem Plugin rauszugehen.** Die konzeptionelle Beschreibung „AI & Marketplace“ (Lizenz-Cockpit, KI-Architekt, Credit-System, integrierter Marktplatz) wird hier in konkrete Plugin-Tasks übersetzt.

### Plattform-Domain (wichtig)

Die Plattform läuft unter **einer festen Domain**. Das Plugin spricht **ausschließlich mit dieser Plattform**, sobald es um Lizenz, Credits, KI oder Marktplatz geht.

| Umgebung | Domain |
|----------|--------|
| **Produktion** | `https://gutenform.de` |
| **Entwicklung** | `https://gutenform.vercel.app` |

- **Alle API-Aufrufe** (Lizenz validieren, Status abrufen, KI-Generierung, Marktplatz-Katalog, Add-on-Download, Checkout-Links) gehen an diese Basis-URL. Es gibt keine alternative Backend-URL für diese Features.
- **Konfiguration im Plugin:** Die Basis-URL ist fest vorgegeben (Konstante oder Build-Time-Env), mit Umschaltung Prod/Dev (z. B. über `WP_DEBUG` oder eine Plugin-Option „Umgebung“). Keine freie Eingabe einer beliebigen API-URL durch Nutzer – immer Gutenform-Plattform.
- **Beispiele:** Lizenz-Status → `https://gutenform.de/api/...` (bzw. Subdomain/Path der Plattform-API), KI-Request → dieselbe Domain, Marktplatz-Items → dieselbe Domain. So bleibt Sicherheit und Konsistenz gewährleistet.

---

## Phasen-Übersicht

| Phase | Inhalt | Abhängigkeit |
|-------|--------|--------------|
| **Phase 1** | Lizenz-Cockpit: Menüpunkt, Key-Eingabe, Validierung gegen Plattform-API, Speicherung, Status-Anzeige (Plan, Credits, Domains), Soft-Lock für AI/Premium | Plattform: Lizenz-Validierungs-Endpoint (z. B. `GET /v1/license/status` mit `x-license-key`) |
| **Phase 2** | Account-Anbindung im Plugin: Anmeldung/Registrierung (Embed/Iframe oder Deep-Link) und Key-Generierung aus dem Plugin heraus | Plattform: Auth + `POST /v1/license/generate` (nach Login) |
| **Phase 3** | KI-Integration im Formular-Block: „Magic Button“, Kontext (bestehende Felder), Aufruf `POST /v1/ai/generate`, Diff-Vorschau, Anwenden | Plattform: `POST /v1/ai/generate` live |
| **Phase 4** | Credit-System im Plugin: Kosten-Vorschau vor Request, Live-Balance im Editor, Top-Up-Overlay (ohne Plugin verlassen) | Plattform: Credit-Info in Lizenz-Response, ggf. Checkout-URL/Embed für Top-Up |
| **Phase 5** | Integrierter Marktplatz: Katalog (Erweiterungen), Installieren/Kaufen/Aktivieren, Phantom-Modus, Auto-Updates | Plattform: `POST /v1/market/install`, Produktliste, ggf. Update-API |

---

## 1. Übersicht & Ziele

### Hauptziel

- **Kein Wechsel der Umgebung:** Nutzer installiert das Plugin, aktiviert die Lizenz (oder legt im Plugin einen Account an und generiert einen Key), nutzt KI und Add-ons – alles aus dem WordPress-Admin bzw. Block-Editor heraus.
- **Lizenz-Cockpit** als zentraler Zugang: neuer Menüpunkt „Lizenz & Account“, Anzeige von Plan, Credits, aktivierten Domains; Soft-Lock für KI und Premium-Add-ons ohne gültige Lizenz.
- **KI als Co-Pilot** im Formular-Block: Formulare per natürlicher Sprache erstellen, erweitern, ändern, übersetzen; sichere Diff-Vorschau vor dem Anwenden.
- **Credits** transparent: Vorschau vor Nutzung, Live-Anzeige, Nachkauf im Overlay.
- **Marktplatz** im Plugin: Erweiterungen katalogisieren, ein-Klick-Installation für berechtigte Lizenzen, Add-ons nicht in der normalen WP-Plugin-Liste (Phantom-Modus), Auto-Updates.

### Abhängigkeiten zur bestehenden Architektur

- **Admin:** `includes/Admin/Menu.php` (Submenüs über `gf_submenu_pages`), React-Admin-App (z. B. `src/admin/`), Hash-Routing (#/settings, #/forms-usage). Neuer Submenu „Lizenz & Account“ und ggf. „Erweiterungen“.
- **Blocks:** `src/blocks/form/` (Form-Block: `edit.tsx`, Inspector, Toolbar). KI-UI als neuer Bereich in Toolbar/Sidebar, Aufruf der Plattform-API mit gespeichertem Lizenz-Key.
- **Optionen/Speicher:** Lizenz-Key und Lizenz-Metadaten (Plan, Credits, Domains) müssen persistent gespeichert werden – z. B. `options`-API oder eigener Key-Store; pro Installation ein Key (oder pro WordPress-User, je nach Produktentscheidung).
- **Plattform-API:** Das Plugin spricht immer mit der Gutenform-Plattform (Prod: `https://gutenform.de`, Dev: `https://gutenform.vercel.app`). Basis-URL fest im Plugin (Konstante oder Option Prod/Dev); alle Aufrufe (Validierung, AI, Marktplatz) nutzen diese URL und den gespeicherten Key (Header `x-license-key`).

---

## 2. Lizenz-Cockpit (Der Zugang)

### 2.1 Menü & Seite

- **Neuer Menüpunkt** „Lizenz & Account“ (oder „Lizenz & Credits“) im Gutenform-Dashboard.
  - Integration über `gf_submenu_pages` in `includes/Admin/Menu.php` (oder zentrales Menu-Register).
  - Eigenes Submenu-Slug (z. B. `gutenform-license`), React-Route z. B. `#/license`.
- **Inhalt der Seite (Zustände):**
  - **Keine Lizenz:** Eingabefeld für Lizenzschlüssel, Button „Aktivieren“. Optional: Link/Button „Account erstellen“ (führt zu Phase 2: Anmeldung/Registrierung im Plugin).
  - **Lizenz aktiv:** Anzeige von Plan (z. B. „Pro Bundle“), verfügbarem KI-Guthaben (Credits), Anzahl aktivierter Domains / Aktivierungslimit. Optional: „Key kopieren“, „Domain hinzufügen/entfernen“ (falls Plattform-API das unterstützt).
  - **Lizenz ungültig/abgelaufen:** Hinweis + erneute Eingabe oder Link zum Verlängern (Plattform).

### 2.2 Validierung & Speicherung

- Beim „Aktivieren“: Key an Plattform senden (z. B. `GET /v1/license/status` oder `POST /v1/license/validate` mit Header `x-license-key`).
- Response enthält: `status`, `tier`/`plan`, `credits_balance`, `credits_monthly_limit`, `current_activations`, `activation_limit`, ggf. `expires_at`.
- Bei Erfolg: Key und ggf. gecachte Metadaten in WordPress speichern (Options oder eigener Encrypted-Store, falls gewünscht). Domain der aktuellen Installation bei der Plattform registrieren (falls API: „Activation“ pro Domain).
- Bei Fehler: Fehlermeldung anzeigen (ungültig, abgelaufen, Limit erreicht, etc.).

### 2.3 Soft-Lock (ohne Lizenz)

- **AI-Buttons** im Form-Block und **Premium-Add-ons** im Marktplatz bleiben ohne gültige Lizenz ausgegraut oder mit Schloss-Symbol („Nur in Pro“ / „Bitte Lizenz aktivieren“).
- Technisch: globale Prüfung „hat gültige Lizenz“ (aus Optionen/Cache); Block-Editor und Admin-UI fragen diese Prüfung ab und blenden KI/Marktplatz-Funktionen entsprechend ein oder aus.

### 2.4 Plugin-seitige Implementierung (Stichpunkte)

- **PHP:** Option/Settings für Umgebung (Prod/Dev → gutenform.de vs. gutenform.vercel.app) und gespeicherten Key (nur gespeichert, nicht im Frontend auslesbar). REST-Route oder Admin-Ajax für „License validate“ (Key vom Frontend übergeben, Backend ruft **die Gutenform-Plattform** auf und speichert bei Erfolg).
- **Admin-React:** Seite „Lizenz & Account“ mit Formular (Key-Eingabe), Anzeige (Plan, Credits, Domains), Fehler-/Erfolgsmeldungen. Optional: periodischer Hintergrund-Check (Credits/Status aktualisieren).

---

## 3. Account-Anmeldung & Key-Generierung im Plugin

**Ziel:** Nutzer soll eine Lizenz erzeugen können, ohne die Webseite zu verlassen.

### 3.1 Optionen

- **A) Embedded Login/Register:** In einem Modal oder Tab innerhalb des Plugins: Iframe oder eingebetteter Flow zur Plattform (Login/Registrierung). Nach erfolgreicher Anmeldung: Plattform leitet zurück (Deep-Link) oder postMessage mit Token; Plugin ruft mit diesem Token `POST /v1/license/generate` auf und erhält den Key einmalig. Key wird dann wie in Phase 1 gespeichert und angezeigt.
- **B) Popup/Redirect mit Return-URL:** Login/Registrierung auf der Plattform, Return-URL zeigt wieder WordPress-Admin mit Query-Parameter (z. B. `?gutenform_license_key=...`). Plugin liest Key aus und speichert ihn (einmalig anzeigen, dann nur noch Maskierung wie „sk_...829a“).

### 3.2 Plugin-Tasks

- Button „Account erstellen“ / „Lizenz generieren“ auf der Lizenz-Seite (wenn keine Lizenz aktiv).
- Öffnen des Auth-Flows (Iframe/Redirect) mit korrekter Return-URL bzw. postMessage-Listener.
- Nach Rückkehr: Aufruf von `POST /v1/license/generate` (mit Auth-Token oder einmaligem Code) und Speicherung des Keys + Anzeige „Key erstellt – bitte sicher aufbewahren“.
- Hinweis: Key nur einmal sichtbar; danach nur Prefix in der Lizenz-Ansicht.

### 3.3 Abhängigkeit Plattform

- Plattform muss Auth (z. B. Supabase Auth) und Endpoint `POST /v1/license/generate` bereitstellen; ggf. Return-URL oder postMessage für „Key an Plugin übergeben“ dokumentieren.

---

## 4. KI-Integration im Formular-Block

### 4.1 „Magic Button“ & Kontext

- **Position:** Neuer Bereich in der **Werkzeugleiste** oder **Sidebar** des Form-Blocks (Gutenberg): z. B. „Mit KI bearbeiten“ / „AI Assistent“.
- **Kontext:** Beim Aufruf sendet das Plugin den **aktuellen Block-Kontext** mit: welche Blöcke (Felder) bereits im Formular sind (Block-Namen, Attribute, Reihenfolge). Dazu: aktueller Cursor/Kontext (z. B. „Feld X ausgewählt“). Die Plattform-API (`POST /v1/ai/generate`) erhält Prompt + Kontext und liefert Block-JSON zurück.

### 4.2 Szenarien (Intelligente Manipulation)

- **Neu erstellen:** „Erstelle ein Kontaktformular.“ → KI liefert vollständiges Block-Array.
- **Erweitern:** „Füge eine Checkbox für Newsletter hinzu.“ → Bestehende Blöcke + neue Blöcke, logisch eingefügt.
- **Ändern:** „Mache alle Felder zu Pflichtfeldern.“ → Geänderte Attribute in den bestehenden Blöcken.
- **Übersetzen:** „Übersetze alle Labels ins Englische.“ → Nur Attribute (Labels) anpassen.

Datenformat: Das Plugin serialisiert die aktuellen Inner Blocks (und ggf. Block-Attribute des Form-Containers) in eine strukturierte Form (JSON), sendet sie mit dem User-Prompt an die Plattform; die Plattform antwortet mit neuem/angepasstem Block-JSON (siehe Plattform-Plan: `block_definitions`, System-Prompt).

### 4.3 Sicherheits-Vorschau (Diff-View)

- **Vor dem Anwenden:** Nach Antwort der KI öffnet das Plugin ein **Modal/Fenster** mit Diff-Ansicht:
  - Links: aktueller Stand (Blöcke/Attribute).
  - Rechts: Vorschlag der KI.
  - Farblich markiert: Grün = neu, Rot = gelöscht, Blau = geändert (oder vereinfachte Text-Diff der serialisierten Struktur).
- **Aktion:** Buttons „Verwerfen“ und „Anwenden“. Nur bei „Anwenden“ werden die Blöcke im Editor tatsächlich ersetzt/aktualisiert (z. B. `replaceBlocks` oder Setzen der Inner-Blocks des Form-Blocks).

### 4.4 Plugin-Implementierung (Stichpunkte)

- **Block-Editor (React):** Komponente „AI Panel“ in `src/blocks/form/` (oder shared), die:
  - Aktuelle Form-Struktur aus dem Block-Editor ausliest (parent block, inner blocks).
  - Textfeld für Prompt, Button „Generieren“.
  - Request an Backend (PHP) oder direkt an Plattform mit `x-license-key` (Key aus Plugin-Options/Cache; niemals im Frontend-Bundle in Klartext, sondern vom Backend injiziert oder per Proxy-Request).
- **Sicherheit:** Lizenz-Key nicht im Client-Bundle; entweder PHP-Proxy (Plugin-Backend ruft Plattform mit Key auf) oder Key nur in Admin/Editor-Kontext und nur für API-Call verwendet.
- **Fehlerbehandlung:** 429 (Rate Limit), 402 (Credits leer), 401 (Lizenz ungültig) → entsprechende Meldungen und ggf. Link zum Lizenz-Cockpit oder Top-Up.

---

## 5. Credit-System im Plugin

### 5.1 Kosten-Vorschau

- **Vor dem Senden** des KI-Requests: Optional einen „Kosten-Check“ an die Plattform (z. B. `POST /v1/ai/estimate` mit gleichem Prompt/Kontext oder vereinfachte Schätzung). Anzeige: „Das wird ca. X Credits kosten.“
- Falls die Plattform keine Estimate-API hat: Festes Äquivalent pro Request anzeigen (z. B. „1 Anfrage ≈ ca. Y Credits“) oder nach erstem Request aus Response (verbrauchte Credits) anzeigen.

### 5.2 Live-Balance

- **Anzeige im Editor:** Kleine Anzeige (z. B. in der Sidebar oder Toolbar) mit aktuellem Restguthaben („Credits: 120“). Quelle: aus Lizenz-Status (Phase 1), bei jedem KI-Request oder periodisch aktualisierbar (nach Abschluss eines Requests Credits aus Response übernehmen oder kurz `GET /v1/license/status` aufrufen).

### 5.3 Top-Up (ohne Plugin verlassen)

- **Wenn Credits leer (oder unter Schwellwert):** Statt nur Fehlermeldung ein **Overlay/Modal** anzeigen: „Credits aufgebraucht. Jetzt aufladen?“ mit Buttons zu Paketen (z. B. „50 Credits“, „200 Credits“). Optionen:
  - **A) Inline-Checkout:** Embedded Checkout der Plattform (Lemon Squeezy Checkout in iframe) mit Return-URL zurück ins Plugin/Editor.
  - **B) Link:** Link zum Plattform-Dashboard (Billing), in neuem Tab – weniger „ohne rausgehen“, aber einfacher umsetzbar.
- Ziel laut Konzept: Overlay, in dem man direkt Pakete nachkaufen kann (also A anstreben, sofern Plattform es anbietet).

### 5.4 Plugin-Tasks

- Credits-Anzeige aus Lizenz-Response speichern und in Editor-UI anzeigen.
- Nach jedem KI-Request: verbrauchte Credits aus Response übernehmen und Anzeige aktualisieren (oder Status-Request auslösen).
- Top-Up-Overlay-Komponente; Integration mit Plattform-Checkout-URL oder Embed.

---

## 6. Integrierter Marktplatz (Erweiterungen)

### 6.1 Katalog

- **Neuer Bereich** im Plugin: z. B. Menüpunkt „Erweiterungen“ oder Tab auf der Lizenz-Seite. Grid/Liste aller verfügbaren Add-ons (von der Plattform: z. B. Liste aus `marketplace_items` oder eigener API `GET /v1/market/items`).
- Pro Item: Name, Beschreibung, Preis, „required_tier“, ob bereits gekauft/entitled (aus Lizenz-Response oder `GET /v1/market/entitlements`).

### 6.2 Smart Buttons

- **Installieren:** Wenn das Add-on im gekauften Paket enthalten ist (entitlement vorhanden) → One-Click-Installation: Plugin ruft `POST /v1/market/install` mit `item_id`/slug auf, erhält Signed URL, lädt ZIP herunter und „installiert“ das Add-on (siehe Phantom-Modus).
- **Kaufen:** Wenn nicht enthalten → Button „Kaufen“ öffnet Checkout (Plattform/Lemon Squeezy), nach Kauf Webhook fügt Entitlement hinzu, Nutzer kann danach „Installieren“ klicken.
- **Aktivieren/Deaktivieren:** Wenn bereits installiert (Phantom-Liste) → Toggle aktivieren/deaktivieren (plugin-seitig: Option oder eigener Loader für „gutenform-addons“).

### 6.3 Phantom-Modus

- **Installierte Add-ons** erscheinen **nicht** in der normalen WordPress-Plugin-Liste (`wp-admin/plugins.php`). Sie werden nur im Gutenform-Dashboard unter „Erweiterungen“ verwaltet (sichtbar als „installiert“, aktiviert/deaktiviert).
- Technisch: Add-ons in eigenem Verzeichnis (z. B. `wp-content/gutenform-addons/` oder unter Plugin-Pfad) speichern und über einen eigenen Loader (PHP) nur dann als „Plugins“ laden, wenn sie in der Gutenform-Whitelist stehen. WordPress’ Standard-Plugin-API dafür nicht nutzen (eigene Liste, eigenes Aktivieren/Deaktivieren).

### 6.4 Auto-Updates

- **Plattform** liefert Version pro Marketplace-Item (bereits in `marketplace_items.version`). Plugin prüft periodisch (Cron oder beim Öffnen der Erweiterungs-Seite) auf neuere Versionen und zeigt „Update verfügbar“ an. Download wieder über `POST /v1/market/install` (signed URL für neue Version), dann lokales Ersetzen des Add-on-ZIPs/Pakets.

### 6.5 Plugin-Tasks (Stichpunkte)

- Admin-Seite „Erweiterungen“: API-Aufruf für Katalog, Anzeige Grid, Buttons je nach Lizenz/Entitlement.
- PHP: Proxy für `POST /v1/market/install` (Key vom Backend mitschicken), Download des ZIPs, Entpacken in Add-on-Verzeichnis.
- Eigenes Verzeichnis und Loader für Phantom-Add-ons; Optionen für „aktiviert“ pro Add-on-Slug.
- Cron oder On-Demand-Check für Updates; Update-UI und Installations-Flow für neue Version.

---

## 7. Abhängigkeiten von der Plattform (Zusammenfassung)

Das Plugin spricht **ausschließlich mit der Gutenform-Plattform** (gutenform.de / gutenform.vercel.app) für Lizenz, KI und Marktplatz. Von dieser Plattform werden folgende APIs bzw. Verhaltensweisen benötigt:

| Feature | Erwarteter Endpoint / Verhalten |
|---------|----------------------------------|
| Lizenz prüfen & Status | `GET /v1/license/status` (Header `x-license-key`) → Plan, Credits, Aktivierungen, Ablauf |
| Lizenz generieren (nach Auth) | `POST /v1/license/generate` (mit Auth) → einmalig Raw-Key |
| KI-Generierung | `POST /v1/ai/generate` (Header `x-license-key`, Body: Prompt + Kontext) → Block-JSON, verbrauchte Credits in Response |
| Optional: Kosten-Schätzung | `POST /v1/ai/estimate` oder Schätzung in Response von `/v1/ai/generate` |
| Marktplatz-Katalog | `GET /v1/market/items` (oder aus Lizenz-Response) → Liste mit Slug, Name, Preis, required_tier |
| Entitlements | In Lizenz-Status oder `GET /v1/market/entitlements` |
| Add-on-Download | `POST /v1/market/install` (Body: item_id/slug) → Signed URL (z. B. Supabase Storage) |
| Checkout/Top-Up | URL oder Embed für Lemon Squeezy Checkout (Plattform stellt URL bereit, Plugin öffnet in Overlay/iframe oder Tab) |

Falls ein Endpoint noch nicht existiert (z. B. reines `GET /v1/license/status`), sollte er im Plattform-Plan ergänzt und im Plugin entsprechend angebunden werden.

---

## 8. User Journey (Kurz)

1. Nutzer installiert das Gutenform-Plugin (Free).
2. Im Editor: „AI“-Button sichtbar, Klick → „Bitte Lizenz aktivieren“ (Soft-Lock).
3. Nutzer öffnet „Lizenz & Account“ im Plugin, gibt Key ein **oder** klickt „Account erstellen“ und durchläuft Anmeldung/Registrierung im Plugin; Key wird generiert und gespeichert.
4. Lizenz aktiv → AI und Marktplatz freigeschaltet. Nutzer baut Formulare per KI, sieht Credit-Vorschau und Live-Balance.
5. Credits leer → Top-Up-Overlay im Plugin, Nachkauf ohne Wechsel der Umgebung (idealerweise).
6. Nutzer braucht CRM-Anbindung → „Erweiterungen“ → Add-on „HubSpot“ → „Installieren“ (One-Click) → Add-on erscheint nur in Gutenform, nicht in der WP-Plugin-Liste; Auto-Updates über Gutenform.

---

## 9. Implementierungs-Reihenfolge (Empfehlung)

1. **Phase 1 (Lizenz-Cockpit)** zuerst: Ohne gültige Lizenz können KI und Marktplatz nicht sinnvoll genutzt werden. Parallel: Plattform um `GET /v1/license/status` (oder Validate) und ggf. Aktivierungs-Registrierung pro Domain erweitern.
2. **Phase 2 (Account & Key im Plugin)** danach oder parallel zu Phase 1: Ermöglicht „alles aus dem Plugin“ für Neukunden.
3. **Phase 3 (KI im Block):** Sobald Lizenz und `POST /v1/ai/generate` stehen; Diff-View von Anfang an einplanen.
4. **Phase 4 (Credits):** Mit Phase 3 verzahnen (Live-Balance, Fehler bei 402); Kosten-Vorschau und Top-Up-Overlay ausbauen.
5. **Phase 5 (Marktplatz):** Katalog und Install-Flow; Phantom-Modus und Auto-Updates können schrittweise folgen.

Dieser Plan kann als Referenz für Backlog und Sprints dienen; Abhängigkeiten zur Plattform sind in Abschnitt 7 und in `documentation/app-platform-plan.md` beschrieben.
