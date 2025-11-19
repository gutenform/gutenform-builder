<?php

/**
 * Abstract Provider Base Class
 *
 * Base class for all Gutenform providers. Defines the interface and common functionality.
 *
 * @package Gutenform\Providers
 * @since 1.0.0
 */

namespace Gutenform\Providers;

defined('ABSPATH') || exit;

/**
 * Abstract Provider Class
 *
 * All providers must extend this class and implement the abstract methods.
 */
abstract class AbstractProvider
{

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
     * @param array  $submission_data Die Formulardaten
     * @param array  $provider_settings Die individuellen Einstellungen für diesen Provider
     * @param string $form_identifier Der Formular-Identifier
     * @return bool Erfolg der Verarbeitung
     */
    abstract public function process_submission(
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
     * - {form_identifier} - Formular-Identifier
     * - {form_title} - Formular-Titel (aus Post Meta)
     * - {site_name} - Site-Name
     * - {date} - Aktuelles Datum
     * - {time} - Aktuelle Uhrzeit
     * - {ip_address} - IP-Adresse des Clients
     * - {all_fields} - Alle Formularfelder als Liste (key: value)
     *
     * @param string $content Der String mit Platzhaltern
     * @param array  $submission_data Die Formulardaten
     * @param string $form_identifier Der Formular-Identifier
     * @return string String mit ersetzten Platzhaltern
     */
    protected function replace_placeholders(
        string $content,
        array $submission_data,
        string $form_identifier
    ): string {
        $replacements = array();

        // Formularfeld-Werte ersetzen
        foreach ($submission_data as $key => $value) {
            $replacements['{' . $key . '}'] = is_array($value) ? implode(', ', $value) : $value;
        }

        // Standard-Platzhalter
        $replacements['{form_identifier}'] = $form_identifier;
        $replacements['{form_title}']     = $this->get_form_title($form_identifier);
        $replacements['{site_name}']      = get_bloginfo('name');
        $replacements['{date}']           = current_time('Y-m-d');
        $replacements['{time}']           = current_time('H:i:s');
        $replacements['{ip_address}']    = $this->get_client_ip();
        $replacements['{all_fields}']    = $this->format_all_fields($submission_data);

        // Alle Platzhalter ersetzen
        return str_replace(array_keys($replacements), array_values($replacements), $content);
    }

    /**
     * Formatiert alle Formularfelder als Liste im Format "key: value".
     *
     * @param array $submission_data Die Formulardaten
     * @return string Formatierte Liste aller Felder
     */
    protected function format_all_fields(array $submission_data): string
    {
        if (empty($submission_data)) {
            return '';
        }

        $rows = '';
        foreach ($submission_data as $key => $value) {
            // Format value
            if (is_array($value)) {
                $formatted_value = implode(', ', $value);
            } elseif (is_bool($value)) {
                $formatted_value = $value ? __('Yes', 'gutenform') : __('No', 'gutenform');
            } else {
                $formatted_value = (string) $value;
            }

            $rows .= '<tr style="border-bottom:1px solid #eee;"><td style="padding: 5px 10px; font-weight:bold; text-align:left;">' . esc_html($key) . '</td><td style="padding: 5px 10px;">' . esc_html($formatted_value) . '</td></tr>';
        }

        $table = '<table style="border-collapse:collapse;width:100%;background:#fafbfc;border:1px solid #eaeaea;font-family:sans-serif;font-size:14px;margin:10px 0 15px 0;">';
        $table .= '<thead><tr style="background:#f0f4f8;"><th style="padding:8px 10px; text-align:left; border-bottom:2px solid #eaeaea;">' . __('Field', 'gutenform') . '</th><th style="padding:8px 10px;text-align:left; border-bottom:2px solid #eaeaea;">' . __('Value', 'gutenform') . '</th></tr></thead>';
        $table .= '<tbody>' . $rows . '</tbody>';
        $table .= '</table>';

        return $table;
    }

    /**
     * Ermittelt den Formular-Titel aus dem Form-Identifier.
     *
     * @param string $form_identifier Der Formular-Identifier
     * @return string Der Formular-Titel oder der Identifier als Fallback
     */
    protected function get_form_title(string $form_identifier): string
    {
        // Versuche, den Titel aus Post Meta zu holen
        // Dies ist eine vereinfachte Implementierung - kann später erweitert werden
        // z.B. durch Speicherung der Form-Titel in einer separaten Tabelle oder Meta
        return $form_identifier;
    }

    /**
     * Ermittelt die Client-IP-Adresse.
     *
     * @return string Die IP-Adresse
     */
    protected function get_client_ip(): string
    {
        $ip_keys = array(
            'HTTP_CLIENT_IP',
            'HTTP_X_FORWARDED_FOR',
            'HTTP_X_FORWARDED',
            'HTTP_X_CLUSTER_CLIENT_IP',
            'HTTP_FORWARDED_FOR',
            'HTTP_FORWARDED',
            'REMOTE_ADDR',
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
}
