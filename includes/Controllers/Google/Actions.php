<?php

/**
 * Google Integration Controller
 *
 * @package Gutenform\Controllers\Google
 * @since 1.0.0
 */

namespace Gutenform\Controllers\Google;

use Gutenform\Core\Google\Drive;
use Gutenform\Core\Google\GoogleApiException;
use Gutenform\Core\Google\OAuth;
use Gutenform\Core\Google\Sheets;
use Gutenform\Providers\GoogleSheets;

defined('ABSPATH') || exit;

/**
 * REST actions for Google OAuth, Sheets, and Drive.
 */
class Actions
{
	/**
	 * Field block names.
	 *
	 * @var array<int, string>
	 */
	private static $field_block_names = array(
		'gutenform/input',
		'gutenform/textarea',
		'gutenform/select',
		'gutenform/checkbox',
		'gutenform/radio',
		'gutenform/date-time',
		'gutenform/slider',
		'gutenform/file',
	);

	/**
	 * Save Google OAuth credentials.
	 *
	 * @param \WP_REST_Request $request Request.
	 * @return array|\WP_Error
	 */
	public function save_credentials(\WP_REST_Request $request)
	{
		$denied = $this->authorize_admin($request);
		if (is_wp_error($denied)) {
			return $denied;
		}

		$params = $request->get_json_params();
		$client_id = isset($params['client_id']) ? sanitize_text_field((string) $params['client_id']) : '';
		$client_secret = isset($params['client_secret']) ? sanitize_text_field((string) $params['client_secret']) : '';
		$api_key = isset($params['api_key']) ? sanitize_text_field((string) $params['api_key']) : '';

		if ('' === $client_id) {
			return new \WP_Error(
				'google_invalid_credentials',
				__('Google Client ID is required.', 'gutenform'),
				array('status' => 400)
			);
		}

		$existing = OAuth::get_credentials(true);
		if ('' === $client_secret && empty($existing['client_secret'])) {
			return new \WP_Error(
				'google_invalid_credentials',
				__('Google Client Secret is required.', 'gutenform'),
				array('status' => 400)
			);
		}

		OAuth::save_credentials($client_id, $client_secret, $api_key);

		return array(
			'success' => true,
			'message' => __('Google credentials saved successfully.', 'gutenform'),
			'data'    => OAuth::get_status(),
		);
	}

	/**
	 * Get Google connection status.
	 *
	 * @param \WP_REST_Request $request Request.
	 * @return array|\WP_Error
	 */
	public function get_status(\WP_REST_Request $request)
	{
		$denied = $this->authorize_admin($request, false);
		if (is_wp_error($denied)) {
			return $denied;
		}

		return array(
			'success' => true,
			'data'    => OAuth::get_status(),
		);
	}

	/**
	 * Get OAuth authorization URL.
	 *
	 * @param \WP_REST_Request $request Request.
	 * @return array|\WP_Error
	 */
	public function get_auth_url(\WP_REST_Request $request)
	{
		$denied = $this->authorize_admin($request, false);
		if (is_wp_error($denied)) {
			return $denied;
		}

		$result = OAuth::get_auth_url();
		if (is_wp_error($result)) {
			return $result;
		}

		return array(
			'success' => true,
			'data'    => $result,
		);
	}

	/**
	 * OAuth callback handler.
	 *
	 * @param \WP_REST_Request $request Request.
	 * @return void|\WP_Error
	 */
	public function oauth_callback(\WP_REST_Request $request)
	{
		// REST callback URLs may not restore the WP session from cookies after
		// the Google redirect. Authorization is validated via the OAuth state transient.
		$state   = sanitize_text_field((string) $request->get_param('state'));
		$user_id = $state ? get_transient(OAuth::STATE_TRANSIENT . $state) : false;

		if ($user_id && user_can((int) $user_id, 'manage_options')) {
			wp_set_current_user((int) $user_id);
		} elseif (! is_user_logged_in() || ! current_user_can('manage_options')) {
			$this->render_oauth_popup_result(
				false,
				__('You do not have permission to connect Google.', 'gutenform')
			);
		}

		if ($request->get_param('error')) {
			$error = sanitize_text_field((string) $request->get_param('error'));
			$this->render_oauth_popup_result(
				false,
				sprintf(
					/* translators: %s: Google OAuth error code */
					__('Google authorization failed: %s', 'gutenform'),
					$error
				)
			);
		}

		$code  = sanitize_text_field((string) $request->get_param('code'));
		$state = sanitize_text_field((string) $request->get_param('state'));

		$result = OAuth::handle_callback($code, $state);

		if (is_wp_error($result)) {
			$this->render_oauth_popup_result(false, $result->get_error_message());
		}

		$this->render_oauth_popup_result(
			true,
			'',
			isset($result['email']) ? (string) $result['email'] : ''
		);
	}

