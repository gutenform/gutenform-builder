# 📋 Provider-Architektur Integrationsplan für GutenForm

Dieser Plan beschreibt die schrittweise Integration der Provider-Architektur in das bestehende GutenForm Plugin. Die Integration erfolgt schrittweise und ist rückwärtskompatibel mit dem bestehenden System.

---

## 🎯 Übersicht

### Ziel
Integration eines erweiterbaren Provider-Systems, das es ermöglicht, Formular-Submissions über verschiedene Kanäle zu verarbeiten (E-Mail, Datenbank, CRM-APIs, etc.).

### Aktueller Stand
- ✅ Formulare werden als Gutenberg-Blöcke gespeichert
- ✅ Frontend-Submission erfolgt direkt über `window.gutenform.Entries.create()`
- ✅ `Providers` Model existiert bereits in der Datenbank
- ✅ API-Routen sind über `includes/Routes/Api.php` definiert
- ✅ Namespace: `Gutenform\`

### Neue Architektur
- 🔄 Frontend sendet Submissions an neuen zentralen Endpoint `/gutenform/v1/submit`
- 🔄 Submission Handler orchestriert Provider-Verarbeitung
- 🔄 Provider Registry verwaltet alle verfügbaren Provider-Typen (Provider-Klassen) - **KEINE DB nötig**
- 🔄 Provider-Feeds (Provider-Konfigurationen) bleiben in `wp_gutenform_providers` Tabelle
- 🔄 Form-Block hat `provider_ids` Array-Attribut (IDs der Provider-Feeds)
- 🔄 Database Provider läuft automatisch, benötigt keine Konfiguration in DB
- 🔄 **Wichtig:** `form_identifier` ist der Schlüssel, nicht `wp_post_id` (mehrere Formulare pro Seite möglich)

---

## 📁 Neue Verzeichnisstruktur

### Umstrukturierung von `includes/`

```
includes/
├── Admin/
│   └── Menu.php
├── Assets/
│   ├── Admin.php
│   └── Frontend.php
├── Controllers/
│   ├── Database/
│   │   └── Actions.php
│   ├── Entries/
│   │   └── Actions.php
│   ├── EntryLabels/
│   │   └── Actions.php
│   ├── Mailboxes/
│   │   └── Actions.php
│   ├── Posts/
│   │   └── Actions.php
│   ├── Providers/
│   │   └── Actions.php
│   └── Submissions/          [NEU]
│       └── Actions.php       [NEU] - Submission Handler Controller
├── Core/
│   ├── Api.php
│   ├── Deactivate.php
│   └── Install.php
├── Models/
│   ├── Entries.php
│   ├── EntryLabels.php
│   ├── Mailboxes.php
│   ├── Posts.php
│   ├── Providers.php
│   └── Users.php
├── Providers/                [NEU] - Provider-Klassen
│   ├── AbstractProvider.php  [NEU] - Basis-Klasse für alle Provider
│   ├── Email.php             [NEU] - E-Mail Provider
│   ├── Database.php          [NEU] - Datenbank Provider (Entry-Speicherung)
│   └── Registry.php          [NEU] - Provider Registry (Singleton)
├── Routes/
│   └── Api.php               [ERWEITERN] - Neuer Submit-Endpoint
├── Traits/
│   └── Base.php
├── Interfaces/
│   └── Migration.php
└── functions.php
```

---

## 🔧 Schritt-für-Schritt Implementierung

### Phase 1: Provider-Kernarchitektur

#### 1.1 AbstractProvider Basis-Klasse
**Datei:** `includes/Providers/AbstractProvider.php`

```php
<?php
namespace Gutenform\Providers;

abstract class AbstractProvider {
    
    /**
     * Gibt den eindeutigen Slug des Providers zurück.
     * 
     * @return string
     */
    abstract public function get_slug(): string;
    
    /**
     * Gibt den Anzeigenamen des Providers zurück.
     * 
     * @return string
     */
    abstract public function get_title(): string;
    
    /**
     * Verarbeitet eine Formular-Submission.
     * 
     * @param array $submission_data Die Formulardaten
     * @param array $provider_settings Die individuellen Einstellungen für diesen Provider
     * @param int $form_id Die WordPress Post-ID des Formulars
     * @return bool Erfolg der Verarbeitung
     */
    abstract     public function process_submission( 
        array $submission_data, 
        array $provider_settings, 
        string $form_identifier 
    ): bool;
    
    /**
     * Gibt die Feld-Definitionen für die Settings zurück.
     * Wird im Admin-Interface verwendet, um dynamische Formulare zu generieren.
     * 
     * @return array Array von Feld-Definitionen
     */
    abstract public function get_settings_fields(): array;
    
    /**
     * Ersetzt Platzhalter in einem String.
     * 
     * Unterstützt:
     * - {field_slug} - Formularfeld-Werte
     * - {form_id} - Formular-ID
     * - {form_title} - Formular-Titel
     * - {site_name} - Site-Name
     * - {date} - Aktuelles Datum
     * - {time} - Aktuelle Uhrzeit
     * 
     * @param string $content Der String mit Platzhaltern
     * @param array $submission_data Die Formulardaten
     * @param int $form_id Die WordPress Post-ID
     * @return string String mit ersetzten Platzhaltern
     */
    protected function replace_placeholders( 
        string $content, 
        array $submission_data, 
        string $form_identifier 
    ): string {
        // Implementierung der Platzhalter-Ersetzung
        // {field_slug}, {form_identifier}, {form_title}, {site_name}, {date}, {time}, {ip_address}
    }
}
```

#### 1.2 Provider Registry (Singleton)
**Datei:** `includes/Providers/Registry.php`

```php
<?php
namespace Gutenform\Providers;

use Gutenform\Traits\Base;

class Registry {
    use Base;
    
    /**
     * Array aller registrierten Provider-Instanzen.
     * 
     * @var array<string, AbstractProvider>
     */
    private array $providers = [];
    
    /**
     * Initialisiert die Registry und registriert alle Provider.
     */
    private function __construct() {
        $this->register_all_providers();
    }
    
    /**
     * Registriert alle verfügbaren Provider.
     * 
     * Nutzt WordPress Hook 'gutenform/available_providers' für Erweiterungen.
     */
    private function register_all_providers(): void {
        // Basis-Provider
        $base_providers = array(
            Email::class,
            Database::class,
        );
        
        // Hook für externe Provider
        $provider_classes = apply_filters( 
            'gutenform/available_providers', 
            $base_providers 
        );
        
        // Instanziieren und speichern
        foreach ( $provider_classes as $provider_class ) {
            if ( is_subclass_of( $provider_class, AbstractProvider::class ) ) {
                $instance = new $provider_class();
                $this->providers[ $instance->get_slug() ] = $instance;
            }
        }
    }
    
    /**
     * Gibt eine Provider-Instanz zurück.
     * 
     * @param string $slug Der Provider-Slug
     * @return AbstractProvider|null Die Provider-Instanz oder null
     */
    public function get_provider( string $slug ): ?AbstractProvider {
        return $this->providers[ $slug ] ?? null;
    }
    
    /**
     * Gibt alle registrierten Provider zurück.
     * 
     * @return array<string, AbstractProvider>
     */
    public function get_all_providers(): array {
        return $this->providers;
    }
    
    /**
     * Prüft, ob ein Provider existiert.
     * 
     * @param string $slug Der Provider-Slug
     * @return bool
     */
    public function has_provider( string $slug ): bool {
        return isset( $this->providers[ $slug ] );
    }
}
```

#### 1.3 E-Mail Provider
**Datei:** `includes/Providers/Email.php`

```php
<?php
namespace Gutenform\Providers;

class Email extends AbstractProvider {
    
    public function get_slug(): string {
        return 'email';
    }
    
    public function get_title(): string {
        return __( 'E-Mail Benachrichtigung', 'gutenform' );
    }
    
    public function process_submission( 
        array $submission_data, 
        array $provider_settings, 
        string $form_identifier 
    ): bool {
        // 1. Platzhalter ersetzen
        $to_email = $provider_settings['to_email'] ?? '';
        $subject = $this->replace_placeholders( 
            $provider_settings['subject'] ?? '', 
            $submission_data, 
            $form_identifier 
        );
        $body = $this->replace_placeholders( 
            $provider_settings['body'] ?? '', 
            $submission_data, 
            $form_identifier 
        );
        $from_email = $this->replace_placeholders( 
            $provider_settings['from_email'] ?? get_option( 'admin_email' ), 
            $submission_data, 
            $form_identifier 
        );
        $from_name = $this->replace_placeholders( 
            $provider_settings['from_name'] ?? get_bloginfo( 'name' ), 
            $submission_data, 
            $form_identifier 
        );
        
        // 2. Header erstellen
        $headers = array(
            'From: ' . $from_name . ' <' . $from_email . '>',
            'Content-Type: text/html; charset=UTF-8',
        );
        
        // 3. E-Mail versenden
        return wp_mail( $to_email, $subject, $body, $headers );
    }
    
