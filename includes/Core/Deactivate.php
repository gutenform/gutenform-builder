<?php

namespace Gutenform\Core;

use Gutenform\Traits\Base;

defined('ABSPATH') || exit;

/**
 * Class Deactivate
 *
 * Handles plugin deactivation with optional database removal.
 *
 * @package Gutenform\Core
 * @since 1.0.0
 */
class Deactivate
{

	use Base;

	/**
	 * Initialize the deactivation handler.
	 *
	 * @return void
	 */
	public function init()
	{
		// Add JavaScript to intercept deactivation
		add_action('admin_footer', array($this, 'add_deactivation_script'));
	}

	/**
	 * Add JavaScript to intercept plugin deactivation.
	 *
	 * @return void
	 */
	public function add_deactivation_script()
	{
		$screen = get_current_screen();
		if (!$screen || $screen->id !== 'plugins') {
			return;
		}

		// Get plugin basename - the main plugin file is gutenform-builder.php, not plugin.php
		// GUTENFORM_PLUGIN_FILE points to plugin.php, but we need gutenform-builder.php for the basename
		if (defined('GUTENFORM_DIR')) {
			$plugin_file = GUTENFORM_DIR . '/gutenform-builder.php';
		} else {
			// Fallback: try to find gutenform-builder.php relative to this file
			$plugin_file = __DIR__ . '/../../gutenform-builder.php';
		}
		$plugin_basename = plugin_basename($plugin_file);
		$rest_url = rest_url(GUTENFORM_ROUTE_PREFIX . '/database/remove');

		// Ensure jQuery is loaded
		wp_enqueue_script('jquery');

		// Debug: Output plugin basename for troubleshooting
		Debug::log('Gutenform Deactivate: Plugin basename = ' . $plugin_basename);

?>
		<script type="text/javascript">
			jQuery(document).ready(function($) {
				var pluginSlug = '<?php echo esc_js($plugin_basename); ?>';
				var deactivateLinkHref = '';
				console.log('Gutenform Deactivate: Looking for plugin with slug: ' + pluginSlug);

				// Create modal HTML first - overlay should be visible when modal is shown
				var modalHtml = `
				<div id="gutenform-deactivate-modal" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; z-index: 100000;">
					<div class="gutenform-modal-overlay" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.7); display: flex; align-items: center; justify-content: center;">
						<div class="gutenform-modal-content" style="background: #fff; padding: 30px; border-radius: 8px; max-width: 500px; width: 90%; box-shadow: 0 4px 20px rgba(0,0,0,0.3); position: relative; z-index: 100001;">
							<h2 style="margin-top: 0; margin-bottom: 15px;"><?php echo esc_js(__('Deactivate Gutenform', 'gutenform-builder')); ?></h2>
							<p style="margin-bottom: 20px;"><?php echo esc_js(__('What would you like to do?', 'gutenform-builder')); ?></p>
							<div style="margin-bottom: 20px;">
								<label style="display: block; margin-bottom: 10px; cursor: pointer;">
									<input type="radio" name="gutenform_deactivate_option" value="disable" checked style="margin-right: 8px;">
									<strong><?php echo esc_js(__('Just disable the plugin', 'gutenform-builder')); ?></strong>
									<p style="margin: 5px 0 0 24px; opacity: 0.8; font-size: 13px;"><?php echo esc_js(__('Keep all data and settings. You can reactivate the plugin later.', 'gutenform-builder')); ?></p>
								</label>
								<label style="display: block; margin-bottom: 10px; cursor: pointer;color: #F00;">
									<input type="radio" name="gutenform_deactivate_option" value="remove" style="margin-right: 8px;">
									<strong><?php echo esc_js(__('Disable and remove database tables', 'gutenform-builder')); ?></strong>
									<p style="margin: 5px 0 0 24px; opacity: 0.8; font-size: 13px;"><?php echo esc_js(__('This will permanently delete all form entries, accounts, and settings. This action cannot be undone.', 'gutenform-builder')); ?></p>
								</label>
							</div>
							<div style="display: flex; gap: 10px; justify-content: flex-end;">
								<button type="button" class="gutenform-modal-cancel button" style="margin-right: 10px;"><?php echo esc_js(__('Cancel', 'gutenform-builder')); ?></button>
								<button type="button" class="gutenform-modal-confirm button button-primary"><?php echo esc_js(__('Continue', 'gutenform-builder')); ?></button>
							</div>
						</div>
					</div>
				</div>
			`;
				$('body').append(modalHtml);

				var $modal = $('#gutenform-deactivate-modal');
				var $overlay = $modal.find('.gutenform-modal-overlay');

				// Debug: verify modal exists
				console.log('Gutenform: Modal exists:', $modal.length > 0);
				console.log('Gutenform: Overlay exists:', $overlay.length > 0);

				// Use event delegation to catch clicks on deactivate links for our plugin
				$(document).on('click', 'tr[data-plugin="' + pluginSlug + '"] .deactivate a', function(e) {
					e.preventDefault();
					e.stopImmediatePropagation();
					e.stopPropagation();

					var $link = $(this);
					deactivateLinkHref = $link.attr('href');
					console.log('Gutenform: Deactivate link clicked, href: ' + deactivateLinkHref);

					// Re-select modal elements in case DOM changed
					$modal = $('#gutenform-deactivate-modal');
					$overlay = $modal.find('.gutenform-modal-overlay');

					console.log('Gutenform: Modal found:', $modal.length);
					console.log('Gutenform: Overlay found:', $overlay.length);

					// Show the modal - use show() method which handles display properly
					if ($modal.length > 0 && $overlay.length > 0) {
						$modal.show();
						console.log('Gutenform: Modal should be visible now');
						console.log('Gutenform: Modal display:', $modal.css('display'));
						console.log('Gutenform: Modal is visible:', $modal.is(':visible'));
						console.log('Gutenform: Modal computed style:', window.getComputedStyle($modal[0]).display);
					} else {
						console.error('Gutenform: Modal or overlay not found!');
						console.error('Gutenform: Modal length:', $modal.length);
						console.error('Gutenform: Overlay length:', $overlay.length);
					}
					return false;
				});

				// Handle cancel button
				$modal.on('click', '.gutenform-modal-cancel', function(e) {
					e.preventDefault();
					e.stopPropagation();
					$modal.css('display', 'none');
					$overlay.css('display', 'none');
				});

				// Handle overlay click (close modal)
				$overlay.on('click', function(e) {
					if (e.target === this) {
						$modal.css('display', 'none');
						$overlay.css('display', 'none');
					}
				});

				// Handle confirm button
				$modal.on('click', '.gutenform-modal-confirm', function(e) {
					e.preventDefault();
					e.stopPropagation();

					var option = $('input[name="gutenform_deactivate_option"]:checked').val();
					var $button = $(this);
					var originalText = $button.text();

					$button.prop('disabled', true).text('<?php echo esc_js(__('Processing...', 'gutenform-builder')); ?>');

					if (option === 'remove') {
						// Remove database tables via REST API
						$.ajax({
							url: '<?php echo esc_url($rest_url); ?>',
							method: 'POST',
							beforeSend: function(xhr) {
								xhr.setRequestHeader('X-WP-Nonce', '<?php echo esc_js(wp_create_nonce('wp_rest')); ?>');
							},
							success: function(response, textStatus, xhr) {
								console.log('Gutenform: AJAX Success - Full response:', response);
								console.log('Gutenform: Response type:', typeof response);
								console.log('Gutenform: Response keys:', Object.keys(response || {}));

								// WordPress REST API returns data in response.data
								var data = response;
								if (response && response.data) {
									data = response.data;
								}

								var success = data && data.success === true;
								var message = data && data.message || '';

								console.log('Gutenform: Parsed data:', data);
								console.log('Gutenform: Parsed success:', success);
								console.log('Gutenform: Parsed message:', message);

								if (success) {
									// Proceed with deactivation
									alert('<?php echo esc_js(__('Database tables removed successfully. Deactivating plugin...', 'gutenform-builder')); ?>');
									window.location.href = deactivateLinkHref;
								} else {
									var errorMsg = message || '<?php echo esc_js(__('Error removing database tables. Please try again.', 'gutenform-builder')); ?>';
									console.error('Gutenform: Database removal failed:', errorMsg);
									alert(errorMsg);
									$button.prop('disabled', false).text(originalText);
								}
							},
							error: function(xhr, status, error) {
								console.error('Gutenform: AJAX Error:', {
									status: status,
									error: error,
									responseText: xhr.responseText,
									statusCode: xhr.status
								});
								var errorMsg = '<?php echo esc_js(__('Error removing database tables. Please try again.', 'gutenform-builder')); ?>';
								if (xhr.responseText) {
									try {
										var errorResponse = JSON.parse(xhr.responseText);
										if (errorResponse.message) {
											errorMsg = errorResponse.message;
										}
									} catch (e) {
										// Ignore JSON parse errors
									}
								}
								alert(errorMsg);
								$button.prop('disabled', false).text(originalText);
							}
						});
					} else {
						// Just disable the plugin
						window.location.href = deactivateLinkHref;
					}
				});

				// Debug: log available plugins
				setTimeout(function() {
					console.log('Gutenform: Available plugins:', $('tr[data-plugin]').map(function() {
						return $(this).attr('data-plugin');
					}).get());
				}, 1000);
			});
		</script>
<?php
	}
}
