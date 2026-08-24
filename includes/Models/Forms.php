<?php

/**
 * Class Forms
 *
 * Represents the server-side form index for Gutenform.
 *
 * @package Gutenform\Models
 * @since 1.0.0
 */

namespace Gutenform\Models;

use Prappo\WpEloquent\Database\Eloquent\Model;

defined('ABSPATH') || exit;

/**
 * Class Forms
 *
 * @package Gutenform\Models
 */
class Forms extends Model
{

	/**
	 * The table associated with the model.
	 *
	 * @var string
	 */
	protected $table = 'gutenform_forms';

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
		'form_identifier',
		'post_id',
		'config',
		'fields',
		'updated_at',
	);

	/**
	 * The attributes that should be cast.
	 *
	 * @var array
	 */
	protected $casts = array(
		'config'     => 'array',
		'fields'     => 'array',
		'updated_at' => 'datetime',
	);
}
