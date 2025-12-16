<?php
/**
 * Submission Actions Controller
 *
 * REST API controller for form submission handling.
 *
 * @package Gutenform\Controllers\Submissions
 * @since 1.0.0
 */

namespace Gutenform\Controllers\Submissions;

defined( 'ABSPATH' ) || exit;

/**
 * Submission Actions Class
 *
 * Handles REST API requests for form submissions.
 */
class Actions {

	/**
	 * Verarbeitet eine Formular-Submission.
	 *
	 * @param \WP_REST_Request $request
	 * @return array|\WP_Error
	 */
	public function submit( \WP_REST_Request $request ) {
		// 1. Nonce verification
		$nonce = $request->get_header( 'X-WP-Nonce' );
		if ( ! wp_verify_nonce( $nonce, 'wp_rest' ) ) {
			return new \WP_Error(
				'invalid_nonce',
				__( 'Invalid nonce.', 'gutenform' ),
				array( 'status' => 403 )
			);
		}

		// 2. Extract data
		$submission_data = $request->get_param( 'submission_data' ) ?? array();
		$form_identifier = sanitize_text_field( $request->get_param( 'form_identifier' ) ?? '' );
		$provider_ids     = $request->get_param( 'provider_ids' ) ?? array();

		// 3. Validation
		if ( empty( $form_identifier ) ) {
			return new \WP_Error(
				'missing_form_identifier',
				__( 'Form identifier is missing.', 'gutenform' ),
				array( 'status' => 400 )
			);
		}

		// Validation: provider_ids must be an array
		if ( ! is_array( $provider_ids ) ) {
			$provider_ids = array();
		}

		// Sanitize provider_ids
		$provider_ids = array_map( 'absint', $provider_ids );
		$provider_ids = array_filter( $provider_ids ); // Remove 0 and negative values

		// 4. Call Submission Handler
		$handler = new Handler();
		$result  = $handler->process( $submission_data, $form_identifier, $provider_ids );

		// 5. Return response
		if ( $result['success'] ) {
			return array(
				'success' => true,
				'message' => __( 'Form submitted successfully.', 'gutenform' ),
				'data'    => $result,
			);
		} else {
			return new \WP_Error(
				'submission_failed',
				__( 'Form submission failed.', 'gutenform' ),
				array(
					'status'  => 500,
					'errors'  => $result['errors'],
					'results' => $result['results'],
				)
			);
		}
	}
}

