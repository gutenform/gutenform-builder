import { type GlobalFieldAttributes } from './globalField';

export type DateTimeAttributes = GlobalFieldAttributes & {
	mode: 'date' | 'time' | 'datetime';
	range: boolean;
	defaultValueEnd?: string;
	min?: string;
	max?: string;
};
