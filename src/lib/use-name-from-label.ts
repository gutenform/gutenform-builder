import { useEffect } from 'react';
import { cleanForSlug } from '@wordpress/url';

/**
 * Hook that automatically generates a name (slug) from a label.
 * Always syncs label to name unless useCustomName is true.
 * 
 * @param label - The label value
 * @param name - The current name value
 * @param setName - Function to update the name
 * @param useCustomName - Whether to use a custom name (disable label-name sync)
 */
export const useNameFromLabel = (
	label: string,
	name: string,
	setName: (name: string) => void,
	useCustomName: boolean = false
): void => {
	useEffect(() => {
		// If custom name is enabled, don't sync
		if (useCustomName) return;
		
		// If no label, don't update
		if (!label) return;
		
		// Generate slug from label
		const slug = cleanForSlug(label) || '';
		if (slug && slug !== name) {
			setName(slug);
		}
	}, [label, name, setName, useCustomName]);
};

