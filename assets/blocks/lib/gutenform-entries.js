/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	// The require scope
/******/ 	var __webpack_require__ = {};
/******/ 	
/************************************************************************/
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
/************************************************************************/
var __webpack_exports__ = {};
/*!**************************************!*\
  !*** ./src/lib/gutenform-entries.ts ***!
  \**************************************/
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   GutenformEntries: () => (/* binding */ GutenformEntries)
/* harmony export */ });
/**
 * Gutenform Entries API Class
 * 
 * Provides a TypeScript class to interact with the Gutenform Entries API.
 * This class is available globally via window.gutenform.Entries
 * 
 * @example
 * // Create a new entry
 * const entry = await window.gutenform.Entries.create({
 *   mailbox_id: 1,
 *   form_identifier: 'contact-form',
 *   data: {
 *     name: 'John Doe',
 *     email: 'john@example.com',
 *     message: 'Hello World'
 *   }
 * });
 */

// Type definitions

// Extend Window interface

/**
 * Gutenform Entries API Class
 */
class GutenformEntries {
  /**
   * Constructor
   * 
   * @param config Configuration object
   */
  constructor(config) {
    if (!config || !config.apiUrl) {
      throw new Error('GutenformEntries: apiUrl is required');
    }
    this.apiUrl = config.apiUrl;
    this.nonce = config.nonce || '';
    this.namespace = config.namespace || 'gutenform/v1';
  }

  /**
   * Get the full API URL for an endpoint
   * 
   * @param endpoint API endpoint
   * @returns Full API URL
   */
  getApiUrl(endpoint) {
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
    return `${this.apiUrl}${this.namespace}/${cleanEndpoint}`;
  }

  /**
   * Make an API request
   * 
   * @param endpoint API endpoint
   * @param options Fetch options
   * @returns API response
   */
  async request(endpoint, options = {}) {
    const url = this.getApiUrl(endpoint);
    const defaultHeaders = {
      'Content-Type': 'application/json'
    };

    // Add WordPress REST API nonce if available
    if (this.nonce) {
      defaultHeaders['X-WP-Nonce'] = this.nonce;
    }
    const response = await fetch(url, {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers
      }
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({
        message: `HTTP error! status: ${response.status}`
      }));
      throw new Error(error.message || `HTTP error! status: ${response.status}`);
    }
    return response.json();
  }

  /**
   * Create a new entry
   * 
   * @param entryData Entry data
   * @returns Created entry
   * 
   * @example
   * const entry = await entries.create({
   *   mailbox_id: 1,
   *   form_identifier: 'contact-form',
   *   data: {
   *     name: 'John Doe',
   *     email: 'john@example.com'
   *   }
   * });
   */
  async create(entryData) {
    if (!entryData || !entryData.mailbox_id) {
      throw new Error('mailbox_id is required');
    }
    if (!entryData.data) {
      throw new Error('data is required');
    }
    const response = await this.request('entries/create', {
      method: 'POST',
      body: JSON.stringify(entryData)
    });
    if (!response.success) {
      throw new Error(response.message || 'Failed to create entry');
    }
    return response.data;
  }

  /**
   * Get entries with optional filters
   * 
   * @param filters Filter options
   * @returns Entries response with data, total, page, per_page
   */
  async get(filters = {}) {
    const queryParams = new URLSearchParams();
    if (filters.mailbox_id) {
      queryParams.append('mailbox_id', filters.mailbox_id.toString());
    }
    if (filters.form_identifier) {
      queryParams.append('form_identifier', filters.form_identifier);
    }
    if (filters.is_read !== undefined) {
      queryParams.append('is_read', filters.is_read ? '1' : '0');
    }
    if (filters.page) {
      queryParams.append('page', filters.page.toString());
    }
    if (filters.per_page) {
      queryParams.append('per_page', filters.per_page.toString());
    }
    const endpoint = 'entries/get' + (queryParams.toString() ? '?' + queryParams.toString() : '');
    const response = await this.request(endpoint, {
      method: 'GET'
    });
    if (!response.success) {
      throw new Error(response.message || 'Failed to get entries');
    }
    return response.data;
  }

  /**
   * Get a single entry by ID
   * 
   * @param id Entry ID
   * @returns Entry data
   */
  async getById(id) {
    if (!id) {
      throw new Error('Entry ID is required');
    }
    const response = await this.request(`entries/get/${id}`, {
      method: 'GET'
    });
    if (!response.success) {
      throw new Error(response.message || 'Failed to get entry');
    }
    return response.data;
  }

  /**
   * Update an entry
   * 
   * @param entryData Entry data with id
   * @returns Updated entry
   */
  async update(entryData) {
    if (!entryData || !entryData.id) {
      throw new Error('Entry ID is required');
    }
    const response = await this.request('entries/update', {
      method: 'POST',
      body: JSON.stringify(entryData)
    });
    if (!response.success) {
      throw new Error(response.message || 'Failed to update entry');
    }
    return response.data;
  }

  /**
   * Delete an entry
   * 
   * @param id Entry ID
   * @returns Success response
   */
  async delete(id) {
    if (!id) {
      throw new Error('Entry ID is required');
    }
    const response = await this.request('entries/delete', {
      method: 'POST',
      body: JSON.stringify({
        id
      })
    });
    if (!response.success) {
      throw new Error(response.message || 'Failed to delete entry');
    }
    return response.data;
  }

  /**
   * Mark an entry as read or unread
   * 
   * @param id Entry ID
   * @param is_read Whether to mark as read (default: true)
   * @returns Updated entry
   */
  async markRead(id, is_read = true) {
    if (!id) {
      throw new Error('Entry ID is required');
    }
    const response = await this.request('entries/mark-read', {
      method: 'POST',
      body: JSON.stringify({
        id,
        is_read
      })
    });
    if (!response.success) {
      throw new Error(response.message || 'Failed to update entry');
    }
    return response.data;
  }
}

// Initialize and expose to window object
if (typeof window !== 'undefined') {
  // Ensure gutenform object exists
  window.gutenform = window.gutenform || {};

  // Initialize Entries class if config is available
  if (window.gutenform.apiUrl) {
    window.gutenform.Entries = new GutenformEntries({
      apiUrl: window.gutenform.apiUrl,
      nonce: window.gutenform.nonce || '',
      namespace: window.gutenform.namespace || 'gutenform/v1'
    });
  } else {
    // Store constructor for later initialization
    window.gutenform.EntriesClass = GutenformEntries;

    // Initialize when config is available
    const initEntries = () => {
      if (window.gutenform?.apiUrl) {
        window.gutenform.Entries = new GutenformEntries({
          apiUrl: window.gutenform.apiUrl,
          nonce: window.gutenform.nonce || '',
          namespace: window.gutenform.namespace || 'gutenform/v1'
        });
      }
    };

    // Try to initialize on DOM ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initEntries);
    } else {
      initEntries();
    }
  }
}

/******/ })()
;
//# sourceMappingURL=gutenform-entries.js.map