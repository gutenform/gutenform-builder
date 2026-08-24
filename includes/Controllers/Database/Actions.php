<?php

namespace Gutenform\Controllers\Database;

use Gutenform\Database\Seeders\Demo;
use Gutenform\Database\Migrations\Mailboxes;
use Gutenform\Database\Migrations\Entries;
use Gutenform\Database\Migrations\EntryLabels;
use Gutenform\Database\Migrations\Providers;

/**
 * Class Actions
 *
 * Handles database-related actions such as seeding demo data and removing tables.
 *
 * @package Gutenform\Controllers\Database
 */
class Actions
{

	/**
	 * Seeds the database with demo data.
	 *
	 * @param \WP_REST_Request $request The REST request object.
	 * @return array The response message.
	 */
	public function seed_demo(\WP_REST_Request $request)
	{
		// Check if demo data already exists.
		if (Demo::has_data()) {
			return array(
				'success' => false,
				'message' => __('Demo data already exists in the database.', 'gutenform-builder'),
			);
		}

		try {
			Demo::run();
			return array(
				'success' => true,
				'message' => __('Demo data has been successfully seeded.', 'gutenform-builder'),
			);
		} catch (\Exception $e) {
			return array(
				'success' => false,
				'message' => __('Error seeding demo data: ', 'gutenform-builder') . $e->getMessage(),
			);
		}
	}

	/**
	 * Checks if demo data exists.
	 *
	 * @param \WP_REST_Request $request The REST request object.
	 * @return array The response with has_data flag.
	 */
	public function check_demo_data(\WP_REST_Request $request)
	{
		return array(
			'success'  => true,
			'has_data' => Demo::has_data(),
		);
	}

	/**
	 * Removes all database tables created by the plugin.
	 *
	 * @param \WP_REST_Request $request The REST request object.
	 * @return \WP_REST_Response|array The response message.
	 */
	public function remove(\WP_REST_Request $request)
	{
		// Check user capabilities
		if (! current_user_can('activate_plugins')) {
			if (defined('WP_DEBUG') && WP_DEBUG) {
				error_log('Gutenform: Database remove - Permission denied for user: ' . get_current_user_id());
			}
			return new \WP_REST_Response(
				array(
					'success' => false,
					'message' => __('You do not have permission to perform this action.', 'gutenform-builder'),
				),
				403
			);
		}

		if (defined('WP_DEBUG') && WP_DEBUG) {
			error_log('Gutenform: Starting database table removal...');
		}

		// delete all data from the database
		if (defined('WP_DEBUG') && WP_DEBUG) {
			error_log('Gutenform: Deleting all data from the database...');
		}

		global $wpdb;
		$wpdb->query("DELETE FROM " . $wpdb->prefix . Entries::$table);
		$wpdb->query("DELETE FROM " . $wpdb->prefix . EntryLabels::$labels_table);
		$wpdb->query("DELETE FROM " . $wpdb->prefix . EntryLabels::$rel_table);
		$wpdb->query("DELETE FROM " . $wpdb->prefix . Mailboxes::$table);
		$wpdb->query("DELETE FROM " . $wpdb->prefix . Providers::$table);

		try {
			// Remove all tables in reverse order of dependencies
			if (defined('WP_DEBUG') && WP_DEBUG) {
				error_log('Gutenform: Removing Entries table...');
			}
			Entries::down();

			if (defined('WP_DEBUG') && WP_DEBUG) {
				error_log('Gutenform: Removing EntryLabels table...');
			}
			EntryLabels::down();

			if (defined('WP_DEBUG') && WP_DEBUG) {
				error_log('Gutenform: Removing Mailboxes table...');
			}
			Mailboxes::down();

			if (defined('WP_DEBUG') && WP_DEBUG) {
				error_log('Gutenform: Removing Providers table...');
			}
			Providers::down();

			if (defined('WP_DEBUG') && WP_DEBUG) {
				error_log('Gutenform: All database tables removed successfully.');
			}

			return new \WP_REST_Response(
				array(
					'success' => true,
					'message' => __('All database tables have been successfully removed.', 'gutenform-builder'),
				),
				200
			);
		} catch (\Exception $e) {
			if (defined('WP_DEBUG') && WP_DEBUG) {
				error_log('Gutenform: Error removing database tables: ' . $e->getMessage());
				error_log('Gutenform: Stack trace: ' . $e->getTraceAsString());
			}
			return new \WP_REST_Response(
				array(
					'success' => false,
					'message' => __('Error removing database tables: ', 'gutenform-builder') . $e->getMessage(),
				),
				500
			);
		}
	}
}
