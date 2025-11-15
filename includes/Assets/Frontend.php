<?php

declare(strict_types=1);

namespace Gutenform\Assets;

use Gutenform\Core\Template;
use Gutenform\Traits\Base;
use Gutenform\Libs\Assets;

/**
 * Class Frontend
 *
 * Handles frontend functionalities for the Gutenform.
 *
 * @package Gutenform\Assets
 */
class Frontend
{

	use Base;

	/**
	 * Script handle for Gutenform.
	 */
	const HANDLE = 'gutenform-frontend';

	/**
	 * JS Object name for Gutenform.
	 */
	const OBJ_NAME = 'wordpressPluginBoilerplateFrontend';

	/**
	 * Development script path for Gutenform.
	 */
	const DEV_SCRIPT = 'src/frontend/main.jsx';

	/**
	 * List of allowed screens for script enqueue.
	 *
	 * @var array
	 */
	private $allowed_screens = array(
		'toplevel_page_gutenform',
	);

	/**
	 * Frontend bootstrapper.
	 *
	 * @return void
	 */
	public function bootstrap()
	{
		add_action('wp_enqueue_scripts', array($this, 'enqueue_script'));
	}

	/**
	 * Enqueue script based on the current screen.
	 *
	 * @return void
	 */
	public function enqueue_script()
	{
		$template_file_name = Template::FRONTEND_TEMPLATE;
		$should_enqueue     = false;

		if (! is_admin()) {
			$template_slug = get_page_template_slug();
			if ($template_slug && $template_slug === $template_file_name) {
				$should_enqueue = true;
			}
		}

		if ($should_enqueue) {
			$enqueued = Assets\enqueue_asset(
				GF_DIR . '/assets/frontend/dist',
				self::DEV_SCRIPT,
				$this->get_config()
			);
			if ($enqueued) {
				wp_localize_script(self::HANDLE, self::OBJ_NAME, $this->get_data());
			}
		}
	}

	/**
	 * Get the script configuration.
	 *
	 * @return array The script configuration.
	 */
	public function get_config()
	{
		return array(
			'dependencies' => array('react', 'react-dom'),
			'handle'       => self::HANDLE,
			'in-footer'    => true,
		);
	}

	/**
	 * Get data for script localization.
	 *
	 * @return array The localized script data.
	 */
	public function get_data()
	{

		return array(
			'developer' => 'prappo',
			'isAdmin'   => is_admin(),
			'apiUrl'    => rest_url(),
			'userInfo'  => $this->get_user_data(),
		);
	}

	/**
	 * Get user data for script localization.
	 *
	 * @return array The user data.
	 */
	private function get_user_data()
	{
		$username   = '';
		$avatar_url = '';

		if (is_user_logged_in()) {
			// Get current user's data .
			$current_user = wp_get_current_user();

			// Get username.
			$username = $current_user->user_login; // or use user_nicename, display_name, etc.

			// Get avatar URL.
			$avatar_url = get_avatar_url($current_user->ID);
		}

		return array(
			'username' => $username,
			'avatar'   => $avatar_url,
		);
	}
}
