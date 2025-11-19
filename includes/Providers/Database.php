<?php
/**
 * Database Provider
 *
 * Stores form submissions in the database using the Entries model.
 *
 * @package Gutenform\Providers
 * @since 1.0.0
 */

namespace Gutenform\Providers;

use Gutenform\Models\Entries;

defined( 'ABSPATH' ) || exit;

/**
 * Database Provider Class
 *
 * Handles database storage for form submissions.
 */
class Database extends AbstractProvider {

	/**
	 * Gibt den eindeutigen Slug des Providers zurück.
	 *
	 * @return string
	 */
	public function get_slug(): string {
		return 'database';
	}

	/**
	 * Gibt den Anzeigenamen des Providers zurück.
	 *
	 * @return string
	 */
	public function get_title(): string {
		return __( 'Datenbank-Speicherung', 'gutenform' );
	}

	/**
	 * Verarbeitet eine Formular-Submission.
	 *
	 * @param array  $submission_data Die Formulardaten
	 * @param array  $provider_settings Die individuellen Einstellungen für diesen Provider
	 * @param string $form_identifier Der Formular-Identifier
	 * @return bool Erfolg der Verarbeitung
	 */
	public function process_submission(
		array $submission_data,
		array $provider_settings,
		string $form_identifier
	): bool {
		try {
			$entry = new Entries();
			$entry->mailbox_id     = absint( $provider_settings['mailbox_id'] ?? 1 );
			$entry->form_identifier = $form_identifier;
			$entry->wp_post_id     = isset( $provider_settings['wp_post_id'] ) ? absint( $provider_settings['wp_post_id'] ) : null;
			$entry->data            = $submission_data;
			$entry->ip_address     = $this->get_client_ip();
			$entry->is_read         = false;
			$entry->date_created    = current_time( 'mysql' );

			return $entry->save();
		} catch ( \Exception $e ) {
			error_log( 'GutenForm Database Provider Error: ' . $e->getMessage() );
			return false;
		}
	}

	/**
	 * Gibt die Feld-Definitionen für die Settings zurück.
	 *
	 * @return array Array von Feld-Definitionen
	 */
	public function get_settings_fields(): array {
		return array(
			array(
				'name'        => 'mailbox_id',
				'label'       => __( 'Mailbox ID', 'gutenform' ),
				'type'        => 'number',
				'required'    => true,
				'default'     => 1,
				'description' => __( 'ID der Mailbox, in der der Eintrag gespeichert wird.', 'gutenform' ),
				'min'         => 1,
			),
		);
	}
}