    public function get_settings_fields(): array {
        return array(
            array(
                'name' => 'to_email',
                'label' => __('E-Mail-Adresse', 'gutenform'),
                'type' => 'email',
                'required' => true,
                'default' => '',
                'description' => __('E-Mail-Adresse, an die die Benachrichtigung gesendet wird.', 'gutenform'),
                'placeholder' => 'admin@example.com',
            ),
            array(
                'name' => 'subject',
                'label' => __('Betreff', 'gutenform'),
                'type' => 'text',
                'required' => true,
                'default' => __('Neue Formular-Übermittlung: {form_title}', 'gutenform'),
                'description' => __('Betreff der E-Mail. Platzhalter wie {form_title} werden ersetzt.', 'gutenform'),
            ),
            array(
                'name' => 'body',
                'label' => __('Nachricht', 'gutenform'),
                'type' => 'textarea',
                'required' => true,
                'default' => '',
                'description' => __('E-Mail-Nachricht. HTML erlaubt. Platzhalter wie {field_name} werden ersetzt.', 'gutenform'),
                'rows' => 6,
            ),
            array(
                'name' => 'from_email',
                'label' => __('Absender E-Mail', 'gutenform'),
                'type' => 'email',
                'required' => false,
                'default' => get_option('admin_email'),
                'description' => __('E-Mail-Adresse des Absenders.', 'gutenform'),
            ),
            array(
                'name' => 'from_name',
                'label' => __('Absender Name', 'gutenform'),
                'type' => 'text',
                'required' => false,
                'default' => get_bloginfo('name'),
                'description' => __('Name des Absenders.', 'gutenform'),
            ),
        );
    }
}
```

#### 1.4 Datenbank Provider (Entry-Speicherung)
**Datei:** `includes/Providers/Database.php`

```php
<?php
namespace Gutenform\Providers;

use Gutenform\Models\Entries;

class Database extends AbstractProvider {
    
    public function get_slug(): string {
        return 'database';
    }
    
    public function get_title(): string {
        return __( 'Datenbank-Speicherung', 'gutenform' );
    }
    
    public function process_submission( 
        array $submission_data, 
        array $provider_settings, 
        string $form_identifier 
    ): bool {
        try {
            $entry = new Entries();
            $entry->mailbox_id     = $provider_settings['mailbox_id'] ?? 1;
            $entry->form_identifier = $form_identifier;
            $entry->wp_post_id     = $provider_settings['wp_post_id'] ?? null; // Optional
            $entry->data            = $submission_data;
            $entry->ip_address     = $this->get_client_ip();
            $entry->is_read         = false;
            $entry->date_created    = current_time( 'mysql' );
            
            return $entry->save();
        } catch ( \Exception $e ) {
            error_log( 'GutenForm Database Provider Error: ' . $e->getMessage() );
            return false;
        }
    }
    
    public function get_settings_fields(): array {
        return array(
            array(
                'name' => 'mailbox_id',
                'label' => __('Mailbox ID', 'gutenform'),
                'type' => 'number',
                'required' => true,
                'default' => 1,
                'description' => __('ID der Mailbox, in der der Eintrag gespeichert wird.', 'gutenform'),
                'min' => 1,
            ),
        );
    }
    
    /**
     * Ermittelt die Client-IP-Adresse.
     * 
     * @return string
     */
    private function get_client_ip(): string {
        // Implementierung der IP-Erkennung
    }
}
```

---

### Phase 2: Submission Handler

#### 2.1 Submission Handler Klasse
**Datei:** `includes/Controllers/Submissions/Handler.php`

```php
<?php
namespace Gutenform\Controllers\Submissions;

use Gutenform\Providers\Registry;

class Handler {
    
    /**
     * Verarbeitet eine Formular-Submission.
     * 
     * @param array $submission_data Die Formulardaten
     * @param int $form_id Die WordPress Post-ID des Formulars
     * @return array Ergebnis mit success, errors, etc.
     */
    public function process( array $submission_data, int $form_id ): array {
        $errors = array();
        $results = array();
        
        // 1. Provider-Feeds aus Post Meta laden
        $provider_feeds = $this->get_provider_feeds( $form_id );
        
        if ( empty( $provider_feeds ) ) {
            return array(
                'success' => false,
                'errors'  => array( __( 'Keine Provider für dieses Formular konfiguriert.', 'gutenform' ) ),
            );
        }
        
        // 2. Registry abrufen
        $registry = Registry::get_instance();
        
        // 3. Durch alle Provider-Feeds iterieren
        foreach ( $provider_feeds as $feed ) {
            $provider_slug = $feed['provider_slug'] ?? '';
            $provider_settings = $feed['settings'] ?? array();
            $is_active = $feed['is_active'] ?? true;
            
            // Überspringe inaktive Feeds
            if ( ! $is_active ) {
                continue;
            }
            
            // Provider abrufen
            $provider = $registry->get_provider( $provider_slug );
            
            if ( ! $provider ) {
                $errors[] = sprintf( 
                    __( 'Provider "%s" nicht gefunden.', 'gutenform' ), 
                    $provider_slug 
                );
                continue;
            }
            
            // Provider verarbeiten
            try {
                $success = $provider->process_submission( 
                    $submission_data, 
                    $provider_settings, 
                    $form_id 
                );
                
                $results[ $provider_slug ] = array(
                    'success' => $success,
                    'provider' => $provider->get_title(),
                );
                
                if ( ! $success ) {
                    $errors[] = sprintf( 
                        __( 'Provider "%s" konnte die Submission nicht verarbeiten.', 'gutenform' ), 
                        $provider->get_title() 
                    );
                }
            } catch ( \Exception $e ) {
                $errors[] = sprintf( 
                    __( 'Fehler in Provider "%s": %s', 'gutenform' ), 
                    $provider->get_title(), 
                    $e->getMessage() 
                );
                $results[ $provider_slug ] = array(
                    'success' => false,
                    'error'   => $e->getMessage(),
                );
            }
        }
        
        // 4. Ergebnis zusammenstellen
        $overall_success = empty( $errors ) || count( $errors ) < count( $provider_feeds );
        
        return array(
            'success' => $overall_success,
            'errors'  => $errors,
            'results' => $results,
        );
    }
    
    /**
     * Lädt die Provider-Feeds für ein Formular aus Post Meta.
     * 
     * @param int $form_id Die WordPress Post-ID
     * @return array Array von Provider-Feed-Konfigurationen
     */
    private function get_provider_feeds( int $form_id ): array {
        $feeds = get_post_meta( $form_id, '_gutenform_provider_feeds', true );
        
        if ( ! is_array( $feeds ) ) {
            return array();
        }
        
        // Sortiere nach Reihenfolge (order)
        usort( $feeds, function( $a, $b ) {
            $order_a = $a['order'] ?? 999;
            $order_b = $b['order'] ?? 999;
            return $order_a <=> $order_b;
        } );
        
        return $feeds;
    }
}
```

#### 2.2 Submission Controller
**Datei:** `includes/Controllers/Submissions/Actions.php`

```php
<?php
namespace Gutenform\Controllers\Submissions;

class Actions {
    
    /**
     * Verarbeitet eine Formular-Submission.
     * 
     * @param \WP_REST_Request $request
     * @return array|\WP_Error
     */
    public function submit( \WP_REST_Request $request ) {
        // 1. Nonce-Prüfung
        $nonce = $request->get_header( 'X-WP-Nonce' );
        if ( ! wp_verify_nonce( $nonce, 'wp_rest' ) ) {
            return new \WP_Error(
                'invalid_nonce',
                __( 'Ungültiger Nonce.', 'gutenform' ),
                array( 'status' => 403 )
            );
        }
        
        // 2. Daten extrahieren
        $submission_data = $request->get_param( 'submission_data' ) ?? array();
        $form_identifier = sanitize_text_field( $request->get_param( 'form_identifier' ) ?? '' );
        $provider_ids = $request->get_param( 'provider_ids' ) ?? array();
        
        // 3. Validierung
        if ( empty( $form_identifier ) ) {
            return new \WP_Error(
                'missing_form_identifier',
                __( 'Formular-Identifier fehlt.', 'gutenform' ),
                array( 'status' => 400 )
            );
        }
        
        // 4. Submission Handler aufrufen
        $handler = new Handler();
        $result = $handler->process( $submission_data, $form_identifier, $provider_ids );
        
        // 5. Antwort zurückgeben
        if ( $result['success'] ) {
            return array(
                'success' => true,
                'message' => __( 'Formular erfolgreich übermittelt.', 'gutenform' ),
                'data'    => $result,
            );
        } else {
            return new \WP_Error(
                'submission_failed',
                __( 'Fehler bei der Formular-Übermittlung.', 'gutenform' ),
                array(
                    'status' => 500,
                    'errors' => $result['errors'],
                    'results' => $result['results'],
                )
            );
        }
    }
}
```

---

### Phase 3: API-Route Integration

#### 3.1 Neue Route hinzufügen
**Datei:** `includes/Routes/Api.php` (ERWEITERN)

```php
// In der Route-Definition hinzufügen:

