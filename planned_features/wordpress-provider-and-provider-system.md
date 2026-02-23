# WordPress-Provider & Provider-System – Plan

Dieses Dokument beschreibt den Plan für den **WordPress-Provider** sowie die **Erweiterung und das Refactoring des Provider-Systems**: Feld-Mapping, Provider-Aktionstypen, Erweiterbarkeit (Theme/Plugin) und Dokumentation.

---

## Phasen-Übersicht

| Phase | Inhalt | Reihenfolge |
|-------|--------|-------------|
| **Phase 1** | Provider-System: Aktionstypen, Feld-Mapping, Erweiterbarkeit (Filter/Action, PHP-Klasse erweitern) | Zuerst |
| **Phase 2** | Input-Block: Typ „Password“ ergänzen | Parallel / vor WP-Provider |
| **Phase 3** | WordPress-Provider: Anmelden, Registrieren, Post erstellen, Kommentar schreiben | Danach |
| **Phase 4** | Dokumentation: Nutzung & Erweiterung des Provider-Systems | Durchgängig |

---

## 1. Übersicht

### Ziele

- **WordPress-Provider** mit folgenden Aktionen:
  - **Anmelden** (Login)
  - **Registrieren** (Registrierung)
  - **Post erstellen** (für konfigurierbaren Post-Type, Status wählbar)
  - **Kommentar schreiben** (für die aktuelle Seite)
- **Provider-System erweitern**:
  - **Aktionstypen pro Provider:** Beim Anlegen eines Providers wählt man einen Typ (z. B. „Registrierung“, „Post anlegen“, „Kommentar“) und erhält ggf. typspezifische Einstellungen.
  - **Feld-Mapping im Form-Block:** Für jeden Provider(-Typ) können Formularfelder auf „Slots“ gemappt werden (z. B. Registrierung: welches Feld = Name, E-Mail, Passwort; Post: welches Feld = Titel, Inhalt, Meta).
- **Erweiterbarkeit:** Nutzer sollen über Theme oder eigenes Plugin eigene Provider anlegen können (Filter `gutenform/available_providers`, PHP-Klasse von `AbstractProvider` erweitern). Dokumentation an allen relevanten Stellen.
- **Input-Block:** Neuer Typ **Password** (falls noch nicht vorhanden).

### Abhängigkeiten zur bestehenden Architektur

- **Provider:** `includes/Providers/AbstractProvider.php`, `Registry.php`, `Email.php`, `Database.php`; Hook `gutenform/available_providers`.
- **Formular:** Form-Block (`src/blocks/form/`), Submission-Handler (`includes/Controllers/Submissions/Handler.php`), `submission_data` als flaches Array mit Feld-`name` als Key.
- **Provider-Typen-API:** `GET providers/types` liefert `slug`, `title`, `icon`, `fields` (Settings-Felder). Noch **keine** Unterteilung in Aktionstypen pro Provider.
- **Input-Block:** `src/blocks/input/` – Typen aktuell: text, number, email, tel, url, search; **Password fehlt**.

---

## 2. Provider-System: Refactoring & Erweiterungen

### 2.1 Aktionstypen (Action Types) pro Provider

Ein Provider kann mehrere **Aktionstypen** anbieten (z. B. WordPress: login, register, create_post, comment). Jeder Aktionstyp hat:

- Eindeutige **Slug** (z. B. `register`, `create_post`)
- **Titel** (übersetzt)
- Optionale **Einstellungsfelder** (z. B. Post-Type, Status bei „Post erstellen“)
- **Feld-Mapping-Definition:** welche „Slots“ dieser Typ erwartet (z. B. `username`, `email`, `password` für Register; `title`, `content`, `meta_*` für Post)

**PHP-Seite:**

- `AbstractProvider` erweitern um:
  - `get_action_types(): array` – Liste der Aktionstypen mit `slug`, `title`, `settings_fields` (optional), `field_mapping_slots` (Definition der erwarteten Slots).
- Provider ohne Aktionstypen (z. B. Email, Database) geben ein Default-„Action-Type“ zurück (z. B. `default` mit denselben bisherigen Settings), damit die API einheitlich bleibt.

**Beispiel Signatur (PHP):**

```php
/**
 * Returns available action types for this provider.
 * Each action type can have its own settings and field mapping slots.
 *
 * @return array<int, array{slug: string, title: string, settings_fields?: array, field_mapping_slots: array}>
 */
public function get_action_types(): array
```

