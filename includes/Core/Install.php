<?php

namespace Gutenform\Core;

use Gutenform\Database\Migrations\Mailboxes;
use Gutenform\Database\Migrations\Entries;
use Gutenform\Database\Migrations\EntryLabels;
use Gutenform\Database\Migrations\Providers;
use Gutenform\Database\Migrations\AddFormIdentifierToProviders;
use Gutenform\Database\Migrations\AddFolderIdToEntries;
use Gutenform\Database\Migrations\EmailLogs;
use Gutenform\Database\Migrations\Forms;
use Gutenform\Database\Migrations\InboxFolders;
use Gutenform\Database\Seeders\EntryLabelsSeeder as SeedersEntryLabels;
use Gutenform\Database\Seeders\MailboxesSeeder as SeedersMailboxes;
use Gutenform\Database\Seeders\DatabaseProviderSeeder;
use Gutenform\Traits\Base;

defined('ABSPATH') || exit;

/**
 * This class is responsible for the functionality
 * which is required to set up after activating the plugin
 */
class Install
{


	use Base;

	/**
	 * Schema version. Bump whenever install_tables() gains a new table or
	 * column migration, so existing installs pick it up on the next request
	 * instead of only on (re)activation.
	 */
	public const DB_VERSION = '2';

	/**
	 * Option key holding the installed schema version.
	 */
	private const DB_VERSION_OPTION = 'gutenform_db_version';

	/**
	 * Initialize the class
	 *
	 * @return void
	 */
	public function init()
	{

		// $this->install_pages(); // Not needed - using standard WordPress frontend
		$this->install_tables();
		$this->insert_data();
		Capabilities::grant_role_capabilities();
		update_option('gutenform_capabilities_version', Capabilities::VERSION, false);
		update_option(self::DB_VERSION_OPTION, self::DB_VERSION, false);
	}

	/**
	 * Runs pending migrations on an existing install.
	 *
	 * Every migration's up() is written to be idempotent (it returns early if
	 * the table already exists), so this is safe to run whenever the stored
	 * schema version is behind.
	 *
	 * @return void
	 */
	public function maybe_upgrade_database()
	{
		if (get_option(self::DB_VERSION_OPTION) === self::DB_VERSION) {
			return;
		}

		$this->install_tables();

		update_option(self::DB_VERSION_OPTION, self::DB_VERSION, false);
	}

	/**
	 * Install the pages
	 *
	 * @return void
	 * @deprecated Not needed - using standard WordPress frontend
	 */
	private function install_pages()
	{
		// Frontend page installation removed - using standard WordPress frontend
	}

	/**
	 * Install the tables
	 *
	 * @return void
	 */
	private function install_tables()
	{
		Mailboxes::up();
		Entries::up();
		EntryLabels::up();
		Providers::up();
		// Run migration to add form_identifier column
		AddFormIdentifierToProviders::up();
		InboxFolders::up();
		AddFolderIdToEntries::up();
		EmailLogs::up();
		// Server-side form index (provider feeds + field schema) -- see Core\FormRegistry.
		Forms::up();
	}

	/**
	 * Insert data to the tables
	 *
	 * @return void
	 */
	private function insert_data()
	{
		// Insert data to the tables.
		SeedersEntryLabels::run();
		SeedersMailboxes::run();
		// Create default Database Provider
		DatabaseProviderSeeder::run();
	}
}