// Submissions route (NEU)
$route->post('/submit', '\Gutenform\Controllers\Submissions\Actions@submit');
```

---

### Phase 4: Frontend-Integration

#### 4.1 Frontend-Submission umleiten
**Datei:** `src/blocks/form/view.ts` (ANPASSEN)

**Aktuell:**
```typescript
window.gutenform?.Entries.create({
    mailbox_id: mailboxId,
    form_identifier: formIdentifier,
    data,
});
```

**Neu:**
```typescript
// Neue Submission-Funktion
async function submitForm(formData: Record<string, FormDataEntryValue>, formId: string, formOptions: any) {
    try {
        const response = await fetch(
            window.gutenform?.apiUrl + 'gutenform/v1/submit',
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-WP-Nonce': window.gutenform?.nonce || '',
                },
                body: JSON.stringify({
                    form_id: formOptions.wp_post_id || 0,
                    submission_data: formData,
                }),
            }
        );
        
        const result = await response.json();
        
        if (result.success) {
            // Erfolg-Handling (z.B. Success-Message anzeigen)
            console.log('Form submitted successfully', result);
        } else {
            // Fehler-Handling
            console.error('Form submission failed', result);
        }
    } catch (error) {
        console.error('Form submission error', error);
    }
}

// Im Event-Listener verwenden:
form.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(form as HTMLFormElement);
    const data = Object.fromEntries(formData);
    
    submitForm(data, formOptions.formId, formOptions);
});
```

#### 4.2 TypeScript-Typen erweitern
**Datei:** `src/lib/gutenform-entries.ts` (ERWEITERN)

Neue Funktion für Submission-API hinzufügen oder separate Datei `src/lib/gutenform-submit.ts` erstellen.

---

### Phase 5: Provider-Feed Verwaltung

#### 5.1 Admin-Interface für Provider-Feeds
**Neue Datei:** `src/admin/pages/settings/provider-feeds.tsx`

React-Komponente zum Verwalten der Provider-Feeds pro Formular.

#### 5.2 API-Endpoints für Provider-Feeds
**Datei:** `includes/Routes/Api.php` (ERWEITERN)

```php
// Provider Feeds routes
$route->get('/forms/{id}/provider-feeds', '\Gutenform\Controllers\Submissions\Actions@get_provider_feeds');
$route->post('/forms/{id}/provider-feeds', '\Gutenform\Controllers\Submissions\Actions@save_provider_feeds');
```

**Datei:** `includes/Controllers/Submissions/Actions.php` (ERWEITERN)

```php
public function get_provider_feeds( \WP_REST_Request $request ) {
    $form_id = absint( $request->get_param( 'id' ) );
    $feeds = get_post_meta( $form_id, '_gutenform_provider_feeds', true );
    
    return array(
        'success' => true,
        'data'    => is_array( $feeds ) ? $feeds : array(),
    );
}

public function save_provider_feeds( \WP_REST_Request $request ) {
    $form_id = absint( $request->get_param( 'id' ) );
    $feeds = $request->get_param( 'feeds' );
    
    update_post_meta( $form_id, '_gutenform_provider_feeds', $feeds );
    
    return array(
        'success' => true,
        'message' => __( 'Provider-Feeds gespeichert.', 'gutenform' ),
    );
}
```

---

## 🔄 Migrationspfad & Rückwärtskompatibilität

### Option 1: Paralleler Betrieb (Empfohlen)
- Alte `Entries.create()` Route bleibt bestehen
- Neue `/submit` Route wird zusätzlich angeboten
- Frontend kann schrittweise migriert werden

### Option 2: Automatische Umleitung
- `Entries.create()` Route leitet intern an Submission Handler weiter
- Keine Breaking Changes für bestehende Implementierungen

### Option 3: Feature Flag
- Konfigurierbar über Plugin-Einstellungen
- Ermöglicht schrittweise Migration

---

## 📝 Provider-Feed Datenstruktur

### Datenbank-Format: `wp_gutenform_providers`

**Tabellen-Struktur (nach Migration):**
```sql
CREATE TABLE `wp_gutenform_providers` (
    `id` BIGINT(20) UNSIGNED NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL,
    `provider_type` VARCHAR(50) NOT NULL COMMENT 'Provider-Klasse Slug (email, webhook, etc.)',
    `form_identifier` VARCHAR(100) DEFAULT NULL COMMENT 'Formular-Identifier, NULL = Global',
    `settings` LONGTEXT NOT NULL COMMENT 'JSON-Konfiguration',
    `is_active` TINYINT(1) DEFAULT 1,
    `date_created` DATETIME NOT NULL,
    PRIMARY KEY (`id`),
    KEY `idx_provider_type` (`provider_type`),
    KEY `idx_form_identifier` (`form_identifier`)
);
```

**Wichtig:**
- `id` ist UNIQUE (Primary Key)
- `provider_type` ist **NICHT unique** - mehrere Provider pro Type möglich
- `form_identifier` ist optional (NULL = globaler Provider)

**Beispiel-Daten:**
```php
// Provider-Feed 1: E-Mail Provider (global)
array(
    'id' => 1,
    'name' => 'E-Mail Benachrichtigung',
    'provider_type' => 'email',  // Verweist auf Email::class
    'form_identifier' => NULL,  // NULL = globaler Provider
    'is_active' => true,
    'settings' => array(
        'to_email' => 'admin@example.com',
        'subject' => 'Neue Formular-Übermittlung: {form_title}',
        'body' => 'Formular-Daten: {field_name}, {field_email}',
        'from_email' => '{field_email}',
        'from_name' => '{field_name}',
    ),
    'date_created' => '2024-01-01 12:00:00',
)

// Provider-Feed 2: Webhook Provider (formular-spezifisch)
array(
    'id' => 2,
    'name' => 'Webhook zu CRM',
    'provider_type' => 'webhook',  // Verweist auf Webhook::class
    'form_identifier' => 'contact-form',  // Formular-spezifisch
    'is_active' => true,
    'settings' => array(
        'url' => 'https://crm.example.com/webhook',
        'method' => 'POST',
        'headers' => array('Authorization' => 'Bearer token'),
    ),
    'date_created' => '2024-01-01 12:05:00',
)

// Database Provider: Läuft automatisch, kein DB-Eintrag nötig!
// Wird immer zuerst ausgeführt mit Standard-Einstellungen
```

**Wichtige Punkte:**
- `form_identifier = NULL` = Globaler Provider (kann allen Formularen zugewiesen werden)
- `form_identifier = 'contact-form'` = Formular-spezifischer Provider
- Database Provider läuft **IMMER automatisch**, benötigt keinen DB-Eintrag
- Mehrere Provider pro Formular möglich (z.B. Email + Webhook)
- Form-Block hat `provider_ids` Array - IDs der Provider-Feeds, die verwendet werden

---

## 🧪 Testing-Strategie

### Unit Tests
- Provider-Klassen isoliert testen
- Registry-Funktionalität testen
- Platzhalter-Ersetzung testen

### Integration Tests
- End-to-End Submission-Workflow
- Provider-Feed-Konfiguration
- Fehlerbehandlung

### Manuelle Tests
- Formular-Submission im Frontend
- Provider-Konfiguration im Admin
- E-Mail-Versand testen

---

## 🚀 Implementierungsreihenfolge

1. ✅ **Phase 1:** Provider-Kernarchitektur (AbstractProvider, Registry, Email, Database)
2. ✅ **Phase 2:** Submission Handler & Controller
3. ✅ **Phase 3:** API-Route hinzufügen
4. ✅ **Phase 4:** Frontend-Integration (optional: Feature Flag)
5. ✅ **Phase 5:** Admin-Interface für Provider-Feeds
6. ✅ **Phase 6:** Dokumentation & Testing
7. ✅ **Phase 7:** Migration bestehender Formulare (falls nötig)

---

## 📚 Erweiterbarkeit

### Externe Provider hinzufügen

```php
// In einem anderen Plugin oder Theme:
add_filter( 'gutenform/available_providers', function( $providers ) {
    $providers[] = MyCustomProvider::class;
    return $providers;
} );
```

### Custom Provider Beispiel

```php
class MyCustomProvider extends \Gutenform\Providers\AbstractProvider {
    public function get_slug(): string {
        return 'my-custom-provider';
    }
    
    public function get_title(): string {
        return 'Mein Custom Provider';
    }
    
