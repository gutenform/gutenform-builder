"use client"

import { __ } from "@/lib/i18n";
import { useState, useEffect } from "react"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import { TestConnectionModal } from "@/components/smtp/test-connection-modal"
import { apiGet, apiPost } from "@/lib/api"
import { ExternalLink, Mail } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

const smtpFormSchema = z.object({
  enabled: z.boolean().default(false),
  host: z.string().min(1, __("smtpHostRequired")).optional(),
  port: z.union([z.string(), z.number()]).transform((val) => {
    // Convert string to number if needed
    if (typeof val === 'string') {
      const num = parseInt(val, 10);
      return isNaN(num) ? val : num;
    }
    return val;
  }).pipe(z.number().int().positive().optional()),
  encryption: z.enum(["tls", "ssl", "none"]).optional(),
  auth: z.boolean().default(true),
  username: z.string().optional(),
  password: z.string().optional(),
  from_email: z.string().email(__("invalidEmail")).optional(),
  from_name: z.string().optional(),
  email_logging: z.boolean().default(false),
}).refine((data) => {
  if (data.enabled) {
    return data.host && data.host.length > 0;
  }
  return true;
}, {
  message: __("smtpHostRequired"),
  path: ["host"],
}).refine((data) => {
  if (data.enabled && data.auth) {
    return data.username && data.username.length > 0;
  }
  return true;
}, {
  message: __("smtpUsernameRequired"),
  path: ["username"],
})

type SmtpFormValues = z.infer<typeof smtpFormSchema>

interface SmtpSettings {
  enabled: boolean;
  host: string;
  port: string;
  encryption: string;
  auth: boolean;
  username: string;
  password: string;
  from_email: string;
  from_name: string;
  email_logging: boolean;
}

