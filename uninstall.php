<?php

/**
 * Uninstall the plugin.
 *
 * Runs only when the user deletes the plugin from the Plugins screen, never on
 * deactivation. Destructive cleanup is opt-in: unless the site explicitly asked
 * for its data to be removed (Gutenform → Settings), the tables and uploads are
 * left completely alone, so deleting and reinstalling the plugin does not throw
 * away someone's form submissions.
 *
 * @package Gutenform
 * @subpackage Database
 */

if (! defined('WP_UNINSTALL_PLUGIN')) {
	exit;
}

/**
 * Options this plugin creates. Removed on every uninstall, including the
 * non-opt-in path: they are small, plugin-internal, and one of them holds the
 * SMTP password, which must not survive a deletion.
 *
 * @var array<string>
 */
$gutenform_options = array(
	'gutenform_smtp_settings',
	'gutenform_captcha_settings',
	'gutenform_debug_enabled',
	'gutenform_admin_bar_enabled',
	'gutenform_skin',
	'gutenform_db_version',
	'gutenform_capabilities_version',
	'gutenform_delete_data_on_uninstall',
	// Removed in 1.0.0, cleaned up here for sites upgrading from an older build.
	'gutenform_use_provider_system',
);

/**
 * User meta keys this plugin creates.
 *
 * @var array<string>
 */
$gutenform_user_meta = array(
	'gutenform_skip_first_steps',
	'gutenform_charts_visible',
);

$gutenform_delete_data = (bool) get_option('gutenform_delete_data_on_uninstall', false);

global $wpdb;

if ($gutenform_delete_data) {
	// Tables, newest/most dependent first.
	$gutenform_tables = array(
		'gutenform_forms',
		'gutenform_email_logs',
		'gutenform_entry_label_rel',
		'gutenform_entry_labels',
		'gutenform_inbox_folders',
		'gutenform_entries',
		'gutenform_providers',
		'gutenform_mailboxes',
	);

	foreach ($gutenform_tables as $gutenform_table) {
		// Table names cannot be bound as prepared-statement parameters, and these
		// are internal constants rather than user input.
		$wpdb->query('DROP TABLE IF EXISTS `' . esc_sql($wpdb->prefix . $gutenform_table) . '`'); // phpcs:ignore WordPress.DB.PreparedSQL.NotPrepared, WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.DirectDatabaseQuery.SchemaChange, PluginCheck.Security.DirectDB.UnescapedDBParameter
	}

	// Uploaded form attachments (wp-content/uploads/gutenform/).
	$gutenform_upload_dir = wp_upload_dir();
	$gutenform_base       = trailingslashit($gutenform_upload_dir['basedir']) . 'gutenform';

	if (is_dir($gutenform_base)) {
		require_once ABSPATH . 'wp-admin/includes/file.php';
		if (WP_Filesystem()) {
			global $wp_filesystem;
			$wp_filesystem->delete($gutenform_base, true);
		}
	}
}

// Options and user meta always go, regardless of the opt-in.
foreach ($gutenform_options as $gutenform_option) {
	delete_option($gutenform_option);
}

foreach ($gutenform_user_meta as $gutenform_meta_key) {
	delete_metadata('user', 0, $gutenform_meta_key, '', true);
}

// Custom capabilities added to roles.
$gutenform_caps = array(
	'gutenform_view_entries',
	'gutenform_manage_entries',
	'gutenform_manage_settings',
);

foreach (array('administrator', 'editor') as $gutenform_role_name) {
	$gutenform_role = get_role($gutenform_role_name);
	if (! $gutenform_role) {
		continue;
	}
	foreach ($gutenform_caps as $gutenform_cap) {
		$gutenform_role->remove_cap($gutenform_cap);
	}
}

// Scheduled jobs.
$gutenform_timestamp = wp_next_scheduled('gutenform_purge_expired_entries');
if ($gutenform_timestamp) {
	wp_unschedule_event($gutenform_timestamp, 'gutenform_purge_expired_entries');
}

// Transients created by the upload-token store and the submission rate limiter.
$wpdb->query( // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching -- deleting this plugin's transients on uninstall.
	$wpdb->prepare(
		"DELETE FROM {$wpdb->options} WHERE option_name LIKE %s OR option_name LIKE %s",
		$wpdb->esc_like('_transient_gutenform_') . '%',
		$wpdb->esc_like('_transient_timeout_gutenform_') . '%'
	)
);