    public function process_submission( array $data, array $settings, int $form_id ): bool {
        // Custom Logik
        return true;
    }
}
```

---

## ⚠️ Wichtige Hinweise

1. **Namespace-Konsistenz:** Alle neuen Klassen nutzen `Gutenform\` Namespace
2. **WordPress Standards:** Folgt WordPress Coding Standards
3. **Sicherheit:** Nonce-Verification, Input-Sanitization, Output-Escaping
4. **Performance:** Provider-Registry wird nur einmal initialisiert (Singleton)
5. **Fehlerbehandlung:** Umfassendes Error-Logging und User-Feedback

---

## 🔍 Offene Fragen / Entscheidungen

1. **Form-ID Identifikation:**
   - ✅ **`form_identifier` ist der Schlüssel** (String, z.B. "contact-form")
   - ✅ **`wp_post_id` ist NICHT relevant** für Provider-Zuordnung (mehrere Formulare pro Seite möglich)
   - ✅ **Form-Block hat `provider_ids` Array** - IDs der Provider-Feeds, die für dieses Formular verwendet werden

2. **Provider-Feed Standard-Konfiguration:**
   - Database Provider läuft automatisch, benötigt keine Konfiguration
   - Neue Formulare können optional Provider-Feeds haben (Email, Webhook, etc.)
   - Keine Standard-Feeds nötig, da Database Provider immer aktiv ist

3. **Fehlerbehandlung:**
   - Soll die Submission fehlschlagen, wenn ein Provider fehlschlägt?
   - Aktueller Plan: Submission gilt als erfolgreich, wenn mindestens ein Provider erfolgreich ist

4. **Migration bestehender Entries:**
   - Sollen bestehende Entries automatisch über Provider-System laufen?
   - Empfehlung: Nein, nur neue Submissions

---

---

## 🔍 Detaillierte Analyse: Aktueller Stand vs. Zielzustand

### ✅ Was bereits vorhanden ist

#### Backend (PHP)
1. **Models:**
   - ✅ `Gutenform\Models\Entries` - Vollständig implementiert mit Relationships
   - ✅ `Gutenform\Models\Providers` - Datenbank-Model existiert, aber nur als Datenstruktur
   - ✅ Eloquent ORM Integration funktioniert

2. **Controllers:**
   - ✅ `Gutenform\Controllers\Entries\Actions` - CRUD-Operationen für Entries
   - ✅ `Gutenform\Controllers\Providers\Actions` - CRUD-Operationen für Provider (nur Datenbank-Verwaltung)
   - ✅ Alle Controller nutzen WordPress REST API Standard

3. **API-Routen:**
   - ✅ `includes/Routes/Api.php` - Route-System funktioniert
   - ✅ Route-Prefix: `gutenform/v1`
   - ✅ Hook-System für Erweiterungen vorhanden: `do_action('gf_api', $route)`

4. **Datenbank:**
   - ✅ Tabelle `wp_gutenform_entries` existiert mit allen benötigten Feldern
   - ✅ Tabelle `wp_gutenform_providers` existiert (aber aktuell nur für Provider-Konfigurationen, nicht für Provider-Klassen)
   - ✅ Migrationen vorhanden in `database/Migrations/`

5. **Plugin-Initialisierung:**
   - ✅ `plugin.php` - Haupt-Plugin-Klasse mit Singleton-Pattern
   - ✅ Namespace: `Gutenform\`
   - ✅ Asset-Management über `Gutenform\Assets\Frontend`

#### Frontend (TypeScript/React)
1. **Form-Block:**
   - ✅ `src/blocks/form/view.ts` - Frontend-Submission-Handler
   - ✅ `src/blocks/form/edit.tsx` - Block-Editor-Interface
   - ✅ `src/blocks/form/save.tsx` - Block-Save-Funktion
   - ✅ Form-Attribute: `mailboxId`, `formId`, `formTitle`, `skin`

2. **API-Integration:**
   - ✅ `src/lib/gutenform-entries.ts` - TypeScript-Klasse für Entries-API
   - ✅ `window.gutenform` Objekt wird im Frontend bereitgestellt
   - ✅ Nonce und API-URL werden automatisch lokalisiert

3. **Aktueller Submission-Flow:**
   ```typescript
   // Aktuell in src/blocks/form/view.ts (Zeile 55-59)
   window.gutenform?.Entries.create({
       mailbox_id: mailboxId,
       form_identifier: formIdentifier,
       data,
   });
   ```

### ❌ Was fehlt / Neu erstellt werden muss

#### Backend (PHP)
1. **Provider-Architektur:**
   - ❌ `includes/Providers/` Verzeichnis existiert nicht
   - ❌ `AbstractProvider.php` - Basis-Klasse
   - ❌ `Registry.php` - Provider-Registry (Singleton)
   - ❌ `Email.php` - E-Mail-Provider
   - ❌ `Database.php` - Datenbank-Provider

2. **Submission Handler:**
   - ❌ `includes/Controllers/Submissions/` Verzeichnis existiert nicht
   - ❌ `Handler.php` - Submission-Orchestrierung
   - ❌ `Actions.php` - REST API Controller für `/submit`

3. **Provider-Feed Verwaltung:**
   - ⚠️ `wp_gutenform_providers` Tabelle muss erweitert werden
   - ⚠️ UNIQUE KEY muss geändert werden: `provider_type` darf nicht unique sein, nur `id` ist unique
   - ✅ API-Endpoints für Provider-Feed CRUD existieren bereits (`/providers/*`)
   - ⚠️ Admin-Interface existiert (`providers.tsx`), muss erweitert werden für Provider-Type-Feld-Definitionen

4. **API-Route:**
   - ❌ Route `/gutenform/v1/submit` existiert nicht

#### Frontend (TypeScript/React)
1. **Submission-Integration:**
   - ❌ Neue Submission-Funktion für `/submit` Endpoint
   - ❌ `wp_post_id` wird aktuell nicht ermittelt/übergeben
   - ❌ Feature Flag für Migration fehlt

2. **Admin-Interface:**
   - ❌ Provider-Feed-Konfiguration-UI fehlt
   - ❌ Provider-Auswahl und -Einstellungen fehlen

### 🔄 Was verändert werden muss

#### Backend (PHP)
1. **Entries Controller:**
   - ⚠️ `Entries\Actions@create` sollte optional an Submission Handler delegieren können
   - ⚠️ Oder: Neue Route parallel betreiben (empfohlen)

2. **Provider Model & Datenbank:**
   - ⚠️ Aktuell: `Providers` Model verwaltet Provider-Feeds (Konfigurationen) in DB
   - ⚠️ Problem: Tabelle hat `UNIQUE KEY` auf `provider_type` - nur ein Provider pro Type möglich
   - ⚠️ **Lösung:** Migration nötig: 
     - `form_identifier` Feld hinzufügen (VARCHAR, NULL erlaubt für globale Provider)
     - UNIQUE KEY auf `provider_type` entfernen
     - Nur `id` bleibt UNIQUE
   - ⚠️ **Wichtig:** Database Provider läuft automatisch, braucht keinen DB-Eintrag
   - ⚠️ **Wichtig:** Provider-Klassen (Email, Webhook, etc.) werden in Registry zusammengestellt, keine DB nötig

#### Frontend (TypeScript)
1. **Form-Submission:**
   - ⚠️ `src/blocks/form/view.ts` muss angepasst werden
   - ⚠️ `provider_ids` Array muss aus Form-Attributen gezogen werden
   - ⚠️ `form_identifier` wird bereits verwendet (aus `formOptions.formId`)
   - ⚠️ Neue Submission-Funktion implementieren

2. **Form-Attribute:**
   - ⚠️ `provider_ids` Array muss als Attribut hinzugefügt werden (Array von Provider-Feed-IDs)
   - ⚠️ Form-Block muss Provider-Auswahl im Editor ermöglichen

---

## 📋 Detaillierter Migrationsplan

### Phase 0: Vorbereitung & Analyse

#### Schritt 0.1: Bestandsaufnahme
- [x] ✅ Aktuelle Codebase analysiert
- [x] ✅ Vorhandene Komponenten identifiziert
- [x] ✅ Fehlende Komponenten dokumentiert
- [ ] ⏳ Entscheidung: Provider-Konfigurationen in DB vs. Post Meta
- [ ] ⏳ Entscheidung: Migration-Strategie (Feature Flag vs. sofortige Umstellung)

#### Schritt 0.2: Entscheidungen treffen
**Entscheidung 1: Provider-Konfigurationen (BEREITS ENTSCHIEDEN)**
- ✅ **Provider-Feeds = Provider in der Datenbank** (`wp_gutenform_providers`)
- ✅ **Provider-Type = Provider-Klassen** (Email, Webhook, etc.) - **KEINE DB nötig, nur Registry**
- ✅ **Database Provider läuft automatisch**, benötigt keinen DB-Eintrag
- ⚠️ **Migration nötig:** Tabelle muss `form_identifier` Feld erhalten, UNIQUE KEY auf `provider_type` entfernen

**Entscheidung 2: Form-ID Identifikation (BEREITS ENTSCHIEDEN)**
- ✅ **`form_identifier` ist der Schlüssel** (String, z.B. "contact-form")
- ✅ **`wp_post_id` ist NICHT relevant** für Provider-Zuordnung (mehrere Formulare pro Seite möglich)
- ✅ **Form-Block hat `provider_ids` Array** - IDs der Provider-Feeds, die für dieses Formular verwendet werden

**Entscheidung 3: Migration-Strategie**
- **Option A:** Feature Flag (empfohlen)
  - Pro: Schrittweise Migration möglich
  - Pro: Einfaches Rollback
  - Pro: Testing in Produktion möglich
  
- **Option B:** Sofortige Umstellung
  - Pro: Einfacher
  - Contra: Höheres Risiko

**Empfehlung:** Option A mit Feature Flag

---

### Phase 1: Provider-Kernarchitektur (NEU)

#### Schritt 1.1: Verzeichnisstruktur erstellen
```bash
mkdir -p includes/Providers
```

**Dateien zu erstellen:**
- [ ] `includes/Providers/AbstractProvider.php`
- [ ] `includes/Providers/Registry.php`
- [ ] `includes/Providers/Email.php`
- [ ] `includes/Providers/Database.php`

#### Schritt 1.2: AbstractProvider implementieren
**Datei:** `includes/Providers/AbstractProvider.php`

**Wichtige Punkte:**
- Platzhalter-Ersetzung muss unterstützen:
  - `{field_slug}` - Formularfeld-Werte
  - `{form_identifier}` - Form-Identifier
  - `{form_title}` - Formular-Titel
  - `{site_name}` - Site-Name
  - `{date}` - Aktuelles Datum
  - `{time}` - Aktuelle Uhrzeit
  - `{ip_address}` - IP-Adresse

**NEU: Feld-Definitionen für Admin-Interface:**
```php
/**
 * Gibt die Feld-Definitionen für die Settings zurück.
 * Wird im Admin-Interface verwendet, um dynamische Formulare zu generieren.
 * 
 * @return array Array von Feld-Definitionen
 */
