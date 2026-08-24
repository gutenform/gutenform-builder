import { __ } from '@/lib/i18n';
import { type Option } from '../../controls/OptionsRepeater';

export const getSelectPresets = (): Array<{
	name: string;
	title: string;
	options: Option[];
}> => [
	{
		name: 'country',
		title: __('country'),
		options: [
			{ label: __('germany'), value: 'de' },
			{ label: __('austria'), value: 'at' },
			{ label: __('switzerland'), value: 'ch' },
			{ label: __('france'), value: 'fr' },
			{ label: __('italy'), value: 'it' },
			{ label: __('spain'), value: 'es' },
			{ label: __('netherlands'), value: 'nl' },
			{ label: __('belgium'), value: 'be' },
			{ label: __('poland'), value: 'pl' },
			{ label: __('czechRepublic'), value: 'cz' },
		],
	},
	{
		name: 'bundeslaender',
		title: __('federalStates'),
		options: [
			{ label: __('badenWurttemberg'), value: 'bw' },
			{ label: __('bavaria'), value: 'by' },
			{ label: __('berlin'), value: 'be' },
			{ label: __('brandenburg'), value: 'bb' },
			{ label: __('bremen'), value: 'hb' },
			{ label: __('hamburg'), value: 'hh' },
			{ label: __('hesse'), value: 'he' },
			{ label: __('mecklenburgWesternPomerania'), value: 'mv' },
			{ label: __('lowerSaxony'), value: 'ni' },
			{ label: __('northRhineWestphalia'), value: 'nw' },
			{ label: __('rhinelandPalatinate'), value: 'rp' },
			{ label: __('saarland'), value: 'sl' },
			{ label: __('saxony'), value: 'sn' },
			{ label: __('saxonyAnhalt'), value: 'st' },
			{ label: __('schleswigHolstein'), value: 'sh' },
			{ label: __('thuringia'), value: 'th' },
		],
	},
	{
		name: 'titel',
		title: __('title'),
		options: [
			{ label: __('mr'), value: 'herr' },
			{ label: __('mrs'), value: 'frau' },
			{ label: __('diverse'), value: 'divers' },
		],
	},
	{
		name: 'altersgruppen',
		title: __('ageGroups'),
		options: [
			{ label: __('years017'), value: '0-17' },
			{ label: __('years1824'), value: '18-24' },
			{ label: __('years2534'), value: '25-34' },
			{ label: __('years3544'), value: '35-44' },
			{ label: __('years4554'), value: '45-54' },
			{ label: __('years5564'), value: '55-64' },
			{ label: __('years65Plus'), value: '65+' },
		],
	},
];
