<?php

/**
 * Select field REST actions.
 *
 * @package Gutenform\Controllers\Select
 * @since 1.0.0
 */

namespace Gutenform\Controllers\Select;

use Gutenform\Core\BlockScanner;
use Gutenform\Core\PopulatedSelect;

defined('ABSPATH') || exit;

/**
 * Class Actions
 */
class Actions
{
	/**
	 * Returns populated options for a select field (client-side fallback).
	 *
	 * @param \WP_REST_Request $request Request.
	 * @return \WP_REST_Response|\WP_Error
	 */
	public function get_populated_options(\WP_REST_Request $request)
	{
		$field_name = sanitize_text_field((string) $request->get_param('field_name'));
		$post_id    = (int) $request->get_param('post_id');

		if ('' === $field_name || $post_id <= 0) {
			return new \WP_Error(
				'gutenform_invalid_params',
				__('field_name and post_id are required.', 'gutenform-builder'),
				array('status' => 400)
			);
		}

		$post = get_post($post_id);
		if (! $post instanceof \WP_Post || ! is_post_publicly_viewable($post)) {
			return new \WP_Error(
				'gutenform_post_not_found',
				__('Post not found.', 'gutenform-builder'),
				array('status' => 404)
			);
		}

		$attrs = PopulatedSelect::find_field_block_by_name(
			parse_blocks($post->post_content),
			'gutenform/select',
			$field_name
		);

		if (null === $attrs || empty($attrs['optionsPopulated'])) {
			return new \WP_Error(
				'gutenform_not_populated_select',
				__('This field is not a populated select.', 'gutenform-builder'),
				array('status' => 404)
			);
		}

		$options = PopulatedSelect::get_options(
			$attrs,
			array(
				'post_id' => $post_id,
				'source'  => 'rest',
			)
		);

		return rest_ensure_response(
			array(
				'options' => $options,
			)
		);
	}
}
