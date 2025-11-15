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
    form.addEventListener('submit', e => {
      e.preventDefault();
      console.log('form submitted');
    });
  });
});
/******/ })()
;
//# sourceMappingURL=view.js.map