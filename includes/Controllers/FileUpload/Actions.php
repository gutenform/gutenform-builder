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

use Gutenform\Core\UploadTokens;

defined('ABSPATH') || exit;

/**
 * File Upload Actions Class
 *
 * Handles REST API requests for file uploads.
 *
 * This endpoint is reachable by anonymous visitors (form submitters), so every
 * uploaded file is run through WordPress' own upload pipeline
 * (wp_handle_upload()) with a server-side MIME allowlist that the client
 * cannot widen -- the accept_types request parameter is only ever used to
 * narrow that allowlist for a nicer error message, never to bypass it.
 * Successful uploads are stored outside any web-executable context and handed
 * back only as an opaque, single-use token; no attachment_id, path, or URL
 * that a submission could use to reference an arbitrary existing file.
 */
class Actions
{
	/**
	 * MIME types this endpoint will ever accept, regardless of what the
	 * client requests. Intersected with WordPress' own
	 * get_allowed_mime_types() at request time, and filterable for sites
	 * that need to widen (never narrow-bypass) this set.
	 *
	 * @return array<string, string> extension(s) => mime type, as expected by wp_handle_upload()'s 'mimes' override.
	 */
	private function get_allowed_mimes(): array
	{
		$allowed = array(
			'jpg|jpeg|jpe' => 'image/jpeg',
			'gif'          => 'image/gif',
			'png'          => 'image/png',
			'webp'         => 'image/webp',
			'svg'          => 'image/svg+xml',
			'pdf'          => 'application/pdf',
			'doc'          => 'application/msword',
			'docx'         => 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
			'xls'          => 'application/vnd.ms-excel',
			'xlsx'         => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
			'ppt'          => 'application/vnd.ms-powerpoint',
			'pptx'         => 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
			'txt'          => 'text/plain',
			'csv'          => 'text/csv',
			'zip'          => 'application/zip',
		);

		/**
		 * Filters the MIME allowlist for Gutenform's public file upload endpoint.
		 * This is always intersected with WordPress' own get_allowed_mime_types(),
		 * so it can only narrow, never grant a type WordPress itself disallows.
		 *
		 * @param array<string, string> $allowed extension(s) => mime type.
		 */
		$allowed = apply_filters('gutenform/upload/allowed_mimes', $allowed);

		$wp_mimes = get_allowed_mime_types();

		return array_intersect($allowed, $wp_mimes);
	}

	/**
	 * Handles file upload request.
	 *
	 * @param \WP_REST_Request $request The REST request object.
	 * @return array|\WP_Error The uploaded file data or error.
	 */
	public function upload(\WP_REST_Request $request)
	{
		if (empty($_FILES['file'])) {
			return new \WP_Error(
				'no_file',
				__('No file was uploaded.', 'gutenform-builder'),
				array('status' => 400)
			);
		}

		$field_name    = sanitize_text_field($request->get_param('field_name') ?? '');
		$max_file_size = absint($request->get_param('max_file_size') ?? 0);
		$accept_types  = sanitize_text_field($request->get_param('accept_types') ?? '');

		$files = array();
		if (is_array($_FILES['file']['name'])) {
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
			$result = $this->process_single_file($_FILES['file'], $field_name, $max_file_size, $accept_types);
			if (is_wp_error($result)) {
				return $result;
			}
			$files[] = $result;
		}

		return array(
			'success' => true,
			'files'   => $files,
		);
	}

	/**
	 * Processes a single file upload.
	 *
	 * @param array  $file          The file array (single-file $_FILES shape).
	 * @param string $field_name    The field name.
	 * @param int    $max_file_size Maximum file size in MB (0 = use WordPress limit).
	 * @param string $accept_types  Client-requested accepted file types (a UI hint, not authoritative).
	 * @return array|\WP_Error File data (with an upload token) or error.
	 */
	private function process_single_file($file, $field_name, $max_file_size, $accept_types)
	{
		if ($file['error'] !== UPLOAD_ERR_OK) {
			return new \WP_Error(
				'upload_error',
				$this->get_upload_error_message($file['error']),
				array('status' => 400)
			);
		}

		$file_size_mb  = $file['size'] / 1024 / 1024;
		$wp_max_size   = wp_max_upload_size() / 1024 / 1024;
		$effective_max = $max_file_size > 0 ? min($max_file_size, $wp_max_size) : $wp_max_size;

		if ($file_size_mb > $effective_max) {
			return new \WP_Error(
				'file_too_large',
				sprintf(
					__('File is too large. Maximum size is %s MB.', 'gutenform-builder'),
					$effective_max
				),
				array('status' => 400)
			);
		}

		$allowed_mimes = $this->get_allowed_mimes();

		// If the block declared accepted types, use them to narrow the allowlist
		// for this request (better error message) -- but never to widen it.
		if (! empty($accept_types)) {
			$requested = $this->filter_mimes_by_accept($allowed_mimes, $accept_types);
			if (empty($requested)) {
				return new \WP_Error(
					'invalid_file_type',
					__('Invalid file type. Please check the accepted file types.', 'gutenform-builder'),
					array('status' => 400)
				);
			}
			$allowed_mimes = $requested;
		}

		if (empty($allowed_mimes)) {
			return new \WP_Error(
				'invalid_file_type',
				__('This file type is not allowed.', 'gutenform-builder'),
				array('status' => 400)
			);
		}

		require_once ABSPATH . 'wp-admin/includes/file.php';

		add_filter('upload_dir', array($this, 'filter_upload_dir'));
		$overrides = array(
			'test_form' => false,
			'mimes'     => $allowed_mimes,
		);
		$handled = wp_handle_upload($file, $overrides);
		remove_filter('upload_dir', array($this, 'filter_upload_dir'));

		if (isset($handled['error'])) {
			return new \WP_Error(
				'upload_failed',
				$handled['error'],
				array('status' => 400)
			);
		}

		$this->ensure_directory_protected(dirname($handled['file']));

		$file_data = array(
			'name'          => wp_basename($handled['file']),
			'original_name' => sanitize_file_name($file['name']),
			'type'          => $handled['type'],
			'size'          => (int) $file['size'],
			'path'          => $handled['file'],
			'url'           => $handled['url'],
		);

		$token = UploadTokens::issue($file_data);

		return array(
			'token'         => $token,
			'name'          => $file_data['name'],
			'original_name' => $file_data['original_name'],
			'type'          => $file_data['type'],
			'size'          => $file_data['size'],
			'url'           => $file_data['url'],
		);
	}

