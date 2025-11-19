<?php

/**
 * Database migration for providers table.
 *
 * @package Gutenform
 * @subpackage Database\Migrations
 * @since 1.0.0
 */

namespace Gutenform\Database\Migrations;

use Gutenform\Interfaces\Migration;
use Prappo\WpEloquent\Database\Capsule\Manager as Capsule;

/**
 * Class Providers
 *
 * Represents the migration for creating the 'wp_gutenform_providers' table.
 *
 * @package Gutenform\Database\Migrations
 */
class Providers implements Migration
{

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
	public static function up()
	{
		global $wpdb;
		$table_name = $wpdb->prefix . self::$table;

		if (Capsule::schema()->hasTable($table_name)) {
			return;
		}

		$sql = "CREATE TABLE IF NOT EXISTS `" . $table_name . "` (
			`id` BIGINT(20) UNSIGNED NOT NULL AUTO_INCREMENT,
			`name` VARCHAR(255) NOT NULL,
			`provider_type` VARCHAR(50) NOT NULL COMMENT 'Interner Slug des Providers (z.B. db, email).',
			`form_identifier` VARCHAR(100) DEFAULT NULL COMMENT 'Formular-Identifier. NULL = Globaler Provider',
			`settings` LONGTEXT NOT NULL COMMENT 'Verschlüsselte Konfigurationsdaten (JSON).',
			`is_active` TINYINT(1) DEFAULT 1,
			`date_created` DATETIME NOT NULL,
			PRIMARY KEY (`id`),
			KEY `idx_provider_type` (`provider_type`),
			KEY `idx_form_identifier` (`form_identifier`)
		) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;";

		Capsule::connection()->getPdo()->exec($sql);
	}

	/**
	 * Reverse the migrations.
	 *
	 * @return void
	 */
	public static function down()
	{
		global $wpdb;
		$table_name = $wpdb->prefix . self::$table;

		$wpdb->query("DROP TABLE IF EXISTS " . $table_name);
	}
}
