<?php

namespace Gutenform\Admin;

use Gutenform\Traits\Base;

/**
 * Class Menu
 *
 * Represents the admin menu management for the Gutenform plugin.
 *
 * @package Gutenform\Admin
 */
class Menu
{

	use Base;

	/**
	 * Parent slug for the menu.
	 *
	 * @var string
	 */
	private $parent_slug = 'gutenform';

	/**
	 * Initializes the admin menu.
	 *
	 * @return void
	 */
	public function init()
	{
		// Hook the function to the admin menu.
		add_action('admin_menu', array($this, 'menu'));
	}

	/**
	 * Adds a menu to the WordPress admin dashboard.
	 *
	 * @return void
	 */
	public function menu()
	{

		add_menu_page(
			__('Gutenform', 'gutenform'),
			__('Gutenform', 'gutenform'),
			'manage_options',
			$this->parent_slug,
			array($this, 'admin_page'),
			'dashicons-email',
			3
		);

		$settings_slug = $this->parent_slug . '-settings';

		$submenu_pages = array(
			array(
				'parent_slug' => $this->parent_slug,
				'page_title'  => __('Inbox', 'gutenform'),
				'menu_title'  => __('Inbox', 'gutenform'),
				'capability'  => 'manage_options',
				'menu_slug'   => $this->parent_slug,
				'function'    => array($this, 'admin_page'),
			),
			array(
				'parent_slug' => $this->parent_slug,
				'page_title'  => __('Settings', 'gutenform'),
				'menu_title'  => __('Settings', 'gutenform'),
				'capability'  => 'manage_options',
				'menu_slug'   => $settings_slug,
				'function'    => array($this, 'admin_page'),
			),
		);

		$plugin_submenu_pages = apply_filters('gf_submenu_pages', $submenu_pages);

		foreach ($plugin_submenu_pages as $submenu) {

			add_submenu_page(
				$submenu['parent_slug'],
				$submenu['page_title'],
				$submenu['menu_title'],
				$submenu['capability'],
				$submenu['menu_slug'],
				$submenu['function']
			);
		}
	}

	/**
	 * Callback function for the main "MyPlugin" menu page.
	 *
	 * @return void
	 */
	public function admin_page()
	{
		$page = isset($_GET['page']) ? sanitize_text_field(wp_unslash($_GET['page'])) : '';
		$settings_slug = $this->parent_slug . '-settings';

		if ($page === $settings_slug) {
			// Only set default hash when empty or not already on a settings sub-route
			// This preserves #/settings/providers etc. on page reload
			echo '<script>(function(){var h=window.location.hash;if(!h||h==="#"||h==="#/"||!h.startsWith("#/settings")){window.location.hash="#/settings";}})();</script>';
		}
?>
		<div id="myplugin" class="myplugin-app"></div>
<?php
	}
}
