<?php

/**
 * Database Provider
 *
 * Stores form submissions in the database using the Entries model.
 *
 * @package Gutenform\Providers
 * @since 1.0.0
 */

namespace Gutenform\Providers;

use Gutenform\Models\Entries;

defined('ABSPATH') || exit;

/**
 * Database Provider Class
 *
 * Handles database storage for form submissions.
 */
class Database extends AbstractProvider
{

    /**
     * Gibt den eindeutigen Slug des Providers zurück.
     *
     * @return string
     */
    public function get_slug(): string
    {
        return 'database';
    }

    /**
     * Gibt den Anzeigenamen des Providers zurück.
     *
     * @return string
     */
    public function get_title(): string
    {
        return __('Datenbank-Speicherung', 'gutenform');
    }

    /**
     * Verarbeitet eine Formular-Submission.
     *
     * @param array  $submission_data Die Formulardaten
     * @param array  $provider_settings Die individuellen Einstellungen für diesen Provider
     * @param string $form_identifier Der Formular-Identifier
     * @return bool Erfolg der Verarbeitung
     */
    public function process_submission(
        array $submission_data,
        array $provider_settings,
        string $form_identifier
    ): bool {
        try {
            // Replace placeholders in subject and from_email
            $subject = $this->replace_placeholders(
                $provider_settings['subject'] ?? __('Neue Formular-Übermittlung: {form_title}', 'gutenform'),
                $submission_data,
                $form_identifier
            );
            $from_email = sanitize_email(
                $this->replace_placeholders(
                    $provider_settings['from_email'] ?? get_option('admin_email'),
                    $submission_data,
                    $form_identifier
                )
            );

            $entry = new Entries();
            $entry->mailbox_id      = absint($provider_settings['mailbox_id'] ?? 1);
            $entry->form_identifier = $form_identifier;
            $entry->wp_post_id      = isset($provider_settings['wp_post_id']) ? absint($provider_settings['wp_post_id']) : null;
            $entry->data            = $submission_data;
            $entry->ip_address      = $this->get_client_ip();
            $entry->is_read         = false;
            $entry->subject         = sanitize_text_field($subject);
            $entry->from_mail       = $from_email;
            $entry->date_created    = current_time('mysql');

            $result = $entry->save();

            if ($result) {
                error_log(sprintf(
                    'GutenForm Database Provider: Entry saved successfully (ID: %d) for form "%s"',
                    $entry->id,
                    $form_identifier
                ));
            } else {
                error_log('GutenForm Database Provider Error: Failed to save entry');
            }

            return $result;
        } catch (\Exception $e) {
            error_log('GutenForm Database Provider Error: ' . $e->getMessage());
            return false;
        }
    }

    /**
     * Gibt die Feld-Definitionen für die Settings zurück.
     *
     * @return array Array von Feld-Definitionen
     */
    public function get_settings_fields(): array
    {
        return array(
            array(
                'name'        => 'mailbox_id',
                'label'       => __('Mailbox ID', 'gutenform'),
                'type'        => 'number',
                'required'    => true,
                'default'     => 1,
                'description' => __('ID der Mailbox, in der der Eintrag gespeichert wird.', 'gutenform'),
                'min'         => 1,
            ),
            array(
                'name'        => 'subject',
                'label'       => __('Betreff', 'gutenform'),
                'type'        => 'text',
                'required'    => false,
                'default'     => __('Neue Formular-Übermittlung: {form_title}', 'gutenform'),
                'description' => __('Betreff für den Eintrag. Platzhalter wie {form_title} werden ersetzt.', 'gutenform'),
            ),
            array(
                'name'        => 'body',
                'label'       => __('Nachricht', 'gutenform'),
                'type'        => 'textarea',
                'required'    => false,
                'default'     => '{all_fields}',
                'description' => __('Nachricht für den Eintrag. Platzhalter wie {field_name} werden ersetzt.', 'gutenform'),
                'rows'        => 6,
            ),
            array(
                'name'        => 'from_email',
                'label'       => __('Absender E-Mail', 'gutenform'),
                'type'        => 'text',
                'required'    => false,
                'default'     => get_option('admin_email'),
                'description' => __('E-Mail-Adresse des Absenders, die im Eintrag gespeichert wird.', 'gutenform'),
            ),
        );
    }
}
