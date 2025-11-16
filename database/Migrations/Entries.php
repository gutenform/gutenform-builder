<?php

/**
 * Database migration for entries table.
 *
 * @package Gutenform
 * @subpackage Database\Migrations
 * @since 1.0.0
 */

namespace Gutenform\Database\Migrations;

use Gutenform\Interfaces\Migration;
use Prappo\WpEloquent\Database\Capsule\Manager as Capsule;

/**
 * Class Entries
 *
 * Represents the migration for creating the 'wp_gutenform_entries' table.
 *
 * @package Gutenform\Database\Migrations
 */
class Entries implements Migration
{

	/**
	 * Table name for the migration.
	 *
	 * @var string
	 */
	public static $table = 'gutenform_entries';

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
			`mailbox_id` BIGINT(20) UNSIGNED NOT NULL COMMENT 'Referenziert das Postfach aus wp_gutenform_mailboxes.',
			`form_identifier` VARCHAR(100) DEFAULT NULL COMMENT 'Vom Nutzer definierter Slug des Formulars (z.B. landing-page-v2).',
			`wp_post_id` BIGINT(20) UNSIGNED DEFAULT NULL COMMENT 'Die ID der WP-Seite, von der das Formular abgeschickt wurde.',
			`data` LONGTEXT NOT NULL COMMENT 'Alle Feldwerte als JSON-String.',
			`ip_address` VARCHAR(45) DEFAULT NULL COMMENT 'IP-Adresse des Absenders (oder anonymisiert).',
			`is_read` TINYINT(1) DEFAULT 0 COMMENT 'Status: 0=Ungelesen, 1=Gelesen.',
			`status` VARCHAR(32) DEFAULT 'inbox' COMMENT 'Status des Eintrags, z.B. new, archived, deleted.',
			`date_created` DATETIME NOT NULL,
			PRIMARY KEY (`id`),
			KEY `idx_mailbox_id` (`mailbox_id`),
			KEY `idx_wp_post_id` (`wp_post_id`),
			KEY `idx_identifier` (`form_identifier`),
			KEY `idx_status` (`status`)
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
