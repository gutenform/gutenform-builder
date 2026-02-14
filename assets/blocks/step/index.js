/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./node_modules/clsx/dist/clsx.mjs":
/*!*****************************************!*\
  !*** ./node_modules/clsx/dist/clsx.mjs ***!
  \*****************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   clsx: () => (/* binding */ clsx),
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
function r(e){var t,f,n="";if("string"==typeof e||"number"==typeof e)n+=e;else if("object"==typeof e)if(Array.isArray(e)){var o=e.length;for(t=0;t<o;t++)e[t]&&(f=r(e[t]))&&(n&&(n+=" "),n+=f)}else for(f in e)e[f]&&(n&&(n+=" "),n+=f);return n}function clsx(){for(var e,t,f=0,n="",o=arguments.length;f<o;f++)(e=arguments[f])&&(t=r(e))&&(n&&(n+=" "),n+=t);return n}/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (clsx);

/***/ }),

/***/ "./node_modules/lucide-react/dist/esm/createLucideIcon.js":
/*!****************************************************************!*\
  !*** ./node_modules/lucide-react/dist/esm/createLucideIcon.js ***!
  \****************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ createLucideIcon),
/* harmony export */   toKebabCase: () => (/* binding */ toKebabCase)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _defaultAttributes_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./defaultAttributes.js */ "./node_modules/lucide-react/dist/esm/defaultAttributes.js");
/**
 * @license lucide-react v0.302.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */




const toKebabCase = (string) => string.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase().trim();
const createLucideIcon = (iconName, iconNode) => {
  const Component = (0,react__WEBPACK_IMPORTED_MODULE_0__.forwardRef)(
    ({ color = "currentColor", size = 24, strokeWidth = 2, absoluteStrokeWidth, className = "", children, ...rest }, ref) => (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(
      "svg",
      {
        ref,
        ..._defaultAttributes_js__WEBPACK_IMPORTED_MODULE_1__["default"],
        width: size,
        height: size,
        stroke: color,
        strokeWidth: absoluteStrokeWidth ? Number(strokeWidth) * 24 / Number(size) : strokeWidth,
        className: ["lucide", `lucide-${toKebabCase(iconName)}`, className].join(" "),
        ...rest
      },
      [
        ...iconNode.map(([tag, attrs]) => (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(tag, attrs)),
        ...Array.isArray(children) ? children : [children]
      ]
    )
  );
  Component.displayName = `${iconName}`;
  return Component;
};


//# sourceMappingURL=createLucideIcon.js.map


/***/ }),

/***/ "./node_modules/lucide-react/dist/esm/defaultAttributes.js":
/*!*****************************************************************!*\
  !*** ./node_modules/lucide-react/dist/esm/defaultAttributes.js ***!
  \*****************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ defaultAttributes)
/* harmony export */ });
/**
 * @license lucide-react v0.302.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */

var defaultAttributes = {
  xmlns: "http://www.w3.org/2000/svg",
  width: 24,
  height: 24,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round"
};


//# sourceMappingURL=defaultAttributes.js.map


/***/ }),

/***/ "./node_modules/lucide-react/dist/esm/icons/layers.js":
/*!************************************************************!*\
  !*** ./node_modules/lucide-react/dist/esm/icons/layers.js ***!
  \************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ Layers)
/* harmony export */ });
/* harmony import */ var _createLucideIcon_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../createLucideIcon.js */ "./node_modules/lucide-react/dist/esm/createLucideIcon.js");
/**
 * @license lucide-react v0.302.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */



const Layers = (0,_createLucideIcon_js__WEBPACK_IMPORTED_MODULE_0__["default"])("Layers", [
  [
    "path",
    {
      d: "m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z",
      key: "8b97xw"
    }
  ],
  ["path", { d: "m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65", key: "dd6zsq" }],
  ["path", { d: "m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65", key: "ep9fru" }]
]);


//# sourceMappingURL=layers.js.map


/***/ }),

