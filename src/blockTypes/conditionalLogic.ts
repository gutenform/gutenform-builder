/**
 * Shared types for conditional show logic (fields and steps).
 */
export type ConditionalShowOperator =
	| 'equals'
	| 'notEquals'
	| 'isEmpty'
	| 'isNotEmpty'
	| 'contains';

/** Single condition (one field + operator + optional value). */
export type ConditionalShowRule = {
	sourceFieldName: string;
	operator: ConditionalShowOperator;
	value?: string;
};

/**
 * Multiple conditions with AND/OR.
 * Backward compat: a single ConditionalShowRule (no .conditions) is treated as one condition.
 */
export type ConditionalShow =
	| ConditionalShowRule
	| {
			logic: 'and' | 'or';
			conditions: ConditionalShowRule[];
	  };

export function isConditionalShowGroup(
	c: ConditionalShow
): c is { logic: 'and' | 'or'; conditions: ConditionalShowRule[] } {
	return c !== null && typeof c === 'object' && 'conditions' in c && Array.isArray((c as any).conditions);
}

/** True if we should output data-conditional-show (single rule or group with conditions). */
export function hasConditionalShowToOutput(c: ConditionalShow | undefined | null): boolean {
	if (!c || typeof c !== 'object') return false;
	if ('sourceFieldName' in c && c.sourceFieldName) return true;
	if ('conditions' in c && Array.isArray((c as any).conditions) && (c as any).conditions.length > 0) return true;
	return false;
}
