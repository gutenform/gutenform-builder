<?php

/**
 * Class Actions
 *
 * Handles form usage overview: posts that contain embedded Gutenform blocks.
 *
 * @package Gutenform\Controllers\Forms
 * @since 1.0.0
 */

namespace Gutenform\Controllers\Forms;

use Gutenform\Models\Mailboxes;
use Gutenform\Models\Providers;

/**
 * Class Actions
 *
 * Handles form usage and overview actions.
 *
 * @package Gutenform\Controllers\Forms
 */
class Actions
{

	/**
	 * Field block names that count as "form fields".
	 *
	 * @var array<string>
	 */
	private static $field_block_names = array(
		'gutenform/input',
		'gutenform/textarea',
		'gutenform/select',
		'gutenform/checkbox',
		'gutenform/radio',
		'gutenform/date-time',
		'gutenform/slider',
		'gutenform/file',
	);

	/**
	 * Recursively find all gutenform/form blocks in a block list.
	 *
	 * @param array $blocks Parsed blocks.
	 * @return array List of form block data (attrs + field_count).
	 */
	private function find_form_blocks(array $blocks)
	{
		$found = array();
		foreach ($blocks as $block) {
			$name = isset($block['blockName']) ? $block['blockName'] : '';
			if ($name === 'gutenform/form') {
				$attrs = isset($block['attrs']) ? $block['attrs'] : array();
				$inner = isset($block['innerBlocks']) ? $block['innerBlocks'] : array();
				$found[] = array(
					'attrs'        => $attrs,
					'field_count'  => $this->count_field_blocks($inner),
				);
			}
			if (!empty($block['innerBlocks'])) {
				$found = array_merge($found, $this->find_form_blocks($block['innerBlocks']));
			}
		}
		return $found;
	}

	/**
	 * Recursively count blocks that are form fields (input, textarea, select, file).
	 *
	 * @param array $blocks Parsed blocks.
	 * @return int
	 */
	private function count_field_blocks(array $blocks)
	{
		$count = 0;
		foreach ($blocks as $block) {
			$name = isset($block['blockName']) ? $block['blockName'] : '';
			if (in_array($name, self::$field_block_names, true)) {
				++$count;
			}
			if (!empty($block['innerBlocks'])) {
				$count += $this->count_field_blocks($block['innerBlocks']);
			}
		}
		return $count;
	}

	/**
	 * Get all posts that contain at least one gutenform/form block, grouped by post type.
	 *
	 * @param \WP_REST_Request $request The REST request object.
	 * @return \WP_REST_Response|\WP_Error
	 */
	public function get_usage(\WP_REST_Request $request)
	{
		$post_types = get_post_types(array('public' => true), 'names');
		$post_types['page'] = 'page';
		// Include wp_block (WordPress Patterns / Synced patterns / Reusable blocks).
		if (post_type_exists('wp_block')) {
			$post_types['wp_block'] = 'wp_block';
		}
		$post_types = array_unique(array_values($post_types));

		$posts = get_posts(array(
			'post_type'      => $post_types,
			'post_status'    => array('publish', 'draft', 'private', 'pending'),
			'posts_per_page' => -1,
			'no_found_rows'  => true,
			'orderby'        => 'post_type title',
			'order'          => 'ASC',
		));

		$mailbox_map = array();
		$provider_map = array();
		try {
			$mailboxes = Mailboxes::all();
			foreach ($mailboxes as $m) {
				$mailbox_map[(string) $m->id] = $m->title;
			}
			$providers = Providers::all();
			foreach ($providers as $p) {
				$provider_map[(string) $p->id] = $p->name;
			}
		} catch (\Exception $e) {
			// Tables may not exist; continue with empty maps.
		}

		$by_post_type = array();
		foreach ($posts as $post) {
			if (strpos($post->post_content, 'gutenform/form') === false) {
				continue;
			}
			$blocks = parse_blocks($post->post_content);
			$forms = $this->find_form_blocks($blocks);
			if (empty($forms)) {
				continue;
			}

			$post_type = $post->post_type;
			$post_type_obj = get_post_type_object($post_type);
			$post_type_label = $post_type_obj ? $post_type_obj->labels->singular_name : $post_type;

			if (!isset($by_post_type[$post_type])) {
				$by_post_type[$post_type] = array(
					'label' => $post_type_label,
					'posts' => array(),
				);
			}

			$edit_link = get_edit_post_link($post->ID, 'raw');
			$view_link = get_permalink($post->ID);

			foreach ($forms as $form) {
				$attrs = $form['attrs'];
				$form_id = isset($attrs['formId']) ? $attrs['formId'] : '';
				$form_title = isset($attrs['formTitle']) ? $attrs['formTitle'] : '';
				$mailbox_id = isset($attrs['mailboxId']) ? $attrs['mailboxId'] : '1';
				$provider_ids = isset($attrs['providerIds']) && is_array($attrs['providerIds']) ? $attrs['providerIds'] : array();

				$mailbox_title = isset($mailbox_map[$mailbox_id]) ? $mailbox_map[$mailbox_id] : $mailbox_id;
				$provider_names = array();
				foreach ($provider_ids as $pid) {
					$provider_names[] = isset($provider_map[(string) $pid]) ? $provider_map[(string) $pid] : (string) $pid;
				}

				$by_post_type[$post_type]['posts'][] = array(
					'post_id'        => $post->ID,
					'post_title'     => $post->post_title,
					'form_id'        => $form_id,
					'form_title'     => $form_title,
					'mailbox'        => $mailbox_title,
					'mailbox_id'     => $mailbox_id,
					'providers'      => implode(', ', $provider_names),
					'provider_ids'   => $provider_ids,
					'field_count'    => $form['field_count'],
					'edit_link'      => $edit_link ? $edit_link : '',
					'view_link'      => $view_link ? $view_link : '',
				);
			}
		}

		// Sort post types by label.
		uasort($by_post_type, function ($a, $b) {
			return strcasecmp($a['label'], $b['label']);
		});

		return rest_ensure_response(array(
			'by_post_type' => $by_post_type,
		));
	}
}
