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
     * Returns the unique slug of the provider.
     *
     * @return string
     */
    public function get_slug(): string
    {
        return 'database';
    }

    /**
     * Returns the display name of the provider.
     *
     * @return string
     */
    public function get_title(): string
    {
        return __('Database Storage', 'gutenform');
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
        try {
            // Replace placeholders in subject and from_email
            $subject = $this->replace_placeholders(
                $provider_settings['subject'] ?? __('New Form Submission: {form_title}', 'gutenform'),
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
     * Returns the field definitions for the settings.
     *
     * @return array Array of field definitions
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
                'description' => __('ID of the mailbox where the entry will be stored.', 'gutenform'),
                'min'         => 1,
            ),
            array(
                'name'        => 'subject',
                'label'       => __('Subject', 'gutenform'),
                'type'        => 'text',
                'required'    => false,
                'default'     => __('New Form Submission: {form_title}', 'gutenform'),
                'description' => __('Subject for the entry. Placeholders like {form_title} will be replaced.', 'gutenform'),
            ),
            array(
                'name'        => 'body',
                'label'       => __('Message', 'gutenform'),
                'type'        => 'textarea',
                'required'    => false,
                'default'     => '{all_fields}',
                'description' => __('Message for the entry. Placeholders like {field_name} will be replaced.', 'gutenform'),
                'rows'        => 6,
            ),
            array(
                'name'        => 'from_email',
                'label'       => __('From Email', 'gutenform'),
                'type'        => 'text',
                'required'    => false,
                'default'     => get_option('admin_email'),
                'description' => __('Email address of the sender that will be stored in the entry.', 'gutenform'),
            ),
        );
    }
}
