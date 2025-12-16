import { type GlobalFieldAttributes } from './globalField';

export type CaptchaAttributes = GlobalFieldAttributes & {
	captchaType: 'friendlycaptcha' | 'recaptcha';
	siteKey?: string;
	apiKey?: string;
};

