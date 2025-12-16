<?php

namespace Gutenform\Core;

use Gutenform\Database\Migrations\Mailboxes;
use Gutenform\Database\Migrations\Entries;
use Gutenform\Database\Migrations\EntryLabels;
use Gutenform\Database\Migrations\Providers;
use Gutenform\Database\Migrations\AddFormIdentifierToProviders;
use Gutenform\Database\Migrations\EmailLogs;
use Gutenform\Database\Seeders\EntryLabelsSeeder as SeedersEntryLabels;
use Gutenform\Database\Seeders\MailboxesSeeder as SeedersMailboxes;
use Gutenform\Database\Seeders\DatabaseProviderSeeder;
use Gutenform\Traits\Base;

/**
 * This class is responsible for the functionality
 * which is required to set up after activating the plugin
 */
class Install
{


	use Base;

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
		EmailLogs::up();
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
