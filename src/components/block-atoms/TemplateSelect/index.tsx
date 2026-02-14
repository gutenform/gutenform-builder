import { __ } from "@/lib/i18n";
import { type TemplateArray } from '@wordpress/blocks';
import './styles.css';

export type TemplateCategory = 'start' | 'basics' | 'advanced' | 'multistep';

const templates: Array<{ label: string; value: TemplateArray; category: TemplateCategory }> = [
	{
		label: __('templateBlank'),
		category: 'start',
		value: [
			['gutenform/submit', {}],
			['gutenform/success', {}],
		],
	},
	{
		label: __('basicForm'),
		category: 'start',
		value: [
			['gutenform/input', { type: 'text', label: '' }],
			['gutenform/textarea', {}],
			['gutenform/submit', {}],
			['gutenform/success', {}],
		],
	},
	{
		label: __('templateContact'),
		category: 'basics',
		value: [
			['gutenform/input', { type: 'text', label: __('firstName', 'Vorname'), required: true }],
			['gutenform/input', { type: 'text', label: __('lastName', 'Nachname'), required: true }],
			['gutenform/input', { type: 'email', label: __('email', 'E-Mail'), required: true, isPrimaryMail: true }],
			['gutenform/select', {
				label: __('subject', 'Betreff'),
				placeholder: __('selectAnOption'),
				options: [
					{ label: __('generalEnquiry', 'Allgemeine Anfrage'), value: 'general' },
					{ label: __('support', 'Support'), value: 'support' },
					{ label: __('other', 'Sonstiges'), value: 'other' },
				],
				required: true,
			}],
			['gutenform/textarea', { label: __('message', 'Nachricht'), required: true, rows: 5 }],
			['gutenform/select', {
				label: __('privacyConsent', 'Datenschutz-Einwilligung'),
				options: [{ label: __('iAgreeToPrivacy', 'Ich stimme den Datenschutzbestimmungen zu'), value: 'yes' }],
				required: true,
			}],
			['gutenform/submit', {}],
			['gutenform/success', {}],
		],
	},
	{
		label: __('templateNewsletter'),
		category: 'basics',
		value: [
			['gutenform/input', { type: 'email', label: __('email', 'E-Mail'), required: true, isPrimaryMail: true }],
			['gutenform/input', { type: 'text', label: __('firstName', 'Vorname'), required: false, help: __('newsletterFirstNameHelp', 'Damit wir dich persönlich ansprechen können') }],
			['gutenform/select', {
				label: __('privacyConsent', 'Datenschutz'),
				options: [{ label: __('iAgreeToPrivacy', 'Ich stimme den Datenschutzbestimmungen zu'), value: 'yes' }],
				required: true,
			}],
			['gutenform/submit', {}],
			['gutenform/success', {}],
		],
	},
	{
		label: __('templateCallback'),
		category: 'basics',
		value: [
			['gutenform/input', { type: 'text', label: __('name', 'Name'), required: true }],
			['gutenform/input', { type: 'tel', label: __('phone', 'Telefonnummer'), required: true }],
			['gutenform/select', {
				label: __('bestReachability', 'Beste Erreichbarkeit'),
				options: [
					{ label: __('morning', 'Vormittags'), value: 'morning' },
					{ label: __('afternoon', 'Nachmittags'), value: 'afternoon' },
					{ label: __('evening', 'Abends'), value: 'evening' },
				],
				required: true,
			}],
			['gutenform/textarea', { label: __('reasonForCall', 'Grund des Anrufs (optional)'), required: false, rows: 3 }],
			['gutenform/submit', {}],
			['gutenform/success', {}],
		],
	},
	{
		label: __('templateEventRsvp'),
		category: 'advanced',
		value: [
			['gutenform/input', { type: 'text', label: __('name', 'Name'), required: true }],
			['gutenform/input', { type: 'email', label: __('email', 'E-Mail'), required: true, isPrimaryMail: true }],
			['gutenform/input', { type: 'number', label: __('numberOfGuests', 'Anzahl Begleitpersonen'), required: false, defaultValue: '0' }],
			['gutenform/select', {
				label: __('dietaryPreferences', 'Essenswünsche'),
				options: [
					{ label: __('all', 'Alles'), value: 'all' },
					{ label: __('vegetarian', 'Vegetarisch'), value: 'vegetarian' },
					{ label: __('vegan', 'Vegan'), value: 'vegan' },
					{ label: __('allergies', 'Allergien'), value: 'allergies' },
				],
				required: false,
			}],
			['gutenform/select', {
				label: __('eveningEventParticipation', 'Teilnahme Abendveranstaltung'),
				options: [
					{ label: __('yes', 'Ja'), value: 'yes' },
					{ label: __('no', 'Nein'), value: 'no' },
				],
				required: true,
			}],
			['gutenform/submit', {}],
			['gutenform/success', {}],
		],
	},
	{
		label: __('templateJobApplication'),
		category: 'advanced',
		value: [
			['gutenform/input', { type: 'text', label: __('name', 'Name'), required: true }],
			['gutenform/input', { type: 'text', label: __('address', 'Adresse'), required: false }],
			['gutenform/input', { type: 'email', label: __('email', 'E-Mail'), required: true, isPrimaryMail: true }],
			['gutenform/input', { type: 'tel', label: __('phone', 'Telefon'), required: false }],
			['gutenform/select', {
				label: __('desiredPosition', 'Gewünschte Position'),
				options: [
					{ label: __('selectAnOption', 'Bitte wählen'), value: '' },
					{ label: __('developer', 'Entwickler:in'), value: 'developer' },
					{ label: __('designer', 'Designer:in'), value: 'designer' },
					{ label: __('marketing', 'Marketing'), value: 'marketing' },
				],
				required: true,
			}],
			['gutenform/input', { type: 'date', label: __('earliestStartDate', 'Frühestes Eintrittsdatum'), required: false }],
			['gutenform/input', { type: 'text', label: __('salaryExpectation', 'Gehaltsvorstellung'), required: false }],
			['gutenform/file', { label: __('resumeCv', 'Lebenslauf (PDF)'), required: true, acceptTypes: 'application/pdf' }],
			['gutenform/file', { label: __('coverLetter', 'Anschreiben / Portfolio'), required: false, acceptTypes: 'application/pdf,.doc,.docx' }],
			['gutenform/submit', {}],
			['gutenform/success', {}],
		],
	},
	{
		label: __('templateFeedback'),
		category: 'advanced',
		value: [
			['gutenform/select', {
				label: __('howSatisfied', 'Wie zufrieden waren Sie? (1-10)'),
				options: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => ({ label: String(n), value: String(n) })),
				required: true,
			}],
			['gutenform/textarea', { label: __('whatDidYouLike', 'Was hat Ihnen besonders gut gefallen?'), required: false, rows: 4 }],
			['gutenform/textarea', { label: __('whatCanWeImprove', 'Was können wir besser machen?'), required: false, rows: 4 }],
			['gutenform/select', {
				label: __('contactForFollowUp', 'Dürfen wir Sie für Rückfragen kontaktieren?'),
				options: [
					{ label: __('yes', 'Ja'), value: 'yes' },
					{ label: __('no', 'Nein'), value: 'no' },
				],
				required: true,
			}],
			['gutenform/input', { type: 'email', label: __('emailFollowUp', 'E-Mail (für Rückfragen)'), required: false }],
			['gutenform/submit', {}],
			['gutenform/success', {}],
		],
	},
	{
		label: __('templateBasicMultiStep'),
		category: 'multistep',
		value: [
			['gutenform/progress', { variant: 'bubbles' }],
			['gutenform/step', { title: __('stepTitlePersonalData', 'Persönliche Daten') }, [
				['gutenform/input', { type: 'text', label: __('name', 'Name'), required: true }],
				['gutenform/input', { type: 'email', label: __('email', 'E-Mail'), required: true, isPrimaryMail: true }],
				['gutenform/step-navigation', {}],
			]],
			['gutenform/step', { title: __('stepTitleMessage', 'Nachricht') }, [
				['gutenform/textarea', { label: __('message', 'Nachricht'), required: true, rows: 5 }],
				['gutenform/step-navigation', {}],
			]],
			['gutenform/success', {}],
		],
	},
	{
		label: __('templateProjectRequest'),
		category: 'multistep',
		value: [
			['gutenform/progress', { variant: 'bubbles' }],
			['gutenform/step', { title: __('theProject', 'Das Projekt') }, [
				['gutenform/select', {
					label: __('projectType', 'Art des Projekts'),
					options: [
						{ label: 'Webdesign', value: 'webdesign' },
						{ label: 'SEO', value: 'seo' },
						{ label: 'App', value: 'app' },
						{ label: 'Branding', value: 'branding' },
					],
					required: true,
				}],
				['gutenform/select', {
					label: __('currentStatus', 'Aktueller Status'),
					options: [
						{ label: __('justAnIdea', 'Nur eine Idee'), value: 'idea' },
						{ label: __('specificationAvailable', 'Spezifikation vorhanden'), value: 'spec' },
						{ label: __('relaunch', 'Relaunch'), value: 'relaunch' },
					],
					required: true,
				}],
				['gutenform/step-navigation', {}],
			]],
			['gutenform/step', { title: __('framework', 'Rahmenbedingungen') }, [
				['gutenform/select', {
					label: __('budgetRange', 'Budgetrahmen'),
					options: [
						{ label: '< 2.000 €', value: 'under2k' },
						{ label: '2.000 – 5.000 €', value: '2k-5k' },
						{ label: '5.000 – 10.000 €', value: '5k-10k' },
						{ label: '> 10.000 €', value: 'over10k' },
					],
					required: true,
				}],
				['gutenform/input', { type: 'date', label: __('deadline', 'Deadline'), required: false }],
				['gutenform/step-navigation', {}],
			]],
			['gutenform/step', { title: __('contactDetails', 'Kontaktdaten') }, [
				['gutenform/input', { type: 'text', label: __('name', 'Name'), required: true }],
				['gutenform/input', { type: 'text', label: __('company', 'Firma'), required: false }],
				['gutenform/input', { type: 'email', label: __('email', 'E-Mail'), required: true, isPrimaryMail: true }],
				['gutenform/step-navigation', {}],
			]],
			['gutenform/success', {}],
		],
	},
	{
		label: __('templateSupportTicket'),
		category: 'advanced',
		value: [
			['gutenform/input', { type: 'text', label: __('customerIdOrderNumber', 'Kunden-ID / Bestellnummer'), required: false }],
			['gutenform/select', {
				label: __('problemCategory', 'Kategorie des Problems'),
				options: [
					{ label: __('technical', 'Technisch'), value: 'technical' },
					{ label: __('billing', 'Rechnung'), value: 'billing' },
					{ label: __('shipping', 'Versand'), value: 'shipping' },
				],
				required: true,
			}],
			['gutenform/select', {
				label: __('urgency', 'Dringlichkeit'),
				options: [
					{ label: __('low', 'Niedrig'), value: 'low' },
					{ label: __('medium', 'Mittel'), value: 'medium' },
					{ label: __('critical', 'Kritisch'), value: 'critical' },
				],
				required: true,
			}],
			['gutenform/textarea', { label: __('problemDescription', 'Problembeschreibung'), required: true, rows: 5 }],
			['gutenform/file', { label: __('screenshotUpload', 'Screenshot'), required: false, acceptTypes: 'image/*' }],
			['gutenform/submit', {}],
			['gutenform/success', {}],
		],
	},
	{
		label: __('templateTableReservation'),
		category: 'advanced',
		value: [
			['gutenform/input', { type: 'date', label: __('date', 'Datum'), required: true }],
			['gutenform/input', { type: 'time', label: __('time', 'Uhrzeit'), required: true }],
			['gutenform/input', { type: 'number', label: __('numberOfGuests', 'Personenanzahl'), required: true, defaultValue: '2' }],
			['gutenform/select', {
				label: __('area', 'Bereich'),
				options: [
					{ label: __('indoors', 'Innen'), value: 'indoors' },
					{ label: __('terrace', 'Terrasse'), value: 'terrace' },
				],
				required: true,
			}],
			['gutenform/input', { type: 'text', label: __('specialOccasions', 'Besondere Anlässe (z. B. Geburtstag)'), required: false }],
			['gutenform/submit', {}],
			['gutenform/success', {}],
		],
	},
	{
		label: __('templateProductConfigurator'),
		category: 'advanced',
		value: [
			['gutenform/select', {
				label: __('productChoice', 'Produktwahl'),
				options: [
					{ label: __('selectAnOption', 'Bitte wählen'), value: '' },
					{ label: __('basicPackage', 'Basispaket – 99 €'), value: 'basic' },
					{ label: __('premiumPackage', 'Premium – 199 €'), value: 'premium' },
				],
				required: true,
			}],
			['gutenform/select', {
				label: __('addOns', 'Zusatzoptionen'),
				options: [
					{ label: __('expressProcessing', 'Expressbearbeitung +20 €'), value: 'express' },
					{ label: __('giftWrapping', 'Geschenkverpackung +5 €'), value: 'giftwrap' },
				],
				required: false,
			}],
			['gutenform/textarea', { label: __('deliveryAddress', 'Lieferadresse'), required: true, rows: 3 }],
			['gutenform/input', { type: 'text', label: __('billingAddressSame', 'Rechnungsadresse'), required: false, placeholder: __('sameAsDelivery', 'Gleiche wie Lieferadresse') }],
			['gutenform/submit', {}],
			['gutenform/success', {}],
		],
	},
];

