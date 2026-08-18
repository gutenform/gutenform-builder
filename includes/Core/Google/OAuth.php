<?php

/**
 * Google OAuth Handler
 *
 * @package Gutenform\Core\Google
 * @since 1.0.0
 */

namespace Gutenform\Core\Google;

defined('ABSPATH') || exit;

/**
 * Handles Google OAuth 2.0 for BYO credentials.
 */
class OAuth
{
	public const OPTION_CREDENTIALS = 'gutenform_google_credentials';
	public const OPTION_TOKENS      = 'gutenform_google_oauth';
	public const AUTH_URL           = 'https://accounts.google.com/o/oauth2/v2/auth';
	public const TOKEN_URL          = 'https://oauth2.googleapis.com/token';
	public const USERINFO_URL       = 'https://www.googleapis.com/oauth2/v2/userinfo';
	public const STATE_TRANSIENT    = 'gutenform_google_oauth_state_';

	/**
	 * Required OAuth scopes.
	 *
	 * @return array<int, string>
	 */
	public static function get_scopes(): array
	{
		return array(
			'https://www.googleapis.com/auth/spreadsheets',
			'https://www.googleapis.com/auth/drive',
			'https://www.googleapis.com/auth/userinfo.email',
		);
	}

	/**
	 * Save OAuth client credentials.
	 *
	 * @param string $client_id     Google client ID.
	 * @param string $client_secret Google client secret.
	 * @param string $api_key       Google API key for Picker (browser).
	 * @return bool
	 */
	public static function save_credentials(string $client_id, string $client_secret, string $api_key = ''): bool
	{
		$existing = self::get_credentials(false);
		$secret   = $client_secret;

		if ('' === $secret && ! empty($existing['client_secret'])) {
			$secret = $existing['client_secret'];
		}

		$key = $api_key;
		if ('' === $key && ! empty($existing['api_key'])) {
			$key = $existing['api_key'];
		}

		$data = array(
			'client_id'     => sanitize_text_field($client_id),
			'client_secret' => $secret,
			'api_key'       => sanitize_text_field($key),
		);

		return update_option(self::OPTION_CREDENTIALS, self::encrypt(wp_json_encode($data)), false);
	}

	/**
	 * Get stored credentials.
	 *
	 * @param bool $include_secret Whether to include client secret.
	 * @return array{client_id: string, client_secret: string, api_key: string, has_secret: bool, has_api_key: bool}
	 */
	public static function get_credentials(bool $include_secret = true): array
	{
		$stored = get_option(self::OPTION_CREDENTIALS, '');
		$data   = array(
			'client_id'     => '',
			'client_secret' => '',
			'api_key'       => '',
			'has_secret'    => false,
			'has_api_key'   => false,
		);

		if (empty($stored)) {
			return $data;
		}

		$decoded = json_decode(self::decrypt((string) $stored), true);
		if (! is_array($decoded)) {
			return $data;
		}

		$data['client_id']   = isset($decoded['client_id']) ? (string) $decoded['client_id'] : '';
		$data['has_secret']  = ! empty($decoded['client_secret']);
		$data['has_api_key'] = ! empty($decoded['api_key']);

		if ($include_secret) {
			$data['client_secret'] = isset($decoded['client_secret']) ? (string) $decoded['client_secret'] : '';
			$data['api_key']       = isset($decoded['api_key']) ? (string) $decoded['api_key'] : '';
		}

		return $data;
	}

	/**
	 * Get OAuth redirect URI.
	 *
	 * @return string
	 */
	public static function get_redirect_uri(): string
	{
		return rest_url(GF_ROUTE_PREFIX . '/google/callback');
	}

	/**
	 * Build authorization URL.
	 *
	 * @return array{url: string, state: string}|\WP_Error
	 */
	public static function get_auth_url()
	{
		$credentials = self::get_credentials(true);

		if (empty($credentials['client_id']) || empty($credentials['client_secret'])) {
			return new \WP_Error(
				'google_credentials_missing',
				__('Google OAuth credentials are not configured. Please enter your Client ID and Client Secret first.', 'gutenform'),
				array('status' => 400)
			);
		}

		$state = wp_generate_password(32, false, false);
		set_transient(self::STATE_TRANSIENT . $state, get_current_user_id(), 15 * MINUTE_IN_SECONDS);

		$params = array(
			'client_id'     => $credentials['client_id'],
			'redirect_uri'  => self::get_redirect_uri(),
			'response_type' => 'code',
			'scope'         => implode(' ', self::get_scopes()),
			'access_type'   => 'offline',
			'prompt'        => 'consent',
			'state'         => $state,
		);

		return array(
			'url'   => add_query_arg($params, self::AUTH_URL),
			'state' => $state,
		);
	}

