# Blocks

Gutenform provides Gutenberg blocks for building forms. All blocks are registered as inner blocks of the Form block.

## Form Block

The main container block. Wraps all form fields and handles form submission. Supports layout options and templates.

**Location**: `src/blocks/form/`

## Field Blocks

### Input

Text input field. Supports presets (email, tel, url, number) and validation.

**Location**: `src/blocks/input/`

### Select

Dropdown select field. Supports single/multiple selection, options from presets or manual entry.

**Location**: `src/blocks/select/`

### Textarea

Multi-line text input for longer content.

**Location**: `src/blocks/textarea/`

### File

File upload field. Configurable accepted file types and size limits.

**Location**: `src/blocks/file/`

## Action Blocks

### Submit

Submit button. Triggers form validation and submission.

**Location**: `src/blocks/submit/`

### Success

Displays success message after form submission. Can show custom content or redirect.

**Location**: `src/blocks/success/`

## Utility Blocks

### Captcha

CAPTCHA field for spam protection.

**Location**: `src/blocks/captcha/`

### Honeypot

Hidden field for spam protection. Invisible to users, catches bots.

**Location**: `src/blocks/honeypot/`

## Skins

Form styling can be customized via skins. Default skin available in `src/skins/default/`.
