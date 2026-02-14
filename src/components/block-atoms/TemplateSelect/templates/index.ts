import { __ } from '@/lib/i18n';
import { type TemplateArray } from '@wordpress/blocks';
import { resolveTemplateValue } from './resolve';

export type TemplateCategory = 'start' | 'basics' | 'advanced' | 'multistep';

export type RawTemplate = {
	labelKey: string;
	category: TemplateCategory;
	value: unknown;
};

import blank from './blank.json';
import basicForm from './basic-form.json';
import contact from './contact.json';
import newsletter from './newsletter.json';
import callback from './callback.json';
import eventRsvp from './event-rsvp.json';
import jobApplication from './job-application.json';
import feedback from './feedback.json';
import supportTicket from './support-ticket.json';
import tableReservation from './table-reservation.json';
import productConfigurator from './product-configurator.json';
import basicMultistep from './basic-multistep.json';
import projectRequest from './project-request.json';

const rawTemplates: RawTemplate[] = [
	blank as RawTemplate,
	basicForm as RawTemplate,
	contact as RawTemplate,
	newsletter as RawTemplate,
	callback as RawTemplate,
	eventRsvp as RawTemplate,
	jobApplication as RawTemplate,
	feedback as RawTemplate,
	supportTicket as RawTemplate,
	tableReservation as RawTemplate,
	productConfigurator as RawTemplate,
	basicMultistep as RawTemplate,
	projectRequest as RawTemplate,
];

export type ResolvedTemplate = {
	label: string;
	category: TemplateCategory;
	value: TemplateArray;
};

function resolveTemplates(): ResolvedTemplate[] {
	return rawTemplates.map((raw) => ({
		label: __(raw.labelKey),
		category: raw.category,
		value: resolveTemplateValue(raw.value, __) as TemplateArray,
	}));
}

export const templates = resolveTemplates();
