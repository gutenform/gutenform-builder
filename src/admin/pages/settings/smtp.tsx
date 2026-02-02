"use client"

import { __ } from "@/lib/i18n";
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Mail, FileText, ExternalLink } from "lucide-react"

export default function SmtpPage() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">{__("smtpSettings")}</h3>
        <p className="text-sm text-muted-foreground">
          {__("smtpSettingsDescription")}
        </p>
      </div>

      <div className="space-y-4">
        <Alert>
          <Mail className="h-4 w-4" />
          <AlertDescription>
            {__("smtpPageHint")}{" "}
            <a
              href="https://wordpress.org/plugins/wp-mail-smtp/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline inline-flex items-center gap-1 font-medium"
            >
              {__("wpMailSmtpHint")}
              <ExternalLink className="h-3 w-3" />
            </a>
          </AlertDescription>
        </Alert>

        <Alert variant="outline">
          <FileText className="h-4 w-4" />
          <AlertDescription>
            {__("wpMailLoggingHint")}{" "}
            <a
              href="https://wordpress.org/plugins/wp-mail-logging/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline inline-flex items-center gap-1"
            >
              {__("wpMailLoggingPlugin")}
              <ExternalLink className="h-3 w-3" />
            </a>
          </AlertDescription>
        </Alert>
      </div>
    </div>
  )
}
