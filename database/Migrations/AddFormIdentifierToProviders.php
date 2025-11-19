<?php
/**
 * Database migration for adding form_identifier column to providers table.
 *
 * @package Gutenform
 * @subpackage Database\Migrations
 * @since 1.0.0
 */

namespace Gutenform\Database\Migrations;

use Gutenform\Interfaces\Migration;
use Prappo\WpEloquent\Database\Capsule\Manager as Capsule;

/**
 * Class AddFormIdentifierToProviders
 *
 * Adds form_identifier column and removes UNIQUE constraint on provider_type.
 *
 * @package Gutenform\Database\Migrations
 */
class AddFormIdentifierToProviders implements Migration {

	/**
	 * Table name for the migration.
	 *
	 * @var string
	 */
	public static $table = 'gutenform_providers';

	/**
	 * Run the migrations.
	 *
	 * @return void
	 */
	public static function up() {
		global $wpdb;
		$table_name = $wpdb->prefix . self::$table;

		// Check if table exists
		if ( ! Capsule::schema()->hasTable( $table_name ) ) {
			return;
		}

		// Check if column already exists
		$column_exists = Capsule::schema()->hasColumn( $table_name, 'form_identifier' );
		if ( $column_exists ) {
			return;
		}

		// 1. Remove UNIQUE KEY on provider_type (if it exists)
		// Check if the unique key exists before trying to drop it
		$index_exists = $wpdb->get_results(
			$wpdb->prepare(
				"SHOW INDEX FROM `%s` WHERE Key_name = 'uk_provider_type'",
				$table_name
			)
		);

		if ( ! empty( $index_exists ) ) {
			$wpdb->query( "ALTER TABLE `{$table_name}` DROP INDEX `uk_provider_type`" );
		}

		// 2. Add form_identifier column
		$wpdb->query(
			"ALTER TABLE `{$table_name}` 
			ADD COLUMN `form_identifier` VARCHAR(100) DEFAULT NULL 
			COMMENT 'Formular-Identifier. NULL = Globaler Provider' 
			AFTER `provider_type`"
		);

		// 3. Add index on form_identifier
		$wpdb->query(
			"ALTER TABLE `{$table_name}` 
			ADD KEY `idx_form_identifier` (`form_identifier`)"
		);
	}

	/**
	 * Reverse the migrations.
	 *
	 * @return void
	 */
	public static function down() {
		global $wpdb;
		$table_name = $wpdb->prefix . self::$table;

		// Check if table exists
		if ( ! Capsule::schema()->hasTable( $table_name ) ) {
			return;
		}

		// 1. Remove index on form_identifier
		$wpdb->query( "ALTER TABLE `{$table_name}` DROP INDEX `idx_form_identifier`" );

		// 2. Remove form_identifier column
		$wpdb->query( "ALTER TABLE `{$table_name}` DROP COLUMN `form_identifier`" );

		// 3. Re-add UNIQUE KEY on provider_type
		$wpdb->query(
			"ALTER TABLE `{$table_name}` 
			ADD UNIQUE KEY `uk_provider_type` (`provider_type`)"
		);
	}
}

