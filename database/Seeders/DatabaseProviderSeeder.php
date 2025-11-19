<?php

/**
 * Database seeder for default Database Provider.
 *
 * @package Gutenform
 * @subpackage Database\Seeders
 * @since 1.0.0
 */

namespace Gutenform\Database\Seeders;

use Gutenform\Models\Providers;
use Gutenform\Models\Mailboxes;

/**
 * Class DatabaseProviderSeeder
 *
 * Creates the default Database Provider entry in the database.
 *
 * @package Gutenform\Database\Seeders
 * @since 1.0.0
 */
class DatabaseProviderSeeder
{

    /**
     * Run the database seeds.
     *
     * @return void
     */
    public static function run()
    {
        // Check if Database Provider already exists.
        $database_provider = Providers::where('provider_type', 'database')
            ->whereNull('form_identifier') // Global provider
            ->first();

        if (! $database_provider) {
            // Get default mailbox ID
            $default_mailbox = Mailboxes::where('is_default', true)->first();
            $mailbox_id = $default_mailbox ? (int) $default_mailbox->id : 1;

            // Create default Database Provider.
            Providers::create(
                array(
                    'name'            => __('Database Provider (Standard)', 'gutenform'),
                    'provider_type'   => 'database',
                    'form_identifier' => null, // Global provider
                    'settings'        => array(
                        'mailbox_id'  => $mailbox_id,
                        'subject'     => __('Neue Formular-Übermittlung: {form_title}', 'gutenform'),
                        'body'        => '{all_fields}',
                        'from_email'  => get_option('admin_email'),
                    ),
                    'is_active'      => true,
                    'date_created'   => current_time('mysql'),
                )
            );
        }
    }
}
