<?php

/**
 * Class Entries
 *
 * Represents the Entries model for Gutenform.
 *
 * @package Gutenform\Models
 * @since 1.0.0
 */

namespace Gutenform\Models;

use Prappo\WpEloquent\Database\Eloquent\Model;

/**
 * Class Entries
 *
 * Represents the Entries model for Gutenform.
 *
 * @package Gutenform\Models
 */
class Entries extends Model
{

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'gutenform_entries';

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
        'mailbox_id',
        'form_identifier',
        'wp_post_id',
        'data',
        'ip_address',
        'is_read',
        'status',
        'date_created',
    );

    /**
     * The attributes that should be cast.
     *
     * @var array
     */
    protected $casts = array(
        'data'        => 'array',
        'is_read'     => 'boolean',
        'date_created' => 'datetime',
    );

    /**
     * Get the mailbox that owns the entry.
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function mailbox()
    {
        return $this->belongsTo(Mailboxes::class, 'mailbox_id');
    }

    /**
     * Get the labels for the entry.
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsToMany
     */
    public function labels()
    {
        return $this->belongsToMany(
            EntryLabels::class,
            'gutenform_entry_label_rel',
            'entry_id',
            'label_id'
        );
    }
}
