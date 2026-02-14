/**
 * Save Progress frontend logic.
 * Saves all form field values + current step to sessionStorage.
 */

window.addEventListener('DOMContentLoaded', () => {
	const saveButtons = document.querySelectorAll<HTMLButtonElement>('[data-action="save-progress"]');

	saveButtons.forEach((btn) => {
		const form = btn.closest('.wp-block-gutenform-form') as HTMLFormElement | null;
		if (!form) return;

		btn.addEventListener('click', (e) => {
			e.preventDefault();

			const formDataOptions = form.getAttribute('data-form-options');
			if (!formDataOptions) return;

			const formOptions = JSON.parse(formDataOptions);
			const formId = formOptions.formId;
			if (!formId) return;

			// Collect all form field values
			const formData = new FormData(form);
			const data: Record<string, string> = {};
			formData.forEach((value, key) => {
				if (typeof value === 'string') {
					data[key] = value;
				}
			});

			// Determine current step index
			const steps = form.querySelectorAll('.wp-block-gutenform-step');
			let currentStepIndex = 0;
			steps.forEach((step, index) => {
				if (step.classList.contains('gutenform-step--active')) {
					currentStepIndex = index;
				}
			});

			// Save to sessionStorage
			const progressData = {
				formId,
				fields: data,
				currentStep: currentStepIndex,
				savedAt: new Date().toISOString(),
			};

			try {
				sessionStorage.setItem(
					`gutenform_progress_${formId}`,
					JSON.stringify(progressData)
				);

				// Show brief confirmation
				showSaveConfirmation(btn);
			} catch (error) {
				console.error('Failed to save form progress:', error);
			}
		});
	});
});

/**
 * Show a brief visual confirmation that progress was saved
 */
function showSaveConfirmation(btn: HTMLButtonElement) {
	const originalText = btn.textContent;
	btn.textContent = '✓ Saved!';
	btn.classList.add('gutenform-save-progress-btn--saved');

	setTimeout(() => {
		btn.textContent = originalText;
		btn.classList.remove('gutenform-save-progress-btn--saved');
	}, 2000);
}
