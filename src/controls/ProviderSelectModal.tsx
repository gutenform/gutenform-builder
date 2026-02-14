"use client";

import { __ } from "@/lib/i18n";
import { Modal } from "@wordpress/components";
import { useProviders } from "@/hooks/useProviders";
import { Database, Mail, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const SLUG_TO_ICON: Record<string, LucideIcon> = {
	database: Database,
	email: Mail,
};

export interface ProviderSelectModalProps {
	open: boolean;
	onClose: () => void;
	selectedIds: number[];
	onChange: (providerIds: number[]) => void;
}

export function ProviderSelectModal({
	open,
	onClose,
	selectedIds,
	onChange,
}: ProviderSelectModalProps) {
	const { providers, loading, error } = useProviders({ is_active: true });

	const toggle = (id: number) => {
		if (selectedIds.includes(id)) {
			onChange(selectedIds.filter((pid) => pid !== id));
		} else {
			onChange([...selectedIds, id]);
		}
	};

	if (!open) return null;

	return (
		<Modal
			title={__("selectProviders")}
			onRequestClose={onClose}
			className="gutenform-provider-select-modal"
			style={{ maxWidth: 480 }}
		>
			<div style={{ padding: "8px 0", minHeight: 200 }}>
				{loading && (
					<p style={{ margin: 0, color: "#757575" }}>{__("loadingProviders")}</p>
				)}
				{error && (
					<p style={{ margin: 0, color: "#b32d2e" }}>
						{__("error")}: {error.message}
					</p>
				)}
				{!loading && !error && providers.length === 0 && (
					<p style={{ margin: 0, color: "#757575" }}>{__("noProvidersFound")}</p>
				)}
				{!loading && providers.length > 0 && (
					<div
						style={{
							display: "grid",
							gridTemplateColumns: "repeat(2, 1fr)",
							gap: 12,
						}}
					>
						{providers.map((provider) => {
							const selected = selectedIds.includes(provider.id);
							const Icon =
								SLUG_TO_ICON[provider.provider_type] ?? Database;
							return (
								<button
									key={provider.id}
									type="button"
									onClick={() => toggle(provider.id)}
								className={cn(
									"gutenform-provider-card",
									"relative flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-colors text-left cursor-pointer",
									selected
										? "border-primary bg-primary/5"
										: "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
								)}
									style={{ minHeight: 100 }}
								>
									{selected && (
										<span
											className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center text-white text-xs"
											aria-hidden
										>
											✓
										</span>
									)}
									<div className="flex items-center justify-center w-12 h-12 text-muted-foreground mb-2">
										<Icon className="w-10 h-10" />
									</div>
									<span className="text-sm font-medium text-center line-clamp-2">
										{provider.name}
									</span>
									<span className="text-xs text-muted-foreground mt-0.5">
										{provider.provider_type}
										{provider.form_identifier
											? ` • ${provider.form_identifier}`
											: " • " + __("globalProvider")}
									</span>
								</button>
							);
						})}
					</div>
				)}
			</div>
		</Modal>
	);
}
