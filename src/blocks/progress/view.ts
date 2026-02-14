/**
 * Progress block frontend logic.
 * Builds the progress UI dynamically and listens for step change events.
 */

window.addEventListener('DOMContentLoaded', () => {
	const progressBlocks = document.querySelectorAll<HTMLElement>('.wp-block-gutenform-progress');

	progressBlocks.forEach((progressEl) => {
		const form = progressEl.closest('.wp-block-gutenform-form');
		if (!form) return;

		const variant = progressEl.getAttribute('data-variant') || 'bubbles';
		const steps = form.querySelectorAll('.wp-block-gutenform-step');
		const totalSteps = steps.length;

		if (totalSteps === 0) return;

		// Collect step titles
		const stepTitles: string[] = [];
		steps.forEach((step, index) => {
			const title = step.getAttribute('data-step-title') || `Step ${index + 1}`;
			stepTitles.push(title);
		});

		// Build initial UI
		buildProgressUI(progressEl, variant, stepTitles, 0, totalSteps);

		// Listen for step changes
		form.addEventListener('gutenform:stepchange', ((e: CustomEvent) => {
			const { currentStep } = e.detail;
			buildProgressUI(progressEl, variant, stepTitles, currentStep, totalSteps);
		}) as EventListener);
	});
});

function buildProgressUI(
	container: HTMLElement,
	variant: string,
	stepTitles: string[],
	currentStep: number,
	totalSteps: number
) {
	container.innerHTML = '';

	if (variant === 'bar') {
		buildBarUI(container, currentStep, totalSteps);
	} else {
		buildBubblesUI(container, stepTitles, currentStep, totalSteps);
	}
}

function buildBarUI(container: HTMLElement, currentStep: number, totalSteps: number) {
	const percent = totalSteps > 1
		? Math.round((currentStep / (totalSteps - 1)) * 100)
		: 100;

	const bar = document.createElement('div');
	bar.className = 'gutenform-progress-bar';

	const track = document.createElement('div');
	track.className = 'gutenform-progress-bar__track';

	const fill = document.createElement('div');
	fill.className = 'gutenform-progress-bar__fill';
	fill.style.width = `${percent}%`;

	const label = document.createElement('div');
	label.className = 'gutenform-progress-bar__label';
	label.textContent = `${percent}%`;

	track.appendChild(fill);
	bar.appendChild(track);
	bar.appendChild(label);
	container.appendChild(bar);
}

function buildBubblesUI(
	container: HTMLElement,
	stepTitles: string[],
	currentStep: number,
	totalSteps: number
) {
	const bubbles = document.createElement('div');
	bubbles.className = 'gutenform-progress-bubbles';

	stepTitles.forEach((title, index) => {
		const bubble = document.createElement('div');
		bubble.className = 'gutenform-progress-bubble';

		if (index < currentStep) {
			bubble.classList.add('gutenform-progress-bubble--completed');
		} else if (index === currentStep) {
			bubble.classList.add('gutenform-progress-bubble--active');
		}

		const circle = document.createElement('div');
		circle.className = 'gutenform-progress-bubble__circle';
		circle.textContent = String(index + 1);

		const titleEl = document.createElement('div');
		titleEl.className = 'gutenform-progress-bubble__title';
		titleEl.textContent = title;

		bubble.appendChild(circle);
		bubble.appendChild(titleEl);

		if (index < totalSteps - 1) {
			const line = document.createElement('div');
			line.className = 'gutenform-progress-bubble__line';
			if (index < currentStep) {
				line.classList.add('gutenform-progress-bubble__line--completed');
			}
			bubble.appendChild(line);
		}

		bubbles.appendChild(bubble);
	});

	container.appendChild(bubbles);
}
