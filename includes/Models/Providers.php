<?php

/**
 * Class Providers
 *
 * Represents the Providers model for Gutenform.
 *
 * @package Gutenform\Models
 * @since 1.0.0
 */

namespace Gutenform\Models;

use Prappo\WpEloquent\Database\Eloquent\Model;

/**
 * Class Providers
 *
 * Represents the Providers model for Gutenform.
 *
 * @package Gutenform\Models
 */
class Providers extends Model
{

	/**
	 * The table associated with the model.
	 *
	 * @var string
	 */
	protected $table = 'gutenform_providers';

	/**
	 * The primary key for the model.
	 *
	 * @var string
	 */
	protected $primaryKey = 'id';

	/**
	 * Indicates if the model should be timestamped.
	 *
	 * @var bool
	 */
	public $timestamps = false;

	/**
	 * The attributes that are mass assignable.
	 *
	 * @var array
	 */
	protected $fillable = array(
		'name',
		'provider_type',
		'settings',
		'is_active',
		'date_created',
	);

	/**
	 * The attributes that should be cast.
	 *
	 * @var array
	 */
	protected $casts = array(
		'settings'    => 'array',
		'is_active'   => 'boolean',
		'date_created' => 'datetime',
	);
}