abstract public function get_settings_fields(): array;

/**
 * Beispiel-Implementierung in Email Provider:
 */
public function get_settings_fields(): array {
    return array(
        array(
            'name' => 'to_email',
            'label' => __('E-Mail-Adresse', 'gutenform'),
            'type' => 'email',
            'required' => true,
            'default' => '',
            'description' => __('E-Mail-Adresse, an die die Benachrichtigung gesendet wird.', 'gutenform'),
            'placeholder' => 'admin@example.com',
        ),
        array(
            'name' => 'subject',
            'label' => __('Betreff', 'gutenform'),
            'type' => 'text',
            'required' => true,
            'default' => __('Neue Formular-Übermittlung: {form_title}', 'gutenform'),
            'description' => __('Betreff der E-Mail. Platzhalter wie {form_title} werden ersetzt.', 'gutenform'),
        ),
        array(
            'name' => 'body',
            'label' => __('Nachricht', 'gutenform'),
            'type' => 'textarea',
            'required' => true,
            'default' => '',
            'description' => __('E-Mail-Nachricht. HTML erlaubt. Platzhalter wie {field_name} werden ersetzt.', 'gutenform'),
            'rows' => 6,
        ),
        array(
            'name' => 'from_email',
            'label' => __('Absender E-Mail', 'gutenform'),
            'type' => 'email',
            'required' => false,
            'default' => get_option('admin_email'),
            'description' => __('E-Mail-Adresse des Absenders.', 'gutenform'),
        ),
        array(
            'name' => 'from_name',
            'label' => __('Absender Name', 'gutenform'),
            'type' => 'text',
            'required' => false,
            'default' => get_bloginfo('name'),
            'description' => __('Name des Absenders.', 'gutenform'),
        ),
    );
}
```

**Unterstützte Feld-Typen:**
- `text` - Text-Input
- `email` - E-Mail-Input mit Validierung
- `number` - Zahlen-Input
- `textarea` - Mehrzeiliger Text
- `select` - Dropdown (benötigt `options` Array)
- `checkbox` - Checkbox
- `url` - URL-Input
- `password` - Passwort-Input (maskiert)

**Feld-Definition Struktur:**
```php
array(
    'name' => string,           // Feld-Name (wird als Key in settings verwendet)
    'label' => string,          // Anzeige-Label
    'type' => string,          // Feld-Typ (siehe oben)
    'required' => bool,        // Pflichtfeld?
    'default' => mixed,        // Standard-Wert
    'description' => string,   // Hilfe-Text
    'placeholder' => string,   // Placeholder-Text (optional)
    'options' => array,        // Für select: array('value' => 'label')
    'rows' => int,             // Für textarea: Anzahl Zeilen
    'min' => int,              // Für number: Minimum
    'max' => int,              // Für number: Maximum
    'pattern' => string,       // Regex-Pattern für Validierung (optional)
)
```

**Abhängigkeiten:**
- Keine (Basis-Klasse)

#### Schritt 1.3: Registry implementieren
**Datei:** `includes/Providers/Registry.php`

**Wichtige Punkte:**
- Singleton-Pattern (nutzt `Gutenform\Traits\Base`)
- WordPress Hook: `gutenform/available_providers`
- Lazy Loading der Provider-Instanzen

**Abhängigkeiten:**
- `Gutenform\Traits\Base`
- `Gutenform\Providers\AbstractProvider`

#### Schritt 1.4: Email Provider implementieren
**Datei:** `includes/Providers/Email.php`

**Wichtige Punkte:**
- Nutzt `wp_mail()` für E-Mail-Versand
- Unterstützt HTML-E-Mails
- From-Name und From-Email konfigurierbar
- Platzhalter in Subject, Body, From-Email, From-Name

**Abhängigkeiten:**
- `Gutenform\Providers\AbstractProvider`

#### Schritt 1.5: Database Provider implementieren
**Datei:** `includes/Providers/Database.php`

**Wichtige Punkte:**
- Nutzt `Gutenform\Models\Entries`
- IP-Adresse automatisch ermitteln
- Fehlerbehandlung mit Logging

**Abhängigkeiten:**
- `Gutenform\Providers\AbstractProvider`
- `Gutenform\Models\Entries`

**IP-Erkennung:**
```php
private function get_client_ip(): string {
    $ip_keys = array(
        'HTTP_CLIENT_IP',
        'HTTP_X_FORWARDED_FOR',
        'HTTP_X_FORWARDED',
        'HTTP_X_CLUSTER_CLIENT_IP',
        'HTTP_FORWARDED_FOR',
        'HTTP_FORWARDED',
        'REMOTE_ADDR'
    );
    
    foreach ($ip_keys as $key) {
        if (array_key_exists($key, $_SERVER) === true) {
            foreach (explode(',', $_SERVER[$key]) as $ip) {
                $ip = trim($ip);
                if (filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE) !== false) {
                    return $ip;
                }
            }
        }
    }
    
    return $_SERVER['REMOTE_ADDR'] ?? '';
}
```

**Testing:**
- [ ] Unit Test: AbstractProvider Platzhalter-Ersetzung
- [ ] Unit Test: Registry Provider-Registrierung
- [ ] Integration Test: Email Provider E-Mail-Versand
- [ ] Integration Test: Database Provider Entry-Speicherung

---

### Phase 2: Submission Handler (NEU)

#### Schritt 2.1: Verzeichnisstruktur erstellen
```bash
mkdir -p includes/Controllers/Submissions
```

**Dateien zu erstellen:**
- [ ] `includes/Controllers/Submissions/Handler.php`
- [ ] `includes/Controllers/Submissions/Actions.php`

#### Schritt 2.2: Handler implementieren
**Datei:** `includes/Controllers/Submissions/Handler.php`

**Wichtige Punkte:**
- Erhält `form_identifier` und `provider_ids` Array vom Frontend
- **Database Provider läuft IMMER automatisch zuerst** (muss nicht in DB sein)
- Lädt Provider-Feeds aus Datenbank: `wp_gutenform_providers` WHERE `id` IN ($provider_ids)
- Iteriert durch alle aktiven Provider-Feeds + Database Provider
- Sammelt Fehler und Ergebnisse
- Gibt strukturiertes Ergebnis zurück

**Provider-Feed Format (aus DB):**
```php
// Aus wp_gutenform_providers Tabelle
array(
    array(
        'id'            => 1,
        'name'          => 'E-Mail Benachrichtigung',
        'provider_type' => 'email',  // Verweist auf Provider-Klasse
        'form_identifier' => 'contact-form',  // Optional: NULL = globaler Provider
        'is_active'     => true,
        'settings'      => array(
            'to_email'   => 'admin@example.com',
            'subject'    => 'Neue Formular-Übermittlung',
            'body'       => 'Formular-Daten: {field_name}',
            'from_email' => '{field_email}',
            'from_name'  => '{field_name}',
        ),
    ),
)
```

**Abhängigkeiten:**
- `Gutenform\Providers\Registry`
- `Gutenform\Models\Providers`

**Wichtige Logik:**
```php
public function process(array $submission_data, string $form_identifier, array $provider_ids): array {
    $errors = array();
    $results = array();
    
    // 1. Database Provider IMMER zuerst ausführen
    $database_provider = $registry->get_provider('database');
    if ($database_provider) {
        $database_settings = array(
            'mailbox_id' => $this->get_default_mailbox_id($form_identifier),
        );
        try {
            $success = $database_provider->process_submission(
                $submission_data, 
                $database_settings, 
                $form_identifier
            );
            $results['database'] = array(
                'success' => $success,
                'provider' => $database_provider->get_title(),
            );
        } catch (\Exception $e) {
            $errors[] = sprintf(
                __('Database Provider Fehler: %s', 'gutenform'),
                $e->getMessage()
            );
        }
    }
    
    // 2. Dann alle konfigurierten Provider-Feeds aus DB
    if (!empty($provider_ids)) {
        $provider_feeds = Providers::whereIn('id', $provider_ids)
            ->where('is_active', true)
            ->get();
        
        foreach ($provider_feeds as $feed) {
            $provider = $registry->get_provider($feed->provider_type);
            if (!$provider) {
                $errors[] = sprintf(
                    __('Provider "%s" nicht gefunden.', 'gutenform'),
                    $feed->provider_type
                );
                continue;
            }
            
            try {
                $success = $provider->process_submission(
                    $submission_data, 
                    $feed->settings, 
                    $form_identifier
                );
                $results[$feed->provider_type] = array(
                    'success' => $success,
                    'provider' => $provider->get_title(),
                );
            } catch (\Exception $e) {
                $errors[] = sprintf(
                    __('Provider "%s" Fehler: %s', 'gutenform'),
                    $provider->get_title(),
                    $e->getMessage()
                );
            }
        }
    }
    
    // 3. Ergebnis zusammenstellen
    $overall_success = empty($errors) || count($errors) < count($results);
    
    return array(
        'success' => $overall_success,
        'errors' => $errors,
        'results' => $results,
    );
}
```

#### Schritt 2.3: Actions Controller implementieren
**Datei:** `includes/Controllers/Submissions/Actions.php`

**Wichtige Punkte:**
- Nonce-Verification
- Validierung: `form_identifier` muss vorhanden sein
- `provider_ids` Array ist optional (leeres Array = nur Database Provider)
- Delegation an Handler
- Strukturierte Fehlerbehandlung

**Request-Format:**
```json
{
    "form_identifier": "contact-form",
    "provider_ids": [1, 2],
    "submission_data": {
        "name": "John Doe",
        "email": "john@example.com"
    }
}
```

**Response-Format (Erfolg):**
```json
{
    "success": true,
    "message": "Formular erfolgreich übermittelt.",
    "data": {
        "success": true,
        "errors": [],
        "results": {
            "email": {
                "success": true,
                "provider": "E-Mail Benachrichtigung"
            },
            "database": {
                "success": true,
                "provider": "Datenbank-Speicherung"
            }
        }
    }
}
```

**Response-Format (Fehler):**
```json
{
    "code": "submission_failed",
    "message": "Fehler bei der Formular-Übermittlung.",
    "data": {
        "status": 500,
        "errors": ["Provider 'email' konnte die Submission nicht verarbeiten."],
        "results": {
            "email": {
                "success": false,
                "error": "wp_mail() failed"
            }
        }
    }
}
```

**Abhängigkeiten:**
- `Gutenform\Controllers\Submissions\Handler`

**Testing:**
- [ ] Unit Test: Handler Provider-Iteration
- [ ] Unit Test: Handler Fehlerbehandlung
- [ ] Integration Test: End-to-End Submission
- [ ] Integration Test: Fehlerbehandlung bei Provider-Fehlern

---

### Phase 3: API-Route Integration (ERWEITERN)

#### Schritt 3.1: Route hinzufügen
**Datei:** `includes/Routes/Api.php`

**Änderung:**
```php
// Submissions route (NEU)
$route->post('/submit', '\Gutenform\Controllers\Submissions\Actions@submit');
```

**Position:** Nach den Entry-Routen, vor den Provider-Routen

**Testing:**
- [ ] API-Route ist registriert
- [ ] Nonce-Verification funktioniert
- [ ] Fehlerhafte Requests werden abgelehnt

---

### Phase 4: Frontend-Integration (ANPASSEN)

#### Schritt 4.1: Feature Flag hinzufügen
**Option A: WordPress Option**
```php
// In includes/functions.php oder neue Datei
function gutenform_use_provider_system(): bool {
    return get_option('gutenform_use_provider_system', false);
}
```

**Option B: Konstante**
```php
// In plugin.php oder config
define('GF_USE_PROVIDER_SYSTEM', true); // false für Legacy-Modus
```

**Empfehlung:** Option A (WordPress Option) für einfacheres Toggling

#### Schritt 4.2: provider_ids als Form-Attribut hinzufügen
**Problem:** Form-Block muss `provider_ids` Array-Attribut haben

**Lösung: Form-Attribut erweitern**
**Datei:** `src/blockTypes/form.ts`

**Änderung:**
```typescript
export type FormAttributes = {
	mailboxId: string;
	formTitle: string;
	formId: string;
	skin?: string;
	providerIds?: number[];  // NEU: Array von Provider-Feed-IDs
};
```

**Datei:** `src/blocks/form/edit.tsx`

**Erweiterung:**
- Provider-Auswahl UI im Inspector Controls
- Multi-Select für Provider-Feeds
- Lädt verfügbare Provider aus API
- Speichert `provider_ids` Array in Block-Attributen

#### Schritt 4.3: Neue Submission-Funktion
**Datei:** `src/blocks/form/view.ts`

**Neue Funktion:**
```typescript
async function submitFormWithProviders(
    formData: Record<string, FormDataEntryValue>, 
    formIdentifier: string, 
    providerIds: number[],
    formOptions: any
): Promise<{success: boolean, message?: string, errors?: string[]}> {
    try {
        const response = await fetch(
            window.gutenform?.apiUrl + 'gutenform/v1/submit',
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-WP-Nonce': window.gutenform?.nonce || '',
                },
                body: JSON.stringify({
                    form_identifier: formIdentifier,
                    provider_ids: providerIds || [],
                    submission_data: formData,
                }),
            }
        );
        
        const result = await response.json();
        
        if (result.success) {
            return { success: true, message: result.message };
        } else {
            return { 
                success: false, 
                errors: result.data?.errors || [result.message] 
            };
        }
    } catch (error) {
        console.error('Form submission error', error);
        return { 
            success: false, 
            errors: ['Network error: ' + (error as Error).message] 
        };
    }
}
```

#### Schritt 4.4: Form-Submission anpassen
**Datei:** `src/blocks/form/view.ts`

**Änderung im Event-Listener:**
```typescript
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formIdentifier = formOptions.formId;
    const mailboxId = formOptions.mailboxId;
    const providerIds = formOptions.providerIds || []; // Array von Provider-Feed-IDs
    
    if (!formIdentifier) {
        console.error('Form identifier not found');
        return;
    }
    
    const formData = new FormData(form as HTMLFormElement);
    const data = Object.fromEntries(formData);
    
    // Feature Flag prüfen
    const useProviderSystem = window.gutenform?.useProviderSystem ?? false;
    
    if (useProviderSystem) {
        // Neuer Provider-basierter Flow
        const result = await submitFormWithProviders(data, formIdentifier, providerIds, formOptions);
        
        if (result.success) {
            // Success-Handling
            showSuccessMessage(result.message);
        } else {
            // Error-Handling
            showErrorMessage(result.errors);
        }
    } else {
        // Legacy-Flow (aktueller Code)
        if (!window.gutenform?.Entries) {
            console.error('Entries API not found');
            return;
        }
        window.gutenform?.Entries.create({
            mailbox_id: mailboxId,
            form_identifier: formIdentifier,
            data,
        });
    }
});
```

#### Schritt 4.5: provider_ids im Form-Block speichern
**Datei:** `src/blocks/form/save.tsx`

**Änderung:**
```typescript
const options = {
    formTitle: props.attributes.formTitle,
    skin: props.attributes.skin || 'default',
    mailboxId: props.attributes.mailboxId || '1',
    formId: props.attributes.formId || '',
    providerIds: props.attributes.providerIds || [], // NEU
};
```

#### Schritt 4.6: Feature Flag im Frontend verfügbar machen
**Datei:** `includes/Assets/Frontend.php`

**Änderung in `localize_script()`:**
```php
$inline_script = sprintf(
    'window.gutenform = window.gutenform || {}; window.gutenform.assetsUrl = %s; window.gutenform.pluginUrl = %s; window.gutenform.apiUrl = %s; window.gutenform.nonce = %s; window.gutenform.namespace = %s; window.gutenform.useProviderSystem = %s;',
    wp_json_encode(GF_ASSETS_URL),
    wp_json_encode(GF_URL),
    wp_json_encode($api_url),
    wp_json_encode($nonce),
    wp_json_encode(GF_ROUTE_PREFIX),
    wp_json_encode(gutenform_use_provider_system()) // NEU
);
```

**Testing:**
- [ ] Feature Flag funktioniert (Legacy vs. Provider-System)
- [ ] provider_ids werden aus Form-Attributen gezogen
- [ ] form_identifier wird korrekt übergeben
- [ ] Submission funktioniert mit Provider-System
- [ ] Legacy-Submission funktioniert weiterhin
- [ ] Fehlerbehandlung funktioniert

---

### Phase 5: Provider-Feed Verwaltung (ERWEITERN)

#### Schritt 5.1: Datenbank-Migration für Provider-Tabelle
**Problem:** Aktuelle Tabelle hat `UNIQUE KEY` auf `provider_type` - nur ein Provider pro Type möglich

**Lösung:** Migration erstellen
**Datei:** `database/Migrations/AddFormIdentifierToProviders.php` (NEU)

```php
<?php
namespace Gutenform\Database\Migrations;

