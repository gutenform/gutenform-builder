<?php
/**
 * Plugin Name: Gutenform
 * Description: Gutenform is a plugin for creating and managing forms in WordPress.
 * Author: Gutenform
 * Author URI: https://gutenform.com
 * License: GPLv2
 * Version: 1.0.0
 * Text Domain: gutenform
 * Domain Path: /languages
 *
 * @package Gutenform
 */

use Gutenform\Core\Install;

defined( 'ABSPATH' ) || exit;

require_once plugin_dir_path( __FILE__ ) . 'vendor/autoload.php';
require_once plugin_dir_path( __FILE__ ) . 'plugin.php';

/**
 * Initializes the Gutenform plugin when plugins are loaded.
 *
 * @since 1.0.0
 * @return void
 */
function gutenform_init() {
	Gutenform::get_instance()->init();
}

// Hook for plugin initialization.
add_action( 'plugins_loaded', 'gutenform_init' );

// Hook for plugin activation.
register_activation_hook( __FILE__, array( Install::get_instance(), 'init' ) );
