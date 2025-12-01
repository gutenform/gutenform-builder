import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const getFormClasses = (attributes: any) => {
  return cn(
    'gutenform-form',
    attributes.successView && 'gutenform-form--success-view'
  )
}

export const getFieldClasses = (attributes: any) => {
  return cn(
    'gutenform-field', 
    attributes.type && `gutenform-field-type--${attributes.type.toLowerCase()}`, 
    attributes.required && 'gutenform-field--required'
  )
}