/***/ "./src/blocks/step/allowedBlocks.ts":
/*!******************************************!*\
  !*** ./src/blocks/step/allowedBlocks.ts ***!
  \******************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   allowedBlocks: () => (/* binding */ allowedBlocks),
/* harmony export */   prioritizedInserterBlocks: () => (/* binding */ prioritizedInserterBlocks)
/* harmony export */ });
const allowedBlocks = ['gutenform/input', 'gutenform/textarea', 'gutenform/select', 'gutenform/file', 'gutenform/captcha', 'gutenform/honeypot', 'gutenform/step-navigation', 'gutenform/save-progress', 'core/columns', 'core/column', 'core/heading', 'core/paragraph', 'core/image', 'core/list', 'core/list-item', 'core/quote', 'core/table', 'core/video', 'core/embed', 'core/group'];
const prioritizedInserterBlocks = allowedBlocks.filter(block => block.startsWith('gutenform/'));

/***/ }),

/***/ "./src/blocks/step/block.json":
/*!************************************!*\
  !*** ./src/blocks/step/block.json ***!
  \************************************/
/***/ ((module) => {

module.exports = /*#__PURE__*/JSON.parse('{"$schema":"https://schemas.wp.org/trunk/block.json","apiVersion":3,"name":"gutenform/step","version":"0.1.0","title":"Step","category":"widgets","icon":"editor-ol","description":"Step container block for multi-step forms in Gutenform.","parent":["gutenform/form"],"example":{},"attributes":{"title":{"type":"string","default":"Step"},"stepId":{"type":"string","default":""}},"usesContext":["gutenform/activeStep"],"supports":{"html":false,"spacing":{"padding":true,"blockGap":true},"color":{"background":true,"text":true},"border":{"color":true,"radius":true,"width":true},"layout":{"allowSwitching":false,"allowInheriting":false,"default":{"type":"default","orientation":"vertical"}}},"textdomain":"gutenform","editorScript":"file:./index.js","editorStyle":"file:./index.css","style":"file:./style-index.css"}');

/***/ }),

/***/ "./src/blocks/step/edit.tsx":
/*!**********************************!*\
  !*** ./src/blocks/step/edit.tsx ***!
  \**********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ Edit)
/* harmony export */ });
/* harmony import */ var _lib_i18n__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @/lib/i18n */ "./src/lib/i18n.ts");
/* harmony import */ var _wordpress_block_editor__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @wordpress/block-editor */ "@wordpress/block-editor");
/* harmony import */ var _wordpress_block_editor__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_wordpress_block_editor__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @wordpress/components */ "@wordpress/components");
/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _wordpress_data__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @wordpress/data */ "@wordpress/data");
/* harmony import */ var _wordpress_data__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_wordpress_data__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @wordpress/element */ "@wordpress/element");
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(_wordpress_element__WEBPACK_IMPORTED_MODULE_4__);
/* harmony import */ var _allowedBlocks__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./allowedBlocks */ "./src/blocks/step/allowedBlocks.ts");
/* harmony import */ var _lib_use_unique_id__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../../lib/use-unique-id */ "./src/lib/use-unique-id.ts");
/* harmony import */ var _editor_css__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./editor.css */ "./src/blocks/step/editor.css");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! react/jsx-runtime */ "react/jsx-runtime");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8___default = /*#__PURE__*/__webpack_require__.n(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__);









