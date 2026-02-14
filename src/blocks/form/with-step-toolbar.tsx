/**
 * Higher-order component that injects the step toolbar into any block
 * that is inside a form with steps. Registered via addFilter('editor.BlockEdit').
 * This ensures the step tab bar is visible at ALL nesting depths.
 */
import { __ } from '@/lib/i18n';
import { BlockControls } from '@wordpress/block-editor';
import { ToolbarGroup, ToolbarButton } from '@wordpress/components';
import { createBlock } from '@wordpress/blocks';
import { useSelect, useDispatch } from '@wordpress/data';
import { createHigherOrderComponent } from '@wordpress/compose';
import { Plus } from 'lucide-react';
import BlockIcon from '../../components/block-atoms/BlockIcon';

const withStepToolbar = createHigherOrderComponent((BlockEdit: any) => {
	return (props: any) => {
		const { clientId } = props;

		// Check if this block is inside a form with steps
		const stepToolbarData = useSelect(
			(select: any) => {
				const { getBlockParents, getBlocks, getBlockName, getBlockAttributes } = select('core/block-editor');
				const parents = getBlockParents(clientId);

				// Don't add toolbar to the form block itself (it has its own)
				const blockName = getBlockName(clientId);
				if (blockName === 'gutenform/form') {
					return null;
				}

				// Find the parent form block
				let formClientId: string | null = null;
				for (const pid of parents) {
					if (getBlockName(pid) === 'gutenform/form') {
						formClientId = pid;
						break;
					}
				}

				if (!formClientId) return null;

				// Get step blocks from the form
				const formBlocks = getBlocks(formClientId);
				const stepBlocks = formBlocks.filter((b: any) => b.name === 'gutenform/step');

				if (stepBlocks.length === 0) return null;

				const formAttrs = getBlockAttributes(formClientId);
				const activeStep = formAttrs?.activeStep ?? 0;

				return {
					formClientId,
					activeStep,
					steps: stepBlocks.map((b: any, i: number) => ({
						clientId: b.clientId,
						title: b.attributes.title || `Step ${i + 1}`,
						index: i,
					})),
				};
			},
			[clientId]
		);

		if (!stepToolbarData) {
			return <BlockEdit { ...props } />;
		}

		const { formClientId, activeStep, steps } = stepToolbarData;
		const { updateBlockAttributes, insertBlock, selectBlock } = useDispatch('core/block-editor');

		const handleSwitchStep = (step: { clientId: string; index: number }) => {
			// Update the active step attribute
			updateBlockAttributes(formClientId, { activeStep: step.index });
			// Select the step block so focus moves there
			// (prevents the current step's useEffect from overriding activeStep)
			selectBlock(step.clientId);
		};

		const handleAddStep = () => {
			const newBlock = createBlock('gutenform/step', {
				title: `Step ${steps.length + 1}`,
			});
			insertBlock(newBlock, undefined, formClientId);
			updateBlockAttributes(formClientId, { activeStep: steps.length });
		};

		return (
			<>
				<BlockControls>
					<ToolbarGroup>
						{steps.map((step: { clientId: string; title: string; index: number }) => (
							<ToolbarButton
								key={step.clientId}
								icon={<span style={{
									fontSize: '13px',
									whiteSpace: 'nowrap',
								}}>
									{step.index + 1}. {step.title}
								</span>}
								label={`${__('step')} ${step.index + 1}: ${step.title}`}
								onClick={() => handleSwitchStep(step)}
								isActive={activeStep === step.index}
								style={{ paddingInline: '0.5rem' }}
							/>
						))}
						<ToolbarButton
							icon={<BlockIcon icon={Plus} clean={true} />}
							label={__('addStep')}
							onClick={handleAddStep}
						/>
					</ToolbarGroup>
				</BlockControls>
				<BlockEdit { ...props } />
			</>
		);
	};
}, 'withStepToolbar');

export default withStepToolbar;
