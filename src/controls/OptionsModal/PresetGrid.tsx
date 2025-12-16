import { __ } from '../../lib/i18n';
import { type Option } from '../OptionsRepeater';
import './styles.css';

interface PresetGridProps {
	presets: Array<{ name: string; title: string; options: Option[] }>;
	onSelectPreset: (options: Option[]) => void;
	onStartEmpty: () => void;
	onBulkAddClick: () => void;
}

export const PresetGrid = ({ presets, onSelectPreset, onStartEmpty, onBulkAddClick }: PresetGridProps) => {
	return (
		<div className="gutenform-options-preset-grid">
			<h3>{__('chooseTemplateOrStartEmpty')}</h3>
			<div className="gutenform-options-preset-grid-container">
				{/* Start Empty Box */}
				<div
					className="gutenform-options-preset-box-empty"
					onClick={onStartEmpty}
				>
					<div className="gutenform-options-preset-box-empty-icon">+</div>
					<div className="gutenform-options-preset-box-empty-title">
						{__('startWithoutTemplate')}
					</div>
				</div>

				{/* Bulk Add Box */}
				<div
					className="gutenform-options-preset-box-empty"
					onClick={onBulkAddClick}
				>
					<div className="gutenform-options-preset-box-empty-icon">📋</div>
					<div className="gutenform-options-preset-box-empty-title">
						{__('addBulkOptions')}
					</div>
				</div>

				{/* Preset Boxes */}
				{presets.map((preset) => (
					<div
						key={preset.name}
						className="gutenform-options-preset-box"
						onClick={() => onSelectPreset(preset.options)}
					>
						<div className="gutenform-options-preset-box-title">
							{preset.title}
						</div>
						<div className="gutenform-options-preset-box-count">
							{__('options')} {preset.options.length}
						</div>
						<div className="gutenform-options-preset-box-preview">
							{preset.options.slice(0, 3).map((opt) => opt.label).join(', ')}
							{preset.options.length > 3 && '...'}
						</div>
					</div>
				))}
			</div>
		</div>
	);
};

