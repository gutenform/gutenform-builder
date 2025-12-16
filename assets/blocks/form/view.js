/******/ (() => { // webpackBootstrap
/*!*********************************!*\
  !*** ./src/blocks/form/view.ts ***!
  \*********************************/
/**
 * Use this file for JavaScript code that you want to run in the front-end 
 * on posts/pages that contain this block.
 *
 * When this file is defined as the value of the `viewScript` property
 * in `block.json` it will be enqueued on the front end of the site.
 *
 * Example:
 *
 * ```js
 * {
 *   "viewScript": "file:./view.js"
 * }
 * ```
 *
 * If you're not making any changes to this file because your project doesn't need any 
 * JavaScript running in the front-end, then you should delete this file and remove 
 * the `viewScript` property from `block.json`. 
 *
 * @see https://developer.wordpress.org/block-editor/reference-guides/block-api/block-metadata/#view-script
 */

window.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelectorAll('.wp-block-gutenform-form');
  form.forEach(form => {
    const formDataOptions = form.getAttribute('data-form-options');
    if (!formDataOptions) {
      console.error('Form options not found');
      return;
    }
    ;
    const formOptions = JSON.parse(formDataOptions);
    console.log(formOptions);

    // Load skin CSS dynamically
    const skinName = form.getAttribute('data-skin') || formOptions.skin || 'default';
    if (skinName) {
      loadSkinCSS(skinName);
    }
    form.addEventListener('submit', async e => {
      var _window$gutenform$use;
      e.preventDefault();
      const formIdentifier = formOptions.formId;
      const mailboxId = formOptions.mailboxId;
      const providerIds = formOptions.providerIds || [];
      if (!formIdentifier) {
        console.error('Form identifier not found');
        return;
      }
      const formData = new FormData(form);
      const data = Object.fromEntries(formData);

      // Extract file upload data from hidden inputs
      const fileUploadFields = form.querySelectorAll('input[type="hidden"][id$="_files"]');
      fileUploadFields.forEach(hiddenInput => {
        const fieldName = hiddenInput.name;
        try {
          const fileData = JSON.parse(hiddenInput.value || '[]');
          if (Array.isArray(fileData) && fileData.length > 0) {
            // Store file data as array in submission data
            data[fieldName] = fileData;
          }
        } catch (e) {
          console.error('Failed to parse file data for field:', fieldName, e);
        }
      });
      console.log(data);

      // Feature Flag prüfen
      // @ts-expect-error - useProviderSystem is added dynamically by PHP
      const useProviderSystem = (_window$gutenform$use = window.gutenform?.useProviderSystem) !== null && _window$gutenform$use !== void 0 ? _window$gutenform$use : false;
      if (useProviderSystem) {
        // Neuer Provider-basierter Flow
        const result = await submitFormWithProviders(data, formIdentifier, providerIds);

        // Show debug view if debug data is present
        if (result.debug) {
          showDebugView(result.debug);
        }
        if (result.success) {
          // Success-Handling (z.B. Success-Message anzeigen)
          console.log('Form submitted successfully', result);
          form.classList.add('gutenform-form--success-view');
          //clear form
          if (form instanceof HTMLFormElement) {
            form.reset();
            // Also clear file upload lists
            const fileLists = form.querySelectorAll('.gutenform-file-upload-list');
            fileLists.forEach(list => {
              list.innerHTML = '';
            });
          }
          // TODO: Show success message to user
        } else {
          // Error-Handling
          console.error('Form submission failed', result.errors);
          // TODO: Show error message to user
        }
      } else {
        // Legacy-Flow (aktueller Code)
        if (!window.gutenform?.Entries) {
          console.error('Entries API not found');
          return;
        }
        window.gutenform?.Entries.create({
          mailbox_id: mailboxId,
          form_identifier: formIdentifier,
          data
        });
      }
    });
  });
});

/**
 * Submits form using the new provider system
 */
