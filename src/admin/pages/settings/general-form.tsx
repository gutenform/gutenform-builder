"use client"

import { __ } from "@/lib/i18n";
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"

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
import { toast } from "@/components/ui/use-toast"

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
  const form = useForm<GeneralFormValues>({
    resolver: zodResolver(generalFormSchema),
    defaultValues,
    mode: "onChange",
  })

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
      </form>
    </Form>
  )
}