use Gutenform\Interfaces\Migration;
use Prappo\WpEloquent\Database\Capsule\Manager as Capsule;

class AddFormIdentifierToProviders implements Migration {
    public static $table = 'gutenform_providers';
    
    public static function up() {
        global $wpdb;
        $table_name = $wpdb->prefix . self::$table;
        
        // Prüfe ob Spalte bereits existiert
        $column_exists = Capsule::schema()->hasColumn($table_name, 'form_identifier');
        if ($column_exists) {
            return;
        }
        
        // 1. UNIQUE KEY auf provider_type entfernen (erlaubt mehrere Provider pro Type)
        $wpdb->query("ALTER TABLE `{$table_name}` DROP INDEX `uk_provider_type`");
        
        // 2. form_identifier Spalte hinzufügen
        $wpdb->query("ALTER TABLE `{$table_name}` 
            ADD COLUMN `form_identifier` VARCHAR(100) DEFAULT NULL 
            COMMENT 'Formular-Identifier. NULL = Globaler Provider' 
            AFTER `provider_type`");
        
        // 3. Index auf form_identifier hinzufügen
        $wpdb->query("ALTER TABLE `{$table_name}` 
            ADD KEY `idx_form_identifier` (`form_identifier`)");
        
        // 4. id bleibt UNIQUE (Primary Key)
        // provider_type ist NICHT mehr unique - mehrere Provider pro Type möglich
    }
    
    public static function down() {
        global $wpdb;
        $table_name = $wpdb->prefix . self::$table;
        
        // Rollback
        $wpdb->query("ALTER TABLE `{$table_name}` DROP INDEX `idx_form_identifier`");
        $wpdb->query("ALTER TABLE `{$table_name}` DROP COLUMN `form_identifier`");
        $wpdb->query("ALTER TABLE `{$table_name}` 
            ADD UNIQUE KEY `uk_provider_type` (`provider_type`)");
    }
}
```

#### Schritt 5.2: Provider Model erweitern
**Datei:** `includes/Models/Providers.php`

**Änderung:**
```php
protected $fillable = array(
    'name',
    'provider_type',
    'form_identifier',  // NEU - Optional, NULL = globaler Provider
    'settings',
    'is_active',
    'date_created',
);
```

#### Schritt 5.3: Provider Controller erweitern
**Datei:** `includes/Controllers/Providers/Actions.php`

**Bestehende Methoden nutzen, aber erweitern:**
- `get()` - Filter nach `form_identifier` hinzufügen (optional)
- `create()` - `form_identifier` Feld unterstützen (optional)
- `update()` - `form_identifier` Feld unterstützen (optional)

**Wichtig:** Bestehende API bleibt kompatibel, `form_identifier` ist optional

#### Schritt 5.4: API-Routen erweitern
**Datei:** `includes/Routes/Api.php`

**Bestehende Routen nutzen:**
- `/providers/get` - Filter nach `form_identifier` möglich (optional)
- `/providers/create` - `form_identifier` kann übergeben werden (optional)
- `/providers/update` - `form_identifier` kann aktualisiert werden (optional)

**Neue Route für verfügbare Provider-Typen:**
```php
// Verfügbare Provider-Typen aus Registry
$route->get('/providers/types', '\Gutenform\Controllers\Providers\Actions@get_provider_types');
```

**Implementierung in Actions.php:**
```php
/**
 * Gibt alle verfügbaren Provider-Typen mit ihren Feld-Definitionen zurück.
 * 
 * @param \WP_REST_Request $request
 * @return array|\WP_Error
 */
public function get_provider_types(\WP_REST_Request $request) {
    try {
        $registry = \Gutenform\Providers\Registry::get_instance();
        $providers = $registry->get_all_providers();
        
        $types = array();
        foreach ($providers as $slug => $provider) {
            $types[] = array(
                'slug' => $slug,
                'title' => $provider->get_title(),
                'fields' => $provider->get_settings_fields(), // Feld-Definitionen für React
            );
        }
        
        return array(
            'success' => true,
            'data' => $types,
        );
    } catch (\Exception $e) {
        return new \WP_Error(
            'provider_types_retrieval_failed',
            __('Fehler beim Laden der Provider-Typen: ', 'gutenform') . $e->getMessage(),
            array('status' => 500)
        );
    }
}
```

**Response-Format:**
```json
{
    "success": true,
    "data": [
        {
            "slug": "email",
            "title": "E-Mail Benachrichtigung",
            "fields": [
                {
                    "name": "to_email",
                    "label": "E-Mail-Adresse",
                    "type": "email",
                    "required": true,
                    "default": "",
                    "description": "E-Mail-Adresse, an die die Benachrichtigung gesendet wird.",
                    "placeholder": "admin@example.com"
                },
                {
                    "name": "subject",
                    "label": "Betreff",
                    "type": "text",
                    "required": true,
                    "default": "Neue Formular-Übermittlung: {form_title}",
                    "description": "Betreff der E-Mail. Platzhalter wie {form_title} werden ersetzt."
                }
                // ... weitere Felder
            ]
        },
        {
            "slug": "webhook",
            "title": "Webhook",
            "fields": [
                {
                    "name": "url",
                    "label": "Webhook URL",
                    "type": "url",
                    "required": true,
                    "description": "URL des Webhook-Endpoints."
                },
                {
                    "name": "method",
                    "label": "HTTP Methode",
                    "type": "select",
                    "required": true,
                    "default": "POST",
                    "options": [
                        {"value": "POST", "label": "POST"},
                        {"value": "GET", "label": "GET"},
                        {"value": "PUT", "label": "PUT"}
                    ]
                }
                // ... weitere Felder
            ]
        }
    ]
}
```

#### Schritt 5.5: React Hook für Provider-Typen erstellen
**Datei:** `src/hooks/useProviders.ts` (ERWEITERN)

**Neuer Hook:**
```typescript
export interface ProviderTypeField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'number' | 'textarea' | 'select' | 'checkbox' | 'url' | 'password';
  required?: boolean;
  default?: any;
  description?: string;
  placeholder?: string;
  options?: Array<{ value: string; label: string }>;
  rows?: number;
  min?: number;
  max?: number;
  pattern?: string;
}

export interface ProviderType {
  slug: string;
  title: string;
  fields: ProviderTypeField[];
}

/**
 * Hook to fetch all available provider types with their field definitions
 */
export function useProviderTypes() {
  const [types, setTypes] = useState<ProviderType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchTypes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiGet<ApiResponse<ProviderType[]>>('providers/types');
      
      if (response.success && response.data) {
        setTypes(response.data);
      } else {
        throw new Error(response.message || 'Failed to fetch provider types');
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
      setTypes([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTypes();
  }, [fetchTypes]);

  return {
    types,
    loading,
    error,
    refetch: fetchTypes,
  };
}
```

#### Schritt 5.6: Admin-Interface erweitern
**Datei:** `src/admin/pages/settings/providers.tsx` (BEREITS VORHANDEN)

**Erweiterungen nötig:**
- ✅ Basis-Interface existiert bereits
- ⚠️ **NEU:** Provider-Type-Feld-Definitionen aus API laden (`useProviderTypes()`)
- ⚠️ **NEU:** Dynamisches Formular basierend auf ausgewähltem Provider-Type
- ⚠️ **NEU:** `form_identifier` Feld hinzufügen (optional, für formular-spezifische Provider)
- ⚠️ **NEU:** Feld-Rendering basierend auf Feld-Typen

**Implementierung:**
```typescript
// In providers.tsx
import { useProviderTypes, type ProviderType, type ProviderTypeField } from '@/hooks/useProviders';

// Komponente für dynamisches Feld-Rendering
function DynamicField({ 
  field, 
  value, 
  onChange 
}: { 
  field: ProviderTypeField; 
  value: any; 
  onChange: (value: any) => void;
}) {
  switch (field.type) {
    case 'text':
    case 'email':
    case 'url':
    case 'password':
      return (
        <FormItem>
          <FormLabel>
            {field.label}
            {field.required && <span className="text-destructive">*</span>}
          </FormLabel>
          <FormControl>
            <Input
              type={field.type}
              value={value || field.default || ''}
              onChange={(e) => onChange(e.target.value)}
              placeholder={field.placeholder}
              required={field.required}
            />
          </FormControl>
          {field.description && (
            <FormDescription>{field.description}</FormDescription>
          )}
        </FormItem>
      );
    
    case 'textarea':
      return (
        <FormItem>
          <FormLabel>
            {field.label}
            {field.required && <span className="text-destructive">*</span>}
          </FormLabel>
          <FormControl>
            <Textarea
              value={value || field.default || ''}
              onChange={(e) => onChange(e.target.value)}
              placeholder={field.placeholder}
              rows={field.rows || 4}
              required={field.required}
            />
          </FormControl>
          {field.description && (
            <FormDescription>{field.description}</FormDescription>
          )}
        </FormItem>
      );
    
    case 'select':
      return (
        <FormItem>
          <FormLabel>
            {field.label}
            {field.required && <span className="text-destructive">*</span>}
          </FormLabel>
          <Select
            value={value || field.default || ''}
            onValueChange={onChange}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder={`Select ${field.label}`} />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {field.options?.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {field.description && (
            <FormDescription>{field.description}</FormDescription>
          )}
        </FormItem>
      );
    
    case 'number':
      return (
        <FormItem>
          <FormLabel>
            {field.label}
            {field.required && <span className="text-destructive">*</span>}
          </FormLabel>
          <FormControl>
            <Input
              type="number"
              value={value ?? field.default ?? ''}
              onChange={(e) => onChange(Number(e.target.value))}
              min={field.min}
              max={field.max}
              required={field.required}
            />
          </FormControl>
          {field.description && (
            <FormDescription>{field.description}</FormDescription>
          )}
        </FormItem>
      );
    
    case 'checkbox':
      return (
        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
          <div className="space-y-0.5">
            <FormLabel>{field.label}</FormLabel>
            {field.description && (
              <FormDescription>{field.description}</FormDescription>
            )}
          </div>
          <FormControl>
            <Switch
              checked={value ?? field.default ?? false}
              onCheckedChange={onChange}
            />
          </FormControl>
        </FormItem>
      );
    
    default:
      return null;
  }
}

// In der Hauptkomponente
export default function ProvidersPage() {
  const { types, loading: typesLoading } = useProviderTypes();
  const [selectedProviderType, setSelectedProviderType] = useState<string>('');
  const [settings, setSettings] = useState<Record<string, any>>({});
  
  // Wenn Provider-Type ausgewählt wird, lade Feld-Definitionen
  const selectedType = types.find(t => t.slug === selectedProviderType);
  
  // Initialisiere Settings mit Default-Werten
  useEffect(() => {
    if (selectedType) {
      const defaultSettings: Record<string, any> = {};
      selectedType.fields.forEach(field => {
        if (field.default !== undefined) {
          defaultSettings[field.name] = field.default;
        }
      });
      setSettings(defaultSettings);
    } else {
      setSettings({});
    }
  }, [selectedType]);
  
  // Handler für Settings-Änderungen
  const handleSettingChange = (fieldName: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [fieldName]: value
    }));
  };
  
  // Im Dialog-Formular:
  return (
    <DialogContent>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          {/* Name */}
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
              </FormItem>
            )}
          />
          
