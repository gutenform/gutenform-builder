<?php

use Gutenform\Core\Api;
use Gutenform\Admin\Menu;
use Gutenform\Core\Template;
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
		define('GF_VERSION', '1.0.0');
		define('GF_PLUGIN_FILE', __FILE__);
		define('GF_DIR', plugin_dir_path(__FILE__));
		define('GF_URL', plugin_dir_url(__FILE__));
		define('GF_ASSETS_URL', GF_URL . '/assets');
		define('GF_ROUTE_PREFIX', 'wordpress-plugin-boilerplate/v1');
	}

	/**
	 * Main execution point where the plugin will fire up.
	 *
	 * Initializes necessary components for both admin and frontend.
	 *
	 * @since 1.0.0
	 * @return void
	 */
	public function init()
	{
		if (is_admin()) {
			Menu::get_instance()->init();
			Admin::get_instance()->bootstrap();
		}

		// Initialze core functionalities.
		Frontend::get_instance()->bootstrap();
		API::get_instance()->init();
		Template::get_instance()->init();

		add_action('init', array($this, 'i18n'));
		add_action('init', array($this, 'register_blocks'));
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
		load_plugin_textdomain('gutenform', false, dirname(plugin_basename(__FILE__)) . '/languages/');
	}
}
