/**
 * Resolves i18n placeholders in template JSON.
 * In JSON, use { "__": "translationKey" } or { "__": "key", "fallback": "Fallback text" }.
 */

type I18nPlaceholder = { __: string; fallback?: string };

function isI18nPlaceholder(obj: unknown): obj is I18nPlaceholder {
	return (
		typeof obj === 'object' &&
		obj !== null &&
		'__' in obj &&
		typeof (obj as I18nPlaceholder).__ === 'string'
	);
}

function resolveValue(
	val: unknown,
	translate: (key: string, fallback?: string) => string
): unknown {
	if (isI18nPlaceholder(val)) {
		return translate(val.__, val.fallback);
	}
	if (Array.isArray(val)) {
		return val.map((item) => resolveValue(item, translate));
	}
	if (val !== null && typeof val === 'object') {
		const out: Record<string, unknown> = {};
		for (const [k, v] of Object.entries(val)) {
			out[k] = resolveValue(v, translate);
		}
		return out;
	}
	return val;
}

/**
 * Recursively replace all { "__": "key", "fallback": "..." } in template value with translated strings.
 */
export function resolveTemplateValue(
	value: unknown,
	translate: (key: string, fallback?: string) => string
): unknown {
	return resolveValue(value, translate);
}