**API-Anpassung:**

- `providers/types`: Response pro Provider um `action_types` erweitern. Jeder Eintrag: `slug`, `title`, `settings_fields` (optional), `field_mapping_slots` (z. B. `[{ "key": "username", "label": "Username", "required": true }, ...]`).
- Provider-Feed in DB: neues Feld `action_type` (string, optional). Bei `null`/fehlend: Verhalten wie bisher („default“).

**DB-Migration:**

- Tabelle `wp_gutenform_providers`: Spalte `action_type` (VARCHAR(50) NULL). Bestehende Zeilen: `NULL` = Default-Verhalten.

### 2.2 Feld-Mapping (Form-Block)

- **Konzept:** Pro Provider-Feed (und ggf. pro Aktionstyp) wird gespeichert, welches **Formularfeld** (Block-`name`/clientId) auf welchen **Slot** des Providers gemappt ist.
- **Slots** werden vom Provider/Aktionstyp definiert (z. B. `username`, `email`, `password`, `title`, `content`, `meta_*`). Im Form-Block wird pro Slot ein Dropdown angeboten: „Welches Feld?“ → Liste der Formularfelder (name + label).
- **Speicherort:**  
  - Option A: In den Provider-`settings` als `field_mapping`: `{ "username": "field_abc", "email": "field_def" }` (Feld-Name/ID).  
  - Option B: Form-Block-Attribute: `providerFieldMappings`: `{ providerFeedId: { slotKey: fieldName } }`.  
  Empfehlung: **Option A** (settings), damit das Mapping zum Provider gehört und formularübergreifend konsistent konfigurierbar ist; Form-Block sendet bei Submit nur die gewohnten Feldnamen – der Provider transformiert anhand des gespeicherten Mappings.
- **Submit-Pipeline:** Der Handler übergibt `submission_data` (Feldname → Wert). Provider mit Feld-Mapping können aus den Settings `field_mapping` lesen (Slot → Feldname), die Daten entsprechend umschlüsseln und dann z. B. `post_title`, `user_email` etc. befüllen.

**UI (Form-Block / Provider-Einstellungen):**

- Beim Bearbeiten eines Providers (oder beim Zuweisen zum Formular): Wenn der gewählte Provider/Aktionstyp `field_mapping_slots` hat, Sektion „Feld-Mapping“ anzeigen: pro Slot ein Select mit den aktuellen Formularfeldern (aus dem Form-Block-Kontext).
- Felder-Liste: wie bisher aus dem Form-Block (z. B. `useFormFieldList`) – Namen und ggf. Label der Felder.

### 2.3 Erweiterbarkeit: Eigene Provider (Theme/Plugin)

- **Registrierung:** Bereits umgesetzt über Filter `gutenform/available_providers`. Array von Klassen (z. B. `MyCustomProvider::class`) anhängen; Klasse muss `AbstractProvider` erweitern.
- **Sicherstellen:** Registry prüft bereits `is_subclass_of( $provider_class, AbstractProvider::class )`. In der Doku klar machen: Nur so werden Provider geladen; keine anderen Wege.
- **Dokumentation:**
  - In `documentation/content/docs/` eine Datei **„Provider-System“** (z. B. `provider-system.mdx`): Wie nutzt man Provider (Admin, Form-Block, Submit)? Wie erweitert man das System (eigene Klasse, Hook, Icon, Settings, Aktionstypen, Feld-Mapping)?
  - Code-Kommentare in `AbstractProvider.php` und `Registry.php` um kurze Hinweise auf Doku und Hook ergänzen.
  - README oder Haupt-Doku: Verweis auf „Eigene Provider anlegen“ (Theme/Plugin).

**Beispiel (Dokumentation):**

```php
// In functions.php des Themes oder im eigenen Plugin
add_filter( 'gutenform/available_providers', function( array $provider_classes ): array {
    $provider_classes[] = MyNamespace\MyCustomProvider::class;
    return $provider_classes;
});
```

- **Icon:** Wie bisher: Icon in `assets/providers/{slug}.svg` (oder png/jpg) ablegen; `AbstractProvider::get_icon()` nutzt bereits den Slug.

### 2.4 Zusammenfassung Provider-Refactoring