	/**
	 * Render a minimal HTML page that notifies the opener window and closes the popup.
	 *
	 * @param bool   $success Whether OAuth succeeded.
	 * @param string $message Error message when unsuccessful.
	 * @param string $email   Connected Google account email.
	 * @return void
	 */
	private function render_oauth_popup_result(bool $success, string $message = '', string $email = ''): void
	{
		$payload = wp_json_encode(
			array(
				'type'    => 'gutenform_google_oauth',
				'success' => $success,
				'message' => $message,
				'email'   => $email,
			)
		);

		$title   = $success
			? __('Google account connected', 'gutenform')
			: __('Google connection failed', 'gutenform');
		$body    = $success
			? __('You can close this window and return to Gutenform.', 'gutenform')
			: ( $message ? $message : __('An unknown error occurred.', 'gutenform') );

		status_header(200);
		nocache_headers();
		header('Content-Type: text/html; charset=utf-8');

		echo '<!DOCTYPE html><html><head><meta charset="utf-8"><title>' . esc_html($title) . '</title>';
		echo '<style>body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;background:#f9fafb;color:#111827;}';
		echo '.box{max-width:420px;padding:24px;background:#fff;border:1px solid #e5e7eb;border-radius:12px;text-align:center;}';
		echo 'h1{font-size:18px;margin:0 0 8px;}p{margin:0;color:#6b7280;font-size:14px;line-height:1.5;}</style></head><body>';
		echo '<div class="box"><h1>' . esc_html($title) . '</h1><p>' . esc_html($body) . '</p></div>';
		echo '<script>(function(){var payload=' . $payload . ';';
		echo 'if(window.opener&&!window.opener.closed){window.opener.postMessage(payload,window.location.origin);}';
		echo 'setTimeout(function(){window.close();},800);})();</script>';
		echo '</body></html>';
		exit;
	}

	/**
	 * Get Google Picker configuration (access token + API key).
	 *
	 * @param \WP_REST_Request $request Request.
	 * @return array|\WP_Error
	 */
	public function get_picker_config(\WP_REST_Request $request)
	{
		$denied = $this->authorize_admin($request, false);
		if (is_wp_error($denied)) {
			return $denied;
		}

		$credentials = OAuth::get_credentials(true);
		if (empty($credentials['api_key'])) {
			return new \WP_Error(
				'google_api_key_missing',
				__('Google API key is not configured. Add it in Settings → Providers → Google Sheets.', 'gutenform'),
				array('status' => 400)
			);
		}

		$access_token = OAuth::get_access_token();
		if (is_wp_error($access_token)) {
			return $access_token;
		}

		return array(
			'success' => true,
			'data'    => array(
				'access_token' => $access_token,
				'api_key'      => $credentials['api_key'],
				'client_id'    => $credentials['client_id'],
			),
		);
	}

	/**
	 * Disconnect Google account.
	 *
	 * @param \WP_REST_Request $request Request.
	 * @return array|\WP_Error
	 */
	public function disconnect(\WP_REST_Request $request)
	{
		$denied = $this->authorize_admin($request);
		if (is_wp_error($denied)) {
			return $denied;
		}

		OAuth::disconnect();

		return array(
			'success' => true,
			'message' => __('Google account disconnected.', 'gutenform'),
			'data'    => OAuth::get_status(),
		);
	}

