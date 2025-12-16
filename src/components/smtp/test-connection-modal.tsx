"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CheckCircle2, XCircle, Loader2, Mail, Server, User, Lock, Send } from "lucide-react"
import { __ } from "@/lib/i18n"
import { cn } from "@/lib/utils"

interface TestConnectionModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  formData: {
    enabled: boolean
    host?: string
    port?: number | string
    encryption?: string
    auth?: boolean
    username?: string
    password?: string
    from_email?: string
    from_name?: string
  }
  onTest: (testEmail: string) => Promise<{ success: boolean; message: string; logs?: string[] }>
}

type TestStep = {
  id: string
  label: string
  status: "pending" | "running" | "success" | "error"
  message?: string
  details?: any
}

export function TestConnectionModal({
  open,
  onOpenChange,
  formData,
  onTest,
}: TestConnectionModalProps) {
  const [steps, setSteps] = useState<TestStep[]>([])
  const [currentStep, setCurrentStep] = useState<string | null>(null)
  const [result, setResult] = useState<{ success: boolean; message: string; logs?: string[] } | null>(null)
  const [testing, setTesting] = useState(false)
  const [testEmail, setTestEmail] = useState(formData.from_email || "")

  useEffect(() => {
    if (open && !testing) {
      // Initialize steps
      setSteps([
        {
          id: "validate",
          label: __("validatingSettings"),
          status: "pending",
        },
        {
          id: "configure",
          label: __("configuringSMTP"),
          status: "pending",
        },
        {
          id: "connect",
          label: __("connectingToServer"),
          status: "pending",
        },
        {
          id: "authenticate",
          label: __("authenticating"),
          status: "pending",
        },
        {
          id: "send",
          label: __("sendingTestEmail"),
          status: "pending",
        },
        {
          id: "response",
          label: __("receivingResponse"),
          status: "pending",
        },
      ])
      setResult(null)
      setCurrentStep(null)
      // Set default test email from formData
      setTestEmail(formData.from_email || "")
    }
  }, [open, testing, formData.from_email])

  const handleTest = async () => {
    setTesting(true)
    setResult(null)
    
    // Step 1: Validate settings
    setCurrentStep("validate")
    setSteps((prev) =>
      prev.map((s) =>
        s.id === "validate" ? { ...s, status: "running" as const } : s
      )
    )

    await new Promise((resolve) => setTimeout(resolve, 500))

    // Validate
    const validationErrors: string[] = []
    if (!formData.host) validationErrors.push(__("smtpHostRequired"))
    if (!formData.port) validationErrors.push(__("smtpPortRequired"))
    if (formData.auth && !formData.username) validationErrors.push(__("smtpUsernameRequired"))
    if (!formData.from_email || !formData.from_email.includes("@")) {
      validationErrors.push(__("invalidEmail") + " (From Email)")
    }
    if (!testEmail || !testEmail.includes("@")) {
      validationErrors.push(__("invalidEmail") + " (Test Email)")
    }

    if (validationErrors.length > 0) {
      setSteps((prev) =>
        prev.map((s) =>
          s.id === "validate"
            ? {
                ...s,
                status: "error" as const,
                message: validationErrors.join(", "),
              }
            : s
        )
      )
      setResult({
        success: false,
        message: validationErrors.join(", "),
      })
      setTesting(false)
      return
    }

    setSteps((prev) =>
      prev.map((s) =>
        s.id === "validate"
          ? { ...s, status: "success" as const, message: __("settingsValid") }
          : s
      )
    )

    // Step 2: Configure SMTP
    setCurrentStep("configure")
    setSteps((prev) =>
      prev.map((s) =>
        s.id === "configure" ? { ...s, status: "running" as const } : s
      )
    )

    await new Promise((resolve) => setTimeout(resolve, 300))

    setSteps((prev) =>
      prev.map((s) =>
        s.id === "configure"
          ? {
              ...s,
              status: "success" as const,
              message: `${formData.host}:${formData.port} (${formData.encryption?.toUpperCase()})`,
            }
          : s
      )
    )

    // Step 3: Connect to server
    setCurrentStep("connect")
    setSteps((prev) =>
      prev.map((s) =>
        s.id === "connect" ? { ...s, status: "running" as const } : s
      )
    )

    await new Promise((resolve) => setTimeout(resolve, 500))

    setSteps((prev) =>
      prev.map((s) =>
        s.id === "connect"
          ? { ...s, status: "success" as const, message: __("connectedToServer") }
          : s
      )
    )

    // Step 4: Authenticate (if enabled)
    if (formData.auth) {
      setCurrentStep("authenticate")
      setSteps((prev) =>
        prev.map((s) =>
          s.id === "authenticate" ? { ...s, status: "running" as const } : s
        )
      )

      await new Promise((resolve) => setTimeout(resolve, 500))

      setSteps((prev) =>
        prev.map((s) =>
          s.id === "authenticate"
            ? {
                ...s,
                status: "success" as const,
                message: __("authenticationSuccessful"),
              }
            : s
        )
      )
    } else {
      setSteps((prev) =>
        prev.map((s) =>
          s.id === "authenticate"
            ? { ...s, status: "success" as const, message: __("authenticationNotRequired") }
            : s
        )
      )
    }

    // Step 5: Send test email
    setCurrentStep("send")
    setSteps((prev) =>
      prev.map((s) =>
        s.id === "send" ? { ...s, status: "running" as const } : s
      )
    )

    try {
      const testResult = await onTest(testEmail)
      setResult(testResult)

      if (testResult.success) {
        setSteps((prev) =>
          prev.map((s) =>
            s.id === "send"
              ? {
                  ...s,
                  status: "success" as const,
                  message: __("testEmailSent"),
                }
              : s
          )
        )

        // Step 6: Response received
        setCurrentStep("response")
        setSteps((prev) =>
          prev.map((s) =>
            s.id === "response"
              ? {
                  ...s,
                  status: "success" as const,
                  message: testResult.message,
                }
              : s
          )
        )
      } else {
        // Mark send step as error
        setSteps((prev) =>
          prev.map((s) =>
            s.id === "send"
              ? {
                  ...s,
                  status: "error" as const,
                  message: testResult.message || __("testFailed"),
                }
              : s
          )
        )

        // Mark response step as error
        setCurrentStep("response")
        setSteps((prev) =>
          prev.map((s) =>
            s.id === "response"
              ? {
                  ...s,
                  status: "error" as const,
                  message: __("errorReceived"),
                }
              : s
          )
        )
      }
    } catch (error: any) {
      const errorMessage =
        error?.errorData?.message || error?.message || __("testFailed")
      
      const errorResult = {
        success: false,
        message: errorMessage,
        logs: error?.logs || [],
      }
      
      setResult(errorResult)
      
      // Mark send step as error
      setSteps((prev) =>
        prev.map((s) =>
          s.id === "send"
            ? {
                ...s,
                status: "error" as const,
                message: errorMessage,
              }
            : s
        )
      )

      // Mark response step as error
      setCurrentStep("response")
      setSteps((prev) =>
        prev.map((s) =>
          s.id === "response"
            ? {
                ...s,
                status: "error" as const,
                message: __("errorReceived"),
              }
            : s
        )
      )
    } finally {
      setTesting(false)
      setCurrentStep(null)
      // Don't close modal automatically - let user close it manually after seeing the result
    }
  }

  const getStepIcon = (step: TestStep) => {
    if (step.status === "running" || (currentStep === step.id && testing)) {
      return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
    }
    if (step.status === "success") {
      return <CheckCircle2 className="h-4 w-4 text-green-500" />
    }
    if (step.status === "error") {
      return <XCircle className="h-4 w-4 text-red-500" />
    }
    return <div className="h-4 w-4 rounded-full border-2 border-gray-300" />
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      // Only allow closing if not testing
      if (!testing) {
        onOpenChange(isOpen)
      }
    }}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{__("testSMTPConnection")}</DialogTitle>
          <DialogDescription>
            {__("testSMTPConnectionDescription")}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Test Email Input */}
          <div className="space-y-2">
            <Label htmlFor="test-email">{__("testEmailAddress")}</Label>
            <Input
              id="test-email"
              type="email"
              placeholder={__("testEmailPlaceholder")}
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              disabled={testing}
            />
            <p className="text-xs text-muted-foreground">
              {__("testEmailDescription")}
            </p>
          </div>

          <Separator />

          {/* SMTP Settings Summary */}
          <div className="rounded-lg border p-4 space-y-3 bg-muted/50">
            <h4 className="font-semibold text-sm">{__("smtpSettings")}</h4>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2">
                <Server className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">{__("smtpHost")}:</span>
                <span className="font-medium">{formData.host || "-"}</span>
              </div>
              <div className="flex items-center gap-2">
                <Server className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">{__("smtpPort")}:</span>
                <span className="font-medium">{formData.port || "-"}</span>
              </div>
              <div className="flex items-center gap-2">
                <Lock className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">{__("smtpEncryption")}:</span>
                <span className="font-medium">
                  {(formData.encryption || "TLS").toUpperCase()}
                </span>
              </div>
              {formData.auth && (
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">{__("smtpUsername")}:</span>
                  <span className="font-medium">{formData.username || "-"}</span>
                </div>
              )}
              <div className="flex items-center gap-2 col-span-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">{__("from")}:</span>
                <span className="font-medium">
                  {formData.from_name || ""} &lt;{formData.from_email || "-"}&gt;
                </span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Test Steps */}
          <div className="space-y-2">
            <h4 className="font-semibold text-sm">{__("testProgress")}</h4>
            {steps.map((step) => (
              <div
                key={step.id}
                className={cn(
                  "flex items-start gap-3 p-3 rounded-lg border transition-colors",
                  step.status === "running" && "bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800",
                  step.status === "success" && "bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800",
                  step.status === "error" && "bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800"
                )}
              >
                <div className="mt-0.5">{getStepIcon(step)}</div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm">{step.label}</div>
                  {step.message && (
                    <div className="text-xs text-muted-foreground mt-1">
                      {step.message}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Result */}
          {(result || steps.some(s => s.status === "error")) && (
            <>
              <Separator />
              <div
                className={cn(
                  "rounded-lg border p-4",
                  result && result.success === true && !steps.some(s => s.status === "error")
                    ? "bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800"
                    : "bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800"
                )}
              >
                <div className="flex items-start gap-2">
                  {result && result.success === true && !steps.some(s => s.status === "error") ? (
                    <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <div className="font-semibold text-sm">
                      {result && result.success === true && !steps.some(s => s.status === "error") 
                        ? __("testSuccessful") 
                        : __("testFailed")}
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      {result?.message || steps.find(s => s.status === "error")?.message || __("testFailed")}
                    </div>
                    {result?.logs && result.logs.length > 0 && (
                      <div className="mt-3">
                        <div className="text-xs font-medium mb-1">{__("logs")}:</div>
                        <pre className="text-xs bg-background p-2 rounded border overflow-auto max-h-32">
                          {result.logs.join("\n")}
                        </pre>
                      </div>
                    )}
                    {/* Show error steps */}
                    {steps.filter(s => s.status === "error").length > 0 && (
                      <div className="mt-3">
                        <div className="text-xs font-medium mb-1">{__("errorDetails")}:</div>
                        <div className="space-y-1">
                          {steps
                            .filter(s => s.status === "error")
                            .map((step) => (
                              <div key={step.id} className="text-xs text-red-600 dark:text-red-400">
                                • {step.label}: {step.message}
                              </div>
                            ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-2">
            {!testing && !result && (
              <>
                <Button variant="outline" onClick={() => onOpenChange(false)}>
                  {__("cancel")}
                </Button>
                <Button onClick={handleTest}>
                  <Send className="h-4 w-4 mr-2" />
                  {__("startTest")}
                </Button>
              </>
            )}
            {testing && (
              <Button disabled>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {__("testing")}
              </Button>
            )}
            {result && !testing && (
              <Button onClick={() => onOpenChange(false)}>
                {__("close")}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

