"use client"

import { __ } from "@/lib/i18n";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface EmailTemplateCustomizationsProps {
  primaryColor: string;
  secondaryColor: string;
  fontFamily: string;
  logoUrl: string;
  onPrimaryColorChange: (color: string) => void;
  onSecondaryColorChange: (color: string) => void;
  onFontFamilyChange: (font: string) => void;
  onLogoUrlChange: (url: string) => void;
}

const MAIL_SAFE_FONTS = [
  { value: 'Arial, sans-serif', label: 'Arial' },
  { value: 'Helvetica, sans-serif', label: 'Helvetica' },
  { value: 'Georgia, serif', label: 'Georgia' },
  { value: 'Times New Roman, serif', label: 'Times New Roman' },
  { value: 'Verdana, sans-serif', label: 'Verdana' },
  { value: 'Courier New, monospace', label: 'Courier New' },
];

export function EmailTemplateCustomizations({
  primaryColor,
  secondaryColor,
  fontFamily,
  logoUrl,
  onPrimaryColorChange,
  onSecondaryColorChange,
  onFontFamilyChange,
  onLogoUrlChange,
}: EmailTemplateCustomizationsProps) {
  return (
    <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
      <div className="space-y-2">
        <Label className="text-sm font-semibold">{__("templateCustomization")}</Label>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        {/* Primary Color */}
        <div className="space-y-2">
          <Label className="text-sm">{__("primaryColor")}</Label>
          <div className="flex gap-2">
            <Input
              type="color"
              value={primaryColor}
              onChange={(e) => onPrimaryColorChange(e.target.value)}
              className="w-16 h-10 p-1"
            />
            <Input
              type="text"
              value={primaryColor}
              onChange={(e) => onPrimaryColorChange(e.target.value)}
              placeholder="#3b82f6"
              className="flex-1"
            />
          </div>
        </div>

        {/* Secondary Color */}
        <div className="space-y-2">
          <Label className="text-sm">{__("secondaryColor")}</Label>
          <div className="flex gap-2">
            <Input
              type="color"
              value={secondaryColor}
              onChange={(e) => onSecondaryColorChange(e.target.value)}
              className="w-16 h-10 p-1"
            />
            <Input
              type="text"
              value={secondaryColor}
              onChange={(e) => onSecondaryColorChange(e.target.value)}
              placeholder="#8b5cf6"
              className="flex-1"
            />
          </div>
        </div>
      </div>

      {/* Font Family */}
      <div className="space-y-2">
        <Label className="text-sm">{__("fontFamily")}</Label>
        <Select value={fontFamily} onValueChange={onFontFamilyChange}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {MAIL_SAFE_FONTS.map((font) => (
              <SelectItem key={font.value} value={font.value}>
                {font.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Logo URL */}
      <div className="space-y-2">
        <Label className="text-sm">{__("logoUrl")}</Label>
        <Input
          type="url"
          value={logoUrl}
          onChange={(e) => onLogoUrlChange(e.target.value)}
          placeholder="https://example.com/logo.png"
        />
        <p className="text-xs text-muted-foreground">
          {__("logoUrlDescription")}
        </p>
      </div>
    </div>
  );
}

