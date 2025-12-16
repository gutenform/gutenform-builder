/**
 * CAPTCHA Block Frontend Script
 * Handles initialization of FriendlyCaptcha and Google reCAPTCHA
 */

window.addEventListener('DOMContentLoaded', () => {
	const captchaBlocks = document.querySelectorAll('.wp-block-gutenform-captcha');
	
	captchaBlocks.forEach((block) => {
		const captchaType = block.getAttribute('data-captcha-type');
		const siteKey = block.getAttribute('data-site-key');
		const container = block.querySelector('.gutenform-captcha-container') as HTMLElement;
		
		if (!container) return;

		if (captchaType === 'friendlycaptcha' && siteKey) {
			initFriendlyCaptcha(container, siteKey);
		} else if (captchaType === 'recaptcha' && siteKey) {
			initRecaptcha(container, siteKey);
		}
	});
});

function initFriendlyCaptcha(container: HTMLElement, siteKey: string) {
	// Load FriendlyCaptcha SDK
	const script = document.createElement('script');
	script.src = 'https://cdn.jsdelivr.net/npm/friendly-challenge@0.9.8/widget.module.min.js';
	script.type = 'module';
	script.onload = () => {
		// @ts-ignore - FriendlyCaptcha is loaded dynamically
		if (window.FriendlyChallenge) {
			const widget = document.createElement('div');
			widget.className = 'frc-captcha';
			widget.setAttribute('data-sitekey', siteKey);
			container.appendChild(widget);
		}
	};
	document.head.appendChild(script);
}

function initRecaptcha(container: HTMLElement, siteKey: string) {
	// Load Google reCAPTCHA v3
	const script = document.createElement('script');
	script.src = `https://www.google.com/recaptcha/api.js?render=${siteKey}`;
	script.onload = () => {
		// @ts-ignore - grecaptcha is loaded dynamically
		if (window.grecaptcha) {
			// @ts-ignore
			window.grecaptcha.ready(() => {
				// @ts-ignore
				window.grecaptcha.execute(siteKey, { action: 'submit' }).then((token: string) => {
					const input = document.createElement('input');
					input.type = 'hidden';
					input.name = 'g-recaptcha-response';
					input.value = token;
					container.appendChild(input);
				});
			});
		}
	};
	document.head.appendChild(script);
}