	/**
	 * Handle OAuth callback and store tokens.
	 *
	 * @param string $code  Authorization code.
	 * @param string $state State parameter.
	 * @return array<string, mixed>|\WP_Error
	 */
	public static function handle_callback(string $code, string $state)
	{
		if ('' === $code) {
			return new \WP_Error(
				'google_oauth_denied',
				__('Google authorization was denied or no authorization code was returned.', 'gutenform'),
				array('status' => 400)
			);
		}

		$user_id = get_transient(self::STATE_TRANSIENT . $state);
		delete_transient(self::STATE_TRANSIENT . $state);

		if (! $user_id || ! user_can((int) $user_id, 'manage_options')) {
			return new \WP_Error(
				'google_oauth_invalid_state',
				__('Invalid OAuth state. Please try connecting again.', 'gutenform'),
				array('status' => 403)
			);
		}

		wp_set_current_user((int) $user_id);

		$credentials = self::get_credentials(true);
		if (empty($credentials['client_id']) || empty($credentials['client_secret'])) {
			return new \WP_Error(
				'google_credentials_missing',
				__('Google OAuth credentials are not configured.', 'gutenform'),
				array('status' => 400)
			);
		}

		$response = wp_remote_post(
			self::TOKEN_URL,
			array(
				'timeout' => 30,
				'headers' => array(
					'Content-Type' => 'application/x-www-form-urlencoded',
				),
				'body'    => array(
					'code'          => $code,
					'client_id'     => $credentials['client_id'],
					'client_secret' => $credentials['client_secret'],
					'redirect_uri'  => self::get_redirect_uri(),
					'grant_type'    => 'authorization_code',
				),
			)
		);

		if (is_wp_error($response)) {
			return new \WP_Error(
				'google_token_exchange_failed',
				sprintf(
					/* translators: %s: error message */
					__('Failed to exchange authorization code: %s', 'gutenform'),
					$response->get_error_message()
				),
				array('status' => 500)
			);
		}

		$status = wp_remote_retrieve_response_code($response);
		$body   = json_decode(wp_remote_retrieve_body($response), true);

		if ($status >= 400 || ! is_array($body) || empty($body['access_token'])) {
			$message = is_array($body) && isset($body['error_description'])
				? (string) $body['error_description']
				: __('Failed to obtain access token from Google.', 'gutenform');

			return new \WP_Error(
				'google_token_exchange_failed',
				$message,
				array('status' => $status >= 400 ? $status : 500)
			);
		}

		$tokens = array(
			'access_token'  => (string) $body['access_token'],
			'refresh_token' => isset($body['refresh_token']) ? (string) $body['refresh_token'] : '',
			'expires_at'    => time() + (int) ( $body['expires_in'] ?? 3600 ),
			'scope'         => isset($body['scope']) ? (string) $body['scope'] : '',
		);

		$userinfo = self::fetch_userinfo($tokens['access_token']);
		if (! is_wp_error($userinfo)) {
			$tokens['email'] = isset($userinfo['email']) ? (string) $userinfo['email'] : '';
			$tokens['name']  = isset($userinfo['name']) ? (string) $userinfo['name'] : '';
		}

		self::save_tokens($tokens);

		return array(
			'connected' => true,
			'email'     => $tokens['email'] ?? '',
			'name'      => $tokens['name'] ?? '',
		);
	}

	/**
	 * Get connection status.
	 *
	 * @return array<string, mixed>
	 */
	public static function get_status(): array
	{
		$credentials = self::get_credentials(false);
		$tokens      = self::get_tokens();

		return array(
			'has_credentials' => ! empty($credentials['client_id']) && $credentials['has_secret'],
			'has_api_key'     => $credentials['has_api_key'],
			'client_id'       => $credentials['client_id'],
			'connected'       => ! empty($tokens['access_token']) || ! empty($tokens['refresh_token']),
			'email'           => $tokens['email'] ?? '',
			'name'            => $tokens['name'] ?? '',
			'redirect_uri'    => self::get_redirect_uri(),
			'scopes'          => self::get_scopes(),
		);
	}

	/**
	 * Disconnect Google account (remove tokens only).
	 *
	 * @return bool
	 */
	public static function disconnect(): bool
	{
		return delete_option(self::OPTION_TOKENS);
	}

	/**
	 * Get a valid access token, refreshing if needed.
	 *
	 * @return string|\WP_Error
	 */
	public static function get_access_token()
	{
		$tokens = self::get_tokens();

		if (empty($tokens['access_token']) && empty($tokens['refresh_token'])) {
			return new \WP_Error(
				'google_not_connected',
				__('Google account is not connected. Please connect your Google account in provider settings.', 'gutenform'),
				array('status' => 401)
			);
		}

		$expires_at = isset($tokens['expires_at']) ? (int) $tokens['expires_at'] : 0;
		if (! empty($tokens['access_token']) && $expires_at > ( time() + 60 )) {
			return (string) $tokens['access_token'];
		}

		if (empty($tokens['refresh_token'])) {
			return new \WP_Error(
				'google_token_expired',
				__('Google access token has expired. Please reconnect your Google account.', 'gutenform'),
				array('status' => 401)
			);
		}

		return self::refresh_access_token($tokens);
	}