async function submitFormWithProviders(formData, formIdentifier, providerIds) {
  try {
    const apiUrl = window.gutenform?.apiUrl || '';
    const nonce = window.gutenform?.nonce || '';
    const namespace = window.gutenform?.namespace || 'gutenform/v1';
    const response = await fetch(`${apiUrl}${namespace}/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-WP-Nonce': nonce
      },
      body: JSON.stringify({
        form_identifier: formIdentifier,
        provider_ids: providerIds,
        submission_data: formData
      })
    });
    const result = await response.json();
    if (result.success) {
      return {
        success: true,
        message: result.message,
        debug: result.debug || null
      };
    } else {
      return {
        success: false,
        errors: result.data?.errors || [result.message || 'Unknown error'],
        debug: result.debug || null
      };
    }
  } catch (error) {
    console.error('Form submission error', error);
    return {
      success: false,
      errors: ['Network error: ' + (error instanceof Error ? error.message : 'Unknown error')]
    };
  }
}

/**
 * Shows debug view with debug data
 */
function showDebugView(debugData) {
  // Remove existing debug view if any
  const existingDebug = document.getElementById('gutenform-debug-view');
  if (existingDebug) {
    existingDebug.remove();
  }

  // Create debug view container
  const debugContainer = document.createElement('div');
  debugContainer.id = 'gutenform-debug-view';
  document.body.appendChild(debugContainer);

  // Import and render DebugView component
  // Note: This is a simplified version - in production, you might want to use React
  // For now, we'll create a simple HTML version
  const debugHtml = `
		<div style="position: fixed; bottom: 16px; right: 16px; z-index: 9999; width: 384px; max-width: calc(100vw - 2rem); background: white; border: 1px solid #e5e7eb; border-radius: 8px; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1); font-family: system-ui, -apple-system, sans-serif;">
			<div style="padding: 12px; border-bottom: 1px solid #e5e7eb; display: flex; align-items: center; justify-content: space-between; cursor: pointer;" onclick="this.parentElement.querySelector('.debug-content').style.display = this.parentElement.querySelector('.debug-content').style.display === 'none' ? 'block' : 'none'; this.querySelector('.chevron').textContent = this.parentElement.querySelector('.debug-content').style.display === 'none' ? '▼' : '▲';">
				<div style="display: flex; align-items: center; gap: 8px;">
					<span style="font-weight: 600; font-size: 14px;">🔍 Debug View</span>
					${debugData.errors && debugData.errors.length > 0 ? `<span style="padding: 2px 8px; font-size: 11px; background: #fee2e2; color: #991b1b; border-radius: 4px;">${debugData.errors.length} error${debugData.errors.length !== 1 ? 's' : ''}</span>` : ''}
				</div>
				<div style="display: flex; align-items: center; gap: 8px;">
					<span class="chevron" style="font-size: 12px; color: #6b7280;">▲</span>
					<button onclick="this.closest('[id=\\'gutenform-debug-view\\']').remove();" style="background: none; border: none; color: #6b7280; cursor: pointer; font-size: 16px;">×</button>
				</div>
			</div>
			<div class="debug-content" style="max-height: 600px; overflow-y: auto; padding: 12px; font-size: 12px;">
				<div style="margin-bottom: 16px;">
					<div style="font-weight: 600; margin-bottom: 4px;">Form Identifier</div>
					<div style="color: #6b7280; font-family: monospace; font-size: 11px;">${debugData.form_identifier || 'N/A'}</div>
				</div>
				<div style="margin-bottom: 16px;">
					<div style="font-weight: 600; margin-bottom: 8px;">Providers</div>
					<div style="display: flex; flex-direction: column; gap: 8px;">
						${(debugData.providers || []).map(p => `
							<div style="padding: 8px; background: #f9fafb; border-radius: 4px; border: 1px solid #e5e7eb;">
								<div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px;">
									<div style="display: flex; align-items: center; gap: 8px;">
										${p.status === 'success' ? '✅' : p.status === 'failed' ? '❌' : 'ℹ️'}
										<span style="font-weight: 500;">${p.name || p.slug}</span>
									</div>
									<span style="font-size: 11px; color: ${p.status === 'success' ? '#16a34a' : p.status === 'failed' ? '#dc2626' : '#6b7280'};">${p.status}</span>
								</div>
								${p.feed_name ? `<div style="font-size: 11px; color: #6b7280; margin-top: 4px;">Feed: ${p.feed_name}</div>` : ''}
							</div>
						`).join('')}
					</div>
				</div>
				${debugData.errors && debugData.errors.length > 0 ? `
					<div style="margin-bottom: 16px;">
						<div style="font-weight: 600; margin-bottom: 8px; color: #dc2626; display: flex; align-items: center; gap: 4px;">⚠️ Errors</div>
						<div style="display: flex; flex-direction: column; gap: 4px;">
							${debugData.errors.map(e => `
								<div style="padding: 8px; background: #fee2e2; border-radius: 4px; color: #991b1b; font-size: 11px;">${e}</div>
							`).join('')}
						</div>
					</div>
				` : ''}
				<div style="margin-bottom: 16px;">
					<div style="font-weight: 600; margin-bottom: 8px;">Payload</div>
					<pre style="padding: 8px; background: #f9fafb; border-radius: 4px; font-size: 11px; overflow-x: auto; font-family: monospace;">${JSON.stringify(debugData.payload || {}, null, 2)}</pre>
				</div>
				<div>
					<div style="font-weight: 600; margin-bottom: 8px;">Results</div>
					<pre style="padding: 8px; background: #f9fafb; border-radius: 4px; font-size: 11px; overflow-x: auto; font-family: monospace;">${JSON.stringify(debugData.results || {}, null, 2)}</pre>
				</div>
			</div>
		</div>
	`;
  debugContainer.innerHTML = debugHtml;
}

/**
 * Load skin CSS dynamically
 */
function loadSkinCSS(skinName) {
  // Check if skin CSS is already loaded
  const existingLink = document.querySelector(`link[data-gutenform-skin="${skinName}"]`);
  if (existingLink) {
    return;
  }

  // Create link element for skin CSS
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  // Load from assets/skins (built skins)
  // @ts-expect-error - assetsUrl is not defined in the window object
  const assetsUrl = window.gutenform?.assetsUrl || '';
  link.href = `${assetsUrl}/blocks/skins/${skinName}/index.css`;
  link.setAttribute('data-gutenform-skin', skinName);
  document.head.appendChild(link);
}
/******/ })()
;
//# sourceMappingURL=view.js.map