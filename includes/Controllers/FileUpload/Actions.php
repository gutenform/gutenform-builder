<?php

/**
 * File Upload Actions Controller
 *
 * REST API controller for file upload handling.
 *
 * @package Gutenform\Controllers\FileUpload
 * @since 1.0.0
 */

namespace Gutenform\Controllers\FileUpload;

defined('ABSPATH') || exit;

/**
 * File Upload Actions Class
 *
 * Handles REST API requests for file uploads.
 */
class Actions
{

    /**
     * Handles file upload request.
     *
     * @param \WP_REST_Request $request The REST request object.
     * @return array|\WP_Error The uploaded file data or error.
     */
    public function upload(\WP_REST_Request $request)
    {
        // 1. Nonce verification
        $nonce = $request->get_header('X-WP-Nonce');
        if (!wp_verify_nonce($nonce, 'wp_rest')) {
            return new \WP_Error(
                'invalid_nonce',
                __('Invalid nonce.', 'gutenform'),
                array('status' => 403)
            );
        }

        // 2. Check if files were uploaded
        if (empty($_FILES['file'])) {
            return new \WP_Error(
                'no_file',
                __('No file was uploaded.', 'gutenform'),
                array('status' => 400)
            );
        }

        // 3. Get upload parameters from request
        $field_name = sanitize_text_field($request->get_param('field_name') ?? '');
        $max_file_size = absint($request->get_param('max_file_size') ?? 0);
        $accept_types = sanitize_text_field($request->get_param('accept_types') ?? '');

        // 4. Handle single or multiple files
        $files = array();
        if (is_array($_FILES['file']['name'])) {
            // Multiple files
            $file_count = count($_FILES['file']['name']);
            for ($i = 0; $i < $file_count; $i++) {
                $file = array(
                    'name'     => $_FILES['file']['name'][$i],
                    'type'     => $_FILES['file']['type'][$i],
                    'tmp_name' => $_FILES['file']['tmp_name'][$i],
                    'error'    => $_FILES['file']['error'][$i],
                    'size'     => $_FILES['file']['size'][$i],
                );
                $result = $this->process_single_file($file, $field_name, $max_file_size, $accept_types);
                if (is_wp_error($result)) {
                    return $result;
                }
                $files[] = $result;
            }
        } else {
            // Single file
            $result = $this->process_single_file($_FILES['file'], $field_name, $max_file_size, $accept_types);
            if (is_wp_error($result)) {
                return $result;
            }
            $files[] = $result;
        }

        // 5. Return success response
        return array(
            'success' => true,
            'files'   => $files,
        );
    }

    /**
     * Processes a single file upload.
     *
     * @param array  $file         The file array from $_FILES.
     * @param string $field_name   The field name.
     * @param int    $max_file_size Maximum file size in MB (0 = use WordPress limit).
     * @param string $accept_types  Accepted file types.
     * @return array|\WP_Error File data or error.
     */
    private function process_single_file($file, $field_name, $max_file_size, $accept_types)
    {
        // 1. Check for upload errors
        if ($file['error'] !== UPLOAD_ERR_OK) {
            return new \WP_Error(
                'upload_error',
                $this->get_upload_error_message($file['error']),
                array('status' => 400)
            );
        }

        // 2. Validate file size
        $file_size_mb = $file['size'] / 1024 / 1024;
        $wp_max_size = wp_max_upload_size() / 1024 / 1024;
        $effective_max = $max_file_size > 0 ? min($max_file_size, $wp_max_size) : $wp_max_size;

        if ($file_size_mb > $effective_max) {
            return new \WP_Error(
                'file_too_large',
                sprintf(
                    __('File is too large. Maximum size is %s MB.', 'gutenform'),
                    $effective_max
                ),
                array('status' => 400)
            );
        }

        // 3. Validate file type
        if (!empty($accept_types)) {
            $is_valid = $this->validate_file_type($file, $accept_types);
            if (!$is_valid) {
                return new \WP_Error(
                    'invalid_file_type',
                    __('Invalid file type. Please check the accepted file types.', 'gutenform'),
                    array('status' => 400)
                );
            }
        }

        // 4. Get WordPress upload directory and create gutenform subdirectory
        $upload_dir = wp_upload_dir();
        $gutenform_dir = $upload_dir['basedir'] . '/gutenform';

        // Create year/month subdirectory
        $year = date('Y');
        $month = date('m');
        $gutenform_dir = $gutenform_dir . '/' . $year . '/' . $month;

        // Create directories if they don't exist
        if (!file_exists($gutenform_dir)) {
            wp_mkdir_p($gutenform_dir);
        }

        // 5. Sanitize file name
        $file_name = sanitize_file_name($file['name']);
        $file_name = wp_unique_filename($gutenform_dir, $file_name);
        $file_path = $gutenform_dir . '/' . $file_name;

        // 6. Move uploaded file
        if (!move_uploaded_file($file['tmp_name'], $file_path)) {
            return new \WP_Error(
                'move_failed',
                __('Failed to move uploaded file.', 'gutenform'),
                array('status' => 500)
            );
        }

        // 7. Set correct file permissions
        chmod($file_path, 0644);

        // 8. Get file URL
        $file_url = $upload_dir['baseurl'] . '/gutenform/' . $year . '/' . $month . '/' . $file_name;

        // 9. Optionally create WordPress attachment (for media library integration)
        $attachment_id = null;
        if (function_exists('wp_insert_attachment')) {
            $attachment_data = array(
                'post_mime_type' => $file['type'],
                'post_title'     => preg_replace('/\.[^.]+$/', '', $file_name),
                'post_content'   => '',
                'post_status'    => 'inherit',
            );

            $attachment_id = wp_insert_attachment($attachment_data, $file_path);
            if (!is_wp_error($attachment_id)) {
                require_once(ABSPATH . 'wp-admin/includes/image.php');
                $attachment_metadata = wp_generate_attachment_metadata($attachment_id, $file_path);
                wp_update_attachment_metadata($attachment_id, $attachment_metadata);
            }
        }

        // 10. Return file data
        return array(
            'url'           => $file_url,
            'name'          => $file_name,
            'original_name' => $file['name'],
            'type'          => $file['type'],
            'size'          => $file['size'],
            'attachment_id' => $attachment_id,
        );
    }

