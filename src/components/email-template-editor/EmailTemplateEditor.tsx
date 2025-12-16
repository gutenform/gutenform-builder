"use client"

import { __ } from "@/lib/i18n";
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { apiGet, apiPost, type ApiResponse } from "@/lib/api";
import { EmailPreview } from "@/components/ui/email-preview";

interface EmailTemplate {
  name: string;
  title: string;
  description: string;
}

interface EmailTemplateEditorProps {
  onApplyTemplate: (html: string, templateName?: string, customizations?: {
    primary_color?: string;
    secondary_color?: string;
    font_family?: string;
    logo_url?: string;
  }) => void;
  currentBody?: string;
  customizations?: {
    template_name?: string;
    primary_color?: string;
    secondary_color?: string;
    font_family?: string;
    logo_url?: string;
  };
}

const MAIL_SAFE_FONTS = [
  { value: 'Arial, sans-serif', label: 'Arial' },
  { value: 'Helvetica, sans-serif', label: 'Helvetica' },
  { value: 'Georgia, serif', label: 'Georgia' },
  { value: 'Times New Roman, serif', label: 'Times New Roman' },
  { value: 'Verdana, sans-serif', label: 'Verdana' },
  { value: 'Courier New, monospace', label: 'Courier New' },
];

export function EmailTemplateEditor({ 
  onApplyTemplate, 
  currentBody = '',
  customizations = {}
}: EmailTemplateEditorProps) {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string>(customizations.template_name || '');
  const [primaryColor, setPrimaryColor] = useState<string>(customizations.primary_color || '#3b82f6');
  const [secondaryColor, setSecondaryColor] = useState<string>(customizations.secondary_color || '#8b5cf6');
  const [fontFamily, setFontFamily] = useState<string>(customizations.font_family || 'Arial, sans-serif');
  const [logoUrl, setLogoUrl] = useState<string>(customizations.logo_url || '');
  const [previewHtml, setPreviewHtml] = useState<string>('');
  const [previewLoading, setPreviewLoading] = useState(false);

  // Load templates on mount
  useEffect(() => {
    loadTemplates();
  }, []);

  // Update preview when settings change
  useEffect(() => {
    if (selectedTemplate) {
      updatePreview();
    }
  }, [selectedTemplate, primaryColor, secondaryColor, fontFamily, logoUrl, currentBody]);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      const response = await apiGet<ApiResponse<EmailTemplate[]>>('email-templates');
      if (response.success && response.data) {
        setTemplates(response.data);
      }
    } catch (error) {
      console.error('Failed to load templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const updatePreview = async () => {
    if (!selectedTemplate) return;

    try {
      setPreviewLoading(true);
      const response = await apiPost<ApiResponse<{ html: string }>>('email-templates/preview', {
        template_name: selectedTemplate,
        customizations: {
          primary_color: primaryColor,
          secondary_color: secondaryColor,
          font_family: fontFamily,
          logo_url: logoUrl,
        },
        body_content: currentBody || '{all_fields}',
      });

      if (response.success && response.data) {
        setPreviewHtml(response.data.html);
      }
    } catch (error) {
      console.error('Failed to generate preview:', error);
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleApplyTemplate = () => {
    if (!selectedTemplate || !previewHtml) return;
    onApplyTemplate(previewHtml, selectedTemplate, {
      primary_color: primaryColor,
      secondary_color: secondaryColor,
      font_family: fontFamily,
      logo_url: logoUrl,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{__("emailTemplate")}</CardTitle>
        <CardDescription>{__("emailTemplateDescription")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Template Selection */}
        <div className="space-y-2">
          <Label>{__("selectTemplate")}</Label>
          <Select
            value={selectedTemplate}
            onValueChange={setSelectedTemplate}
            disabled={loading}
          >
            <SelectTrigger>
              <SelectValue placeholder={__("selectTemplate")} />
            </SelectTrigger>
            <SelectContent>
              {templates.map((template) => (
                <SelectItem key={template.name} value={template.name}>
                  <div>
                    <div className="font-medium">{template.title}</div>
                    {template.description && (
                      <div className="text-xs text-muted-foreground">
                        {template.description}
                      </div>
                    )}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedTemplate && (
          <>
            <Separator />

            {/* Customization Options */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {/* Primary Color */}
                <div className="space-y-2">
                  <Label>{__("primaryColor")}</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="w-20 h-10"
                    />
                    <Input
                      type="text"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      placeholder="#3b82f6"
                    />
                  </div>
                </div>

                {/* Secondary Color */}
                <div className="space-y-2">
                  <Label>{__("secondaryColor")}</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={secondaryColor}
                      onChange={(e) => setSecondaryColor(e.target.value)}
                      className="w-20 h-10"
                    />
                    <Input
                      type="text"
                      value={secondaryColor}
                      onChange={(e) => setSecondaryColor(e.target.value)}
                      placeholder="#8b5cf6"
                    />
                  </div>
                </div>
              </div>

              {/* Font Family */}
              <div className="space-y-2">
                <Label>{__("fontFamily")}</Label>
                <Select value={fontFamily} onValueChange={setFontFamily}>
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
                <Label>{__("logoUrl")}</Label>
                <Input
                  type="url"
                  value={logoUrl}
                  onChange={(e) => setLogoUrl(e.target.value)}
                  placeholder="https://example.com/logo.png"
                />
                <p className="text-xs text-muted-foreground">
                  {__("logoUrlDescription")}
                </p>
              </div>
            </div>

            <Separator />

            {/* Preview */}
            <div className="space-y-2">
              <Label>{__("preview")}</Label>
              {previewLoading ? (
                <div className="border rounded-lg p-8 text-center text-muted-foreground">
                  {__("loading")}...
                </div>
              ) : previewHtml ? (
                <div className="border rounded-lg overflow-hidden">
                  <iframe
                    srcDoc={previewHtml}
                    className="w-full h-96 border-0"
                    title={__("emailPreview")}
                  />
                </div>
              ) : (
                <div className="border rounded-lg p-8 text-center text-muted-foreground">
                  {__("selectTemplateToPreview")}
                </div>
              )}
            </div>

            <Separator />

            {/* Apply Button */}
            <Button
              onClick={handleApplyTemplate}
              disabled={!selectedTemplate || !previewHtml || previewLoading}
              className="w-full"
            >
              {__("applyTemplate")}
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}

