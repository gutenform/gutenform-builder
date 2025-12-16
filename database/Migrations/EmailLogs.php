<?php

/**
 * Database migration for email logs table.
 *
 * @package Gutenform
 * @subpackage Database\Migrations
 * @since 1.0.0
 */

namespace Gutenform\Database\Migrations;

use Gutenform\Interfaces\Migration;
use Prappo\WpEloquent\Database\Capsule\Manager as Capsule;

/**
 * Class EmailLogs
 *
 * Represents the migration for creating the 'wp_gutenform_email_logs' table.
 *
 * @package Gutenform\Database\Migrations
 */
class EmailLogs implements Migration
{

    /**
     * Table name for the migration.
     *
     * @var string
     */
    public static $table = 'gutenform_email_logs';

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
			`to_email` VARCHAR(255) NOT NULL COMMENT 'Recipient email address.',
			`subject` VARCHAR(500) DEFAULT NULL COMMENT 'Email subject.',
			`message` LONGTEXT DEFAULT NULL COMMENT 'Email message body.',
			`headers` TEXT DEFAULT NULL COMMENT 'Email headers as JSON.',
			`attachments` TEXT DEFAULT NULL COMMENT 'Attachment file paths as JSON.',
			`from_email` VARCHAR(255) DEFAULT NULL COMMENT 'Sender email address.',
			`from_name` VARCHAR(255) DEFAULT NULL COMMENT 'Sender name.',
			`status` VARCHAR(50) DEFAULT 'sent' COMMENT 'Email status: sent, failed, pending.',
			`error_message` TEXT DEFAULT NULL COMMENT 'Error message if sending failed.',
			`date_sent` DATETIME NOT NULL COMMENT 'Date and time when email was sent.',
			`date_created` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
			PRIMARY KEY (`id`),
			KEY `idx_to_email` (`to_email`),
			KEY `idx_status` (`status`),
			KEY `idx_date_sent` (`date_sent`)
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
