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
      console.log(data);

      // Feature Flag prüfen
      // @ts-expect-error - useProviderSystem is added dynamically by PHP
      const useProviderSystem = (_window$gutenform$use = window.gutenform?.useProviderSystem) !== null && _window$gutenform$use !== void 0 ? _window$gutenform$use : false;
      if (useProviderSystem) {
        // Neuer Provider-basierter Flow
        const result = await submitFormWithProviders(data, formIdentifier, providerIds);
        if (result.success) {
          // Success-Handling (z.B. Success-Message anzeigen)
          console.log('Form submitted successfully', result);
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
        message: result.message
      };
    } else {
      return {
        success: false,
        errors: result.data?.errors || [result.message || 'Unknown error']
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