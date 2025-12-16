import { __ } from '@wordpress/i18n';
import { SelectControl, Spinner } from '@wordpress/components';
import { useEffect } from 'react';
import { useMailboxes } from '../hooks/useMailboxes';

interface MailboxSelectProps {
	value: string;
	onChange: (value: string) => void;
}

export const MailboxSelect = ({ value, onChange }: MailboxSelectProps) => {
	const { mailboxes, loading, error } = useMailboxes();

	useEffect(() => {
		if (mailboxes.length === 0) return;
		if (!mailboxes.some((mailbox) => mailbox.id === parseInt(value))) {
			onChange(mailboxes[0].id.toString());
		}
	}, [mailboxes, value, onChange]);

	if (loading) return <Spinner />;
	if (error) return <p>Error: {error.message}</p>;
	
	return (
		<SelectControl
			label={__('Mailbox')}
			value={value}
			onChange={onChange}
			options={mailboxes.map((mailbox) => ({
				label: mailbox.title,
				value: mailbox.id.toString(),
			}))}
			__next40pxDefaultSize={true}
			__nextHasNoMarginBottom={true}
		/>
	);
};