function Edit(props) {
  var _gutenformActiveStep;
  const {
    attributes,
    setAttributes,
    clientId,
    context,
    isSelected
  } = props;

  // Automatically generate and set unique step ID
  (0,_lib_use_unique_id__WEBPACK_IMPORTED_MODULE_6__.useUniqueID)(attributes.stepId, clientId, attrs => setAttributes({
    stepId: attrs.id
  }), 'gutenform-step');

  // Get the active step from form context
  const activeStep = (_gutenformActiveStep = context?.['gutenform/activeStep']) !== null && _gutenformActiveStep !== void 0 ? _gutenformActiveStep : 0;
  const {
    updateBlockAttributes
  } = (0,_wordpress_data__WEBPACK_IMPORTED_MODULE_3__.useDispatch)('core/block-editor');

  // Compute this step's index and check if any descendant is selected
  const {
    stepIndex,
    hasSelectedDescendant,
    formClientId
  } = (0,_wordpress_data__WEBPACK_IMPORTED_MODULE_3__.useSelect)(select => {
    const {
      getBlockParents,
      getBlocks,
      hasSelectedInnerBlock,
      getBlockName
    } = select('core/block-editor');
    const parents = getBlockParents(clientId);
    const parentId = parents[parents.length - 1];

    // Find the form block
    let formId = null;
    for (const pid of [...parents].reverse()) {
      const name = getBlockName(pid);
      if (name === 'gutenform/form') {
        formId = pid;
        break;
      }
    }
    if (!parentId) return {
      stepIndex: 0,
      hasSelectedDescendant: false,
      formClientId: null
    };
    const siblings = getBlocks(parentId);
    const stepBlocks = siblings.filter(b => b.name === 'gutenform/step');
    const idx = stepBlocks.findIndex(b => b.clientId === clientId);
    return {
      stepIndex: idx >= 0 ? idx : 0,
      hasSelectedDescendant: hasSelectedInnerBlock(clientId, true),
      formClientId: formId
    };
  }, [clientId]);

  // Sync active step when this step or any of its descendants get selected
  (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_4__.useEffect)(() => {
    if ((isSelected || hasSelectedDescendant) && formClientId && stepIndex !== activeStep) {
      updateBlockAttributes(formClientId, {
        activeStep: stepIndex
      });
    }
  }, [isSelected, hasSelectedDescendant, stepIndex, activeStep, formClientId, updateBlockAttributes]);
  const isActive = stepIndex === activeStep;
  const blockProps = (0,_wordpress_block_editor__WEBPACK_IMPORTED_MODULE_1__.useBlockProps)({
    className: `gutenform-step ${isActive ? 'gutenform-step--active' : 'gutenform-step--hidden'}`,
    style: isActive ? {} : {
      display: 'none'
    },
    'data-step-index': stepIndex
  });
  const innerBlockProps = (0,_wordpress_block_editor__WEBPACK_IMPORTED_MODULE_1__.useInnerBlocksProps)({}, {
    allowedBlocks: _allowedBlocks__WEBPACK_IMPORTED_MODULE_5__.allowedBlocks,
    prioritizedInserterBlocks: _allowedBlocks__WEBPACK_IMPORTED_MODULE_5__.prioritizedInserterBlocks,
    renderAppender: _wordpress_block_editor__WEBPACK_IMPORTED_MODULE_1__.InnerBlocks.ButtonBlockAppender,
    templateLock: false,
    template: [['gutenform/input', {
      type: 'text'
    }], ['gutenform/step-navigation', {}]]
  });
  return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsxs)(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.Fragment, {
    children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)(_wordpress_block_editor__WEBPACK_IMPORTED_MODULE_1__.InspectorControls, {
      children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.PanelBody, {
        title: (0,_lib_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('step'),
        children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.TextControl, {
          label: (0,_lib_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('stepTitle'),
          value: attributes.title,
          onChange: title => setAttributes({
            title
          }),
          __next40pxDefaultSize: true,
          __nextHasNoMarginBottom: true
        })
      })
    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)("div", {
      ...blockProps,
      children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)("div", {
        ...innerBlockProps
      })
    })]
  });
}

/***/ }),

/***/ "./src/blocks/step/editor.css":
/*!************************************!*\
  !*** ./src/blocks/step/editor.css ***!
  \************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
// extracted by mini-css-extract-plugin


/***/ }),

/***/ "./src/blocks/step/index.tsx":
/*!***********************************!*\
  !*** ./src/blocks/step/index.tsx ***!
  \***********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _wordpress_blocks__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @wordpress/blocks */ "@wordpress/blocks");