| Thema | Maßnahme |
|-------|----------|
| Aktionstypen | `AbstractProvider::get_action_types()`, API `providers/types` um `action_types` erweitern, DB `action_type` |
| Feld-Mapping | Slots pro Aktionstyp; Mapping in Provider-`settings.field_mapping`; UI im Form-Block/Provider-Settings |
| Erweiterbarkeit | Filter `gutenform/available_providers` beibehalten; Doku + Code-Kommentare |
| Abwärtskompatibilität | Provider ohne Aktionstypen → ein Default-Aktionstyp; bestehende Feeds ohne `action_type` → wie bisher |

---

## 3. Input-Block: Typ „Password“

- **Prüfen:** Ob der Input-Block bereits den Typ `password` unterstützt (HTML `type="password"`).
- **Falls nicht:**
  - `block.json`: in `attributes.type` Enum/Default anpassen (oder nur Default „text“ lassen, Optionen im Editor).
  - `inspector-controls.tsx`: Option „Password“ in der Typ-Select hinzufügen.
  - `save.tsx`: `type={props.attributes.type}` reicht – sobald `type === 'password'` gesetzt ist, wird `input type="password"` ausgegeben.
  - i18n: Label „Password“ in `Strings.php` + Key z. B. `password` für das Frontend.
- **Validierung:** Keine spezielle Backend-Validierung nötig; Provider (z. B. WordPress Register) nutzen das gemappte Passwort-Feld wie gewohnt.

---

## 4. WordPress-Provider (Implementierung)

### 4.1 Provider-Slug und Klasse

- **Slug:** `wordpress`
- **Klasse:** `Gutenform\Providers\WordPress` in `includes/Providers/WordPress.php`
- **Aktionstypen:** `login`, `register`, `create_post`, `comment`

### 4.2 Aktionstyp: Anmelden (Login)

- **Slug:** `login`
- **Feld-Mapping-Slots:** `username` (oder `user_login`), `password`
- **Logik in `process_submission` (wenn `action_type === 'login'`):**
  - Aus `submission_data` (oder gemappten Daten) `username` und `password` lesen.
  - `wp_signon( array( 'user_login' => ..., 'user_password' => ..., 'remember' => true/false ) )` aufrufen.
  - Bei Erfolg: ggf. Redirect oder Erfolgs-Response; Session-Cookie setzt WordPress automatisch.
  - Bei Fehler: return false; Fehlermeldung über Filter oder Rückgabe an Frontend (je nach bestehender Fehlerbehandlung).
- **Einstellungen (optional):** „Remember me“ (Checkbox), Redirect-URL nach Login.

### 4.3 Aktionstyp: Registrieren

- **Slug:** `register`
- **Feld-Mapping-Slots:** `username`, `email`, `password` (evtl. `password_confirm` nur für Frontend-Validierung)
- **Logik:** `wp_create_user( $username, $password, $email )` oder WP-API nutzen; Rollen-Zuweisung über Einstellung (z. B. „Subscriber“).
- **Einstellungen:** Standard-Rolle, ggf. E-Mail-Benachrichtigung, Passwortstärke-Anforderungen (WP-Standard).

### 4.4 Aktionstyp: Post erstellen

- **Slug:** `create_post`
- **Feld-Mapping-Slots:** `title`, `content`, ggf. `excerpt`; Meta-Felder als dynamische Slots (z. B. `meta_*`).
- **Einstellungen:**
  - Post-Type (z. B. `post`, `page`, oder ein benutzerdefinierter Typ).
  - Status (z. B. `draft`, `publish`, `pending`).
  - Autor: aktueller eingeloggter User oder feste User-ID (Einstellung).
- **Logik:** `wp_insert_post()` mit den gemappten Daten; Meta über `update_post_meta()`.

### 4.5 Aktionstyp: Kommentar schreiben

- **Slug:** `comment`
- **Feld-Mapping-Slots:** `content` (Kommentartext), ggf. `author_name`, `author_email` (falls nicht eingeloggt).
- **Einstellung:** Ziel-Seite/Post: „Aktuelle Seite“ (Standard) = `get_queried_object_id()` bzw. aus Request/Context; optional feste Post-ID.
- **Logik:** `wp_insert_comment()` mit `comment_post_ID`, `comment_content`, ggf. `user_id` wenn eingeloggt.

### 4.6 Sicherheit & Berechtigungen

