<?php

/**
 * Database migration for mailboxes table.
 *
 * @package Gutenform
 * @subpackage Database\Migrations
 * @since 1.0.0
 */

namespace Gutenform\Database\Migrations;

use Gutenform\Interfaces\Migration;
use Prappo\WpEloquent\Database\Capsule\Manager as Capsule;

/**
 * Class Mailboxes
 *
 * Represents the migration for creating the 'wp_gutenform_mailboxes' table.
 *
 * @package Gutenform\Database\Migrations
 */
class Mailboxes implements Migration
{

	/**
	 * Table name for the migration.
	 *
	 * @var string
	 */
	public static $table = 'gutenform_mailboxes';

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
			`title` VARCHAR(255) NOT NULL,
			`is_default` TINYINT(1) DEFAULT 0 COMMENT 'Markiert das Standard-Postfach (1) für die Free-Version.',
			`date_created` DATETIME NOT NULL,
			`user_id` BIGINT(20) UNSIGNED DEFAULT NULL,
			PRIMARY KEY (`id`),
			KEY `idx_default` (`is_default`)
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
