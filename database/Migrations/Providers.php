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
use Prappo\WpEloquent\Database\Schema\Blueprint;

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
		// Capsule adds the WordPress table prefix automatically; pass name without prefix.
		if (Capsule::schema()->hasTable(self::$table)) {
			return;
		}

		Capsule::schema()->create(self::$table, function (Blueprint $table) {
			$table->id();
			$table->string('name', 255);
			$table->string('provider_type', 50);
			$table->string('form_identifier', 100)->nullable();
			$table->longText('settings');
			$table->tinyInteger('is_active')->default(1);
			$table->dateTime('date_created');
			$table->index('provider_type');
			$table->index('form_identifier');
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
