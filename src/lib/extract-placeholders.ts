/**
 * Utility functions for extracting and working with placeholders in provider settings.
 */

/**
 * Standard system placeholders that should not be treated as form fields.
 */
export const STANDARD_PLACEHOLDERS = [
  'form_identifier',
  'form_title',
  'site_name',
  'date',
  'time',
  'ip_address',
  'all_fields',
  'form_primary_mail',
  'content',
];

/**
 * Returns an array of standard placeholder names (without curly braces).
 */
export function getStandardPlaceholders(): string[] {
  return [...STANDARD_PLACEHOLDERS];
}

/**
 * Extracts field placeholders from a text string.
 * Only returns field placeholders, excluding system placeholders.
 * 
 * @param text - The text to analyze
 * @returns Array of field names (without curly braces)
 */
export function extractFieldPlaceholdersFromText(text: string): string[] {
  if (!text || typeof text !== 'string') {
    return [];
  }

  // Match all placeholders in format {field_name}
  const placeholderRegex = /\{([a-z0-9_]+)\}/gi;
  const matches = text.matchAll(placeholderRegex);
  const fieldNames = new Set<string>();

  for (const match of matches) {
    const fieldName = match[1].toLowerCase();
    // Only include if it's not a standard placeholder
    if (!STANDARD_PLACEHOLDERS.includes(fieldName)) {
      fieldNames.add(fieldName);
    }
  }

  return Array.from(fieldNames);
}

/**
 * Extracts all field placeholders from provider settings.
 * Analyzes subject, body, from_email, from_name, and to_email fields.
 * 
 * @param providerSettings - The provider settings object
 * @returns Array of unique field names (without curly braces)
 */
export function extractFieldPlaceholders(providerSettings: Record<string, any>): string[] {
  if (!providerSettings || typeof providerSettings !== 'object') {
    return [];
  }

  const fieldNames = new Set<string>();

  // Fields to analyze for placeholders
  const fieldsToCheck = [
    'subject',
    'body',
    'from_email',
    'from_name',
    'to_email',
  ];

  for (const fieldName of fieldsToCheck) {
    const fieldValue = providerSettings[fieldName];
    if (fieldValue && typeof fieldValue === 'string') {
      const extracted = extractFieldPlaceholdersFromText(fieldValue);
      extracted.forEach(name => fieldNames.add(name));
    }
  }

  return Array.from(fieldNames);
}

