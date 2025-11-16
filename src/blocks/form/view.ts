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

interface GutenformEntries {
	create(entryData: {
		mailbox_id: number;
		form_identifier?: string;
		wp_post_id?: number;
		data: Record<string, any>;
		ip_address?: string;
		is_read?: boolean;
	}): Promise<any>;
	get(filters?: {
		mailbox_id?: number;
		form_identifier?: string;
		is_read?: boolean;
		page?: number;
		per_page?: number;
	}): Promise<any>;
	getById(id: number): Promise<any>;
	update(entryData: {
		id: number;
		mailbox_id?: number;
		form_identifier?: string;
		wp_post_id?: number;
		data?: Record<string, any>;
		ip_address?: string;
		is_read?: boolean;
	}): Promise<any>;
	delete(id: number): Promise<any>;
	markRead(id: number, is_read?: boolean): Promise<any>;
}

interface GutenformWindow extends Window {
	gutenform?: {
		assetsUrl?: string;
		pluginUrl?: string;
		apiUrl?: string;
		nonce?: string;
		namespace?: string;
		Entries?: GutenformEntries;
		EntriesClass?: new (config: {
			apiUrl: string;
			nonce?: string;
			namespace?: string;
		}) => GutenformEntries;
	};
}

const win = window as unknown as GutenformWindow;

window.addEventListener('DOMContentLoaded', () => {
	const form = document.querySelectorAll('.wp-block-gutenform-form');
	form.forEach(form => {
        const formDataOptions = form.getAttribute('data-form-options');
        if (!formDataOptions) {
            console.error('Form options not found');
            return;
        };
        const formOptions = JSON.parse(formDataOptions);
        console.log(formOptions);

		// Load skin CSS dynamically
		const skinName = form.getAttribute('data-skin') || formOptions.skin || 'default';
		if (skinName) {
			loadSkinCSS(skinName);
		}

		form.addEventListener('submit', (e) => {
			e.preventDefault();
			const formIdentifier = formOptions.formId;
			const mailboxId = formOptions.mailboxId;
			if (!formIdentifier) {
				console.error('Form identifier not found');
				return;
			}
			const formData = new FormData(form as HTMLFormElement);
			const data = Object.fromEntries(formData);
			console.log(data);
			if (!win.gutenform?.Entries) {
				console.error('Entries API not found');
				return;
			}
			win.gutenform?.Entries.create({
				mailbox_id: mailboxId,
				form_identifier: formIdentifier,
				data,
			});
		});
	});
});

/**
 * Load skin CSS dynamically
 */
function loadSkinCSS(skinName: string) { 
	// Check if skin CSS is already loaded
	const existingLink = document.querySelector(`link[data-gutenform-skin="${skinName}"]`);
	if (existingLink) {
		return;
	}

	// Create link element for skin CSS
	const link = document.createElement('link');
	link.rel = 'stylesheet';
	// Load from assets/skins (built skins)
	const assetsUrl = win.gutenform?.assetsUrl || '';
	link.href = `${assetsUrl}/blocks/skins/${skinName}/index.css`;
	link.setAttribute('data-gutenform-skin', skinName);
	document.head.appendChild(link);
}
