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
     * Returns the unique slug of the provider.
     *
     * @return string
     */
    public function get_slug(): string
    {
        return 'email';
    }

    /**
     * Returns the display name of the provider.
     *
     * @return string
     */
    public function get_title(): string
    {
        return __('Email Notification', 'gutenform');
    }

    /**
     * Processes a form submission.
     *
     * @param array  $submission_data The form data
     * @param array  $provider_settings The individual settings for this provider
     * @param string $form_identifier The form identifier
     * @return bool Success of processing
     */
    public function process_submission(
        array $submission_data,
        array $provider_settings,
        string $form_identifier
    ): bool {
        // 1. Replace placeholders
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

        // Validation
        if (empty($to_email) || ! is_email($to_email)) {
            error_log('GutenForm Email Provider Error: Invalid to_email address: ' . $to_email);
            return false;
        }

        if (empty($from_email) || ! is_email($from_email)) {
            error_log('GutenForm Email Provider Error: Invalid from_email address: ' . $from_email);
            return false;
        }

        // 2. Create headers
        $headers = array(
            'From: ' . $from_name . ' <' . $from_email . '>',
            'Content-Type: text/html; charset=UTF-8',
        );

        // 3. Send email
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
     * Returns the field definitions for the settings.
     *
     * @return array Array of field definitions
     */
    public function get_settings_fields(): array
    {
        return array(
            array(
                'name'        => 'to_email',
                'label'       => __('Email Address', 'gutenform'),
                'type'        => 'email',
                'required'    => true,
                'default'     => '',
                'description' => __('Email address to which the notification will be sent.', 'gutenform'),
                'placeholder' => 'admin@example.com',
            ),
            array(
                'name'        => 'subject',
                'label'       => __('Subject', 'gutenform'),
                'type'        => 'text',
                'required'    => true,
                'default'     => __('New Form Submission: {form_title}', 'gutenform'),
                'description' => __('Email subject. Placeholders like {form_title} will be replaced.', 'gutenform'),
            ),
            array(
                'name'        => 'body',
                'label'       => __('Message', 'gutenform'),
                'type'        => 'textarea',
                'required'    => true,
                'default'     => '{all_fields}',
                'description' => __('Email message. HTML allowed. Placeholders like {field_name} will be replaced.', 'gutenform'),
                'rows'        => 6,
            ),
            array(
                'name'        => 'from_email',
                'label'       => __('From Email', 'gutenform'),
                'type'        => 'text',
                'required'    => false,
                'default'     => get_option('admin_email'),
                'description' => __('Email address of the sender.', 'gutenform'),
            ),
            array(
                'name'        => 'from_name',
                'label'       => __('From Name', 'gutenform'),
                'type'        => 'text',
                'required'    => false,
                'default'     => get_bloginfo('name'),
                'description' => __('Name of the sender.', 'gutenform'),
            ),
        );
    }
}
