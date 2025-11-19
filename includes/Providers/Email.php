<?php

/**
 * Email Provider
 *
 * Sends form submissions via email using WordPress wp_mail().
 *
 * @package Gutenform\Providers
 * @since 1.0.0
 */

namespace Gutenform\Providers;

defined('ABSPATH') || exit;

/**
 * Email Provider Class
 *
 * Handles email notifications for form submissions.
 */
class Email extends AbstractProvider
{

    /**
     * Gibt den eindeutigen Slug des Providers zurück.
     *
     * @return string
     */
    public function get_slug(): string
    {
        return 'email';
    }

    /**
     * Gibt den Anzeigenamen des Providers zurück.
     *
     * @return string
     */
    public function get_title(): string
    {
        return __('E-Mail Benachrichtigung', 'gutenform');
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
        // 1. Platzhalter ersetzen
        $to_email   = sanitize_email($provider_settings['to_email'] ?? '');
        $subject    = $this->replace_placeholders(
            $provider_settings['subject'] ?? '',
            $submission_data,
            $form_identifier
        );
        $body       = $this->replace_placeholders(
            $provider_settings['body'] ?? '',
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
        $from_name  = sanitize_text_field(
            $this->replace_placeholders(
                $provider_settings['from_name'] ?? get_bloginfo('name'),
                $submission_data,
                $form_identifier
            )
        );

        // Log start of email processing
        error_log(sprintf(
            'GutenForm Email Provider: Starting email processing for form "%s"',
            $form_identifier
        ));

        // Log email details (without sensitive body content)
        error_log(sprintf(
            'GutenForm Email Provider: To: %s, From: %s <%s>, Subject: %s',
            $to_email,
            $from_name,
            $from_email,
            $subject
        ));

        // Validierung
        if (empty($to_email) || ! is_email($to_email)) {
            error_log('GutenForm Email Provider Error: Invalid to_email address: ' . $to_email);
            return false;
        }

        if (empty($from_email) || ! is_email($from_email)) {
            error_log('GutenForm Email Provider Error: Invalid from_email address: ' . $from_email);
            return false;
        }

        // 2. Header erstellen
        $headers = array(
            'From: ' . $from_name . ' <' . $from_email . '>',
            'Content-Type: text/html; charset=UTF-8',
        );

        // 3. E-Mail versenden
        error_log('GutenForm Email Provider: Attempting to send email via wp_mail()');
        $result = wp_mail($to_email, $subject, $body, $headers);

        if ($result) {
            error_log(sprintf(
                'GutenForm Email Provider: Email sent successfully to %s',
                $to_email
            ));
        } else {
            error_log(sprintf(
                'GutenForm Email Provider Error: wp_mail() failed for %s. Check WordPress mail configuration.',
                $to_email
            ));
        }

        return $result;
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
                'name'        => 'to_email',
                'label'       => __('E-Mail-Adresse', 'gutenform'),
                'type'        => 'email',
                'required'    => true,
                'default'     => '',
                'description' => __('E-Mail-Adresse, an die die Benachrichtigung gesendet wird.', 'gutenform'),
                'placeholder' => 'admin@example.com',
            ),
            array(
                'name'        => 'subject',
                'label'       => __('Betreff', 'gutenform'),
                'type'        => 'text',
                'required'    => true,
                'default'     => __('Neue Formular-Übermittlung: {form_title}', 'gutenform'),
                'description' => __('Betreff der E-Mail. Platzhalter wie {form_title} werden ersetzt.', 'gutenform'),
            ),
            array(
                'name'        => 'body',
                'label'       => __('Nachricht', 'gutenform'),
                'type'        => 'textarea',
                'required'    => true,
                'default'     => '{all_fields}',
                'description' => __('E-Mail-Nachricht. HTML erlaubt. Platzhalter wie {field_name} werden ersetzt.', 'gutenform'),
                'rows'        => 6,
            ),
            array(
                'name'        => 'from_email',
                'label'       => __('Absender E-Mail', 'gutenform'),
                'type'        => 'email',
                'required'    => false,
                'default'     => get_option('admin_email'),
                'description' => __('E-Mail-Adresse des Absenders.', 'gutenform'),
            ),
            array(
                'name'        => 'from_name',
                'label'       => __('Absender Name', 'gutenform'),
                'type'        => 'text',
                'required'    => false,
                'default'     => get_bloginfo('name'),
                'description' => __('Name des Absenders.', 'gutenform'),
            ),
        );
    }
}
