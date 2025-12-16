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
use Gutenform\Core\Debug;

defined('ABSPATH') || exit;

/**
 * Submission Handler Class
 *
 * Handles the orchestration of form submissions through providers.
 */
class Handler
{

    /**
     * Processes a form submission.
     *
     * @param array  $submission_data The form data
     * @param string $form_identifier The form identifier
     * @param array  $provider_ids Array of provider feed IDs (optional)
     * @return array Result with success, errors, results
     */
    public function process(array $submission_data, string $form_identifier, array $provider_ids = array()): array
    {
        $errors  = array();
        $results = array();

        // 1. Get registry
        $registry = Registry::get_instance();

        // 2. Database Provider ALWAYS executes first (runs automatically)
        $database_provider = $registry->get_provider('database');
        if ($database_provider) {
            // Load Database Provider settings from database
            $database_provider_feed = $this->get_database_provider_feed();
            $database_settings = array(
                'mailbox_id' => $this->get_default_mailbox_id(),
            );
            
            // Merge settings from database provider feed if it exists
            if ($database_provider_feed && ! empty($database_provider_feed->settings)) {
                $database_settings = array_merge($database_settings, $database_provider_feed->settings);
            }
            
            // Ensure mailbox_id is set and is an integer
            if (isset($database_settings['mailbox_id'])) {
                $database_settings['mailbox_id'] = absint($database_settings['mailbox_id']);
            } else {
                $database_settings['mailbox_id'] = $this->get_default_mailbox_id();
            }
            
            // Log mailbox assignment for debugging
            error_log(sprintf(
                'GutenForm Handler: Processing submission for form "%s" with mailbox_id: %d',
                $form_identifier,
                $database_settings['mailbox_id']
            ));
            
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
                    $errors[] = __('Database Provider could not process the submission.', 'gutenform');
                }
            } catch (\Exception $e) {
                $errors[] = sprintf(
                    __('Database Provider Error: %s', 'gutenform'),
                    $e->getMessage()
                );
                $results['database'] = array(
                    'success' => false,
                    'error'   => $e->getMessage(),
                );
            }
        }

        // 3. Then all configured provider feeds from DB
        if (! empty($provider_ids)) {
            $provider_feeds = Providers::whereIn('id', $provider_ids)
                ->where('is_active', true)
                ->get();

            foreach ($provider_feeds as $feed) {
                $provider_slug = $feed->provider_type ?? '';
                $provider      = $registry->get_provider($provider_slug);

                if (! $provider) {
                    $errors[] = sprintf(
                        __('Provider "%s" not found.', 'gutenform'),
                        $provider_slug
                    );
                    continue;
                }

                // Skip Database Provider (already executed)
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
                            __('Provider "%s" could not process the submission.', 'gutenform'),
                            $provider->get_title()
                        );
                    }
                } catch (\Exception $e) {
                    $errors[] = sprintf(
                        __('Error in Provider "%s": %s', 'gutenform'),
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

        // 4. Compile result
        // Submission is considered successful if at least one provider was successful
        $successful_results = array_filter(
            $results,
            function ($result) {
                return isset($result['success']) && $result['success'] === true;
            }
        );
        $overall_success = ! empty($results) && count($successful_results) > 0;

        // 5. Collect debug data if debug mode is enabled
        $response = array(
            'success' => $overall_success,
            'errors'  => $errors,
            'results' => $results,
        );

        if (Debug::is_enabled()) {
            $debug_data = Debug::collect_debug_data(
                $submission_data,
                $form_identifier,
                $results,
                $errors
            );
            $response['debug'] = $debug_data;
        }

        return $response;
    }

    /**
     * Gets the default mailbox ID.
     *
     * @return int The mailbox ID (default: 1)
     */
    private function get_default_mailbox_id(): int
    {
        $default_mailbox = Mailboxes::where('is_default', true)->first();

        if ($default_mailbox) {
            return (int) $default_mailbox->id;
        }

        // Fallback: First mailbox or ID 1
        $first_mailbox = Mailboxes::orderBy('id', 'ASC')->first();
        return $first_mailbox ? (int) $first_mailbox->id : 1;
    }

    /**
     * Loads the Database Provider feed from the database.
     * Creates it automatically if it doesn't exist.
     *
     * @return \Gutenform\Models\Providers|null
     */
    private function get_database_provider_feed() {
        // Search for Database Provider (provider_type = 'database')
        $provider = Providers::where( 'provider_type', 'database' )
            ->whereNull( 'form_identifier' ) // Global provider
            ->first();

        // If not found, create default provider
        if ( ! $provider ) {
            $provider = $this->create_default_database_provider();
        }

        return $provider;
    }

    /**
     * Creates the default Database Provider in the database.
     *
     * @return \Gutenform\Models\Providers
     */
    private function create_default_database_provider() {
        $provider = new Providers();
        $provider->name            = __( 'Database Provider (Default)', 'gutenform' );
        $provider->provider_type   = 'database';
        $provider->form_identifier = null; // Global
        $provider->settings        = array(
            'mailbox_id'  => $this->get_default_mailbox_id(),
            'subject'     => __( 'New Form Submission: {form_title}', 'gutenform' ),
            'body'        => '{all_fields}',
            'from_email'  => get_option( 'admin_email' ),
        );
        $provider->is_active       = true;
        $provider->date_created    = current_time( 'mysql' );
        $provider->save();

        return $provider;
    }
}
