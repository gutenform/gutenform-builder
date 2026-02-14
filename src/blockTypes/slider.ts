import { type GlobalFieldAttributes } from './globalField';

/** noUiSlider orientation: horizontal or vertical */
export type SliderOrientation = 'horizontal' | 'vertical';

/** noUiSlider direction: ltr or rtl */
export type SliderDirection = 'ltr' | 'rtl';

export type SliderAttributes = GlobalFieldAttributes & {
	min: number;
	max: number;
	step: number;
	range: boolean;
	defaultValueStart?: number;
	defaultValueEnd?: number;
	/** noUiSlider: orientation (horizontal | vertical). Default: horizontal */
	orientation?: SliderOrientation;
	/** noUiSlider: direction (ltr | rtl). Default: ltr */
	direction?: SliderDirection;
	/** noUiSlider: show tooltips with current value. Default: false */
	tooltips?: boolean;
	/** noUiSlider: for range slider, connect handles with a bar. Default: true when range */
	connect?: boolean;
	/** noUiSlider: minimum distance between two handles (range only). Optional. */
	margin?: number | null;
	/** noUiSlider: maximum distance between two handles (range only). Optional. */
	limit?: number | null;
	/** noUiSlider: padding from slider edges. paddingStart = left/top, paddingEnd = right/bottom. 0 = no padding. */
	paddingStart?: number;
	paddingEnd?: number;
	/** noUiSlider: animate when setting value programmatically. Default: true */
	animate?: boolean;
	/** noUiSlider: animation duration in ms. Default: 300 */
	animationDuration?: number;
};