	/**
	 * Refresh access token.
	 *
	 * @param array<string, mixed>|null $tokens Existing tokens.
	 * @return string|\WP_Error
	 */
	public static function refresh_access_token(?array $tokens = null)
	{
		$tokens      = $tokens ?? self::get_tokens();
		$credentials = self::get_credentials(true);

		if (empty($credentials['client_id']) || empty($credentials['client_secret'])) {
			return new \WP_Error(
				'google_credentials_missing',
				__('Google OAuth credentials are not configured.', 'gutenform'),
				array('status' => 400)
			);
		}

		if (empty($tokens['refresh_token'])) {
			return new \WP_Error(
				'google_token_expired',
				__('Google refresh token is missing. Please reconnect your Google account.', 'gutenform'),
				array('status' => 401)
			);
		}

		$response = wp_remote_post(
			self::TOKEN_URL,
			array(
				'timeout' => 30,
				'headers' => array(
					'Content-Type' => 'application/x-www-form-urlencoded',
				),
				'body'    => array(
					'client_id'     => $credentials['client_id'],
					'client_secret' => $credentials['client_secret'],
					'refresh_token' => $tokens['refresh_token'],
					'grant_type'    => 'refresh_token',
				),
			)
		);

		if (is_wp_error($response)) {
			return new \WP_Error(
				'google_token_refresh_failed',
				sprintf(
					/* translators: %s: error message */
					__('Failed to refresh Google access token: %s', 'gutenform'),
					$response->get_error_message()
				),
				array('status' => 500)
			);
		}

		$status = wp_remote_retrieve_response_code($response);
		$body   = json_decode(wp_remote_retrieve_body($response), true);

		if ($status >= 400 || ! is_array($body) || empty($body['access_token'])) {
			$message = is_array($body) && isset($body['error_description'])
				? (string) $body['error_description']
				: __('Failed to refresh Google access token.', 'gutenform');

			return new \WP_Error(
				'google_token_refresh_failed',
				$message,
				array('status' => $status >= 400 ? $status : 401)
			);
		}

		$tokens['access_token'] = (string) $body['access_token'];
		$tokens['expires_at']   = time() + (int) ( $body['expires_in'] ?? 3600 );

		if (! empty($body['refresh_token'])) {
			$tokens['refresh_token'] = (string) $body['refresh_token'];
		}

		self::save_tokens($tokens);

		return (string) $tokens['access_token'];
	}

	/**
	 * Save encrypted tokens.
	 *
	 * @param array<string, mixed> $tokens Token data.
	 * @return bool
	 */
	private static function save_tokens(array $tokens): bool
	{
		return update_option(self::OPTION_TOKENS, self::encrypt(wp_json_encode($tokens)), false);
	}

	/**
	 * Get decrypted tokens.
	 *
	 * @return array<string, mixed>
	 */
	public static function get_tokens(): array
	{
		$stored = get_option(self::OPTION_TOKENS, '');
		if (empty($stored)) {
			return array();
		}

		$decoded = json_decode(self::decrypt((string) $stored), true);
		return is_array($decoded) ? $decoded : array();
	}

	/**
	 * Fetch user info from Google.
	 *
	 * @param string $access_token Access token.
	 * @return array<string, mixed>|\WP_Error
	 */
	private static function fetch_userinfo(string $access_token)
	{
		$response = wp_remote_get(
			self::USERINFO_URL,
			array(
				'timeout' => 20,
				'headers' => array(
					'Authorization' => 'Bearer ' . $access_token,
				),
			)
		);

		if (is_wp_error($response)) {
			return $response;
		}

		$body = json_decode(wp_remote_retrieve_body($response), true);
		return is_array($body) ? $body : array();
	}

	/**
	 * Encrypt sensitive data.
	 *
	 * @param string $data Plain text.
	 * @return string
	 */
	private static function encrypt(string $data): string
	{
		if (! function_exists('openssl_encrypt')) {
			return base64_encode($data);
		}

		$key = self::get_encryption_key();
		$iv  = random_bytes(16);
		$enc = openssl_encrypt($data, 'AES-256-CBC', $key, OPENSSL_RAW_DATA, $iv);

		if (false === $enc) {
			return base64_encode($data);
		}

		return base64_encode($iv . $enc);
	}

	/**
	 * Decrypt sensitive data.
	 *
	 * @param string $data Encrypted data.
	 * @return string
	 */
	private static function decrypt(string $data): string
	{
		$raw = base64_decode($data, true);
		if (false === $raw) {
			return '';
		}

		if (! function_exists('openssl_decrypt')) {
			return (string) base64_decode($data, true);
		}

		$key = self::get_encryption_key();
		$iv  = substr($raw, 0, 16);
		$enc = substr($raw, 16);

		$dec = openssl_decrypt($enc, 'AES-256-CBC', $key, OPENSSL_RAW_DATA, $iv);
		if (false === $dec) {
			return (string) base64_decode($data, true);
		}

		return $dec;
	}

	/**
	 * Derive encryption key from WordPress salts.
	 *
	 * @return string
	 */
	private static function get_encryption_key(): string
	{
		return hash('sha256', AUTH_KEY . SECURE_AUTH_KEY . 'gutenform_google_oauth', true);
	}
}
