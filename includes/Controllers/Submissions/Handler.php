<?php

/**
 * Submission Handler
 *
 * Orchestrates form submission processing through multiple providers.
 *
 * @package Gutenform\Controllers\Submissions
 * @since 1.0.0
 */

namespace Gutenform\Controllers\Submissions;

use Gutenform\Models\Providers;
use Gutenform\Models\Mailboxes;
use Gutenform\Providers\Registry;

defined('ABSPATH') || exit;

/**
 * Submission Handler Class
 *
 * Handles the orchestration of form submissions through providers.
 */
class Handler
{

    /**
     * Verarbeitet eine Formular-Submission.
     *
     * @param array  $submission_data Die Formulardaten
     * @param string $form_identifier Der Formular-Identifier
     * @param array  $provider_ids Array von Provider-Feed-IDs (optional)
     * @return array Ergebnis mit success, errors, results
     */
    public function process(array $submission_data, string $form_identifier, array $provider_ids = array()): array
    {
        $errors  = array();
        $results = array();

        // 1. Registry abrufen
        $registry = Registry::get_instance();

        // 2. Database Provider IMMER zuerst ausführen (läuft automatisch)
        $database_provider = $registry->get_provider('database');
        if ($database_provider) {
            $database_settings = array(
                'mailbox_id' => $this->get_default_mailbox_id(),
            );
            try {
                $success = $database_provider->process_submission(
                    $submission_data,
                    $database_settings,
                    $form_identifier
                );
                $results['database'] = array(
                    'success'  => $success,
                    'provider' => $database_provider->get_title(),
                );

                if (! $success) {
                    $errors[] = __('Database Provider konnte die Submission nicht verarbeiten.', 'gutenform');
                }
            } catch (\Exception $e) {
                $errors[] = sprintf(
                    __('Database Provider Fehler: %s', 'gutenform'),
                    $e->getMessage()
                );
                $results['database'] = array(
                    'success' => false,
                    'error'   => $e->getMessage(),
                );
            }
        }

        // 3. Dann alle konfigurierten Provider-Feeds aus DB
        if (! empty($provider_ids)) {
            $provider_feeds = Providers::whereIn('id', $provider_ids)
                ->where('is_active', true)
                ->get();

            foreach ($provider_feeds as $feed) {
                $provider_slug = $feed->provider_type ?? '';
                $provider      = $registry->get_provider($provider_slug);

                if (! $provider) {
                    $errors[] = sprintf(
                        __('Provider "%s" nicht gefunden.', 'gutenform'),
                        $provider_slug
                    );
                    continue;
                }

                // Überspringe Database Provider (wurde bereits ausgeführt)
                if ($provider_slug === 'database') {
                    continue;
                }

                try {
                    $success = $provider->process_submission(
                        $submission_data,
                        $feed->settings ?? array(),
                        $form_identifier
                    );

                    $results[$provider_slug] = array(
                        'success'  => $success,
                        'provider' => $provider->get_title(),
                    );

                    if (! $success) {
                        $errors[] = sprintf(
                            __('Provider "%s" konnte die Submission nicht verarbeiten.', 'gutenform'),
                            $provider->get_title()
                        );
                    }
                } catch (\Exception $e) {
                    $errors[] = sprintf(
                        __('Fehler in Provider "%s": %s', 'gutenform'),
                        $provider->get_title(),
                        $e->getMessage()
                    );
                    $results[$provider_slug] = array(
                        'success' => false,
                        'error'   => $e->getMessage(),
                    );
                }
            }
        }

        // 4. Ergebnis zusammenstellen
        // Submission gilt als erfolgreich, wenn mindestens ein Provider erfolgreich war
        $successful_results = array_filter(
            $results,
            function ($result) {
                return isset($result['success']) && $result['success'] === true;
            }
        );
        $overall_success = ! empty($results) && count($successful_results) > 0;

        return array(
            'success' => $overall_success,
            'errors'  => $errors,
            'results' => $results,
        );
    }

    /**
     * Ermittelt die Standard-Mailbox-ID.
     *
     * @return int Die Mailbox-ID (Standard: 1)
     */
    private function get_default_mailbox_id(): int
    {
        $default_mailbox = Mailboxes::where('is_default', true)->first();

        if ($default_mailbox) {
            return (int) $default_mailbox->id;
        }

        // Fallback: Erste Mailbox oder ID 1
        $first_mailbox = Mailboxes::orderBy('id', 'ASC')->first();
        return $first_mailbox ? (int) $first_mailbox->id : 1;
    }
}
