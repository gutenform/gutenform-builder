import { __ } from '@/lib/i18n';
import { PanelBody, SelectControl, TextControl, Button } from '@wordpress/components';
import { useFormFieldList } from '@/hooks/useFormFieldList';
import type {
	ConditionalShow,
	ConditionalShowOperator,
	ConditionalShowRule,
} from '@/blockTypes/conditionalLogic';
import { isConditionalShowGroup } from '@/blockTypes/conditionalLogic';

const OPERATOR_OPTIONS: { value: ConditionalShowOperator; label: string }[] = [
	{ value: 'equals', label: __('conditionalOperatorEquals', 'Equals') },
	{ value: 'notEquals', label: __('conditionalOperatorNotEquals', 'Does not equal') },
	{ value: 'isEmpty', label: __('conditionalOperatorIsEmpty', 'Is empty') },
	{ value: 'isNotEmpty', label: __('conditionalOperatorIsNotEmpty', 'Is not empty') },
	{ value: 'contains', label: __('conditionalOperatorContains', 'Contains') },
];

function normalizeToGroup(conditionalShow?: ConditionalShow | null): {
	logic: 'and' | 'or';
	conditions: ConditionalShowRule[];
} {
	const empty = [{ sourceFieldName: '', operator: 'equals' as const }];
	if (!conditionalShow) return { logic: 'and', conditions: empty };
	if (isConditionalShowGroup(conditionalShow)) {
		return {
			logic: conditionalShow.logic,
			conditions: conditionalShow.conditions.length ? conditionalShow.conditions : empty,
		};
	}
	return { logic: 'and', conditions: [conditionalShow] };
}

function toConditionalShow(logic: 'and' | 'or', conditions: ConditionalShowRule[]): ConditionalShow | undefined {
	if (conditions.length === 0) return undefined;
	const valid = conditions.filter((c) => c.sourceFieldName);
	if (valid.length === 0) return undefined;
	if (conditions.length === 1 && valid.length === 1) return valid[0];
	return { logic, conditions };
}

export type ProviderConditionalLogicPanelProps = {
	formBlockClientId: string;
	conditionalShow?: ConditionalShow | null;
	onChange: (conditionalShow: ConditionalShow | undefined) => void;
};

export function ProviderConditionalLogicPanel({
	formBlockClientId,
	conditionalShow,
	onChange,
}: ProviderConditionalLogicPanelProps) {
	const fieldList = useFormFieldList(formBlockClientId, formBlockClientId);
	const { logic, conditions } = normalizeToGroup(conditionalShow);

	const fieldOptions = [
		{ value: '', label: __('conditionalShowNone', '— None —') },
		...fieldList.map((f) => ({ value: f.name, label: f.label || f.name })),
	];

	const updateCondition = (index: number, patch: Partial<ConditionalShowRule>) => {
		const next = [...conditions];
		next[index] = { ...(next[index] ?? { sourceFieldName: '', operator: 'equals' }), ...patch };
		onChange(toConditionalShow(logic, next));
	};

	const addCondition = () => {
		onChange(toConditionalShow(logic, [...conditions, { sourceFieldName: '', operator: 'equals' }]));
	};

	const removeCondition = (index: number) => {
		const next = conditions.filter((_, i) => i !== index);
		onChange(toConditionalShow(logic, next));
	};

	const setLogic = (newLogic: 'and' | 'or') => {
		onChange(toConditionalShow(newLogic, conditions));
	};

	const clearAll = () => {
		onChange(undefined);
	};

	const hasAny = conditions.some((c) => c.sourceFieldName);

	return (
		<PanelBody title={__('providerOnlyWhen', 'Provider only when')} initialOpen={!!hasAny}>
			{conditions.map((condition, index) => {
				const needsValue =
					condition.operator === 'equals' ||
					condition.operator === 'notEquals' ||
					condition.operator === 'contains';
				const sourceField = fieldList.find((f) => f.name === condition.sourceFieldName);
				const valueOptions = sourceField?.options?.length
					? [
							{ value: '', label: __('conditionalSelectValue', 'Select value…') },
							...sourceField.options.map((o) => ({ value: o.value, label: o.label || o.value })),
						]
					: null;

				return (
					<div key={index} style={{ marginBottom: 16 }}>
						<div
							style={{
								display: 'flex',
								alignItems: 'center',
								gap: 8,
								flexWrap: 'wrap',
							}}
						>
							<div style={{ flexShrink: 0, width: 56 }}>
								{index === 0 ? (
									<span style={{ fontSize: 13, fontWeight: 500, whiteSpace: 'nowrap' }}>
										{__('conditionalWhere', 'Where')}
									</span>
								) : (
									<SelectControl
										value={logic}
										options={[
											{ value: 'and', label: __('conditionalLogicAnd', 'AND') },
											{ value: 'or', label: __('conditionalLogicOr', 'OR') },
										]}
										onChange={(v) => setLogic(v as 'and' | 'or')}
										__next40pxDefaultSize
										__nextHasNoMarginBottom
									/>
								)}
							</div>
							<div style={{ flex: 1, minWidth: 100 }}>
								<SelectControl
									value={condition.sourceFieldName || ''}
									options={fieldOptions}
									onChange={(sourceFieldName) =>
										updateCondition(index, {
											sourceFieldName: sourceFieldName || '',
											value: undefined,
										})
									}
									__next40pxDefaultSize
									__nextHasNoMarginBottom
								/>
							</div>
							<div style={{ flex: 1, minWidth: 100 }}>
								<SelectControl
									value={condition.operator || 'equals'}
									options={OPERATOR_OPTIONS}
									onChange={(operator) =>
										updateCondition(index, { operator: operator as ConditionalShowOperator })
									}
									__next40pxDefaultSize
									__nextHasNoMarginBottom
								/>
							</div>
							<div style={{ flex: 1, minWidth: 100 }}>
								{needsValue ? (
									valueOptions ? (
										<SelectControl
											value={condition.value || ''}
											options={valueOptions}
											onChange={(value) => updateCondition(index, { value: value || undefined })}
											__next40pxDefaultSize
											__nextHasNoMarginBottom
										/>
									) : (
										<TextControl
											value={condition.value || ''}
											onChange={(value) => updateCondition(index, { value: value || undefined })}
											__next40pxDefaultSize
											__nextHasNoMarginBottom
											placeholder={__('conditionalValue', 'Value')}
										/>
									)
								) : null}
							</div>
							<Button
								isDestructive
								variant="tertiary"
								size="small"
								icon="trash"
								onClick={() => removeCondition(index)}
								aria-label={__('delete', 'Delete')}
							/>
						</div>
					</div>
				);
			})}
			<div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
				<Button variant="secondary" icon="plus" onClick={addCondition}>
					{__('conditionalAddFilter', 'Add condition')}
				</Button>
				{conditions.length > 1 && (
					<Button isDestructive variant="tertiary" size="small" onClick={clearAll}>
						{__('conditionalDeleteAll', 'Delete all')}
					</Button>
				)}
			</div>
		</PanelBody>
	);
}