const CATEGORY_ORDER: TemplateCategory[] = ['start', 'basics', 'advanced', 'multistep'];
const CATEGORY_LABELS: Record<TemplateCategory, string> = {
	start: __('templateCategoryStart'),
	basics: __('templateCategoryBasics'),
	advanced: __('templateCategoryAdvanced'),
	multistep: __('templateCategoryMultiStep'),
};

type TemplateSelectProps = {
	onSelect: (value: TemplateArray) => void;
};

const TemplateSelect = ({ onSelect }: TemplateSelectProps) => {
	const byCategory = CATEGORY_ORDER.map((cat) => ({
		category: cat,
		label: CATEGORY_LABELS[cat],
		templates: templates.filter((t) => t.category === cat),
	})).filter((section) => section.templates.length > 0);

	return (
		<div className="gutenform-template-select">
			<p className="gutenform-template-select__intro">
				{__('templateSelectIntro')}
			</p>
			{byCategory.map((section) => (
				<section
					key={section.category}
					className="gutenform-template-select__section"
					data-category={section.category}
				>
					<h3 className="gutenform-template-select__title">{section.label}</h3>
					<div className="gutenform-template-select__grid">
						{section.templates.map((template, index) => (
							<TemplateCard
								key={`${section.category}-${index}`}
								label={template.label}
								value={template.value}
								onSelect={() => onSelect(template.value)}
							/>
						))}
					</div>
				</section>
			))}
		</div>
	);
};

type TemplateCardProps = {
	label: string;
	value: TemplateArray;
	onSelect: () => void;
};

const TemplateCard = ({ label, value, onSelect }: TemplateCardProps) => (
	<button
		type="button"
		className="gutenform-template-select__card"
		onClick={() => value && onSelect()}
	>
		{label}
	</button>
);

export default TemplateSelect;
