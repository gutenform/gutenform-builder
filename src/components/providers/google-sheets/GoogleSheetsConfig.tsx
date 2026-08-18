"use client";

import { __ } from "@/lib/i18n";
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
import { useGoogleStatus, useGoogleCredentials, useGoogleAuth } from "@/hooks/useGoogleSheets";
import { CheckCircle2, Copy, ExternalLink, Loader2, Unplug, AlertCircle } from "lucide-react";

interface GoogleSheetsConfigProps {
  settings: Record<string, unknown>;
  onChange: (key: string, value: unknown) => void;
}

export function GoogleSheetsConfig({ settings, onChange }: GoogleSheetsConfigProps) {
  void settings;
  void onChange;

  const { status, loading: statusLoading, refetch: refetchStatus } = useGoogleStatus();
  const { saveCredentials, loading: savingCredentials } = useGoogleCredentials();
  const { getAuthUrl, disconnect, loading: authLoading } = useGoogleAuth();

  const [clientId, setClientId] = useState("");
  const [clientSecret, setClientSecret] = useState("");
  const [apiKey, setApiKey] = useState("");

  useEffect(() => {
    if (status?.client_id) {
      setClientId(status.client_id);
    }
  }, [status]);

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      if (!event.data || event.data.type !== "gutenform_google_oauth") return;

      if (event.data.success) {
        toast({
          title: __("googleConnected"),
          description: event.data.email
            ? `${__("googleConnectedAs")} ${event.data.email}`
            : __("googleConnectedDesc"),
        });
        refetchStatus();
      } else if (event.data.message) {
        toast({
          title: __("googleConnectionFailed"),
          description: event.data.message,
          variant: "destructive",
        });
      }
    };

    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [refetchStatus]);

  const handleSaveCredentials = async () => {
    try {
      await saveCredentials(clientId, clientSecret, apiKey);
      toast({ title: __("googleCredentialsSaved"), description: __("googleCredentialsSavedDesc") });
      setClientSecret("");
      setApiKey("");
      refetchStatus();
    } catch (err) {
      toast({
        title: __("error"),
        description: err instanceof Error ? err.message : __("errorOccurred"),
        variant: "destructive",
      });
    }
  };

  const handleConnect = async () => {
    try {
      const url = await getAuthUrl();
      const popup = window.open(
        url,
        "gutenform_google_oauth",
        "width=520,height=720,scrollbars=yes,resizable=yes,status=yes"
      );

      if (!popup) {
        toast({
          title: __("googleConnectionFailed"),
          description: __("googlePopupBlocked"),
          variant: "destructive",
        });
        return;
      }

      popup.focus();
    } catch (err) {
      toast({
        title: __("googleConnectionFailed"),
        description: err instanceof Error ? err.message : __("errorOccurred"),
        variant: "destructive",
      });
    }
  };

  const handleDisconnect = async () => {
    try {
      await disconnect();
      toast({ title: __("googleDisconnected"), description: __("googleDisconnectedDesc") });
      refetchStatus();
    } catch (err) {
      toast({
        title: __("error"),
        description: err instanceof Error ? err.message : __("errorOccurred"),
        variant: "destructive",
      });
    }
  };

  const copyRedirectUri = () => {
    if (status?.redirect_uri) {
      navigator.clipboard.writeText(status.redirect_uri);
      toast({ title: __("copied"), description: __("googleRedirectUriCopied") });
    }
  };

  if (statusLoading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground py-4">
        <Loader2 className="h-4 w-4 animate-spin" />
        {__("loading")}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">{__("googleProviderConnectionTitle")}</CardTitle>
          <CardDescription>{__("googleProviderConnectionDesc")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>{__("googleSetupInstructions")}</AlertTitle>
            <AlertDescription className="space-y-2 mt-2">
              <ol className="list-decimal list-inside space-y-1 text-sm">
                <li>{__("googleSetupStep1")}</li>
                <li>{__("googleSetupStepPicker")}</li>
                <li>{__("googleSetupStep2")}</li>
                <li>{__("googleSetupStep3")}</li>
                <li>{__("googleSetupStep4")}</li>
              </ol>
              <a
                href="https://console.cloud.google.com/apis/credentials"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-primary text-sm hover:underline mt-2"
              >
                {__("googleOpenCloudConsole")}
                <ExternalLink className="h-3 w-3" />
              </a>
            </AlertDescription>
          </Alert>

          {status?.redirect_uri && (
            <div className="space-y-1">
              <Label>{__("googleRedirectUri")}</Label>
              <div className="flex gap-2">
                <Input value={status.redirect_uri} readOnly className="font-mono text-xs" />
                <Button type="button" variant="outline" size="icon" onClick={copyRedirectUri}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">{__("googleRedirectUriHelp")}</p>
            </div>
          )}

          <div className="grid gap-3">
            <div className="space-y-1">
              <Label>{__("googleClientId")}</Label>
              <Input
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                placeholder={__("googleClientIdPlaceholder")}
              />
            </div>
            <div className="space-y-1">
              <Label>{__("googleClientSecret")}</Label>
              <Input
                type="password"
                value={clientSecret}
                onChange={(e) => setClientSecret(e.target.value)}
                placeholder={
                  status?.has_credentials
                    ? __("googleClientSecretPlaceholderExisting")
                    : __("googleClientSecretPlaceholder")
                }
              />
            </div>
            <div className="space-y-1">
              <Label>{__("googleApiKey")}</Label>
              <Input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder={
                  status?.has_api_key ? __("googleApiKeyPlaceholderExisting") : __("googleApiKeyPlaceholder")
                }
              />
              <p className="text-xs text-muted-foreground">{__("googleApiKeyHelp")}</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleSaveCredentials}
              disabled={savingCredentials || !clientId}
            >
              {savingCredentials && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {__("googleSaveCredentials")}
            </Button>

            {status?.has_credentials && !status.connected && (
              <Button type="button" onClick={handleConnect} disabled={authLoading}>
                {authLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {__("googleConnectAccount")}
              </Button>
            )}

            {status?.connected && (
              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1 text-sm text-green-600">
                  <CheckCircle2 className="h-4 w-4" />
                  {__("googleConnectedAs")} {status.email || status.name}
                </span>
                <Button type="button" variant="outline" size="sm" onClick={handleDisconnect}>
                  <Unplug className="h-3 w-3 mr-1" />
                  {__("googleDisconnect")}
                </Button>
              </div>
            )}
          </div>

          {status?.connected && (
            <p className="text-sm text-muted-foreground">{__("googleConfigureInFormHint")}</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
