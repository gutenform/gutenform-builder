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
				__( 'Invalid nonce.', 'gutenform-builder' ),
				array( 'status' => 403 )
			);
		}

		// 2. Extract data
		$submission_data     = $request->get_param( 'submission_data' ) ?? array();
		$form_identifier     = sanitize_text_field( $request->get_param( 'form_identifier' ) ?? '' );
		$provider_ids        = $request->get_param( 'provider_ids' ) ?? array();
		$provider_overrides  = $request->get_param( 'provider_overrides' ) ?? array();

		// 3. Validation
		if ( empty( $form_identifier ) ) {
			return new \WP_Error(
				'missing_form_identifier',
				__( 'Form identifier is missing.', 'gutenform-builder' ),
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

		// Sanitize provider_overrides: key = feed id (int), value = { use_provider_layout, content, conditional_show? }
		if ( ! is_array( $provider_overrides ) ) {
			$provider_overrides = array();
		}
		$sanitized_overrides = array();
		foreach ( $provider_overrides as $feed_id => $override ) {
			$feed_id = absint( $feed_id );
			if ( $feed_id <= 0 ) {
				continue;
			}
			if ( ! is_array( $override ) ) {
				continue;
			}
			$sanitized_overrides[ $feed_id ] = array(
				'use_provider_layout' => isset( $override['use_provider_layout'] ) ? (bool) $override['use_provider_layout'] : true,
				'content'            => isset( $override['content'] ) ? wp_kses_post( $override['content'] ) : '',
				'conditional_show'   => isset( $override['conditional_show'] ) ? $override['conditional_show'] : null,
			);
			// Keep conditional_show as array for evaluator (logic + conditions)
			if ( $sanitized_overrides[ $feed_id ]['conditional_show'] !== null && ! is_array( $sanitized_overrides[ $feed_id ]['conditional_show'] ) ) {
				$sanitized_overrides[ $feed_id ]['conditional_show'] = null;
			}
		}

		// 4. Call Submission Handler
		$handler = new Handler();
		$result  = $handler->process( $submission_data, $form_identifier, $provider_ids, $sanitized_overrides );

		// 5. Return response
		if ( $result['success'] ) {
			return array(
				'success' => true,
				'message' => __( 'Form submitted successfully.', 'gutenform-builder' ),
				'data'    => $result,
			);
		} else {
			return new \WP_Error(
				'submission_failed',
				__( 'Form submission failed.', 'gutenform-builder' ),
				array(
					'status'  => 500,
					'errors'  => $result['errors'],
					'results' => $result['results'],
				)
			);
		}
	}
}

