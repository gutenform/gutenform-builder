<?php

declare(strict_types=1);

namespace Gutenform\Assets;

use Gutenform\Traits\Base;
use Gutenform\Libs\Assets;

/**
 * Class Frontend
 *
 * Handles frontend asset loading for Gutenform, including skin styles.
 *
 * @package Gutenform\Assets
 */
class Frontend
{

	use Base;

	/**
	 * Skin style handle for Gutenform.
	 */
	const SKIN_HANDLE = 'gutenform-skin';

	/**
	 * Development skin script path.
	 */
	const DEV_SKIN_SCRIPT = 'src/skins/default/skin.js';

	/**
	 * Get the active skin name from settings.
	 * 
	 * @return string The active skin name.
	 */
	private function get_active_skin()
	{
		// TODO: Get from settings/options
		// For now, default to 'default'
		return get_option('gutenform_skin', 'default');
	}

	/**
	 * Frontend bootstrapper.
	 *
	 * @return void
	 */
	public function bootstrap()
	{
		// Load skin styles in frontend
		add_action('wp_enqueue_scripts', array($this, 'enqueue_skin_styles'));

		// Load skin styles in block editor
		add_action('enqueue_block_editor_assets', array($this, 'enqueue_skin_styles'));

		// Load skin styles in admin area
		add_action('admin_enqueue_scripts', array($this, 'enqueue_skin_styles'));
	}

	/**
	 * Enqueue skin styles.
	 *
	 * @return void
	 */
	public function enqueue_skin_styles()
	{
		$skin = $this->get_active_skin();

		// Only load if skin is 'default' or exists
		if ($skin === 'default' || file_exists(GF_DIR . "/src/skins/{$skin}/skin.js")) {
			$skin_entry = $skin === 'default'
				? self::DEV_SKIN_SCRIPT
				: "src/skins/{$skin}/skin.js";

			Assets\enqueue_asset(
				GF_DIR . '/assets/admin/dist',
				$skin_entry,
				array(
					'handle'           => self::SKIN_HANDLE,
					'css-only'         => true,
					'css-dependencies' => array(),
					'css-media'        => 'all',
				)
			);
		}
	}
}