	/**
	 * List spreadsheets.
	 *
	 * @param \WP_REST_Request $request Request.
	 * @return array|\WP_Error
	 */
	public function list_spreadsheets(\WP_REST_Request $request)
	{
		$denied = $this->authorize_admin($request, false);
		if (is_wp_error($denied)) {
			return $denied;
		}

		try {
			$search = sanitize_text_field((string) $request->get_param('search'));
			return array(
				'success' => true,
				'data'    => Sheets::list_spreadsheets($search),
			);
		} catch (GoogleApiException $e) {
			return $e->to_wp_error();
		}
	}

	/**
	 * Create spreadsheet.
	 *
	 * @param \WP_REST_Request $request Request.
	 * @return array|\WP_Error
	 */
	public function create_spreadsheet(\WP_REST_Request $request)
	{
		$denied = $this->authorize_admin($request);
		if (is_wp_error($denied)) {
			return $denied;
		}

		$params = $request->get_json_params();
		$title  = isset($params['title']) ? sanitize_text_field((string) $params['title']) : '';

		if ('' === $title) {
			return new \WP_Error(
				'google_invalid_spreadsheet',
				__('Spreadsheet title is required.', 'gutenform'),
				array('status' => 400)
			);
		}

		try {
			return array(
				'success' => true,
				'data'    => Sheets::create_spreadsheet($title),
			);
		} catch (GoogleApiException $e) {
			return $e->to_wp_error();
		}
	}

	/**
	 * List sheet tabs.
	 *
	 * @param \WP_REST_Request $request Request.
	 * @return array|\WP_Error
	 */
	public function list_sheets(\WP_REST_Request $request)
	{
		$denied = $this->authorize_admin($request, false);
		if (is_wp_error($denied)) {
			return $denied;
		}

		$spreadsheet_id = sanitize_text_field((string) $request->get_param('spreadsheet_id'));
		if ('' === $spreadsheet_id) {
			return new \WP_Error(
				'google_invalid_spreadsheet',
				__('Spreadsheet ID is required.', 'gutenform'),
				array('status' => 400)
			);
		}

		try {
			$sheets  = Sheets::list_sheets($spreadsheet_id);
			$headers = array();

			if (! empty($sheets[0]['name'])) {
				$headers = Sheets::get_headers($spreadsheet_id, $sheets[0]['name']);
			}

			return array(
				'success' => true,
				'data'    => array(
					'sheets'  => $sheets,
					'headers' => $headers,
				),
			);
		} catch (GoogleApiException $e) {
			return $e->to_wp_error();
		}
	}

	/**
	 * Get headers for a specific sheet tab.
	 *
	 * @param \WP_REST_Request $request Request.
	 * @return array|\WP_Error
	 */
	public function get_sheet_headers(\WP_REST_Request $request)
	{
		$denied = $this->authorize_admin($request, false);
		if (is_wp_error($denied)) {
			return $denied;
		}

		$spreadsheet_id = sanitize_text_field((string) $request->get_param('spreadsheet_id'));
		$sheet_name     = sanitize_text_field((string) $request->get_param('sheet_name'));

		if ('' === $spreadsheet_id || '' === $sheet_name) {
			return new \WP_Error(
				'google_invalid_sheet',
				__('Spreadsheet ID and sheet name are required.', 'gutenform'),
				array('status' => 400)
			);
		}

		try {
			return array(
				'success' => true,
				'data'    => Sheets::get_headers($spreadsheet_id, $sheet_name),
			);
		} catch (GoogleApiException $e) {
			return $e->to_wp_error();
		}
	}

	/**
	 * Create a new sheet tab.
	 *
	 * @param \WP_REST_Request $request Request.
	 * @return array|\WP_Error
	 */
	public function create_sheet(\WP_REST_Request $request)
	{
		$denied = $this->authorize_admin($request);
		if (is_wp_error($denied)) {
			return $denied;
		}

		$params         = $request->get_json_params();
		$spreadsheet_id = isset($params['spreadsheet_id']) ? sanitize_text_field((string) $params['spreadsheet_id']) : '';
		$sheet_name     = isset($params['sheet_name']) ? sanitize_text_field((string) $params['sheet_name']) : '';
		$headers        = isset($params['headers']) && is_array($params['headers'])
			? array_map('sanitize_text_field', $params['headers'])
			: array();

		if ('' === $spreadsheet_id || '' === $sheet_name) {
			return new \WP_Error(
				'google_invalid_sheet',
				__('Spreadsheet ID and sheet name are required.', 'gutenform'),
				array('status' => 400)
			);
		}

		try {
			return array(
				'success' => true,
				'data'    => Sheets::create_sheet($spreadsheet_id, $sheet_name, $headers),
			);
		} catch (GoogleApiException $e) {
			return $e->to_wp_error();
		}
	}

