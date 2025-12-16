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
     * Returns the unique slug of the provider.
     *
     * @return string
     */
    abstract public function get_slug(): string;

    /**
     * Returns the display name of the provider.
     *
     * @return string
     */
    abstract public function get_title(): string;

    /**
     * Processes a form submission.
     *
     * @param array  $submission_data The form data
     * @param array  $provider_settings The individual settings for this provider
     * @param string $form_identifier The form identifier
     * @return bool Success of processing
     */
    abstract public function process_submission(
        array $submission_data,
        array $provider_settings,
        string $form_identifier
    ): bool;

    /**
     * Returns the field definitions for the settings.
     * Used in the admin interface to generate dynamic forms.
     *
     * @return array Array of field definitions
     */
    abstract public function get_settings_fields(): array;

    /**
     * Replaces placeholders in a string.
     *
     * Supports:
     * - {field_slug} - Form field values
     * - {form_identifier} - Form identifier
     * - {form_title} - Form title (from Post Meta)
     * - {site_name} - Site name
     * - {date} - Current date
     * - {time} - Current time
     * - {ip_address} - Client IP address
     * - {all_fields} - All form fields as a list (key: value)
     *
     * @param string $content The string with placeholders
     * @param array  $submission_data The form data
     * @param string $form_identifier The form identifier
     * @return string String with replaced placeholders
     */
    protected function replace_placeholders(
        string $content,
        array $submission_data,
        string $form_identifier
    ): string {
        $replacements = array();

        // Replace form field values
        foreach ($submission_data as $key => $value) {
            $replacements['{' . $key . '}'] = is_array($value) ? implode(', ', $value) : $value;
        }

        // Standard placeholders
        $replacements['{form_identifier}'] = $form_identifier;
        $replacements['{form_title}']     = $this->get_form_title($form_identifier);
        $replacements['{site_name}']      = get_bloginfo('name');
        $replacements['{date}']           = current_time('Y-m-d');
        $replacements['{time}']           = current_time('H:i:s');
        $replacements['{ip_address}']    = $this->get_client_ip();
        $replacements['{all_fields}']    = $this->format_all_fields($submission_data);
        
        // Primary mail placeholder
        $replacements['{form_primary_mail}'] = $this->get_primary_mail($submission_data);

        // Replace all placeholders
        return str_replace(array_keys($replacements), array_values($replacements), $content);
    }

    /**
     * Gets the primary mail address from submission data.
     *
     * Looks for a field marked as primary mail, or falls back to the first email address found.
     *
     * @param array $submission_data The form submission data.
     * @return string The primary email address or empty string.
     */
    protected function get_primary_mail(array $submission_data): string
    {
        // Check if primary mail field is explicitly marked
        if (isset($submission_data['_primary_mail_field']) && !empty($submission_data['_primary_mail_field'])) {
            $primary_field_name = $submission_data['_primary_mail_field'];
            if (isset($submission_data[$primary_field_name])) {
                $primary_mail = $submission_data[$primary_field_name];
                if (is_email($primary_mail)) {
                    return sanitize_email($primary_mail);
                }
            }
        }

        // Fallback: Find first email-like value in submission data
        foreach ($submission_data as $key => $value) {
            // Skip metadata fields
            if (strpos($key, '_') === 0) {
                continue;
            }

            $email_value = is_array($value) ? (isset($value[0]) ? $value[0] : '') : $value;
            if (is_email($email_value)) {
                return sanitize_email($email_value);
            }
        }

        return '';
    }

    /**
     * Formats all form fields as a list in "key: value" format.
     *
     * @param array $submission_data The form data
     * @return string Formatted list of all fields
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
                // Check if this is a file array (has 'url' key in first element)
                if (!empty($value) && is_array($value[0]) && isset($value[0]['url'])) {
                    // This is a file upload field
                    $formatted_value = $this->format_file_field($value);
                } else {
                    $formatted_value = implode(', ', $value);
                }
            } elseif (is_bool($value)) {
                $formatted_value = $value ? __('Yes', 'gutenform') : __('No', 'gutenform');
            } else {
                $formatted_value = (string) $value;
            }

            $rows .= '<tr style="border-bottom:1px solid #eee;"><td style="padding: 5px 10px; font-weight:bold; text-align:left;">' . esc_html($key) . '</td><td style="padding: 5px 10px;">' . $formatted_value . '</td></tr>';
        }

        $table = '<table style="border-collapse:collapse;width:100%;background:#fafbfc;border:1px solid #eaeaea;font-family:sans-serif;font-size:14px;margin:10px 0 15px 0;">';
        $table .= '<thead><tr style="background:#f0f4f8;"><th style="padding:8px 10px; text-align:left; border-bottom:2px solid #eaeaea;">' . __('Field', 'gutenform') . '</th><th style="padding:8px 10px;text-align:left; border-bottom:2px solid #eaeaea;">' . __('Value', 'gutenform') . '</th></tr></thead>';
        $table .= '<tbody>' . $rows . '</tbody>';
        $table .= '</table>';

        return $table;
    }

    /**
     * Gets the form title from the form identifier.
     *
     * @param string $form_identifier The form identifier
     * @return string The form title or the identifier as fallback
     */
    protected function get_form_title(string $form_identifier): string
    {
        // Try to get the title from Post Meta
        // This is a simplified implementation - can be extended later
        // e.g. by storing form titles in a separate table or meta
        return $form_identifier;
    }

    /**
     * Gets the client IP address.
     *
     * @return string The IP address
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

    /**
     * Formats file field data as HTML with thumbnails and download links.
     *
     * @param array $files Array of file data objects.
     * @return string HTML formatted file list.
     */
    protected function format_file_field(array $files): string
    {
        if (empty($files)) {
            return '';
        }

        $file_list = '<div style="display: flex; flex-direction: column; gap: 8px;">';

        foreach ($files as $file) {
            if (!isset($file['url']) || !isset($file['name'])) {
                continue;
            }

            $file_url = esc_url($file['url']);
            $file_name = esc_html($file['original_name'] ?? $file['name']);
            $file_type = $file['type'] ?? '';
            $is_image = strpos($file_type, 'image/') === 0;

            $file_list .= '<div style="display: flex; align-items: center; gap: 8px; padding: 8px; background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 4px;">';

            if ($is_image) {
                // Show thumbnail for images
                $file_list .= sprintf(
                    '<img src="%s" alt="%s" style="width: 60px; height: 60px; object-fit: cover; border-radius: 4px; flex-shrink: 0;" />',
                    esc_url($file_url),
                    esc_attr($file_name)
                );
            } else {
                // Show file icon for non-images
                $file_list .= '<div style="width: 60px; height: 60px; background: #e5e7eb; border-radius: 4px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">';
                $file_list .= '<span style="font-size: 24px;">📄</span>';
                $file_list .= '</div>';
            }

            $file_list .= '<div style="flex: 1; min-width: 0;">';
            $file_list .= sprintf(
                '<a href="%s" target="_blank" style="color: #3b82f6; text-decoration: none; font-weight: 500; display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">%s</a>',
                $file_url,
                $file_name
            );

            if (isset($file['size'])) {
                $file_size = $this->format_file_size($file['size']);
                $file_list .= sprintf(
                    '<span style="font-size: 12px; color: #6b7280;">%s</span>',
                    esc_html($file_size)
                );
            }

            $file_list .= '</div>';
            $file_list .= '</div>';
        }

        $file_list .= '</div>';

        return $file_list;
    }

    /**
     * Formats file size in human-readable format.
     *
     * @param int $bytes File size in bytes.
     * @return string Formatted file size.
     */
    protected function format_file_size(int $bytes): string
    {
        $units = array('B', 'KB', 'MB', 'GB');
        $bytes = max($bytes, 0);
        $pow = floor(($bytes ? log($bytes) : 0) / log(1024));
        $pow = min($pow, count($units) - 1);
        $bytes /= pow(1024, $pow);

        return round($bytes, 2) . ' ' . $units[$pow];
    }
}
