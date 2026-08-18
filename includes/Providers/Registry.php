<?php
/**
 * Provider Registry
 *
 * Singleton class that manages all available provider instances.
 *
 * @package Gutenform\Providers
 * @since 1.0.0
 */

namespace Gutenform\Providers;

use Gutenform\Traits\Base;

defined( 'ABSPATH' ) || exit;

/**
 * Provider Registry Class
 *
 * Manages all registered provider instances using a singleton pattern.
 */
class Registry {
	use Base;

	/**
	 * Array aller registrierten Provider-Instanzen.
	 *
	 * @var array<string, AbstractProvider>
	 */
	private array $providers = array();

	/**
	 * Initialisiert die Registry und registriert alle Provider.
	 */
	private function __construct() {
		$this->register_all_providers();
	}

	/**
	 * Registriert alle verfügbaren Provider.
	 *
	 * Nutzt WordPress Hook 'gutenform/available_providers' für Erweiterungen.
	 */
	private function register_all_providers(): void {
		// Basis-Provider
		$base_providers = array(
			Email::class,
			Database::class,
			GoogleSheets::class,
		);

		// Hook für externe Provider
		$provider_classes = apply_filters(
			'gutenform/available_providers',
			$base_providers
		);

		// Instanziieren und speichern
		foreach ( $provider_classes as $provider_class ) {
			if ( is_subclass_of( $provider_class, AbstractProvider::class ) ) {
				$instance = new $provider_class();
				$this->providers[ $instance->get_slug() ] = $instance;
			}
		}
	}

	/**
	 * Gibt eine Provider-Instanz zurück.
	 *
	 * @param string $slug Der Provider-Slug
	 * @return AbstractProvider|null Die Provider-Instanz oder null
	 */
	public function get_provider( string $slug ): ?AbstractProvider {
		return $this->providers[ $slug ] ?? null;
	}

	/**
	 * Gibt alle registrierten Provider zurück.
	 *
	 * @return array<string, AbstractProvider>
	 */
	public function get_all_providers(): array {
		return $this->providers;
	}

	/**
	 * Prüft, ob ein Provider existiert.
	 *
	 * @param string $slug Der Provider-Slug
	 * @return bool
	 */
	public function has_provider( string $slug ): bool {
		return isset( $this->providers[ $slug ] );
	}
}

