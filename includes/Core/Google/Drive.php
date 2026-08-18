<?php

/**
 * Google Drive API Client
 *
 * @package Gutenform\Core\Google
 * @since 1.0.0
 */

namespace Gutenform\Core\Google;

defined('ABSPATH') || exit;

/**
 * Google Drive operations for folder selection and file uploads.
 */
class Drive
{
	/**
	 * List folders in Google Drive.
	 *
	 * @param string $parent_id Parent folder ID (default: root).
	 * @param string $search    Optional search query.
	 * @return array<int, array{id: string, name: string}>
	 *
	 * @throws GoogleApiException When the request fails.
	 */
	public static function list_folders(string $parent_id = 'root', string $search = ''): array
	{
		$query = "mimeType='application/vnd.google-apps.folder' and trashed=false";
		if ('root' === $parent_id) {
			$query .= " and 'root' in parents";
		} else {
			$query .= " and '" . str_replace("'", "\\'", $parent_id) . "' in parents";
		}

		if ('' !== $search) {
			$query .= " and name contains '" . str_replace("'", "\\'", $search) . "'";
		}

		$url  = add_query_arg(
			array(
				'q'       => $query,
				'fields'  => 'files(id,name)',
				'orderBy' => 'name',
				'pageSize'=> 100,
			),
			'https://www.googleapis.com/drive/v3/files'
		);
		$data = Client::get($url);

		$files = isset($data['files']) && is_array($data['files']) ? $data['files'] : array();
		$out   = array();

		foreach ($files as $file) {
			if (empty($file['id']) || empty($file['name'])) {
				continue;
			}
			$out[] = array(
				'id'   => (string) $file['id'],
				'name' => (string) $file['name'],
			);
		}

		return $out;
	}

	/**
	 * Upload a local file to Google Drive.
	 *
	 * @param string $folder_id Folder ID.
	 * @param string $file_path Local file path.
	 * @param string $filename  Target filename.
	 * @param string $mime_type MIME type.
	 * @return array{id: string, name: string, web_view_link: string}
	 *
	 * @throws GoogleApiException When the request fails.
	 */
	public static function upload_file(string $folder_id, string $file_path, string $filename, string $mime_type = 'application/octet-stream'): array
	{
		if (! file_exists($file_path) || ! is_readable($file_path)) {
			throw new GoogleApiException(
				sprintf(
					/* translators: %s: file path */
					__('File not found or not readable: %s', 'gutenform'),
					$filename
				),
				400
			);
		}

		$access_token = OAuth::get_access_token();
		if (is_wp_error($access_token)) {
			throw new GoogleApiException($access_token->get_error_message(), 401);
		}

		$metadata = wp_json_encode(
			array(
				'name'    => $filename,
				'parents' => array( $folder_id ),
			)
		);

		$file_contents = file_get_contents($file_path);
		if (false === $file_contents) {
			throw new GoogleApiException(
				sprintf(
					/* translators: %s: file path */
					__('Failed to read file for upload: %s', 'gutenform'),
					$filename
				),
				500
			);
		}

		$boundary = wp_generate_password(24, false, false);
		$body     = "--{$boundary}\r\n";
		$body    .= "Content-Type: application/json; charset=UTF-8\r\n\r\n";
		$body    .= $metadata . "\r\n";
		$body    .= "--{$boundary}\r\n";
		$body    .= 'Content-Type: ' . $mime_type . "\r\n";
		$body    .= "Content-Transfer-Encoding: base64\r\n\r\n";
		$body    .= chunk_split(base64_encode($file_contents));
		$body    .= "--{$boundary}--";

		$url = add_query_arg(
			array(
				'uploadType' => 'multipart',
				'fields'     => 'id,name,webViewLink',
			),
			'https://www.googleapis.com/upload/drive/v3/files'
		);

		$response = wp_remote_post(
			$url,
			array(
				'timeout' => 60,
				'headers' => array(
					'Authorization' => 'Bearer ' . $access_token,
					'Content-Type'  => 'multipart/related; boundary=' . $boundary,
				),
				'body'    => $body,
			)
		);

		if (is_wp_error($response)) {
			throw new GoogleApiException(
				sprintf(
					/* translators: %s: error message */
					__('Google Drive upload failed: %s', 'gutenform'),
					$response->get_error_message()
				),
				500
			);
		}

		$status = (int) wp_remote_retrieve_response_code($response);
		$data   = json_decode(wp_remote_retrieve_body($response), true);
		$data   = is_array($data) ? $data : array();

		if ($status >= 400) {
			$message = isset($data['error']['message'])
				? (string) $data['error']['message']
				: __('Failed to upload file to Google Drive.', 'gutenform');
			throw new GoogleApiException($message, $status, $data);
		}

		return array(
			'id'             => isset($data['id']) ? (string) $data['id'] : '',
			'name'           => isset($data['name']) ? (string) $data['name'] : $filename,
			'web_view_link'  => isset($data['webViewLink']) ? (string) $data['webViewLink'] : '',
		);
	}

	/**
	 * Download a remote file to a temp path for Drive upload.
	 *
	 * @param string $url      Remote URL.
	 * @param string $filename Suggested filename.
	 * @return array{path: string, mime_type: string, filename: string}|\WP_Error
	 */
	public static function download_to_temp(string $url, string $filename)
	{
		$response = wp_remote_get(
			$url,
			array(
				'timeout'   => 30,
				'sslverify' => true,
			)
		);

		if (is_wp_error($response)) {
			return new \WP_Error(
				'drive_download_failed',
				sprintf(
					/* translators: %s: error message */
					__('Failed to download file from URL: %s', 'gutenform'),
					$response->get_error_message()
				)
			);
		}

		$status = wp_remote_retrieve_response_code($response);
		if ($status >= 400) {
			return new \WP_Error(
				'drive_download_failed',
				sprintf(
					/* translators: %d: HTTP status code */
					__('Failed to download file (HTTP %d).', 'gutenform'),
					$status
				)
			);
		}

		$body = wp_remote_retrieve_body($response);
		if ('' === $body) {
			return new \WP_Error(
				'drive_download_failed',
				__('Downloaded file is empty.', 'gutenform')
			);
		}

		$tmp = wp_tempnam($filename);
		if (! $tmp) {
			return new \WP_Error(
				'drive_download_failed',
				__('Could not create temporary file for upload.', 'gutenform')
			);
		}

		// phpcs:ignore WordPress.WP.AlternativeFunctions.file_system_operations_file_put_contents
		file_put_contents($tmp, $body);

		$mime = wp_remote_retrieve_header($response, 'content-type');
		if (is_array($mime)) {
			$mime = $mime[0] ?? 'application/octet-stream';
		}

		return array(
			'path'      => $tmp,
			'mime_type' => $mime ? (string) $mime : 'application/octet-stream',
			'filename'  => $filename,
		);
	}
}
