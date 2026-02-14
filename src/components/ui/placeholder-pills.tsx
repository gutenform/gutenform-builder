"use client";

import { useState } from "react";
import { __ } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
	DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, Replace, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

export type PlaceholderOption = { value: string; label: string };

type PlaceholderOccurrence = { start: number; end: number; text: string };

function findPlaceholderOccurrences(content: string): PlaceholderOccurrence[] {
	const re = /\{([^}]+)\}/g;
	const out: PlaceholderOccurrence[] = [];
	let m: RegExpExecArray | null;
	while ((m = re.exec(content)) !== null) {
		out.push({ start: m.index, end: m.index + m[0].length, text: m[1] });
	}
	return out;
}

export type PlaceholderPillsProps = {
	content: string;
	onChange: (newContent: string) => void;
	availablePlaceholders: PlaceholderOption[];
	className?: string;
};

export function PlaceholderPills({
	content,
	onChange,
	availablePlaceholders,
	className,
}: PlaceholderPillsProps) {
	const [replaceIndex, setReplaceIndex] = useState<number | null>(null);
	const occurrences = findPlaceholderOccurrences(content);

	const removeAt = (index: number) => {
		const occ = occurrences[index];
		if (!occ) return;
		const newContent = content.substring(0, occ.start) + content.substring(occ.end);
		onChange(newContent);
	};

	const replaceAt = (index: number, newPlaceholder: string) => {
		const occ = occurrences[index];
		if (!occ) return;
		const newContent =
			content.substring(0, occ.start) + newPlaceholder + content.substring(occ.end);
		onChange(newContent);
		setReplaceIndex(null);
	};

	if (occurrences.length === 0) return null;

	return (
		<div className={cn("flex flex-wrap gap-2 items-center", className)}>
			<span className="text-xs text-muted-foreground mr-1">
				{__("insertedPlaceholders") || "Inserted placeholders"}:
			</span>
			{occurrences.map((occ, index) => (
				<DropdownMenu
					key={`${occ.start}-${index}`}
					open={replaceIndex === index}
					onOpenChange={(open) => setReplaceIndex(open ? index : null)}
				>
					<DropdownMenuTrigger asChild>
						<Button
							variant="secondary"
							size="sm"
							className="h-7 gap-1 font-mono text-xs"
						>
							{`{${occ.text}}`}
							<ChevronDown className="h-3 w-3" />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="start" className="max-h-64 overflow-y-auto">
						<DropdownMenuItem
							onSelect={(e) => e.preventDefault()}
							className="text-xs font-medium text-muted-foreground cursor-default"
						>
							{__("replace") || "Replace"}
						</DropdownMenuItem>
						{availablePlaceholders
							.filter((p) => p.value !== `{${occ.text}}`)
							.map((p, index) => (
								<DropdownMenuItem
									key={`${p.value}-${index}`}
									onClick={() => replaceAt(index, p.value)}
								>
									<Replace className="h-3 w-3 mr-2" />
									{p.value}
								</DropdownMenuItem>
							))}
						<DropdownMenuSeparator />
						<DropdownMenuItem
							onClick={() => removeAt(index)}
							className="text-destructive focus:text-destructive"
						>
							<Trash2 className="h-3 w-3 mr-2" />
							{__("remove") || "Remove"}
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			))}
		</div>
	);
}
