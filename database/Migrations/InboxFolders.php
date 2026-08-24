<?php

/**
 * Database migration for inbox folders table.
 *
 * @package Gutenform
 * @subpackage Database\Migrations
 * @since 1.0.0
 */

namespace Gutenform\Database\Migrations;

use Gutenform\Interfaces\Migration;
use Prappo\WpEloquent\Database\Capsule\Manager as Capsule;
use Prappo\WpEloquent\Database\Schema\Blueprint;

defined('ABSPATH') || exit;

/**
 * Class InboxFolders
 *
 * Represents the migration for creating the 'wp_gutenform_inbox_folders' table.
 *
 * @package Gutenform\Database\Migrations
 */
class InboxFolders implements Migration
{

	/**
	 * Table name for the migration.
	 *
	 * @var string
	 */
	public static $table = 'gutenform_inbox_folders';

	/**
	 * Run the migrations.
	 *
	 * @return void
	 */
	public static function up()
	{
		if (Capsule::schema()->hasTable(self::$table)) {
			return;
		}

		Capsule::schema()->create(self::$table, function (Blueprint $table) {
			$table->id();
			$table->unsignedBigInteger('mailbox_id');
			$table->unsignedBigInteger('parent_id')->nullable();
			$table->string('name', 255);
			$table->unsignedInteger('sort_order')->default(0);
			$table->dateTime('date_created');
			$table->index('mailbox_id');
			$table->index('parent_id');
		});
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
