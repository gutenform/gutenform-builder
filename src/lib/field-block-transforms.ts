/**
 * Shared utility functions for field block transforms.
 * Used to convert between Input, Textarea, and Select blocks.
 */

import { createBlock } from '@wordpress/blocks'

/**
 * Common attributes shared by all field blocks.
 */
interface CommonFieldAttributes {
  label: string
  name: string
  id: string
  placeholder: string
  help: string
  required: boolean
  useCustomName?: boolean
  useCustomId?: boolean
  defaultValue?: string
}

/**
 * Input block attributes.
 */
interface InputAttributes extends CommonFieldAttributes {
  type: string
  isPrimaryMail?: boolean
}

/**
 * Textarea block attributes.
 */
interface TextareaAttributes extends CommonFieldAttributes {
  rows?: number
}

/**
 * Select block attributes.
 */
interface SelectAttributes extends CommonFieldAttributes {
  options: Array<{ label: string; value: string }>
  optionsPopulated: boolean
  syncLabelValue: boolean
}

/**
 * Extracts common attributes from any field block.
 */
export function getCommonAttributes(attributes: any): Partial<CommonFieldAttributes> {
  return {
    label: attributes.label || '',
    name: attributes.name || '',
    id: attributes.id || '',
    placeholder: attributes.placeholder || '',
    help: attributes.help || '',
    required: attributes.required || false,
    useCustomName: attributes.useCustomName,
    useCustomId: attributes.useCustomId,
    defaultValue: attributes.defaultValue || '',
  }
}

/**
 * Transforms any field block to an Input block.
 */
export function transformToInput(
  attributes: any,
  targetType: string = 'text'
): any {
  const common = getCommonAttributes(attributes)

  return createBlock('gutenform/input', {
    ...common,
    type: targetType,
    isPrimaryMail: attributes.isPrimaryMail || false,
  } as InputAttributes)
}

/**
 * Transforms any field block to a Textarea block.
 */
export function transformToTextarea(attributes: any): any {
  const common = getCommonAttributes(attributes)

  return createBlock('gutenform/textarea', {
    ...common,
    rows: attributes.rows || 4,
  } as TextareaAttributes)
}

/**
 * Transforms any field block to a Select block.
 */
export function transformToSelect(attributes: any): any {
  const common = getCommonAttributes(attributes)

  // If source is a Select block, preserve options
  const options = attributes.options || [
    { label: 'Option 1', value: 'option1' },
    { label: 'Option 2', value: 'option2' },
  ]

  return createBlock('gutenform/select', {
    ...common,
    options: options,
    optionsPopulated: attributes.optionsPopulated || false,
    syncLabelValue: attributes.syncLabelValue || false,
  } as SelectAttributes)
}

