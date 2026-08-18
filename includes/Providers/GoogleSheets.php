<?php

/**
 * Google Sheets Provider
 *
 * @package Gutenform\Providers
 * @since 1.0.0
 */

namespace Gutenform\Providers;

use Gutenform\Core\Google\Drive;
use Gutenform\Core\Google\GoogleApiException;
use Gutenform\Core\Google\OAuth;
use Gutenform\Core\Google\Sheets;

defined('ABSPATH') || exit;

/**
 * Sends form submissions to Google Sheets.
 */
class GoogleSheets extends AbstractProvider
{
	/**
	 * Provider slug.
	 *
	 * @return string
	 */
	public function get_slug(): string
	{
		return 'google-sheets';
	}

	/**
	 * Provider title.
	 *
	 * @return string
	 */
	public function get_title(): string
	{
		return __('Google Sheets', 'gutenform');
	}

	/**
	 * Process a form submission.
	 *
	 * @param array  $submission_data   Form data.
	 * @param array  $provider_settings Provider settings.
	 * @param string $form_identifier   Form identifier.
	 * @return bool
	 */
	public function process_submission(
		array $submission_data,
		array $provider_settings,
		string $form_identifier
	): bool {
		try {
			$access_token = OAuth::get_access_token();
			if (is_wp_error($access_token)) {
				error_log('GutenForm Google Sheets Provider: ' . $access_token->get_error_message());
				return false;
			}

			$row = self::build_row($submission_data, $provider_settings, $form_identifier);
			if (empty($row)) {
				error_log('GutenForm Google Sheets Provider: No row data to append.');
				return false;
			}

			$spreadsheet_id = isset($provider_settings['spreadsheet_id']) ? sanitize_text_field((string) $provider_settings['spreadsheet_id']) : '';
			$sheet_name     = isset($provider_settings['sheet_name']) ? sanitize_text_field((string) $provider_settings['sheet_name']) : '';

			if ('' === $spreadsheet_id || '' === $sheet_name) {
				error_log('GutenForm Google Sheets Provider: Spreadsheet or sheet name is not configured.');
				return false;
			}

			Sheets::append_row($spreadsheet_id, $sheet_name, $row);

			error_log(sprintf(
				'GutenForm Google Sheets Provider: Row appended to "%s" / "%s" for form "%s".',
				$spreadsheet_id,
				$sheet_name,
				$form_identifier
			));

			return true;
		} catch (GoogleApiException $e) {
			error_log('GutenForm Google Sheets Provider Error: ' . $e->getMessage());
			return false;
		} catch (\Exception $e) {
			error_log('GutenForm Google Sheets Provider Error: ' . $e->getMessage());
			return false;
		}
	}

	/**
	 * Build a sheet row from submission data and column mapping.
	 *
	 * @param array  $submission_data   Form data.
	 * @param array  $provider_settings Provider settings.
	 * @param string $form_identifier   Form identifier.
	 * @param bool   $is_test           Whether this is a test submission.
	 * @return array<int, string>
	 *
	 * @throws GoogleApiException When file upload fails.
	 */
	public static function build_row(
		array $submission_data,
		array $provider_settings,
		string $form_identifier,
		bool $is_test = false
	): array {
		$mapping = isset($provider_settings['column_mapping']) && is_array($provider_settings['column_mapping'])
			? $provider_settings['column_mapping']
			: array();

		if (empty($mapping)) {
			return array();
		}

		$drive_folder_id = isset($provider_settings['drive_folder_id'])
			? sanitize_text_field((string) $provider_settings['drive_folder_id'])
			: '';

		$row = array();

		foreach ($mapping as $map) {
			if (! is_array($map)) {
				continue;
			}

			$field = isset($map['field']) ? (string) $map['field'] : '';
			if ('' === $field) {
				$row[] = '';
				continue;
			}

			$row[] = self::resolve_field_value(
				$field,
				$submission_data,
				$form_identifier,
				$drive_folder_id,
				$is_test
			);
		}

		return $row;
	}

	/**
	 * Resolve a single mapped field value.
	 *
	 * @param string $field             Field key or meta key.
	 * @param array  $submission_data   Submission data.
	 * @param string $form_identifier   Form identifier.
	 * @param string $drive_folder_id   Drive folder for uploads.
	 * @param bool   $is_test           Test mode flag.
	 * @return string
	 *
	 * @throws GoogleApiException When file upload fails.
	 */
	private static function resolve_field_value(
		string $field,
		array $submission_data,
		string $form_identifier,
		string $drive_folder_id,
		bool $is_test
	): string {
		if ($is_test) {
			return self::get_test_value($field);
		}

		switch ($field) {
			case '_submission_date':
				return current_time('Y-m-d H:i:s');
			case '_form_identifier':
				return $form_identifier;
			case '_ip_address':
				return ( new self() )->get_client_ip();
			case '_site_name':
				return get_bloginfo('name');
		}

		if (! isset($submission_data[ $field ])) {
			return '';
		}

		$value = $submission_data[ $field ];

		if (is_array($value) && self::is_file_field($value)) {
			return self::format_file_values_for_sheet($value, $drive_folder_id);
		}

		if (is_array($value)) {
			return implode(', ', array_map('strval', $value));
		}

		if (is_bool($value)) {
			return $value ? __('Yes', 'gutenform') : __('No', 'gutenform');
		}

		return (string) $value;
	}