export default function SmtpPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [testing, setTesting] = useState(false)
  const [settings, setSettings] = useState<SmtpSettings | null>(null)
  const [testModalOpen, setTestModalOpen] = useState(false)

  const form = useForm<SmtpFormValues>({
    resolver: zodResolver(smtpFormSchema),
    defaultValues: {
      enabled: false,
      host: "",
      port: "587",
      encryption: "tls",
      auth: true,
      username: "",
      password: "",
      from_email: "",
      from_name: "",
      email_logging: false,
    },
  })

  const enabled = form.watch("enabled")
  const auth = form.watch("auth")

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      setLoading(true)
      const data = await apiGet<{ data: SmtpSettings }>("/settings/smtp")
      if (data.data) {
        setSettings(data.data)
        // Don't populate password field for security
        form.reset({
          enabled: data.data.enabled || false,
          host: data.data.host || "",
          port: typeof data.data.port === 'number' ? data.data.port.toString() : (data.data.port || "587"),
          encryption: (data.data.encryption as "tls" | "ssl" | "none") || "tls",
          auth: data.data.auth !== false,
          username: data.data.username || "",
          password: "", // Always empty for security
          from_email: data.data.from_email || "",
          from_name: data.data.from_name || "",
          email_logging: data.data.email_logging || false,
        })
      }
    } catch (err: any) {
      toast({
        title: __("error"),
        description: err.message || __("errorOccurred"),
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const onSubmit = async (data: SmtpFormValues) => {
    try {
      setSaving(true)
      const response = await apiPost<{ success: boolean; message: string; data: SmtpSettings }>("/settings/smtp", data)
      
      if (response.success) {
        setSettings(response.data)
        toast.success(__("settingsSaved"), {
          description: __("smtpSettingsSaved"),
        })
      } else {
        toast.error(__("error"), {
          description: response.message || __("errorOccurred"),
        })
      }
    } catch (err: any) {
      toast.error(__("error"), {
        description: err.message || err.errorData?.message || __("errorOccurred"),
      })
    } finally {
      setSaving(false)
    }
  }

  const handleTestConnection = async () => {
    const formData = form.getValues()
    
    // Validate SMTP is enabled before testing
    if (!formData.enabled) {
      toast.error(__("smtpNotEnabled"))
      return
    }
    
    setTestModalOpen(true)
  }

  const performTest = async (testEmail: string): Promise<{ success: boolean; message: string; logs?: string[] }> => {
    const formData = form.getValues()
    const logs: string[] = []
    
    try {
      logs.push(`[${new Date().toISOString()}] Starting SMTP test...`)
      logs.push(`[${new Date().toISOString()}] Host: ${formData.host}`)
      logs.push(`[${new Date().toISOString()}] Port: ${formData.port}`)
      logs.push(`[${new Date().toISOString()}] Encryption: ${formData.encryption}`)
      logs.push(`[${new Date().toISOString()}] From: ${formData.from_name} <${formData.from_email}>`)
      logs.push(`[${new Date().toISOString()}] Test Email: ${testEmail}`)
      
      // Send current form settings to test endpoint
      const response = await apiPost<{ success: boolean; message: string }>("/settings/smtp/test", {
        test_email: testEmail,
        settings: {
          enabled: formData.enabled,
          host: formData.host,
          port: typeof formData.port === 'string' ? parseInt(formData.port, 10) : formData.port,
          encryption: formData.encryption,
          auth: formData.auth,
          username: formData.username,
          password: formData.password, // Send password for testing
          from_email: formData.from_email,
          from_name: formData.from_name,
        },
      })
      
      logs.push(`[${new Date().toISOString()}] Response received: ${response.success ? 'Success' : 'Failed'}`)
      
      if (response.success) {
        logs.push(`[${new Date().toISOString()}] ${response.message}`)
        toast.success(__("smtpTestSuccess"), {
          description: response.message,
        })
        return { success: true, message: response.message, logs }
      } else {
        logs.push(`[${new Date().toISOString()}] Error: ${response.message}`)
        return { success: false, message: response.message || __("smtpTestFailedDesc"), logs }
      }
    } catch (err: any) {
      // Extract error message from API response
      let errorMessage = __("smtpTestFailedDesc")
      
      // WordPress REST API error format: { code, message, data: { status } }
      if (err.errorData) {
        // WordPress REST API format
        if (err.errorData.message) {
          errorMessage = err.errorData.message
        } else if (err.errorData.code) {
          errorMessage = err.errorData.code
        }
      } else if (err.message) {
        // Standard error message
        errorMessage = err.message
      }
      
      logs.push(`[${new Date().toISOString()}] Exception: ${errorMessage}`)
      
      // Log error for debugging
      console.error('SMTP Test Connection Error:', {
        error: err,
        errorData: err.errorData,
        message: err.message,
        status: err.status,
        extractedMessage: errorMessage
      })
      
      toast.error(__("smtpTestFailed"), {
        description: errorMessage,
      })
      
      return { success: false, message: errorMessage, logs }
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium">{__("smtpSettings")}</h3>
          <p className="text-sm text-muted-foreground">
            {__("smtpSettingsDescription")}
          </p>
        </div>
        <Separator />
        <div className="text-center py-8">{__("loading")}</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">{__("smtpSettings")}</h3>
        <p className="text-sm text-muted-foreground">
          {__("smtpSettingsDescription")}
        </p>
      </div>
      <Separator />

      <Alert>
        <Mail className="h-4 w-4" />
        <AlertDescription>
          {__("smtpAdvancedSettings")}{" "}
          <a
            href="https://wordpress.org/plugins/wp-mail-smtp/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline inline-flex items-center gap-1"
          >
            {__("wpMailSmtpPlugin")}
            <ExternalLink className="h-3 w-3" />
          </a>
        </AlertDescription>
      </Alert>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{__("smtpConfiguration")}</CardTitle>
              <CardDescription>
                {__("smtpConfigurationDescription")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="enabled"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">
                        {__("enableSmtp")}
                      </FormLabel>
                      <FormDescription>
                        {__("enableSmtpDescription")}
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              {enabled && (
                <>
                  <FormField
                    control={form.control}
                    name="host"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{__("smtpHost")}</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="smtp.example.com"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          {__("smtpHostDescription")}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="port"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{__("smtpPort")}</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="587"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            {__("smtpPortDescription")}
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="encryption"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{__("smtpEncryption")}</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder={__("selectEncryption")} />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="tls">TLS</SelectItem>
                              <SelectItem value="ssl">SSL</SelectItem>
                              <SelectItem value="none">{__("none")}</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            {__("smtpEncryptionDescription")}
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="auth"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">
                            {__("smtpAuth")}
                          </FormLabel>
                          <FormDescription>
                            {__("smtpAuthDescription")}
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  {auth && (
                    <>
                      <FormField
                        control={form.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{__("smtpUsername")}</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="your-email@example.com"
                                {...field}
                              />
                            </FormControl>
                            <FormDescription>
                              {__("smtpUsernameDescription")}
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{__("smtpPassword")}</FormLabel>
                            <FormControl>
                              <Input
                                type="password"
                                placeholder={__("smtpPasswordPlaceholder")}
                                {...field}
                              />
                            </FormControl>
                            <FormDescription>
                              {__("smtpPasswordDescription")}
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </>
                  )}

                  <Separator />

                  <div className="space-y-4">
                    <h4 className="text-sm font-medium">{__("smtpFromSettings")}</h4>
                    
                    <FormField
                      control={form.control}
                      name="from_email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{__("smtpFromEmail")}</FormLabel>
                          <FormControl>
                            <Input
                              type="email"
                              placeholder="sender@example.com"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            {__("smtpFromEmailDescription")}
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="from_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{__("smtpFromName")}</FormLabel>
                          <FormControl>
                            <Input
                              placeholder={__("smtpFromNamePlaceholder")}
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            {__("smtpFromNameDescription")}
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </>
              )}

              <Separator />

              <FormField
                control={form.control}
                name="email_logging"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">
                        {__("enableEmailLogging")}
                      </FormLabel>
                      <FormDescription>
                        {__("enableEmailLoggingDescription")}
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <div className="flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={handleTestConnection}
              disabled={!enabled || saving}
            >
              {__("testConnection")}
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? __("saving") : __("saveChanges")}
            </Button>
          </div>
          
          <TestConnectionModal
            open={testModalOpen}
            onOpenChange={setTestModalOpen}
            formData={form.getValues()}
            onTest={performTest}
          />
        </form>
      </Form>

      {form.watch("email_logging") && (
        <EmailLogsSection />
      )}
    </div>
  )
}

// Email Logs Section Component
function EmailLogsSection() {
  const [logs, setLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const perPage = 20

  useEffect(() => {
    loadLogs()
  }, [page])

  const loadLogs = async () => {
    try {
      setLoading(true)
      const response = await apiGet<{ success: boolean; data: any[]; total: number }>(
        `/email-logs/get?page=${page}&per_page=${perPage}`
      )
      if (response.success) {
        setLogs(response.data || [])
        setTotal(response.total || 0)
      }
    } catch (err: any) {
      toast({
        title: __("error"),
        description: err.message || __("errorOccurred"),
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await apiPost("/email-logs/delete", { id })
      toast({
        title: __("emailLogDeleted"),
        description: __("emailLogDeletedDesc"),
      })
      loadLogs()
    } catch (err: any) {
      toast({
        title: __("error"),
        description: err.message || __("errorOccurred"),
        variant: "destructive",
      })
    }
  }

  const handleDeleteAll = async () => {
    if (!confirm(__("confirmDeleteAllEmailLogs"))) {
      return
    }
    try {
      await apiPost("/email-logs/delete-all", {})
      toast({
        title: __("allEmailLogsDeleted"),
        description: __("allEmailLogsDeletedDesc"),
      })
      loadLogs()
    } catch (err: any) {
      toast({
        title: __("error"),
        description: err.message || __("errorOccurred"),
        variant: "destructive",
      })
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{__("emailLogs")}</CardTitle>
            <CardDescription>
              {__("emailLogsDescription")}
            </CardDescription>
          </div>
          {logs.length > 0 && (
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDeleteAll}
            >
              {__("deleteAll")}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-8">{__("loading")}</div>
        ) : logs.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            {__("noEmailLogsFound")}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              {logs.map((log) => (
                <div
                  key={log.id}
                  className="border rounded-lg p-4 space-y-2"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{log.to_email}</span>
                        <span
                          className={`text-xs px-2 py-1 rounded ${
                            log.status === "sent"
                              ? "bg-green-100 text-green-800"
                              : log.status === "failed"
                              ? "bg-red-100 text-red-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {log.status}
                        </span>
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">
                        {log.subject}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {__("from")}: {log.from_email} | {__("date")}:{" "}
                        {new Date(log.date_sent).toLocaleString()}
                      </div>
                      {log.error_message && (
                        <div className="text-xs text-red-600 mt-1">
                          {__("error")}: {log.error_message}
                        </div>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(log.id)}
                    >
                      {__("delete")}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            {total > perPage && (
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  {__("showing")} {(page - 1) * perPage + 1} - {Math.min(page * perPage, total)} {__("of")} {total}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    {__("previous")}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => p + 1)}
                    disabled={page * perPage >= total}
                  >
                    {__("next")}
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

