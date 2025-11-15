<?php
/**
 * Gutenform Routes
 *
 * Defines and registers custom API routes for the Gutenform using the Haruncpi\WpApi library.
 *
 * @package Gutenform\Routes
 */

namespace Gutenform\Routes;

use Gutenform\Libs\API\Route;

Route::prefix(
	GF_ROUTE_PREFIX,
	function ( Route $route ) {

		// Define accounts API routes.

		$route->post( '/accounts/create', '\Gutenform\Controllers\Accounts\Actions@create' );
		$route->get( '/accounts/get', '\Gutenform\Controllers\Accounts\Actions@get' );
		$route->post( '/accounts/delete', '\Gutenform\Controllers\Accounts\Actions@delete' );
		$route->post( '/accounts/update', '\Gutenform\Controllers\Accounts\Actions@update' );

		// Posts routes.
		$route->get( '/posts/get', '\Gutenform\Controllers\Posts\Actions@get_all_posts' );
		$route->get( '/posts/get/{id}', '\Gutenform\Controllers\Posts\Actions@get_post' );
		// Allow hooks to add more custom API routes.
		do_action( 'gf_api', $route );
	}
);