/* harmony import */ var _wordpress_blocks__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_wordpress_blocks__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _components_block_atoms_BlockIcon__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../components/block-atoms/BlockIcon */ "./src/components/block-atoms/BlockIcon/index.tsx");
/* harmony import */ var _style_css__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./style.css */ "./src/blocks/step/style.css");
/* harmony import */ var _edit__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./edit */ "./src/blocks/step/edit.tsx");
/* harmony import */ var _save__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./save */ "./src/blocks/step/save.tsx");
/* harmony import */ var _block_json__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./block.json */ "./src/blocks/step/block.json");
/* harmony import */ var lucide_react__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! lucide-react */ "./node_modules/lucide-react/dist/esm/icons/layers.js");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! react/jsx-runtime */ "react/jsx-runtime");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7___default = /*#__PURE__*/__webpack_require__.n(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__);








(0,_wordpress_blocks__WEBPACK_IMPORTED_MODULE_0__.registerBlockType)(_block_json__WEBPACK_IMPORTED_MODULE_5__.name, {
  ..._block_json__WEBPACK_IMPORTED_MODULE_5__,
  icon: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(_components_block_atoms_BlockIcon__WEBPACK_IMPORTED_MODULE_1__["default"], {
    icon: lucide_react__WEBPACK_IMPORTED_MODULE_6__["default"]
  }),
  edit: _edit__WEBPACK_IMPORTED_MODULE_3__["default"],
  save: _save__WEBPACK_IMPORTED_MODULE_4__["default"]
});

/***/ }),

/***/ "./src/blocks/step/save.tsx":
/*!**********************************!*\
  !*** ./src/blocks/step/save.tsx ***!
  \**********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ save)
/* harmony export */ });
/* harmony import */ var _wordpress_block_editor__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @wordpress/block-editor */ "@wordpress/block-editor");
/* harmony import */ var _wordpress_block_editor__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_wordpress_block_editor__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react/jsx-runtime */ "react/jsx-runtime");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__);


function save(props) {
  const blockProps = _wordpress_block_editor__WEBPACK_IMPORTED_MODULE_0__.useBlockProps.save({
    className: 'gutenform-step',
    'data-step-title': props.attributes.title || 'Step'
  });
  return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)("div", {
    ...blockProps,
    children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_wordpress_block_editor__WEBPACK_IMPORTED_MODULE_0__.InnerBlocks.Content, {})
  });
}

/***/ }),

/***/ "./src/blocks/step/style.css":
/*!***********************************!*\
  !*** ./src/blocks/step/style.css ***!
  \***********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
// extracted by mini-css-extract-plugin


/***/ }),

/***/ "./src/components/block-atoms/BlockIcon/index.tsx":
/*!********************************************************!*\
  !*** ./src/components/block-atoms/BlockIcon/index.tsx ***!
  \********************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _styles_css__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./styles.css */ "./src/components/block-atoms/BlockIcon/styles.css");
/* harmony import */ var clsx__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! clsx */ "./node_modules/clsx/dist/clsx.mjs");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! react/jsx-runtime */ "react/jsx-runtime");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__);



const BlockIcon = ({
  icon,
  clean
}) => {
  const Icon = icon;
  return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsx)("div", {
    className: (0,clsx__WEBPACK_IMPORTED_MODULE_1__["default"])('gutenform-block-icon', clean && 'clean'),
    children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsx)(Icon, {})
  });
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (BlockIcon);

/***/ }),

/***/ "./src/components/block-atoms/BlockIcon/styles.css":
/*!*********************************************************!*\
  !*** ./src/components/block-atoms/BlockIcon/styles.css ***!
  \*********************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
// extracted by mini-css-extract-plugin


/***/ }),

/***/ "./src/lib/i18n.ts":
/*!*************************!*\
  !*** ./src/lib/i18n.ts ***!
  \*************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   __: () => (/* binding */ __),
/* harmony export */   translate: () => (/* binding */ translate)
/* harmony export */ });
/**
 * Internationalization utility for accessing translated strings.
 * 
 * Strings are translated in PHP and passed via window.gutenForm.strings
 * or window.gutenform.strings (for block editor).
 */

