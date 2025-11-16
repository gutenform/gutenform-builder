<?php
/**
 * Class Actions
 *
 * Handles provider-related actions such as creation, retrieval, deletion, and update.
 *
 * @package Gutenform\Controllers\Providers
 * @since 1.0.0
 */

namespace Gutenform\Controllers\Providers;

use Gutenform\Models\Providers;

/**
 * Class Actions
 *
 * Handles provider-related actions.
 *
 * @package Gutenform\Controllers\Providers
 */
class Actions {

	/**
	 * Creates a new provider.
	 *
	 * @param \WP_REST_Request $request The REST request object.
	 * @return array|\WP_Error The response message or error.
	 */
	public function create( \WP_REST_Request $request ) {
		try {
			// Check if provider_type already exists (unique constraint).
			if ( Providers::where( 'provider_type', $request->get_param( 'provider_type' ) )->exists() ) {
				return new \WP_Error(
					'provider_type_exists',
					__( 'A provider with this type already exists.', 'gutenform' ),
					array( 'status' => 400 )
				);
			}

			$provider = new Providers();
			$provider->name         = $request->get_param( 'name' );
			$provider->provider_type = $request->get_param( 'provider_type' );
			$provider->settings      = $request->get_param( 'settings' ) ?? array();
			$provider->is_active     = $request->get_param( 'is_active' ) ?? true;
			$provider->date_created  = current_time( 'mysql' );

			$provider->save();

			return array(
				'success' => true,
				'message' => __( 'Provider created successfully.', 'gutenform' ),
				'data'    => $provider,
			);
		} catch ( \Exception $e ) {
			return new \WP_Error(
				'provider_creation_failed',
				__( 'Failed to create provider: ', 'gutenform' ) . $e->getMessage(),
				array( 'status' => 500 )
			);
		}
	}

	/**
	 * Retrieves all providers.
	 *
	 * @param \WP_REST_Request $request The REST request object.
	 * @return array|\WP_Error The list of providers or error.
	 */
	public function get( \WP_REST_Request $request ) {
		try {
			$query = Providers::query();

			// Filter by is_active.
			if ( $request->has_param( 'is_active' ) ) {
				$query->where( 'is_active', $request->get_param( 'is_active' ) ? 1 : 0 );
			}

			// Filter by provider_type.
			if ( $request->get_param( 'provider_type' ) ) {
				$query->where( 'provider_type', $request->get_param( 'provider_type' ) );
			}

			$providers = $query->orderBy( 'date_created', 'DESC' )->get();

			return array(
				'success' => true,
				'data'    => $providers,
			);
		} catch ( \Exception $e ) {
			return new \WP_Error(
				'provider_retrieval_failed',
				__( 'Failed to retrieve providers: ', 'gutenform' ) . $e->getMessage(),
				array( 'status' => 500 )
			);
		}
	}

	/**
	 * Retrieves a single provider by ID.
	 *
	 * @param \WP_REST_Request $request The REST request object.
	 * @return array|\WP_Error The provider or error.
	 */
	public function get_single( \WP_REST_Request $request ) {
		try {
			$id = $request->get_param( 'id' );

			$provider = Providers::find( $id );

			if ( ! $provider ) {
				return new \WP_Error(
					'provider_not_found',
					__( 'Provider not found.', 'gutenform' ),
					array( 'status' => 404 )
				);
			}

			return array(
				'success' => true,
				'data'    => $provider,
			);
		} catch ( \Exception $e ) {
			return new \WP_Error(
				'provider_retrieval_failed',
				__( 'Failed to retrieve provider: ', 'gutenform' ) . $e->getMessage(),
				array( 'status' => 500 )
			);
		}
	}

	/**
	 * Retrieves a provider by provider_type.
	 *
	 * @param \WP_REST_Request $request The REST request object.
	 * @return array|\WP_Error The provider or error.
	 */
	public function get_by_type( \WP_REST_Request $request ) {
		try {
			$provider_type = $request->get_param( 'provider_type' );

			$provider = Providers::where( 'provider_type', $provider_type )->first();

			if ( ! $provider ) {
				return new \WP_Error(
					'provider_not_found',
					__( 'Provider not found.', 'gutenform' ),
					array( 'status' => 404 )
				);
			}

			return array(
				'success' => true,
				'data'    => $provider,
			);
		} catch ( \Exception $e ) {
			return new \WP_Error(
				'provider_retrieval_failed',
				__( 'Failed to retrieve provider: ', 'gutenform' ) . $e->getMessage(),
				array( 'status' => 500 )
			);
		}
	}

	/**
	 * Updates a provider.
	 *
	 * @param \WP_REST_Request $request The REST request object.
	 * @return array|\WP_Error The response message or error.
	 */
	public function update( \WP_REST_Request $request ) {
		$id = $request->get_param( 'id' );

		$provider = Providers::find( $id );

		if ( ! $provider ) {
			return new \WP_Error(
				'provider_not_found',
				__( 'Provider not found.', 'gutenform' ),
				array( 'status' => 404 )
			);
		}

		try {
			// Check if provider_type is being changed and if new type already exists.
			if ( $request->has_param( 'provider_type' ) && $request->get_param( 'provider_type' ) !== $provider->provider_type ) {
				if ( Providers::where( 'provider_type', $request->get_param( 'provider_type' ) )->exists() ) {
					return new \WP_Error(
						'provider_type_exists',
						__( 'A provider with this type already exists.', 'gutenform' ),
						array( 'status' => 400 )
					);
				}
			}

			if ( $request->has_param( 'name' ) ) {
				$provider->name = $request->get_param( 'name' );
			}
			if ( $request->has_param( 'provider_type' ) ) {
				$provider->provider_type = $request->get_param( 'provider_type' );
			}
			if ( $request->has_param( 'settings' ) ) {
				$provider->settings = $request->get_param( 'settings' );
			}
			if ( $request->has_param( 'is_active' ) ) {
				$provider->is_active = $request->get_param( 'is_active' );
			}

			$provider->save();

			return array(
				'success' => true,
				'message' => __( 'Provider updated successfully.', 'gutenform' ),
				'data'    => $provider,
			);
		} catch ( \Exception $e ) {
			return new \WP_Error(
				'provider_update_failed',
				__( 'Failed to update provider: ', 'gutenform' ) . $e->getMessage(),
				array( 'status' => 500 )
			);
		}
	}

	/**
	 * Deletes a provider.
	 *
	 * @param \WP_REST_Request $request The REST request object.
	 * @return array|\WP_Error The response message or error.
	 */
	public function delete( \WP_REST_Request $request ) {
		$id = $request->get_param( 'id' );

		$provider = Providers::find( $id );

		if ( ! $provider ) {
			return new \WP_Error(
				'provider_not_found',
				__( 'Provider not found.', 'gutenform' ),
				array( 'status' => 404 )
			);
		}

		try {
			$provider->delete();

			return array(
				'success' => true,
				'message' => __( 'Provider deleted successfully.', 'gutenform' ),
			);
		} catch ( \Exception $e ) {
			return new \WP_Error(
				'provider_deletion_failed',
				__( 'Failed to delete provider: ', 'gutenform' ) . $e->getMessage(),
				array( 'status' => 500 )
			);
		}
	}
}

