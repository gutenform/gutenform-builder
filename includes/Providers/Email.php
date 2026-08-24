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

use Gutenform\Core\EmailTemplates;

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
        return __('Email Notification', 'gutenform-builder');
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
        // 1. Replace placeholders in to_email BEFORE validation
        $to_email_raw = $provider_settings['to_email'] ?? '';
        $to_email_replaced = $this->replace_placeholders(
            $to_email_raw,
            $submission_data,
            $form_identifier
        );
        $to_email = sanitize_email($to_email_replaced);

        $subject = $this->replace_placeholders(
            $provider_settings['subject'] ?? '',
            $submission_data,
            $form_identifier
        );

        // Form-level override: use_provider_layout = false means use override content as full body
        $form_use_provider_layout = isset($provider_settings['_form_use_provider_layout']) ? (bool) $provider_settings['_form_use_provider_layout'] : true;
        $form_content_raw         = isset($provider_settings['_form_content']) ? $provider_settings['_form_content'] : '';

        if ($form_content_raw !== '' && ! $form_use_provider_layout) {
            // Full body from form override (replace placeholders in content)
            $body = $this->replace_placeholders($form_content_raw, $submission_data, $form_identifier);
        } else {
            // Build body from template or regular body
            $template_name = $provider_settings['email_template'] ?? '';

            if (!empty($template_name) && $template_name !== 'custom') {
                // Load template content
                $template_content = EmailTemplates::get_template_content($template_name);
                if ($template_content !== false) {
                    // Resolve {content}: form override (after placeholder replace) or default {all_fields}
                    $injected_content = $this->format_all_fields($submission_data);
                    if ($form_content_raw !== '') {
                        $injected_content = $this->replace_placeholders($form_content_raw, $submission_data, $form_identifier);
                    }
                    $template_content = str_replace('{content}', $injected_content, $template_content);
                    // Also support legacy {all_fields} in templates
                    $template_content = str_replace('{all_fields}', $this->format_all_fields($submission_data), $template_content);
                    $body = $this->replace_placeholders($template_content, $submission_data, $form_identifier);
                } else {
                    // Template not found, fall back to regular body
                    error_log(sprintf(
                        'GutenForm Email Provider: Template "%s" not found, using regular body.',
                        $template_name
                    ));
                    $body = $this->replace_placeholders(
                        $provider_settings['body'] ?? '',
                        $submission_data,
                        $form_identifier
                    );
                }
            } else {
                // No template or custom: use body; if it contains {content}, replace with form content or all_fields
                $body_raw = $provider_settings['body'] ?? '';
                $injected_content = $this->format_all_fields($submission_data);
                if ($form_content_raw !== '') {
                    $injected_content = $this->replace_placeholders($form_content_raw, $submission_data, $form_identifier);
                }
                $body_raw = str_replace('{content}', $injected_content, $body_raw);
                $body_raw = str_replace('{all_fields}', $this->format_all_fields($submission_data), $body_raw);
                $body = $this->replace_placeholders($body_raw, $submission_data, $form_identifier);
            }
        }

        // Replace placeholders in from_email BEFORE validation
        $from_email_raw = $this->replace_placeholders(
            $provider_settings['from_email'] ?? get_option('admin_email'),
            $submission_data,
            $form_identifier
        );
        $from_email = sanitize_email($from_email_raw);

        $from_name = sanitize_text_field(
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
            // If to_email was a placeholder that couldn't be resolved, provide helpful error
            $is_placeholder = (strpos($to_email_raw, '{') !== false && strpos($to_email_raw, '}') !== false);
            if ($is_placeholder && empty($to_email_replaced)) {
                error_log(sprintf(
                    'GutenForm Email Provider Error: Placeholder "%s" could not be resolved. No primary mail found in form submission. Make sure an email field is marked as primary mail or contains a valid email address.',
                    $to_email_raw
                ));
            } else {
                error_log(sprintf(
                    'GutenForm Email Provider Error: Invalid to_email address. Original: "%s", Replaced: "%s", Sanitized: "%s"',
                    $to_email_raw,
                    $to_email_replaced,
                    $to_email
                ));
            }
            return false;
        }

        // Validate from_email after placeholder replacement
        if (empty($from_email) || ! is_email($from_email)) {
            error_log(sprintf(
                'GutenForm Email Provider Error: Invalid from_email address after placeholder replacement. Original: "%s", Replaced: "%s"',
                $provider_settings['from_email'] ?? '',
                $from_email_raw
            ));
            return false;
        }

        // 2. Create headers
        $headers = array(
            'From: ' . $from_name . ' <' . $from_email . '>',
            'Content-Type: text/html; charset=UTF-8',
        );

        // 3. Collect file attachments
        $attachments = $this->get_file_attachments($submission_data);

        // 4. Send email
        error_log('GutenForm Email Provider: Attempting to send email via wp_mail()');
        if (!empty($attachments)) {
            error_log(sprintf(
                'GutenForm Email Provider: Attaching %d file(s) to email',
                count($attachments)
            ));
        }
        $result = wp_mail($to_email, $subject, $body, $headers, $attachments);

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
                'label'       => __('Email Address', 'gutenform-builder'),
                'type'        => 'email',
                'required'    => true,
                'default'     => '',
                'description' => __('Email address to which the notification will be sent.', 'gutenform-builder'),
                'placeholder' => 'admin@example.com',
            ),
            array(
                'name'        => 'subject',
                'label'       => __('Subject', 'gutenform-builder'),
                'type'        => 'text',
                'required'    => true,
                'default'     => __('New Form Submission: {form_title}', 'gutenform-builder'),
                'description' => __('Email subject. Placeholders like {form_title} will be replaced.', 'gutenform-builder'),
            ),
            array(
                'name'        => 'body',
                'label'       => __('Message', 'gutenform-builder'),
                'type'        => 'textarea',
                'required'    => true,
                'default'     => '{all_fields}',
                'description' => __('Email message. HTML allowed. Placeholders like {field_name} will be replaced. Use {content} to inject form-specific content when the form has "Use provider layout" enabled.', 'gutenform-builder'),
                'rows'        => 6,
            ),
            array(
                'name'        => 'from_email',
                'label'       => __('From Email', 'gutenform-builder'),
                'type'        => 'text',
                'required'    => false,
                'default'     => get_option('admin_email'),
                'description' => __('Email address of the sender. Placeholders like {field_email} can be used.', 'gutenform-builder'),
            ),
            array(
                'name'        => 'from_name',
                'label'       => __('From Name', 'gutenform-builder'),
                'type'        => 'text',
                'required'    => false,
                'default'     => get_bloginfo('name'),
                'description' => __('Name of the sender.', 'gutenform-builder'),
            ),
            // Email Template Settings (internal use only)
            array(
                'name'        => 'email_template',
                'label'       => __('Template', 'gutenform-builder'),
                'type'        => 'text',
                'required'    => false,
                'default'     => '',
                'description' => __('Template name (internal use).', 'gutenform-builder'),
            ),
        );
    }

    /**
     * Extracts file attachments from submission data.
     *
     * @param array $submission_data The form submission data.
     * @return array Array of file paths for wp_mail() attachments.
     */
    private function get_file_attachments(array $submission_data): array
    {
        $attachments = array();

        foreach ($submission_data as $field_name => $field_value) {
            // Check if field value is an array of file objects
            if (is_array($field_value)) {
                // Check if it's a file array (has 'url' key in first element)
                if (!empty($field_value) && is_array($field_value[0]) && isset($field_value[0]['url'])) {
                    foreach ($field_value as $file_data) {
                        if (isset($file_data['url']) && isset($file_data['attachment_id'])) {
                            // Use WordPress attachment ID if available
                            $attachment_path = get_attached_file($file_data['attachment_id']);
                            if ($attachment_path && file_exists($attachment_path)) {
                                $attachments[] = $attachment_path;
                            } elseif (isset($file_data['url'])) {
                                // Fallback: download from URL
                                $file_path = $this->download_file_for_attachment($file_data['url']);
                                if ($file_path) {
                                    $attachments[] = $file_path;
                                }
                            }
                        } elseif (isset($file_data['url'])) {
                            // No attachment ID, try to download from URL
                            $file_path = $this->download_file_for_attachment($file_data['url']);
                            if ($file_path) {
                                $attachments[] = $file_path;
                            }
                        }
                    }
                }
            }
        }

        return $attachments;
    }

    /**
     * Downloads a file from URL for email attachment.
     *
     * @param string $file_url The file URL.
     * @return string|false The temporary file path or false on failure.
     */
    private function download_file_for_attachment(string $file_url)
    {
        // Check if URL is local (same domain)
        $upload_dir = wp_upload_dir();
        $site_url = site_url();

        if (strpos($file_url, $site_url) === 0) {
            // Local file - convert URL to path
            $file_path = str_replace($upload_dir['baseurl'], $upload_dir['basedir'], $file_url);
            if (file_exists($file_path)) {
                return $file_path;
            }
        }

        // Remote file - download to temporary location
        $response = wp_remote_get($file_url, array(
            'timeout' => 30,
            'sslverify' => true,
        ));

        if (is_wp_error($response) || wp_remote_retrieve_response_code($response) !== 200) {
            error_log('GutenForm Email Provider: Failed to download file for attachment: ' . $file_url);
            return false;
        }

        $file_content = wp_remote_retrieve_body($response);
        $file_name = basename(parse_url($file_url, PHP_URL_PATH));

        if (empty($file_name)) {
            $file_name = 'attachment-' . time();
        }

        // Create temporary file
        $temp_file = wp_tempnam($file_name);
        if ($temp_file) {
            file_put_contents($temp_file, $file_content);
            return $temp_file;
        }

        return false;
    }
}
