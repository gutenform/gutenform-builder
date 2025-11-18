# 📝 GutenForm Architektur: Provider & Asynchroner Submission-Workflow

Dieser Plan beschreibt die Architektur und den Workflow des Formular-Submissions-Systems von GutenForm, welches auf einem hybriden Tech Stack (JS Frontend, PHP REST API Backend) und einem erweiterbaren Provider-System basiert.

---

## 1. 🌐 Architektur-Grundlagen

Die Verarbeitung ist API-zentriert und nutzt einen **Single Entry Point** im Backend, um die Komplexität der Provider-Verarbeitung zu kapseln.

| Komponente | Rolle | Technologie |
| :--- | :--- | :--- |
| **Frontend Handler** | Initiiert die asynchrone Übermittlung und verarbeitet die finale Antwort. | **Vanilla JavaScript** (im `window` Objekt) |
| **REST API Endpoint** | Zentraler Router und Single Entry Point für alle Submissions. | **WordPress REST API** (`/gutenform/v1/submit`) |
| **Submission Handler** | Steuert den Hauptprozess, führt Validierung durch und orchestriert die Provider. | **PHP-Klasse** (`GutenForm_Submission_Handler`) |
| **Provider Registry** | Singleton zur Verwaltung, Registrierung und Bereitstellung aller Provider-Instanzen. | **PHP Singleton** (`GutenForm_Provider_Registry`) |
| **Provider Klassen** | Führen spezifische, konfigurierte Aktionen aus (E-Mail, DB-Speicherung, CRM-API-Aufruf). | **PHP Abstract/Concrete Classes** |

---

## 2. 🚀 Detaillierter Submission-Workflow

Der gesamte asynchrone Prozess gliedert sich in drei Hauptphasen:

### Phase A: Frontend-Initiierung (JavaScript)

1.  **Event-Trigger:** Das Frontend-JavaScript fängt den `submit`-Event ab, verhindert den nativen Browser-POST und führt Client-Side-Validierung durch.
2.  **Datenextraktion:** Alle Formularfelder werden serialisiert (`submission_data`).
3.  **API-Call:** Die JS-Klasse sendet einen **asynchronen Request** (z.B. über `fetch`) an den zentralen REST API Endpunkt.
    * **Body:** Enthält `submission_data`, die `form_id` und einen Nonce zur Sicherheit.
4.  **Rückkopplung:** Wartet auf die JSON-Antwort vom Backend (`success: true/false`).

### Phase B: Backend-Routing (PHP REST API Controller)

1.  **Endpoint-Handler:** Die `GutenForm_API_Controller` Methode fängt den Request ab.
2.  **Sicherheit & Validierung:** Nonce-Prüfung, Basis-Validierung der Post-ID und der Daten.
3.  **Datenabruf:** Lädt die **konfigurierten Provider-Feeds** (die Liste der Provider und deren individuelle Einstellungen für dieses Formular) aus der Datenbank (`wp_postmeta`).
4.  **Delegation:** Übergibt die Kontrolle und alle notwendigen Daten an den **Submission Handler** zur Hauptverarbeitung.

### Phase C: Provider-Verarbeitung (PHP Submission Handler)

1.  **Registry-Zugriff:** Ruft die Singleton-Instanz der Provider-Registry ab: `GutenForm_Provider_Registry::get_instance()`.
2.  **Iteration:** Iteriert durch die **aktivierten Provider** des Formulars in der konfigurierten Reihenfolge.
3.  **Provider-Aufruf:** Für jeden Provider:
    * Die Instanz wird abgerufen: `$provider = $registry->get_provider( $slug );`
    * Die Kernmethode wird aufgerufen, wobei die **individuellen Feed-Einstellungen** übergeben werden:
        ```php
        $success = $provider->process_submission( $submission_data, $provider_settings, $form_id );
        ```
4.  **Fehlerbehandlung:** Sammelt alle Fehlermeldungen (z.B. Validierungsfehler des CRM-Providers, E-Mail-Fehler) in einem zentralen Array.
5.  **Antwort-Generierung:** Der Handler konsolidiert die Ergebnisse und gibt eine Struktur (Erfolg/Fehler-Status und Fehler-Details) zurück an den API-Controller.

---

## 3. 💾 PHP-Klassen-Skizze

### A. `GutenForm_AbstractProvider` (Die Schnittstelle)

Diese Klasse definiert den Vertrag, den alle Provider erfüllen müssen.

```php
abstract class GutenForm_AbstractProvider {
    
    // Die drei Pflichtmethoden
    abstract public function get_slug(): string; 
    abstract public function get_title(): string;
    abstract public function process_submission( array $data, array $settings, int $form_id ): bool;

    // Gemeinsame, geerbte Hilfslogik
    protected function replace_placeholders( string $content, array $submission_data, int $form_id ): string {
        // Logik für die Ersetzung von {feld_slug} und {global_placeholder}
    }
}
````

### B. `GutenForm_Provider_Registry` (Der Manager)

Diese Singleton-Klasse ist der zentrale Zugangspunkt für alle Provider.

```php
class GutenForm_Provider_Registry {
    
    // Stellt sicher, dass nur eine Instanz existiert
    public static function get_instance(): self;

    // Initialisiert Basis-Provider und wendet den Hook an
    private function register_all_providers(): void {
        // $provider_classes = apply_filters( 'gutenform/available_providers', $base_classes );
        // Instanziiert die Klassen und speichert sie intern (z.B. $this->providers['email'] = new GutenForm_Provider_Email())
    }

    // Liefert eine konkrete Provider-Instanz 
    public function get_provider( string $slug ): ?GutenForm_AbstractProvider;
}
```

### C. Beispiel: `GutenForm_Provider_Email` (Konkreter Provider)

Dieser Provider implementiert die Logik für den E-Mail-Versand.

```php
class GutenForm_Provider_Email extends GutenForm_AbstractProvider {
    
    public function get_slug(): string { return 'email'; }
    public function get_title(): string { return __( 'E-Mail Benachrichtigung' ); }

    public function process_submission( array $data, array $settings, int $form_id ): bool {
        
        // 1. Anwendung der Platzhalter auf Betreff, Body, Absender (nutzt $this->replace_placeholders())
        $subject = $this->replace_placeholders( $settings['subject'] ?? '', $data, $form_id );
        
        // 2. Erstellen der Header (From, Content-Type)
        
        // 3. Versand via wp_mail()
        return wp_mail( $settings['to_email'], $subject, $body, $headers );
    }
}
```