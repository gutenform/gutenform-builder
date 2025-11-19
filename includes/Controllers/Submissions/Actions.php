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
		// 1. Nonce-Prüfung
		$nonce = $request->get_header( 'X-WP-Nonce' );
		if ( ! wp_verify_nonce( $nonce, 'wp_rest' ) ) {
			return new \WP_Error(
				'invalid_nonce',
				__( 'Ungültiger Nonce.', 'gutenform' ),
				array( 'status' => 403 )
			);
		}

		// 2. Daten extrahieren
		$submission_data = $request->get_param( 'submission_data' ) ?? array();
		$form_identifier = sanitize_text_field( $request->get_param( 'form_identifier' ) ?? '' );
		$provider_ids     = $request->get_param( 'provider_ids' ) ?? array();

		// 3. Validierung
		if ( empty( $form_identifier ) ) {
			return new \WP_Error(
				'missing_form_identifier',
				__( 'Formular-Identifier fehlt.', 'gutenform' ),
				array( 'status' => 400 )
			);
		}

		// Validierung: provider_ids muss ein Array sein
		if ( ! is_array( $provider_ids ) ) {
			$provider_ids = array();
		}

		// Sanitize provider_ids
		$provider_ids = array_map( 'absint', $provider_ids );
		$provider_ids = array_filter( $provider_ids ); // Entferne 0 und negative Werte

		// 4. Submission Handler aufrufen
		$handler = new Handler();
		$result  = $handler->process( $submission_data, $form_identifier, $provider_ids );

		// 5. Antwort zurückgeben
		if ( $result['success'] ) {
			return array(
				'success' => true,
				'message' => __( 'Formular erfolgreich übermittelt.', 'gutenform' ),
				'data'    => $result,
			);
		} else {
			return new \WP_Error(
				'submission_failed',
				__( 'Fehler bei der Formular-Übermittlung.', 'gutenform' ),
				array(
					'status'  => 500,
					'errors'  => $result['errors'],
					'results' => $result['results'],
				)
			);
		}
	}
}