/**
 * Get a translated string by key.
 * 
 * @param key The string key
 * @param fallback Optional fallback string if key is not found
 * @returns The translated string or fallback
 */
function __(key, fallback) {
  // Normalize key to lowercase for case-insensitive lookup
  const normalizedKey = key.toLowerCase();

  // Try admin context first (window.gutenForm)
  const adminStrings = window.gutenForm?.strings;
  if (adminStrings) {
    // Try exact match first
    if (adminStrings[key]) {
      return adminStrings[key];
    }
    // Try normalized (lowercase) key
    if (adminStrings[normalizedKey]) {
      return adminStrings[normalizedKey];
    }
    // Try to find by matching values (for backward compatibility)
    for (const [k, v] of Object.entries(adminStrings)) {
      if (v === key) {
        return v;
      }
    }
  }

  // Try block editor context (window.gutenform)
  const editorStrings = window.gutenform?.strings;
  if (editorStrings) {
    // Try exact match first
    if (editorStrings[key]) {
      return editorStrings[key];
    }
    // Try normalized (lowercase) key
    if (editorStrings[normalizedKey]) {
      return editorStrings[normalizedKey];
    }
    // Try to find by matching values (for backward compatibility)
    for (const [k, v] of Object.entries(editorStrings)) {
      if (v === key) {
        return v;
      }
    }
  }

  // Return fallback or key if not found
  return fallback || key;
}

/**
 * Get a translated string by key (alias for __).
 * 
 * @param key The string key
 * @param fallback Optional fallback string if key is not found
 * @returns The translated string or fallback
 */
function translate(key, fallback) {
  return __(key, fallback);
}

/***/ }),

/***/ "./src/lib/use-unique-id.ts":
/*!**********************************!*\
  !*** ./src/lib/use-unique-id.ts ***!
  \**********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   generateUniqueBlockId: () => (/* binding */ generateUniqueBlockId),
/* harmony export */   useUniqueID: () => (/* binding */ useUniqueID)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _wordpress_data__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @wordpress/data */ "@wordpress/data");
/* harmony import */ var _wordpress_data__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_wordpress_data__WEBPACK_IMPORTED_MODULE_1__);



/**
 * Generates a unique block ID for input blocks.
 * 
 * @param currentId - The current ID value (may be empty or undefined)
 * @param clientId - The WordPress block clientId
 * @param getAllBlockIds - Function that returns all existing block IDs on the page
 * @param prefix - The prefix for the ID (default: 'gutenform-input')
 * @returns A unique ID string
 */
const generateUniqueBlockId = (currentId, clientId, getAllBlockIds, prefix = 'gutenform-input') => {
  // If no current ID, use the default pattern with clientId
  if (!currentId) {
    const defaultId = `${prefix}-${clientId}`;
    const existingIds = getAllBlockIds();

    // If default ID is already taken, append numbers
    if (existingIds.includes(defaultId)) {
      let counter = 1;
      let uniqueId = `${defaultId}-${counter}`;
      while (existingIds.includes(uniqueId)) {
        counter++;
        uniqueId = `${defaultId}-${counter}`;
      }
      return uniqueId;
    }
    return defaultId;
  }

  // Check if current ID matches the pattern [prefix]-[ID]
  const inputPattern = new RegExp(`^${prefix.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}-(.+)$`);
  const match = currentId.match(inputPattern);
  if (match) {
    // If it matches the pattern, use clientId with the prefix
    const newId = `${prefix}-${clientId}`;
    const existingIds = getAllBlockIds();

    // If the new ID is already taken, append numbers
    if (existingIds.includes(newId)) {
      let counter = 1;
      let uniqueId = `${newId}-${counter}`;
      while (existingIds.includes(uniqueId)) {
        counter++;
        uniqueId = `${newId}-${counter}`;
      }
      return uniqueId;
    }
    return newId;
  }

  // If it doesn't match the pattern, check for duplicates and append numbers
  const existingIds = getAllBlockIds();
  if (!existingIds.includes(currentId)) {
    return currentId;
  }

  // ID is duplicate, append numbers until unique
  let counter = 1;
  let uniqueId = `${currentId}-${counter}`;
  while (existingIds.includes(uniqueId)) {
    counter++;
    uniqueId = `${currentId}-${counter}`;
  }
  return uniqueId;
};