	/**
	 * List Drive folders.
	 *
	 * @param \WP_REST_Request $request Request.
	 * @return array|\WP_Error
	 */
	public function list_drive_folders(\WP_REST_Request $request)
	{
		$denied = $this->authorize_admin($request, false);
		if (is_wp_error($denied)) {
			return $denied;
		}

		try {
			$parent_id = sanitize_text_field((string) $request->get_param('parent_id'));
			$search    = sanitize_text_field((string) $request->get_param('search'));

			if ('' === $parent_id) {
				$parent_id = 'root';
			}

			return array(
				'success' => true,
				'data'    => Drive::list_folders($parent_id, $search),
			);
		} catch (GoogleApiException $e) {
			return $e->to_wp_error();
		}
	}

	/**
	 * Get form fields for column mapping.
	 *
	 * @param \WP_REST_Request $request Request.
	 * @return array|\WP_Error
	 */
	public function get_form_fields(\WP_REST_Request $request)
	{
		$denied = $this->authorize_admin($request, false);
		if (is_wp_error($denied)) {
			return $denied;
		}

		$form_identifier = sanitize_text_field((string) $request->get_param('form_identifier'));
		$fields          = $this->resolve_form_fields($form_identifier);

		$meta_fields = array(
			array('name' => '_submission_date', 'label' => __('Submission Date', 'gutenform'), 'type' => 'meta'),
			array('name' => '_form_identifier', 'label' => __('Form Identifier', 'gutenform'), 'type' => 'meta'),
			array('name' => '_ip_address', 'label' => __('IP Address', 'gutenform'), 'type' => 'meta'),
			array('name' => '_site_name', 'label' => __('Site Name', 'gutenform'), 'type' => 'meta'),
		);

		return array(
			'success' => true,
			'data'    => array(
				'fields'      => $fields,
				'meta_fields' => $meta_fields,
			),
		);
	}

	/**
	 * Send a test row to Google Sheets.
	 *
	 * @param \WP_REST_Request $request Request.
	 * @return array|\WP_Error
	 */
	public function test_submission(\WP_REST_Request $request)
	{
		$denied = $this->authorize_admin($request);
		if (is_wp_error($denied)) {
			return $denied;
		}

		$params   = $request->get_json_params();
		$settings = isset($params['settings']) && is_array($params['settings']) ? $params['settings'] : array();

		$spreadsheet_id = isset($settings['spreadsheet_id']) ? sanitize_text_field((string) $settings['spreadsheet_id']) : '';
		$sheet_name     = isset($settings['sheet_name']) ? sanitize_text_field((string) $settings['sheet_name']) : '';
		$mapping        = isset($settings['column_mapping']) && is_array($settings['column_mapping'])
			? $settings['column_mapping']
			: array();

		if ('' === $spreadsheet_id || '' === $sheet_name) {
			return new \WP_Error(
				'google_test_invalid',
				__('Please select a spreadsheet and sheet tab before testing.', 'gutenform'),
				array('status' => 400)
			);
		}

		if (empty($mapping)) {
			return new \WP_Error(
				'google_test_invalid',
				__('Please configure at least one column mapping before testing.', 'gutenform'),
				array('status' => 400)
			);
		}

		$form_identifier = isset($settings['form_identifier'])
			? sanitize_text_field((string) $settings['form_identifier'])
			: 'test-form';

		try {
			$row = GoogleSheets::build_row(array(), $settings, $form_identifier, true);
			Sheets::append_row($spreadsheet_id, $sheet_name, $row);

			return array(
				'success' => true,
				'message' => __('Test row was successfully written to Google Sheets.', 'gutenform'),
				'data'    => array(
					'row' => $row,
				),
			);
		} catch (GoogleApiException $e) {
			return $e->to_wp_error('google_test_failed');
		}
	}

