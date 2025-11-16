<?php

/**
 * Database migration for entry labels tables.
 *
 * @package Gutenform
 * @subpackage Database\Migrations
 * @since 1.0.0
 */

namespace Gutenform\Database\Migrations;

use Gutenform\Interfaces\Migration;
use Prappo\WpEloquent\Database\Capsule\Manager as Capsule;

/**
 * Class EntryLabels
 *
 * Represents the migration for creating the entry labels tables.
 *
 * @package Gutenform\Database\Migrations
 */
class EntryLabels implements Migration
{

	/**
	 * Table name for labels.
	 *
	 * @var string
	 */
	public static $labels_table = 'gutenform_entry_labels';

	/**
	 * Table name for label relations.
	 *
	 * @var string
	 */
	public static $rel_table = 'gutenform_entry_label_rel';

	/**
	 * Run the migrations.
	 *
	 * @return void
	 */
	public static function up()
	{
		global $wpdb;
		$labels_table = $wpdb->prefix . self::$labels_table;
		$rel_table    = $wpdb->prefix . self::$rel_table;

		// Create labels table.
		if (! Capsule::schema()->hasTable($labels_table)) {
			$sql = "CREATE TABLE IF NOT EXISTS `" . $labels_table . "` (
				`id` BIGINT(20) UNSIGNED NOT NULL AUTO_INCREMENT,
				`name` VARCHAR(100) NOT NULL,
				`description` TEXT DEFAULT NULL COMMENT 'Beschreibung der Label.',
				`color` VARCHAR(7) DEFAULT '#000000' COMMENT 'Hex-Code für die Farbdarstellung.',
				`date_created` DATETIME NOT NULL,
				PRIMARY KEY (`id`),
				UNIQUE KEY `uk_name` (`name`)
			) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;";

			Capsule::connection()->getPdo()->exec($sql);
		}

		// Create label relations table.
		if (! Capsule::schema()->hasTable($rel_table)) {
			$sql = "CREATE TABLE IF NOT EXISTS `" . $rel_table . "` (
				`entry_id` BIGINT(20) UNSIGNED NOT NULL,
				`label_id` BIGINT(20) UNSIGNED NOT NULL,
				`date_applied` DATETIME NOT NULL,
				PRIMARY KEY (`entry_id`, `label_id`),
				KEY `idx_label_id` (`label_id`)
			) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;";

			Capsule::connection()->getPdo()->exec($sql);
		}
	}

	/**
	 * Reverse the migrations.
	 *
	 * @return void
	 */
	public static function down()
	{
		global $wpdb;
		$labels_table = $wpdb->prefix . self::$labels_table;
		$rel_table    = $wpdb->prefix . self::$rel_table;

		$wpdb->query("DROP TABLE IF EXISTS " . $labels_table);
		$wpdb->query("DROP TABLE IF EXISTS " . $rel_table);
	}
}