/**
 * React hook that automatically generates and sets a unique block ID.
 * 
 * @param currentId - The current ID value from block attributes
 * @param clientId - The WordPress block clientId
 * @param setAttributes - Function to update block attributes
 * @param prefix - The prefix for the ID (default: 'gutenform-input')
 */
const useUniqueID = (currentId, clientId, setAttributes, prefix = 'gutenform-input') => {
  // Get all blocks to check for duplicate IDs
  const allBlocks = (0,_wordpress_data__WEBPACK_IMPORTED_MODULE_1__.useSelect)(select => select('core/block-editor').getBlocks(), []);
  (0,react__WEBPACK_IMPORTED_MODULE_0__.useEffect)(() => {
    // Extract all block IDs from blocks that have an 'id' attribute
    // Exclude the current block by clientId to avoid false positives
    const getAllBlockIds = () => {
      return allBlocks.filter(block => block.clientId !== clientId) // Exclude current block
      .map(block => {
        // Check if block has attributes with an 'id' field
        if (block.attributes?.id) {
          return block.attributes.id;
        }
        return null;
      }).filter(id => id !== null);
    };
    const existingIds = getAllBlockIds();
    const uniqueId = generateUniqueBlockId(currentId, clientId, () => existingIds, prefix);
    if (uniqueId !== currentId) {
      setAttributes({
        id: uniqueId
      });
    }
  }, [currentId, clientId, allBlocks, setAttributes, prefix]);
};

/***/ }),

/***/ "@wordpress/block-editor":
/*!*************************************!*\
  !*** external ["wp","blockEditor"] ***!
  \*************************************/
/***/ ((module) => {

module.exports = window["wp"]["blockEditor"];

/***/ }),

/***/ "@wordpress/blocks":
/*!********************************!*\
  !*** external ["wp","blocks"] ***!
  \********************************/
/***/ ((module) => {

module.exports = window["wp"]["blocks"];

/***/ }),

/***/ "@wordpress/components":
/*!************************************!*\
  !*** external ["wp","components"] ***!
  \************************************/
/***/ ((module) => {

module.exports = window["wp"]["components"];

/***/ }),

/***/ "@wordpress/data":
/*!******************************!*\
  !*** external ["wp","data"] ***!
  \******************************/
/***/ ((module) => {

module.exports = window["wp"]["data"];

/***/ }),

/***/ "@wordpress/element":
/*!*********************************!*\
  !*** external ["wp","element"] ***!
  \*********************************/
/***/ ((module) => {

module.exports = window["wp"]["element"];

/***/ }),

/***/ "react":
/*!************************!*\
  !*** external "React" ***!
  \************************/
/***/ ((module) => {

module.exports = window["React"];

/***/ }),

/***/ "react/jsx-runtime":
/*!**********************************!*\
  !*** external "ReactJSXRuntime" ***!
  \**********************************/
