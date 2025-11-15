<?php

namespace Gutenform\Core;

use Gutenform\Database\Migrations\Accounts;
use Gutenform\Database\Seeders\Accounts as SeedersAccounts;
use Gutenform\Traits\Base;

/**
 * This class is responsible for the functionality
 * which is required to set up after activating the plugin
 */
class Install {


	use Base;

	/**
	 * Initialize the class
	 *
	 * @return void
	 */
	public function init() {

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
	private function install_pages() {
		// Frontend page installation removed - using standard WordPress frontend
	}

	/**
	 * Install the tables
	 *
	 * @return void
	 */
	private function install_tables() {
		Accounts::up();
	}

	/**
	 * Insert data to the tables
	 *
	 * @return void
	 */
	private function insert_data() {
		// Insert data to the tables.
		SeedersAccounts::run();
	}
}
