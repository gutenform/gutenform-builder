import type { ConditionalShow } from './conditionalLogic';

export type StepAttributes = {
	title: string;
	stepId: string;
	/** When set, this step is only shown when the condition is met. */
	conditionalShow?: ConditionalShow;
};
