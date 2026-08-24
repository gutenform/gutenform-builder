<?php

namespace Gutenform\Core;

use Gutenform\Traits\Base;
use Gutenform\Libs\API\Config;

defined('ABSPATH') || exit;

/**
 * Class API
 *
 * Initializes and configures the API for the Gutenform.
 *
 * @package Gutenform\Core
 */
class API {

	use Base;

	/**
	 * Initializes the API for the Gutenform.
	 *
	 * @return void
	 */
	public function init() {
		Config::set_route_file( GF_DIR . '/includes/Routes/Api.php' )
			->set_namespace( 'Gutenform\Api' )
			->init();
	}
}