          {/* Provider Type Selection */}
          <FormField
            control={form.control}
            name="provider_type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Provider Type</FormLabel>
                <Select 
                  onValueChange={(value) => {
                    field.onChange(value);
                    setSelectedProviderType(value);
                  }}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a provider type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {types.map((type) => (
                      <SelectItem key={type.slug} value={type.slug}>
                        {type.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />
          
          {/* Dynamische Felder basierend auf ausgewähltem Provider-Type */}
          {selectedType && selectedType.fields.map((field) => (
            <DynamicField
              key={field.name}
              field={field}
              value={settings[field.name]}
              onChange={(value) => handleSettingChange(field.name, value)}
            />
          ))}
          
          {/* Form Identifier (optional) */}
          <FormField
            control={form.control}
            name="form_identifier"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Form Identifier (optional)</FormLabel>
                <FormControl>
                  <Input 
                    {...field}
                    placeholder="Leer lassen für globalen Provider"
                  />
                </FormControl>
                <FormDescription>
                  Formular-spezifischer Provider. Leer lassen für globalen Provider.
                </FormDescription>
              </FormItem>
            )}
          />
          
          {/* Submit Button */}
          <DialogFooter>
            <Button type="submit">Create Provider</Button>
          </DialogFooter>
        </form>
      </Form>
    </DialogContent>
  );
}
```

**Wichtig:**
- Wenn `provider_type` ausgewählt wird, werden automatisch die entsprechenden Felder angezeigt
- Settings werden in einem separaten State verwaltet (`settings` Object)
- Beim Submit werden `settings` als JSON an die API gesendet
- `form_identifier` ist optional (NULL = globaler Provider)

**Abhängigkeiten:**
- React Hook: `useProviders()` - existiert bereits
- React Hook: `useProviderTypes()` - NEU: lädt verfügbare Provider-Typen + Feld-Definitionen
- Bestehende Provider-API: `/providers/create`, `/providers/update`, `/providers/delete`
- Neue API: `/providers/types` - gibt Provider-Typen + Feld-Definitionen zurück

**Vollständiges Beispiel: Provider erstellen mit dynamischen Feldern**

**Workflow:**
1. User klickt "Add Provider"
2. Dialog öffnet sich
3. User wählt Provider-Type (z.B. "Email")
4. System lädt Feld-Definitionen für "Email" aus API
5. Dynamische Felder werden gerendert:
   - `to_email` (email, required)
   - `subject` (text, required)
   - `body` (textarea, required)
   - `from_email` (email, optional)
   - `from_name` (text, optional)
6. User füllt Felder aus
7. Beim Submit werden Settings als JSON gespeichert

**Testing:**
- [ ] Provider-Typen werden aus API geladen
- [ ] Dynamische Felder werden korrekt gerendert
- [ ] Default-Werte werden korrekt gesetzt
- [ ] Settings werden korrekt validiert
- [ ] Provider-Feeds können gespeichert werden
- [ ] Admin-Interface ist benutzerfreundlich

---

### Phase 6: Migration bestehender Daten (OPTIONAL)

#### Schritt 6.1: Migration bestehender Provider-Daten
**Problem:** Bestehende Provider in `wp_gutenform_providers` haben kein `wp_post_id` (sind global)

**Lösung:** Migration-Script erstellen
**Datei:** `includes/Core/Migrate.php` (NEU)

```php
class Migrate {
    /**
     * Migriert bestehende Provider (ohne wp_post_id) zu globalen Providern.
     * Diese können später Formularen zugewiesen werden.
     */
    public static function migrate_existing_providers() {
        // Bestehende Provider haben wp_post_id = NULL (global)
        // Das ist korrekt, keine Migration nötig
        // Sie können später Formularen zugewiesen werden
    }
}
```

**Wann ausführen:**
- Migration läuft automatisch bei Plugin-Update (Tabellen-Migration)
- Bestehende Provider bleiben erhalten (wp_post_id = NULL = global)

#### Schritt 6.2: Database Provider automatisch ausführen
**Wichtig:** Database Provider läuft IMMER automatisch, benötigt keinen DB-Eintrag

**Lösung:** Im Submission Handler implementiert (siehe Schritt 2.2)
- Database Provider läuft IMMER zuerst
- Dann alle Provider-Feeds aus `provider_ids` Array
- `provider_ids` kann leer sein (nur Database Provider)

**Testing:**
- [ ] Migration-Script funktioniert
- [ ] Standard-Feeds werden erstellt
- [ ] Bestehende Feeds werden nicht überschrieben

---

### Phase 7: Testing & Dokumentation

#### Schritt 7.1: Unit Tests
- [ ] AbstractProvider Platzhalter-Ersetzung
- [ ] Registry Provider-Registrierung
- [ ] Email Provider E-Mail-Versand
- [ ] Database Provider Entry-Speicherung
- [ ] Handler Provider-Iteration
- [ ] Handler Fehlerbehandlung

#### Schritt 7.2: Integration Tests
- [ ] End-to-End Submission mit Provider-System
- [ ] End-to-End Submission mit Legacy-System
- [ ] Provider-Feed Verwaltung
- [ ] Fehlerbehandlung bei Provider-Fehlern
- [ ] Feature Flag Toggling

#### Schritt 7.3: Manuelle Tests
- [ ] Formular-Submission im Frontend
- [ ] E-Mail-Versand funktioniert
- [ ] Entry wird in Datenbank gespeichert
- [ ] Provider-Feed-Konfiguration im Admin
- [ ] Migration bestehender Daten

#### Schritt 7.4: Dokumentation
- [ ] README aktualisieren
- [ ] Code-Kommentare ergänzen
- [ ] API-Dokumentation erstellen
- [ ] Migration-Guide erstellen

---

## 🔄 Breaking Changes & Kompatibilität

### Keine Breaking Changes (bei Feature Flag)

**Warum:**
- Legacy-System bleibt funktionsfähig
- Feature Flag ermöglicht schrittweise Migration
- Bestehende Formulare funktionieren weiterhin

### Potenzielle Breaking Changes (ohne Feature Flag)

**Wenn Feature Flag = false:**
- ✅ Keine Breaking Changes
- ✅ Alles funktioniert wie bisher

**Wenn Feature Flag = true:**
- ⚠️ Frontend muss `form_identifier` und `provider_ids` Array übergeben können
- ✅ Database Provider läuft automatisch (keine Konfiguration nötig)
- ✅ Optional: Weitere Provider-Feeds können konfiguriert werden (Email, Webhook, etc.)
- ✅ Submission funktioniert auch ohne konfigurierte Provider-Feeds (nur Database Provider)

---

## 📊 Migrations-Checkliste

### Vor der Migration
- [ ] Backup der Datenbank erstellen
- [ ] Feature Flag auf `false` setzen (Standard)
- [ ] Alle Tests durchführen
- [ ] Dokumentation lesen

### Während der Migration
- [ ] Phase 1-3 implementieren (Backend)
- [ ] Phase 4 implementieren (Frontend mit Feature Flag = false)
- [ ] Testing durchführen
- [ ] Feature Flag auf `true` setzen (Test-Umgebung)
- [ ] Testing in Test-Umgebung
- [ ] Provider-Feeds für Test-Formulare konfigurieren

### Nach der Migration
- [ ] Feature Flag auf `true` setzen (Produktion)
- [ ] Monitoring einrichten
- [ ] Fehler-Logs prüfen
- [ ] User-Feedback sammeln
- [ ] Legacy-System nach X Monaten entfernen (optional)

---

## 📅 Nächste Schritte

1. ✅ Review dieses Plans
2. ⏳ Entscheidungen zu offenen Fragen treffen
3. ⏳ Implementierung starten (Phase 1)
4. ⏳ Schrittweise Testing während der Implementierung
5. ⏳ Dokumentation aktualisieren