    /**
     * Validates file type against accepted types.
     *
     * @param array  $file         The file array.
     * @param string $accept_types Comma-separated list of accepted types.
     * @return bool True if valid, false otherwise.
     */
    private function validate_file_type($file, $accept_types)
    {
        $accepted = array_map('trim', explode(',', $accept_types));
        $file_type = $file['type'];
        $file_extension = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));

        foreach ($accepted as $accept) {
            // Check MIME type (e.g., image/*, application/pdf)
            if (strpos($accept, '*') !== false) {
                $pattern = str_replace('*', '.*', preg_quote($accept, '/'));
                if (preg_match('/^' . $pattern . '$/i', $file_type)) {
                    return true;
                }
            } elseif ($accept === $file_type) {
                return true;
            }

            // Check file extension (e.g., .pdf, .jpg)
            if (strpos($accept, '.') === 0) {
                $ext = substr($accept, 1);
                if (strtolower($ext) === $file_extension) {
                    return true;
                }
            }
        }

        return false;
    }

    /**
     * Gets upload error message.
     *
     * @param int $error_code The upload error code.
     * @return string Error message.
     */
    private function get_upload_error_message($error_code)
    {
        switch ($error_code) {
            case UPLOAD_ERR_INI_SIZE:
            case UPLOAD_ERR_FORM_SIZE:
                return __('File exceeds the maximum upload size.', 'gutenform');
            case UPLOAD_ERR_PARTIAL:
                return __('File was only partially uploaded.', 'gutenform');
            case UPLOAD_ERR_NO_FILE:
                return __('No file was uploaded.', 'gutenform');
            case UPLOAD_ERR_NO_TMP_DIR:
                return __('Missing temporary folder.', 'gutenform');
            case UPLOAD_ERR_CANT_WRITE:
                return __('Failed to write file to disk.', 'gutenform');
            case UPLOAD_ERR_EXTENSION:
                return __('File upload stopped by extension.', 'gutenform');
            default:
                return __('Unknown upload error.', 'gutenform');
        }
    }

    /**
     * Handles URL-based file upload.
     *
     * @param \WP_REST_Request $request The REST request object.
     * @return array|\WP_Error The uploaded file data or error.
     */
    public function upload_from_url(\WP_REST_Request $request)
    {
        // 1. Nonce verification
        $nonce = $request->get_header('X-WP-Nonce');
        if (!wp_verify_nonce($nonce, 'wp_rest')) {
            return new \WP_Error(
                'invalid_nonce',
                __('Invalid nonce.', 'gutenform'),
                array('status' => 403)
            );
        }

        // 2. Get URL from request
        $file_url = esc_url_raw($request->get_param('url') ?? '');
        if (empty($file_url)) {
            return new \WP_Error(
                'no_url',
                __('No URL provided.', 'gutenform'),
                array('status' => 400)
            );
        }

        // 3. Validate URL
        if (!filter_var($file_url, FILTER_VALIDATE_URL)) {
            return new \WP_Error(
                'invalid_url',
                __('Invalid URL provided.', 'gutenform'),
                array('status' => 400)
            );
        }

        // 4. Get upload parameters
        $field_name = sanitize_text_field($request->get_param('field_name') ?? '');
        $max_file_size = absint($request->get_param('max_file_size') ?? 0);
        $accept_types = sanitize_text_field($request->get_param('accept_types') ?? '');

        // 5. Download file from URL
        $response = wp_remote_get($file_url, array(
            'timeout' => 30,
            'sslverify' => true,
        ));

        if (is_wp_error($response)) {
            return new \WP_Error(
                'download_failed',
                __('Failed to download file from URL.', 'gutenform'),
                array('status' => 500)
            );
        }

        $response_code = wp_remote_retrieve_response_code($response);
        if ($response_code !== 200) {
            return new \WP_Error(
                'download_failed',
                sprintf(__('Failed to download file. HTTP status: %d', 'gutenform'), $response_code),
                array('status' => 500)
            );
        }

        $file_content = wp_remote_retrieve_body($response);
        $file_size = strlen($file_content);

        // 6. Validate file size
        $file_size_mb = $file_size / 1024 / 1024;
        $wp_max_size = wp_max_upload_size() / 1024 / 1024;
        $effective_max = $max_file_size > 0 ? min($max_file_size, $wp_max_size) : $wp_max_size;

        if ($file_size_mb > $effective_max) {
            return new \WP_Error(
                'file_too_large',
                sprintf(
                    __('File is too large. Maximum size is %s MB.', 'gutenform'),
                    $effective_max
                ),
                array('status' => 400)
            );
        }

        // 7. Get file name and type from URL or headers
        $file_name = basename(parse_url($file_url, PHP_URL_PATH));
        if (empty($file_name)) {
            $file_name = 'uploaded-file-' . time();
        }

        $content_type = wp_remote_retrieve_header($response, 'content-type');
        if (empty($content_type)) {
            $content_type = 'application/octet-stream';
        }

        // 8. Create temporary file array for validation
        $temp_file = array(
            'name' => $file_name,
            'type' => $content_type,
            'size' => $file_size,
        );

        // 9. Validate file type
        if (!empty($accept_types)) {
            $is_valid = $this->validate_file_type($temp_file, $accept_types);
            if (!$is_valid) {
                return new \WP_Error(
                    'invalid_file_type',
                    __('Invalid file type. Please check the accepted file types.', 'gutenform'),
                    array('status' => 400)
                );
            }
        }

        // 10. Get WordPress upload directory and create gutenform subdirectory
        $upload_dir = wp_upload_dir();
        $gutenform_dir = $upload_dir['basedir'] . '/gutenform';

        // Create year/month subdirectory
        $year = date('Y');
        $month = date('m');
        $gutenform_dir = $gutenform_dir . '/' . $year . '/' . $month;

        // Create directories if they don't exist
        if (!file_exists($gutenform_dir)) {
            wp_mkdir_p($gutenform_dir);
        }

        // 11. Sanitize file name
        $file_name = sanitize_file_name($file_name);
        $file_name = wp_unique_filename($gutenform_dir, $file_name);
        $file_path = $gutenform_dir . '/' . $file_name;

        // 12. Save file
        $saved = file_put_contents($file_path, $file_content);
        if ($saved === false) {
            return new \WP_Error(
                'save_failed',
                __('Failed to save file.', 'gutenform'),
                array('status' => 500)
            );
        }

        // 13. Set correct file permissions
        chmod($file_path, 0644);

        // 14. Get file URL
        $file_url_result = $upload_dir['baseurl'] . '/gutenform/' . $year . '/' . $month . '/' . $file_name;

        // 15. Optionally create WordPress attachment
        $attachment_id = null;
        if (function_exists('wp_insert_attachment')) {
            $attachment_data = array(
                'post_mime_type' => $content_type,
                'post_title'     => preg_replace('/\.[^.]+$/', '', $file_name),
                'post_content'   => '',
                'post_status'    => 'inherit',
            );

            $attachment_id = wp_insert_attachment($attachment_data, $file_path);
            if (!is_wp_error($attachment_id)) {
                require_once(ABSPATH . 'wp-admin/includes/image.php');
                $attachment_metadata = wp_generate_attachment_metadata($attachment_id, $file_path);
                wp_update_attachment_metadata($attachment_id, $attachment_metadata);
            }
        }

        // 16. Return file data
        return array(
            'success' => true,
            'files'   => array(
                array(
                    'url'           => $file_url_result,
                    'name'          => $file_name,
                    'original_name' => basename($file_url),
                    'type'          => $content_type,
                    'size'          => $file_size,
                    'attachment_id' => $attachment_id,
                ),
            ),
        );
    }
}
