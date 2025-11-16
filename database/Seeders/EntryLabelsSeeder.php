<?php

/**
 * Database seeder for entry labels.
 *
 * @package Gutenform
 * @subpackage Database\Seeders
 * @since 1.0.0
 */

namespace Gutenform\Database\Seeders;

use Gutenform\Models\EntryLabels;

/**
 * Class EntryLabels
 *
 * Represents the seeder for the 'gutenform_entry_labels' table.
 *
 * @package Gutenform\Database\Seeders
 * @since 1.0.0
 */
class EntryLabelsSeeder
{

	/**
	 * Run the database seeds.
	 *
	 * @return void
	 */
	public static function run()
	{
		$current_date = gmdate('Y-m-d H:i:s');

		// Default labels to insert.
		$labels = array(
			array(
				'name'         => 'Important',
				'description'  => 'Mark important entries',
				'color'        => '#ef4444', // Red
				'date_created' => $current_date,
			),
			array(
				'name'         => __('Follow Up', 'gutenform'),
				'description'  => __('Entries that need follow-up', 'gutenform'),
				'color'        => '#f59e0b', // Amber
				'date_created' => $current_date,
			),
		);

		foreach ($labels as $label) {
			// Check if label already exists by name (unique constraint).
			if (! EntryLabels::where('name', $label['name'])->exists()) {
				EntryLabels::create($label);
			}
		}
	}
}