	/**
	 * Check if value is a file upload field.
	 *
	 * @param array<int, mixed> $value Field value.
	 * @return bool
	 */
	private static function is_file_field(array $value): bool
	{
		if (empty($value)) {
			return false;
		}

		$first = $value[0] ?? null;
		return is_array($first) && ( isset($first['url']) || isset($first['attachment_id']) );
	}

	/**
	 * Format file field values, optionally uploading to Drive.
	 *
	 * @param array<int, array<string, mixed>> $files           File data.
	 * @param string                           $drive_folder_id Drive folder ID.
	 * @return string
	 *
	 * @throws GoogleApiException When upload fails.
	 */
	private static function format_file_values_for_sheet(array $files, string $drive_folder_id): string
	{
		$links = array();

		foreach ($files as $file) {
			if (! is_array($file)) {
				continue;
			}

			$filename = isset($file['original_name']) ? (string) $file['original_name'] : ( isset($file['name']) ? (string) $file['name'] : 'file' );
			$mime     = isset($file['type']) ? (string) $file['type'] : 'application/octet-stream';
			$url      = isset($file['url']) ? (string) $file['url'] : '';

			if ('' !== $drive_folder_id) {
				$local_path = self::resolve_local_file_path($file);
				if ($local_path) {
					try {
						$uploaded = Drive::upload_file($drive_folder_id, $local_path, $filename, $mime);
						if (! empty($uploaded['web_view_link'])) {
							$links[] = $uploaded['web_view_link'];
							continue;
						}
					} catch (GoogleApiException $e) {
						error_log('GutenForm Google Sheets: Drive upload failed for ' . $filename . ' - ' . $e->getMessage());
						if ($url) {
							$links[] = $url;
							continue;
						}
						throw $e;
					}
				} elseif ($url) {
					$downloaded = Drive::download_to_temp($url, $filename);
					if (! is_wp_error($downloaded)) {
						try {
							$uploaded = Drive::upload_file(
								$drive_folder_id,
								$downloaded['path'],
								$downloaded['filename'],
								$downloaded['mime_type']
							);
							if (! empty($uploaded['web_view_link'])) {
								$links[] = $uploaded['web_view_link'];
							}
						} finally {
							if (file_exists($downloaded['path'])) {
								wp_delete_file($downloaded['path']);
							}
						}
						continue;
					}
				}
			}

			if ($url) {
				$links[] = $url;
			}
		}

		return implode("\n", $links);
	}

	/**
	 * Resolve local filesystem path for an uploaded file.
	 *
	 * @param array<string, mixed> $file File data.
	 * @return string|null
	 */
	private static function resolve_local_file_path(array $file): ?string
	{
		if (! empty($file['attachment_id'])) {
			$path = get_attached_file((int) $file['attachment_id']);
			if ($path && file_exists($path)) {
				return $path;
			}
		}

		if (! empty($file['url'])) {
			$upload_dir = wp_upload_dir();
			$url        = (string) $file['url'];
			if (! empty($upload_dir['baseurl']) && str_starts_with($url, $upload_dir['baseurl'])) {
				$relative = substr($url, strlen($upload_dir['baseurl']));
				$path     = $upload_dir['basedir'] . $relative;
				if (file_exists($path)) {
					return $path;
				}
			}
		}

		return null;
	}

	/**
	 * Get dummy test value for a field.
	 *
	 * @param string $field Field key.
	 * @return string
	 */
	private static function get_test_value(string $field): string
	{
		switch ($field) {
			case '_submission_date':
				return current_time('Y-m-d H:i:s');
			case '_form_identifier':
				return 'test-form';
			case '_ip_address':
				return '127.0.0.1';
			case '_site_name':
				return get_bloginfo('name');
			default:
				if (str_contains($field, 'email') || str_contains($field, 'mail')) {
					return 'test@example.com';
				}
				if (str_contains($field, 'file') || str_contains($field, 'upload')) {
					return __('[Test file – no upload in test mode]', 'gutenform');
				}
				return sprintf(
					/* translators: %s: field name */
					__('Test: %s', 'gutenform'),
					$field
				);
		}
	}

	/**
	 * Settings fields for admin UI metadata.
	 *
	 * @return array<int, array<string, mixed>>
	 */
	public function get_settings_fields(): array
	{
		return array(
			array(
				'name'        => 'connection',
				'label'       => __('Google Connection', 'gutenform'),
				'type'        => 'text',
				'required'    => false,
				'description' => __('Configure Google OAuth in the provider setup wizard. Spreadsheet and Drive settings are configured per form.', 'gutenform'),
			),
		);
	}
}
