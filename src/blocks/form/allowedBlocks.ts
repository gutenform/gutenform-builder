export const allowedBlocks = [
	'gutenform/input',
    'gutenform/textarea',
    'gutenform/select',
    'gutenform/file',
    'gutenform/captcha',
    'gutenform/honeypot',
    'gutenform/submit',
    'gutenform/success',
    'core/columns',
    'core/column',
    'core/heading',
    'core/paragraph',
    'core/image',
    'core/list',
    'core/list-item',
    'core/quote',
    'core/table',
    'core/video',
    'core/embed',
    'core/group',
];

export const prioritizedInserterBlocks = allowedBlocks.filter(block => block.startsWith('gutenform/'));