"use client"

import { __ } from "@/lib/i18n";
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { useState, useEffect } from "react"

import { Button } from "@/components/ui/button"
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
import { toast } from "@/components/ui/use-toast"
import { apiGet, apiPost } from "@/lib/api"
import { Separator } from "@/components/ui/separator"

const generalFormSchema = z.object({
  licenseKey: z
    .string()
    .min(1, {
      message: __("licenseKeyRequired"),
    })
    .optional(),
})

type GeneralFormValues = z.infer<typeof generalFormSchema>

const defaultValues: Partial<GeneralFormValues> = {
  licenseKey: "",
}

export function GeneralForm() {
  const [debugEnabled, setDebugEnabled] = useState(false)
  const [debugLoading, setDebugLoading] = useState(true)
  const [debugSaving, setDebugSaving] = useState(false)

  const [adminBarEnabled, setAdminBarEnabled] = useState(true)
  const [adminBarLoading, setAdminBarLoading] = useState(true)
  const [adminBarSaving, setAdminBarSaving] = useState(false)

  const form = useForm<GeneralFormValues>({
    resolver: zodResolver(generalFormSchema),
    defaultValues,
    mode: "onChange",
  })

  useEffect(() => {
    loadDebugStatus()
    loadAdminBarStatus()
  }, [])

  const loadDebugStatus = async () => {
    try {
      setDebugLoading(true)
      const response = await apiGet<{ enabled: boolean }>("/settings/debug")
      if (response.enabled !== undefined) {
        setDebugEnabled(response.enabled)
      }
    } catch (err: any) {
      console.error("Failed to load debug status:", err)
    } finally {
      setDebugLoading(false)
    }
  }

  const handleDebugToggle = async (enabled: boolean) => {
    try {
      setDebugSaving(true)
      const response = await apiPost<{ enabled: boolean; message: string }>("/settings/debug", {
        enabled,
      })
      setDebugEnabled(response.enabled)
      toast({
        title: __("settingsSaved"),
        description: response.message || (enabled ? __("debugModeEnabled") : __("debugModeDisabled")),
      })
    } catch (err: any) {
      toast({
        title: __("error"),
        description: err.message || __("errorOccurred"),
        variant: "destructive",
      })
    } finally {
      setDebugSaving(false)
    }
  }

  const loadAdminBarStatus = async () => {
    try {
      setAdminBarLoading(true)
      const response = await apiGet<{ enabled: boolean }>("/settings/admin-bar")
      if (response.enabled !== undefined) {
        setAdminBarEnabled(response.enabled)
      }
    } catch (err: any) {
      console.error("Failed to load admin bar status:", err)
    } finally {
      setAdminBarLoading(false)
    }
  }

  const handleAdminBarToggle = async (enabled: boolean) => {
    try {
      setAdminBarSaving(true)
      const response = await apiPost<{ enabled: boolean; message: string }>("/settings/admin-bar", {
        enabled,
      })
      setAdminBarEnabled(response.enabled)
      toast({
        title: __("settingsSaved"),
        description: enabled ? __("adminBarMenuEnabled") : __("adminBarMenuDisabled"),
      })
    } catch (err: any) {
      toast({
        title: __("error"),
        description: err.message || __("errorOccurred"),
        variant: "destructive",
      })
    } finally {
      setAdminBarSaving(false)
    }
  }

  function onSubmit(data: GeneralFormValues) {
    toast({
      title: __("settingsSaved"),
      description: __("settingsSavedDescription"),
    })
    // TODO: Implement API call to save settings
    console.log("Settings data:", data)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="licenseKey"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{__('licenseKey')}</FormLabel>
              <FormControl>
                <Input 
                  type="password"
                  placeholder={__("enterLicenseKey")} 
                  {...field} 
                />
              </FormControl>
              <FormDescription>
                {__('licenseKeyDescription')}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">{__('saveChanges')}</Button>

        <Separator />

        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
          <div className="space-y-0.5">
            <FormLabel className="text-base">{__('debugMode')}</FormLabel>
            <FormDescription>
              {__('debugModeDescription')}
            </FormDescription>
          </div>
          <FormControl>
            <Switch
              checked={debugEnabled}
              onCheckedChange={handleDebugToggle}
              disabled={debugLoading || debugSaving}
            />
          </FormControl>
        </FormItem>

        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
          <div className="space-y-0.5">
            <FormLabel className="text-base">{__('adminBarMenu')}</FormLabel>
            <FormDescription>
              {__('adminBarMenuDescription')}
            </FormDescription>
          </div>
          <FormControl>
            <Switch
              checked={adminBarEnabled}
              onCheckedChange={handleAdminBarToggle}
              disabled={adminBarLoading || adminBarSaving}
            />
          </FormControl>
        </FormItem>
      </form>
    </Form>
  )
}