/***/ ((module) => {

module.exports = window["ReactJSXRuntime"];

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = __webpack_modules__;
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/chunk loaded */
/******/ 	(() => {
/******/ 		var deferred = [];
/******/ 		__webpack_require__.O = (result, chunkIds, fn, priority) => {
/******/ 			if(chunkIds) {
/******/ 				priority = priority || 0;
/******/ 				for(var i = deferred.length; i > 0 && deferred[i - 1][2] > priority; i--) deferred[i] = deferred[i - 1];
/******/ 				deferred[i] = [chunkIds, fn, priority];
/******/ 				return;
/******/ 			}
/******/ 			var notFulfilled = Infinity;
/******/ 			for (var i = 0; i < deferred.length; i++) {
/******/ 				var [chunkIds, fn, priority] = deferred[i];
/******/ 				var fulfilled = true;
/******/ 				for (var j = 0; j < chunkIds.length; j++) {
/******/ 					if ((priority & 1 === 0 || notFulfilled >= priority) && Object.keys(__webpack_require__.O).every((key) => (__webpack_require__.O[key](chunkIds[j])))) {
/******/ 						chunkIds.splice(j--, 1);
/******/ 					} else {
/******/ 						fulfilled = false;
/******/ 						if(priority < notFulfilled) notFulfilled = priority;
/******/ 					}
/******/ 				}
/******/ 				if(fulfilled) {
/******/ 					deferred.splice(i--, 1)
/******/ 					var r = fn();
/******/ 					if (r !== undefined) result = r;
/******/ 				}
/******/ 			}
/******/ 			return result;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/jsonp chunk loading */
/******/ 	(() => {
/******/ 		// no baseURI
/******/ 		
/******/ 		// object to store loaded and loading chunks
/******/ 		// undefined = chunk not loaded, null = chunk preloaded/prefetched
/******/ 		// [resolve, reject, Promise] = chunk loading, 0 = chunk loaded
/******/ 		var installedChunks = {
/******/ 			"step/index": 0,
/******/ 			"step/style-index": 0
/******/ 		};
/******/ 		
/******/ 		// no chunk on demand loading
/******/ 		
/******/ 		// no prefetching
/******/ 		
/******/ 		// no preloaded
/******/ 		
/******/ 		// no HMR
/******/ 		
/******/ 		// no HMR manifest
/******/ 		
/******/ 		__webpack_require__.O.j = (chunkId) => (installedChunks[chunkId] === 0);
/******/ 		
/******/ 		// install a JSONP callback for chunk loading
/******/ 		var webpackJsonpCallback = (parentChunkLoadingFunction, data) => {
/******/ 			var [chunkIds, moreModules, runtime] = data;
/******/ 			// add "moreModules" to the modules object,
/******/ 			// then flag all "chunkIds" as loaded and fire callback
/******/ 			var moduleId, chunkId, i = 0;
/******/ 			if(chunkIds.some((id) => (installedChunks[id] !== 0))) {
/******/ 				for(moduleId in moreModules) {
/******/ 					if(__webpack_require__.o(moreModules, moduleId)) {
/******/ 						__webpack_require__.m[moduleId] = moreModules[moduleId];
/******/ 					}
/******/ 				}
/******/ 				if(runtime) var result = runtime(__webpack_require__);
/******/ 			}
/******/ 			if(parentChunkLoadingFunction) parentChunkLoadingFunction(data);
/******/ 			for(;i < chunkIds.length; i++) {
/******/ 				chunkId = chunkIds[i];
/******/ 				if(__webpack_require__.o(installedChunks, chunkId) && installedChunks[chunkId]) {
/******/ 					installedChunks[chunkId][0]();
/******/ 				}
/******/ 				installedChunks[chunkId] = 0;
/******/ 			}
/******/ 			return __webpack_require__.O(result);
/******/ 		}
/******/ 		
/******/ 		var chunkLoadingGlobal = globalThis["webpackChunkgutenform_builder"] = globalThis["webpackChunkgutenform_builder"] || [];
/******/ 		chunkLoadingGlobal.forEach(webpackJsonpCallback.bind(null, 0));
/******/ 		chunkLoadingGlobal.push = webpackJsonpCallback.bind(null, chunkLoadingGlobal.push.bind(chunkLoadingGlobal));
/******/ 	})();
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module depends on other loaded chunks and execution need to be delayed
/******/ 	var __webpack_exports__ = __webpack_require__.O(undefined, ["step/style-index"], () => (__webpack_require__("./src/blocks/step/index.tsx")))
/******/ 	__webpack_exports__ = __webpack_require__.O(__webpack_exports__);
/******/ 	
/******/ })()
;
//# sourceMappingURL=index.js.map