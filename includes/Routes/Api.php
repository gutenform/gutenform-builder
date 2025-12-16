<?php

/**
 * Gutenform Routes
 *
 * Defines and registers custom API routes for the Gutenform using the Haruncpi\WpApi library.
 *
 * @package Gutenform\Routes
 */

namespace Gutenform\Routes;

use Gutenform\Libs\API\Route;

Route::prefix(
	GF_ROUTE_PREFIX,
	function (Route $route) {

		// Posts routes.
		$route->get('/posts/get', '\Gutenform\Controllers\Posts\Actions@get_all_posts');
		$route->get('/posts/get/{id}', '\Gutenform\Controllers\Posts\Actions@get_post');

		// Database routes.
		$route->post('/database/seed-demo', '\Gutenform\Controllers\Database\Actions@seed_demo');
		$route->get('/database/check-demo-data', '\Gutenform\Controllers\Database\Actions@check_demo_data');
		$route->post('/database/remove', '\Gutenform\Controllers\Database\Actions@remove');

		// Entries routes.
		$route->post('/entries/create', '\Gutenform\Controllers\Entries\Actions@create');
		$route->get('/entries/get', '\Gutenform\Controllers\Entries\Actions@get');
		$route->get('/entries/get/{id}', '\Gutenform\Controllers\Entries\Actions@get_single');
		$route->get('/entries/form-identifiers', '\Gutenform\Controllers\Entries\Actions@get_form_identifiers');
		$route->get('/entries/statuses', '\Gutenform\Controllers\Entries\Actions@get_statuses');
		$route->post('/entries/update', '\Gutenform\Controllers\Entries\Actions@update');
		$route->post('/entries/delete', '\Gutenform\Controllers\Entries\Actions@delete');
		$route->post('/entries/mark-read', '\Gutenform\Controllers\Entries\Actions@mark_read');
		$route->post('/entries/empty-trash', '\Gutenform\Controllers\Entries\Actions@empty_trash');

		// Mailboxes routes.
		$route->post('/mailboxes/create', '\Gutenform\Controllers\Mailboxes\Actions@create');
		$route->get('/mailboxes/get', '\Gutenform\Controllers\Mailboxes\Actions@get');
		$route->get('/mailboxes/get/{id}', '\Gutenform\Controllers\Mailboxes\Actions@get_single');
		$route->post('/mailboxes/update', '\Gutenform\Controllers\Mailboxes\Actions@update');
		$route->post('/mailboxes/delete', '\Gutenform\Controllers\Mailboxes\Actions@delete');

		// Providers routes.
		$route->post('/providers/create', '\Gutenform\Controllers\Providers\Actions@create');
		$route->get('/providers/get', '\Gutenform\Controllers\Providers\Actions@get');
		$route->get('/providers/get/{id}', '\Gutenform\Controllers\Providers\Actions@get_single');
		$route->get('/providers/get-by-type/{provider_type}', '\Gutenform\Controllers\Providers\Actions@get_by_type');
		$route->get('/providers/types', '\Gutenform\Controllers\Providers\Actions@get_provider_types');
		$route->post('/providers/update', '\Gutenform\Controllers\Providers\Actions@update');
		$route->post('/providers/delete', '\Gutenform\Controllers\Providers\Actions@delete');

		// Entry Labels routes.
		$route->post('/entry-labels/create', '\Gutenform\Controllers\EntryLabels\Actions@create');
		$route->get('/entry-labels/get', '\Gutenform\Controllers\EntryLabels\Actions@get');
		$route->get('/entry-labels/get/{id}', '\Gutenform\Controllers\EntryLabels\Actions@get_single');
		$route->post('/entry-labels/update', '\Gutenform\Controllers\EntryLabels\Actions@update');
		$route->post('/entry-labels/delete', '\Gutenform\Controllers\EntryLabels\Actions@delete');
		$route->post('/entry-labels/attach', '\Gutenform\Controllers\EntryLabels\Actions@attach_to_entry');
		$route->post('/entry-labels/detach', '\Gutenform\Controllers\EntryLabels\Actions@detach_from_entry');

		// Submissions route (NEU)
		$route->post('/submit', '\Gutenform\Controllers\Submissions\Actions@submit');

		// File upload routes
		$route->post('/upload', '\Gutenform\Controllers\FileUpload\Actions@upload');
		$route->post('/upload-from-url', '\Gutenform\Controllers\FileUpload\Actions@upload_from_url');

		// Settings routes
		$route->get('/settings/smtp', '\Gutenform\Controllers\Settings\Actions@get_smtp_settings');
		$route->post('/settings/smtp', '\Gutenform\Controllers\Settings\Actions@save_smtp_settings');
		$route->post('/settings/smtp/test', '\Gutenform\Controllers\Settings\Actions@test_smtp_connection');
		$route->get('/settings/debug', '\Gutenform\Controllers\Settings\Actions@get_debug_status');
		$route->post('/settings/debug', '\Gutenform\Controllers\Settings\Actions@update_debug_status');
		$route->get('/settings/skip-first-steps', '\Gutenform\Controllers\Settings\Actions@get_skip_first_steps');
		$route->post('/settings/skip-first-steps', '\Gutenform\Controllers\Settings\Actions@update_skip_first_steps');
		$route->get('/settings/charts-visible', '\Gutenform\Controllers\Settings\Actions@get_charts_visible');
		$route->post('/settings/charts-visible', '\Gutenform\Controllers\Settings\Actions@update_charts_visible');

		// Email Logs routes
		$route->get('/email-logs/get', '\Gutenform\Controllers\EmailLogs\Actions@get_email_logs');
		$route->get('/email-logs/get/{id}', '\Gutenform\Controllers\EmailLogs\Actions@get_email_log');
		$route->post('/email-logs/delete', '\Gutenform\Controllers\EmailLogs\Actions@delete_email_log');
		$route->post('/email-logs/delete-all', '\Gutenform\Controllers\EmailLogs\Actions@delete_all_email_logs');

		// Email Templates routes
		$route->get('/email-templates', '\Gutenform\Controllers\EmailTemplates\Actions@get_templates');
		$route->get('/email-templates/{name}', '\Gutenform\Controllers\EmailTemplates\Actions@get_template');
		$route->post('/email-templates/preview', '\Gutenform\Controllers\EmailTemplates\Actions@preview_template');

		// Allow hooks to add more custom API routes.
		do_action('gf_api', $route);
	}
);