	/**
	 * Authorize admin user with optional nonce check.
	 *
	 * @param \WP_REST_Request $request      Request.
	 * @param bool             $verify_nonce Verify REST nonce.
	 * @return true|\WP_Error
	 */
	private function authorize_admin(\WP_REST_Request $request, bool $verify_nonce = true)
	{
		if ($verify_nonce) {
			$nonce = $request->get_header('X-WP-Nonce');
			if (! $nonce || ! wp_verify_nonce($nonce, 'wp_rest')) {
				return new \WP_Error(
					'rest_forbidden',
					__('Security check failed.', 'gutenform'),
					array('status' => 403)
				);
			}
		}

		if (! current_user_can('manage_options')) {
			return new \WP_Error(
				'rest_forbidden',
				__('You do not have permission to manage Google integration.', 'gutenform'),
				array('status' => 403)
			);
		}

		return true;
	}

	/**
	 * Resolve form fields by form identifier from post content.
	 *
	 * @param string $form_identifier Form identifier.
	 * @return array<int, array{name: string, label: string, type: string}>
	 */
	private function resolve_form_fields(string $form_identifier): array
	{
		if ('' === $form_identifier) {
			return array();
		}

		$post_types = get_post_types(array('public' => true), 'names');
		$post_types['page'] = 'page';
		if (post_type_exists('wp_block')) {
			$post_types['wp_block'] = 'wp_block';
		}

		$posts = get_posts(
			array(
				'post_type'      => array_values($post_types),
				'post_status'    => array('publish', 'draft', 'private', 'pending'),
				'posts_per_page' => -1,
				'no_found_rows'  => true,
			)
		);

		foreach ($posts as $post) {
			if (strpos($post->post_content, 'gutenform/form') === false) {
				continue;
			}

			$blocks = parse_blocks($post->post_content);
			$form   = $this->find_form_by_identifier($blocks, $form_identifier);
			if ($form) {
				return $this->collect_field_blocks(isset($form['innerBlocks']) ? $form['innerBlocks'] : array());
			}
		}

		return array();
	}

	/**
	 * Find a form block by identifier.
	 *
	 * @param array  $blocks          Parsed blocks.
	 * @param string $form_identifier Form identifier.
	 * @return array<string, mixed>|null
	 */
	private function find_form_by_identifier(array $blocks, string $form_identifier): ?array
	{
		foreach ($blocks as $block) {
			$name = isset($block['blockName']) ? $block['blockName'] : '';
			if ('gutenform/form' === $name) {
				$attrs  = isset($block['attrs']) ? $block['attrs'] : array();
				$form_id = isset($attrs['formId']) ? (string) $attrs['formId'] : '';
				if ($form_id === $form_identifier) {
					return $block;
				}
			}
			if (! empty($block['innerBlocks'])) {
				$found = $this->find_form_by_identifier($block['innerBlocks'], $form_identifier);
				if ($found) {
					return $found;
				}
			}
		}

		return null;
	}

	/**
	 * Collect field blocks recursively.
	 *
	 * @param array $blocks Parsed blocks.
	 * @return array<int, array{name: string, label: string, type: string}>
	 */
	private function collect_field_blocks(array $blocks): array
	{
		$fields = array();

		foreach ($blocks as $block) {
			$name = isset($block['blockName']) ? $block['blockName'] : '';
			if (in_array($name, self::$field_block_names, true)) {
				$attrs = isset($block['attrs']) ? $block['attrs'] : array();
				$field_name = isset($attrs['name']) ? (string) $attrs['name'] : '';
				if ('' !== $field_name) {
					$fields[] = array(
						'name'  => $field_name,
						'label' => isset($attrs['label']) && $attrs['label'] ? (string) $attrs['label'] : $field_name,
						'type'  => str_replace('gutenform/', '', $name),
					);
				}
			}
			if (! empty($block['innerBlocks'])) {
				$fields = array_merge($fields, $this->collect_field_blocks($block['innerBlocks']));
			}
		}

		return $fields;
	}
}
