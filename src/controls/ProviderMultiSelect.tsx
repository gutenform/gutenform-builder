import { __ } from '@wordpress/i18n';
import { Spinner, CheckboxControl } from '@wordpress/components';
import { useProviders } from '../hooks/useProviders';

interface ProviderMultiSelectProps {
	value: number[];
	onChange: (value: number[]) => void;
}

export const ProviderMultiSelect = ({ value, onChange }: ProviderMultiSelectProps) => {
	const { providers, loading, error } = useProviders({ is_active: true });

	if (loading) return <Spinner />;
	if (error) return <p>Error: {error.message}</p>;
	
	if (providers.length === 0) {
		return (
			<div>
				<p style={{ marginTop: 0, marginBottom: '8px', fontSize: '13px' }}>
					{__('No active providers found.')}
				</p>
				<p style={{ marginTop: 0, fontSize: '12px', color: '#757575' }}>
					{__('Create providers in Settings → Providers first.')}
				</p>
			</div>
		);
	}

	const handleChange = (providerId: number, checked: boolean) => {
		if (checked) {
			onChange([...value, providerId]);
		} else {
			onChange(value.filter(id => id !== providerId));
		}
	};

	return (
		<div>
			<label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 500 }}>
				{__('Providers')}
			</label>
			<div style={{ marginBottom: '8px', fontSize: '12px', color: '#757575' }}>
				{__('Select which providers should process form submissions. Database provider runs automatically.')}
			</div>
			<div style={{ 
				border: '1px solid #ddd', 
				borderRadius: '2px', 
				padding: '8px',
				maxHeight: '200px',
				overflowY: 'auto'
			}}>
				{providers.map((provider) => (
					<CheckboxControl
						key={provider.id}
						label={`${provider.name} (${provider.provider_type})${provider.form_identifier ? ` - ${provider.form_identifier}` : ' - Global'}`}
						checked={value.includes(provider.id)}
						onChange={(checked) => handleChange(provider.id, checked)}
						__nextHasNoMarginBottom={true}
					/>
				))}
			</div>
		</div>
	);
};