- Login/Register: Rate-Limiting und Nonce prüfen (bereits bei Submit).
- Post erstellen: Capability prüfen oder nur für eingeloggte User mit definierter Rolle; keine Escalation (z. B. nur `draft`/`pending` erlauben wenn gewünscht).
- Kommentar: WordPress-Standard (Moderation, Spam); `comment_post_ID` strikt aus Kontext/Request validieren.

### 4.7 Icon & Assets

- Icon: `assets/providers/wordpress.svg` (oder png) anlegen; von `get_icon()` automatisch geladen.

---

## 5. API & Datenstrukturen

### 5.1 Provider-Types-Response (erweitert)

```json
{
  "success": true,
  "data": [
    {
      "slug": "wordpress",
      "title": "WordPress",
      "icon": "...",
      "action_types": [
        {
          "slug": "login",
          "title": "Anmelden",
          "settings_fields": [...],
          "field_mapping_slots": [
            { "key": "username", "label": "Benutzername", "required": true },
            { "key": "password", "label": "Passwort", "required": true }
          ]
        },
        {
          "slug": "register",
          "title": "Registrieren",
          "field_mapping_slots": [
            { "key": "username", "label": "Benutzername", "required": true },
            { "key": "email", "label": "E-Mail", "required": true },
            { "key": "password", "label": "Passwort", "required": true }
          ]
        },
        {
          "slug": "create_post",
          "title": "Post erstellen",
          "settings_fields": [
            { "name": "post_type", "type": "select", "options": [...] },
            { "name": "post_status", "type": "select", "options": [...] }
          ],
          "field_mapping_slots": [
            { "key": "title", "label": "Titel", "required": true },
            { "key": "content", "label": "Inhalt", "required": true },
            { "key": "excerpt", "label": "Auszug", "required": false }
          ]
        },
        {
          "slug": "comment",
          "title": "Kommentar schreiben",
          "field_mapping_slots": [
            { "key": "content", "label": "Kommentar", "required": true }
          ]
        }
      ],
      "fields": []
    }
  ]
}
```

Bestehende Provider (Email, Database) liefern z. B. `action_types: [{ "slug": "default", "title": "...", "field_mapping_slots": [] }]` und weiterhin `fields` für die bisherigen Settings.

### 5.2 Provider-Feed (DB) mit action_type und field_mapping

- `wp_gutenform_providers.action_type`: z. B. `login`, `register`, `create_post`, `comment`.
- `wp_gutenform_providers.settings`: JSON; kann enthalten:
  - `field_mapping`: `{ "username": "field_login", "password": "field_pass" }`
  - typspezifische Einstellungen (z. B. `post_type`, `post_status`, `role`).

### 5.3 Submit: Daten an Provider

- Handler ruft weiterhin `$provider->process_submission( $submission_data, $provider_settings, $form_identifier )` auf.
- Provider (z. B. WordPress) liest aus `$provider_settings` den `action_type` und `field_mapping`, rekonstruiert die erwarteten Werte (z. B. `user_login`, `user_password`) und führt die Aktion aus.

---

## 6. Reihenfolge & Meilensteine

### Phase 1: Provider-System (Aktionstypen, Feld-Mapping, Erweiterbarkeit)

| Schritt | Inhalt |
|--------|--------|
| 1.1 | DB-Migration: `action_type` zu `wp_gutenform_providers` hinzufügen |
| 1.2 | `AbstractProvider`: Methode `get_action_types()` mit Default-Implementierung (ein Typ „default“) |
| 1.3 | Email/Database: `get_action_types()` überschreiben, ein Default-Typ mit bisherigen `get_settings_fields()` |
| 1.4 | API `providers/types`: Response um `action_types` pro Provider erweitern |
| 1.5 | Provider-Feed CRUD: `action_type` beim Erstellen/Bearbeiten speichern und auslesen |
| 1.6 | Feld-Mapping: Struktur `field_mapping_slots` pro Aktionstyp definieren; in Settings `field_mapping` speichern |
| 1.7 | Form-Block / Provider-Settings-UI: Sektion „Feld-Mapping“ anzeigen wenn Slots vorhanden; Dropdown pro Slot mit Formularfeldern |
| 1.8 | Handler: `field_mapping` an Provider übergeben; Provider wandelt submission_data ggf. in slot-basierte Daten um (intern) |
| 1.9 | Doku: `documentation/content/docs/provider-system.mdx` (Nutzung + Erweiterung); Kommentare in AbstractProvider + Registry |

