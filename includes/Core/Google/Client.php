<?php

/**
 * Google API HTTP Client
 *
 * @package Gutenform\Core\Google
 * @since 1.0.0
 */

namespace Gutenform\Core\Google;

defined('ABSPATH') || exit;

/**
 * Thin wrapper around wp_remote_* for Google APIs.
 */
class Client
{
	/**
	 * Perform a Google API request.
	 *
	 * @param string               $method  HTTP method.
	 * @param string               $url     Request URL.
	 * @param array<string, mixed> $args    wp_remote_* args.
	 * @param bool                 $retry   Whether to retry once after token refresh on 401.
	 * @return array<string, mixed>
	 *
	 * @throws GoogleApiException When the request fails.
	 */
	public static function request(string $method, string $url, array $args = array(), bool $retry = true): array
	{
		$access_token = OAuth::get_access_token();
		if (is_wp_error($access_token)) {
			throw new GoogleApiException($access_token->get_error_message(), 401);
		}

		$headers = isset($args['headers']) && is_array($args['headers']) ? $args['headers'] : array();
		$headers['Authorization'] = 'Bearer ' . $access_token;

		$request_args = array_merge(
			array(
				'timeout' => 30,
				'method'  => strtoupper($method),
			),
			$args,
			array('headers' => $headers)
		);

		$response = wp_remote_request($url, $request_args);

		if (is_wp_error($response)) {
			throw new GoogleApiException(
				sprintf(
					/* translators: %s: error message */
					__('Google API request failed: %s', 'gutenform'),
					$response->get_error_message()
				),
				500
			);
		}

		$status = (int) wp_remote_retrieve_response_code($response);
		$body   = wp_remote_retrieve_body($response);
		$data   = json_decode($body, true);
		$data   = is_array($data) ? $data : array();

		if (401 === $status && $retry) {
			$refreshed = OAuth::refresh_access_token();
			if (! is_wp_error($refreshed)) {
				return self::request($method, $url, $args, false);
			}
		}

		if ($status >= 400) {
			throw self::build_exception($status, $data);
		}

		return $data;
	}

	/**
	 * GET request helper.
	 *
	 * @param string $url Request URL.
	 * @return array<string, mixed>
	 *
	 * @throws GoogleApiException When the request fails.
	 */
	public static function get(string $url): array
	{
		return self::request('GET', $url);
	}

	/**
	 * POST request helper.
	 *
	 * @param string               $url  Request URL.
	 * @param array<string, mixed> $body Request body.
	 * @return array<string, mixed>
	 *
	 * @throws GoogleApiException When the request fails.
	 */
	public static function post(string $url, array $body = array()): array
	{
		return self::request(
			'POST',
			$url,
			array(
				'headers' => array('Content-Type' => 'application/json'),
				'body'    => wp_json_encode($body),
			)
		);
	}

	/**
	 * PUT request helper.
	 *
	 * @param string               $url  Request URL.
	 * @param array<string, mixed> $body Request body.
	 * @return array<string, mixed>
	 *
	 * @throws GoogleApiException When the request fails.
	 */
	public static function put(string $url, array $body = array()): array
	{
		return self::request(
			'PUT',
			$url,
			array(
				'headers' => array('Content-Type' => 'application/json'),
				'body'    => wp_json_encode($body),
			)
		);
	}

	/**
	 * Build a user-friendly exception from Google error payload.
	 *
	 * @param int                  $status HTTP status.
	 * @param array<string, mixed> $data   Response data.
	 * @return GoogleApiException
	 */
	private static function build_exception(int $status, array $data): GoogleApiException
	{
		$message = '';

		if (isset($data['error']['message'])) {
			$message = (string) $data['error']['message'];
		} elseif (isset($data['error_description'])) {
			$message = (string) $data['error_description'];
		} elseif (isset($data['error']) && is_string($data['error'])) {
			$message = $data['error'];
		}

		if ('' === $message) {
			$message = __('An unknown Google API error occurred.', 'gutenform');
		}

		if (403 === $status) {
			$message = sprintf(
				/* translators: %s: original error message */
				__('Permission denied. Please ensure your Google account has access to the selected spreadsheet or folder. Details: %s', 'gutenform'),
				$message
			);
		} elseif (404 === $status) {
			$message = sprintf(
				/* translators: %s: original error message */
				__('The selected Google spreadsheet or sheet was not found. It may have been deleted. Details: %s', 'gutenform'),
				$message
			);
		} elseif (429 === $status) {
			$message = __('Google API rate limit exceeded. Please wait a moment and try again.', 'gutenform');
		}

		return new GoogleApiException($message, $status, $data);
	}
}
