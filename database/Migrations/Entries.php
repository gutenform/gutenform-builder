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
use Prappo\WpEloquent\Database\Schema\Blueprint;

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
		// Capsule adds the WordPress table prefix automatically; pass name without prefix.
		if (Capsule::schema()->hasTable(self::$table)) {
			return;
		}

		Capsule::schema()->create(self::$table, function (Blueprint $table) {
			$table->id();
			$table->unsignedBigInteger('mailbox_id');
			$table->string('form_identifier', 100)->nullable();
			$table->unsignedBigInteger('wp_post_id')->nullable();
			$table->longText('data');
			$table->string('ip_address', 45)->nullable();
			$table->tinyInteger('is_read')->default(0);
			$table->string('status', 32)->default('inbox');
			$table->string('subject', 255)->nullable();
			$table->string('from_mail', 255)->nullable();
			$table->dateTime('date_created');
			$table->index('mailbox_id');
			$table->index('wp_post_id');
			$table->index('form_identifier');
			$table->index('status');
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