### Phase 2: Input-Block Password

| Schritt | Inhalt |
|--------|--------|
| 2.1 | Input-Block: Typ „password“ in block.json (falls nötig), Inspector Select und save.tsx unterstützen |
| 2.2 | i18n: Label „Password“ in Strings.php + Frontend-Key |

### Phase 3: WordPress-Provider

| Schritt | Inhalt |
|--------|--------|
| 3.1 | Klasse `Gutenform\Providers\WordPress` anlegen, `get_action_types()` mit login, register, create_post, comment |
| 3.2 | Aktionstyp „login“: Feld-Mapping, `wp_signon`, Fehlerbehandlung |
| 3.3 | Aktionstyp „register“: Feld-Mapping, `wp_create_user`, Rolle-Einstellung |
| 3.4 | Aktionstyp „create_post“: Einstellungen post_type, post_status; Feld-Mapping title/content/excerpt/meta; `wp_insert_post` |
| 3.5 | Aktionstyp „comment“: Einstellung „aktuelle Seite“; `wp_insert_comment` |
| 3.6 | Registry: WordPress-Provider registrieren (in Basis-Array oder über Filter); Icon `wordpress.svg` |
| 3.7 | Admin-UI: WordPress als Provider-Typ wählbar; nach Auswahl Aktionstyp wählen, dann Settings + Feld-Mapping |

### Phase 4: Dokumentation

| Schritt | Inhalt |
|--------|--------|
| 4.1 | `documentation/content/docs/provider-system.mdx`: Wie nutzt man Provider (Admin, Form-Block, Submit)? |
| 4.2 | Dito: Wie erweitert man (eigene Klasse, Hook `gutenform/available_providers`, Aktionstypen, Feld-Mapping, Icon)? |
| 4.3 | README oder Haupt-Doku: Verweis auf Provider-System und „Eigene Provider anlegen“ |
| 4.4 | Code-Kommentare in AbstractProvider, Registry, ggf. Handler: Verweis auf Doku |

---

## 7. Technische Schnittstellen (Kurz)

### 7.1 Neuer/erweiterter AbstractProvider

- `get_action_types(): array` – liefert Liste der Aktionstypen (slug, title, settings_fields optional, field_mapping_slots).
- Bestehende Methoden `get_slug()`, `get_title()`, `process_submission()`, `get_settings_fields()` bleiben. Bei mehreren Aktionstypen: `get_settings_fields()` kann pro Aktionstyp unterschiedlich sein (aus `get_action_types()[].settings_fields`).

### 7.2 Feld-Mapping im Handler

- Handler ändert sich optional: entweder übergibt er `submission_data` unverändert und der Provider liest `field_mapping` aus Settings und holt sich die Werte selbst; oder der Handler wandelt vorher um. Empfehlung: **Provider macht die Umwandlung** (Slot → Feldname aus mapping, dann Wert aus submission_data).

### 7.3 Erweiterbarkeit

- Filter: `gutenform/available_providers` (Array von Klassen).
- Bedingung: Klasse muss `Gutenform\Providers\AbstractProvider` erweitern.
- Icon: `assets/providers/{slug}.svg` (oder png/jpg) im Plugin; bei eigenen Providern kann ein Plugin eigene Assets ausliefern und `get_icon()` überschreiben.

---

## 8. Dokumentationsorte

| Ort | Inhalt |
|-----|--------|
| `documentation/content/docs/provider-system.mdx` | Vollständige Beschreibung: Nutzung (Admin, Form-Block, Submit), Erweiterung (eigene Klasse, Hook, Aktionstypen, Feld-Mapping) |
| `documentation/content/docs/providers.mdx` | Bestehende Übersicht um Verweis auf provider-system.md und „Eigene Provider“ ergänzen |
| `README.md` | Bereits Hinweis auf `gutenform/available_providers`; um „Eigene Provider“ und Doku-Link ergänzen |
| `includes/Providers/AbstractProvider.php` | PHPDoc: Verweis auf Doku, get_action_types() beschreiben |
| `includes/Providers/Registry.php` | Kommentar: Erweiterung über Filter, Link zur Doku |

---

*Stand: Februar 2026. Bei Umsetzung bestehende i18n-Strategie (PHP-Strings, camelCase-Keys in JS), Projektstruktur und Sicherheitsrichtlinien (Nonce, Capability, Sanitization) beibehalten.*
