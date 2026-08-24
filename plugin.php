<?php

use Gutenform\Core\Api;
use Gutenform\Core\Deactivate;
use Gutenform\Core\Smtp;
use Gutenform\Core\EmailLogger;
use Gutenform\Admin\Menu;
use Gutenform\Admin\AdminBar;
// use Gutenform\Core\Template; // Not needed - using standard WordPress frontend
use Gutenform\Assets\Frontend;
use Gutenform\Assets\Admin;
use Gutenform\Traits\Base;

defined('ABSPATH') || exit;

/**
 * Class Gutenform
 *
 * The main class for the Coldmailar plugin, responsible for initialization and setup.
 *
 * @since 1.0.0
 */
final class Gutenform
{

	use Base;

	/**
	 * Class constructor to set up constants for the plugin.
	 *
	 * @since 1.0.0
	 * @return void
	 */
	public function __construct()
	{
		// GF_PLUGIN_FILE must point at the main plugin bootstrap file (gutenform-builder.php),
		// not this file, since plugin_basename()/get_file_data() need the file WordPress
		// registered as the plugin (the one carrying the plugin header).
		define('GF_PLUGIN_FILE', __DIR__ . '/gutenform-builder.php');
		define('GF_DIR', plugin_dir_path(GF_PLUGIN_FILE));
		define('GF_URL', plugin_dir_url(GF_PLUGIN_FILE));
		define('GF_ASSETS_URL', GF_URL . '/assets');
		define('GF_ROUTE_PREFIX', 'gutenform/v1');

		$plugin_data = get_file_data(GF_PLUGIN_FILE, array('Version' => 'Version'));
		define('GF_VERSION', ! empty($plugin_data['Version']) ? $plugin_data['Version'] : '1.0.0');
	}

	/**
	 * Main execution point where the plugin will fire up.
	 *
	 * Initializes necessary components for admin, blocks, and API.
	 *
	 * @since 1.0.0
	 * @return void
	 */
	public function init()
	{
		if (is_admin()) {
			Menu::get_instance()->init();
			Admin::get_instance()->bootstrap();
			Deactivate::get_instance()->init();
		}

		// Admin bar (runs on frontend and admin).
		AdminBar::get_instance()->init();

		// Initialze core functionalities.
		Frontend::get_instance()->bootstrap();
		API::get_instance()->init();
		Smtp::get_instance()->init();
		EmailLogger::get_instance()->init();
		// Template::get_instance()->init(); // Not needed - using standard WordPress frontend

		add_action('init', array($this, 'i18n'), 1);
		add_action('init', array($this, 'register_blocks'), 10);
	}

	public function register_blocks()
	{
		$blocks_dir = __DIR__ . '/assets/blocks/';
		if (is_dir($blocks_dir)) {
			foreach (scandir($blocks_dir) as $block) {
				if ($block === '.' || $block === '..') {
					continue;
				}
				$block_path = $blocks_dir . $block;
				if (is_dir($block_path) && file_exists($block_path . '/block.json')) {
					register_block_type($block_path);
				}
			}
		}
	}


	/**
	 * Internationalization setup for language translations.
	 *
	 * Loads the plugin text domain for localization.
	 *
	 * @since 1.0.0
	 * @return void
	 */
	public function i18n()
	{
		load_plugin_textdomain('gutenform-builder', false, dirname(plugin_basename(GF_PLUGIN_FILE)) . '/languages/');
	}
}
