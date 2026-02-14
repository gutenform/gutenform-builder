import { type GlobalFieldAttributes } from './globalField';

export type SliderAttributes = GlobalFieldAttributes & {
	min: number;
	max: number;
	step: number;
	range: boolean;
	defaultValueStart?: number;
	defaultValueEnd?: number;
};
