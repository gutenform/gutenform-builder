/**
 * Sync range input values to hidden inputs so they are submitted with the form.
 */
document.addEventListener('DOMContentLoaded', () => {
	const wrappers = document.querySelectorAll<HTMLElement>(
		'.gutenform-field .gutenform-slider-wrapper'
	);
	wrappers.forEach((wrapper) => {
		const isRange = wrapper.closest('.gutenform-field')?.getAttribute('data-slider-range') === 'true';
		const rangeInputs = wrapper.querySelectorAll<HTMLInputElement>('input[type="range"]');
		const hiddenInputs = wrapper.querySelectorAll<HTMLInputElement>('input[type="hidden"]');

		if (isRange && rangeInputs.length === 2 && hiddenInputs.length === 2) {
			const [minRange, maxRange] = Array.from(rangeInputs);
			const [minHidden, maxHidden] = Array.from(hiddenInputs);
			const sync = () => {
				minHidden.value = minRange.value;
				maxHidden.value = maxRange.value;
			};
			minRange.addEventListener('input', sync);
			minRange.addEventListener('change', sync);
			maxRange.addEventListener('input', sync);
			maxRange.addEventListener('change', sync);
		} else if (!isRange && rangeInputs.length === 1 && hiddenInputs.length === 1) {
			const [rangeInput] = rangeInputs;
			const [hiddenInput] = hiddenInputs;
			const sync = () => {
				hiddenInput.value = rangeInput.value;
			};
			rangeInput.addEventListener('input', sync);
			rangeInput.addEventListener('change', sync);
		}
	});
});
