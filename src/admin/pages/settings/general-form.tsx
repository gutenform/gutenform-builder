"use client"

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
      message: "License key is required.",
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
      title: "Settings saved",
      description: "Your general settings have been updated successfully.",
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
              <FormLabel>License Key</FormLabel>
              <FormControl>
                <Input 
                  type="password"
                  placeholder="Enter your license key" 
                  {...field} 
                />
              </FormControl>
              <FormDescription>
                Enter your Gutenform license key to unlock premium features.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Save changes</Button>
      </form>
    </Form>
  )
}