	/**
	 * Narrows a mime allowlist to entries matching the client's requested
	 * accept_types (extensions and/or MIME wildcards like image/*).
	 *
	 * @param array<string, string> $allowed_mimes extension(s) => mime type.
	 * @param string                $accept_types  Comma-separated list from the request.
	 * @return array<string, string>
	 */
	private function filter_mimes_by_accept(array $allowed_mimes, string $accept_types): array
	{
		$accepted = array_map('trim', explode(',', $accept_types));
		$matched  = array();

		foreach ($allowed_mimes as $ext_pattern => $mime) {
			$extensions = explode('|', $ext_pattern);

			foreach ($accepted as $accept) {
				if (strpos($accept, '*') !== false) {
					$pattern = str_replace('*', '.*', preg_quote($accept, '/'));
					if (preg_match('/^' . $pattern . '$/i', $mime)) {
						$matched[$ext_pattern] = $mime;
						continue 2;
					}
				} elseif ($accept === $mime) {
					$matched[$ext_pattern] = $mime;
					continue 2;
				} elseif (strpos($accept, '.') === 0) {
					$ext = strtolower(substr($accept, 1));
					if (in_array($ext, $extensions, true)) {
						$matched[$ext_pattern] = $mime;
						continue 2;
					}
				}
			}
		}

		return $matched;
	}

	/**
	 * Redirects wp_handle_upload() into wp-content/uploads/gutenform/Y/m/
	 * instead of the default uploads root.
	 *
	 * @param array $dirs WordPress upload dir info.
	 * @return array
	 */
	public function filter_upload_dir($dirs)
	{
		$dirs['subdir'] = '/gutenform' . $dirs['subdir'];
		$dirs['path']   = $dirs['basedir'] . $dirs['subdir'];
		$dirs['url']    = $dirs['baseurl'] . $dirs['subdir'];

		return $dirs;
	}

	/**
	 * Ensures a .htaccess (Apache) and index.php (any server) exist in the
	 * upload directory to stop uploaded files from ever being executed as
	 * PHP, and to stop directory listing.
	 *
	 * @param string $dir Absolute directory path.
	 * @return void
	 */
	private function ensure_directory_protected(string $dir): void
	{
		$htaccess = $dir . '/.htaccess';
		if (! file_exists($htaccess)) {
			file_put_contents(
				$htaccess,
				"# Deny execution of any script in this directory.\n" .
					"<FilesMatch \"\\.(php|php[0-9]?|phtml|pl|py|cgi|asp|aspx|sh|exe)$\">\n" .
					"  Require all denied\n" .
					"</FilesMatch>\n" .
					"php_flag engine off\n"
			);
		}

		$index = $dir . '/index.php';
		if (! file_exists($index)) {
			file_put_contents($index, "<?php\n// Silence is golden.\n");
		}
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
				return __('File exceeds the maximum upload size.', 'gutenform-builder');
			case UPLOAD_ERR_PARTIAL:
				return __('File was only partially uploaded.', 'gutenform-builder');
			case UPLOAD_ERR_NO_FILE:
				return __('No file was uploaded.', 'gutenform-builder');
			case UPLOAD_ERR_NO_TMP_DIR:
				return __('Missing temporary folder.', 'gutenform-builder');
			case UPLOAD_ERR_CANT_WRITE:
				return __('Failed to write file to disk.', 'gutenform-builder');
			case UPLOAD_ERR_EXTENSION:
				return __('File upload stopped by extension.', 'gutenform-builder');
			default:
				return __('Unknown upload error.', 'gutenform-builder');
		}
	}
}
