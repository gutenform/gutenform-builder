<?php

/**
 * Google API Exception
 *
 * @package Gutenform\Core\Google
 * @since 1.0.0
 */

namespace Gutenform\Core\Google;

defined('ABSPATH') || exit;

/**
 * Exception for Google API errors with structured error data.
 */
class GoogleApiException extends \Exception
{
	/**
	 * HTTP status code from Google API.
	 *
	 * @var int
	 */
	private int $status_code;

	/**
	 * Raw error payload from Google API.
	 *
	 * @var array<string, mixed>
	 */
	private array $error_data;

	/**
	 * Constructor.
	 *
	 * @param string               $message     Human-readable message.
	 * @param int                  $status_code HTTP status code.
	 * @param array<string, mixed> $error_data  Raw error payload.
	 */
	public function __construct(string $message, int $status_code = 500, array $error_data = array())
	{
		parent::__construct($message, $status_code);
		$this->status_code = $status_code;
		$this->error_data    = $error_data;
	}

	/**
	 * Get HTTP status code.
	 *
	 * @return int
	 */
	public function get_status_code(): int
	{
		return $this->status_code;
	}

	/**
	 * Get raw error data.
	 *
	 * @return array<string, mixed>
	 */
	public function get_error_data(): array
	{
		return $this->error_data;
	}

	/**
	 * Convert to WP_Error.
	 *
	 * @param string $code Error code.
	 * @return \WP_Error
	 */
	public function to_wp_error(string $code = 'google_api_error'): \WP_Error
	{
		return new \WP_Error(
			$code,
			$this->getMessage(),
			array(
				'status'     => $this->status_code >= 400 && $this->status_code < 600 ? $this->status_code : 500,
				'error_data' => $this->error_data,
			)
		);
	}
}
