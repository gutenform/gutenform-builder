"use client"

import { useState } from "react"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "@/components/ui/use-toast"
import { useProviders, useCreateProvider, useUpdateProvider, useDeleteProvider, type Provider } from "@/hooks/useProviders"
import { Plus, Trash2, Edit2, Settings } from "lucide-react"

const providerFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  provider_type: z.string().min(1, "Provider type is required"),
  is_active: z.boolean().default(true),
  settings: z.string().optional(),
})

type ProviderFormValues = z.infer<typeof providerFormSchema>

const providerTypes = [
  { value: "smtp", label: "SMTP" },
  { value: "sendgrid", label: "SendGrid" },
  { value: "mailgun", label: "Mailgun" },
  { value: "ses", label: "Amazon SES" },
]

export default function ProvidersPage() {
  const { providers, loading, error, refetch } = useProviders()
  const { createProvider, loading: creating } = useCreateProvider()
  const { updateProvider, loading: updating } = useUpdateProvider()
  const { deleteProvider, loading: deleting } = useDeleteProvider()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingProvider, setEditingProvider] = useState<Provider | null>(null)

  const form = useForm<ProviderFormValues>({
    resolver: zodResolver(providerFormSchema),
    defaultValues: {
      name: "",
      provider_type: "",
      is_active: true,
      settings: "",
    },
  })

  const handleOpenDialog = (provider?: Provider) => {
    if (provider) {
      setEditingProvider(provider)
      form.reset({
        name: provider.name,
        provider_type: provider.provider_type,
        is_active: provider.is_active,
        settings: JSON.stringify(provider.settings || {}, null, 2),
      })
    } else {
      setEditingProvider(null)
      form.reset({
        name: "",
        provider_type: "",
        is_active: true,
        settings: "",
      })
    }
    setIsDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setIsDialogOpen(false)
    setEditingProvider(null)
    form.reset()
  }

  const onSubmit = async (data: ProviderFormValues) => {
    try {
      let settings = {}
      if (data.settings) {
        try {
          settings = JSON.parse(data.settings)
        } catch {
          toast({
            title: "Invalid JSON",
            description: "Settings must be valid JSON format.",
            variant: "destructive",
          })
          return
        }
      }

      if (editingProvider) {
        await updateProvider({
          id: editingProvider.id,
          name: data.name,
          provider_type: data.provider_type,
          is_active: data.is_active,
          settings,
        })
        toast({
          title: "Provider updated",
          description: "The provider has been updated successfully.",
        })
      } else {
        await createProvider({
          name: data.name,
          provider_type: data.provider_type,
          is_active: data.is_active,
          settings,
        })
        toast({
          title: "Provider created",
          description: "The provider has been created successfully.",
        })
      }
      refetch()
      handleCloseDialog()
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "An error occurred",
        variant: "destructive",
      })
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this provider?")) {
      return
    }

    try {
      await deleteProvider(id)
      toast({
        title: "Provider deleted",
        description: "The provider has been deleted successfully.",
      })
      refetch()
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "An error occurred",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return <div>Loading providers...</div>
  }

  if (error) {
    return <div className="text-destructive">Error: {error.message}</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Email Providers</h3>
          <p className="text-sm text-muted-foreground">
            Manage email service providers for sending form submissions.
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open)
          if (!open) {
            handleCloseDialog()
          }
        }}>
          <Button onClick={() => handleOpenDialog()}>
            <Plus className="mr-2 h-4 w-4" />
            Add Provider
          </Button>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingProvider ? "Edit Provider" : "Create Provider"}
              </DialogTitle>
              <DialogDescription>
                {editingProvider
                  ? "Update the provider details below."
                  : "Configure a new email service provider."}
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="My SMTP Provider" {...field} />
                      </FormControl>
                      <FormDescription>
                        A descriptive name for this provider.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="provider_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Provider Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a provider type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {providerTypes.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Select the type of email service provider.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="is_active"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Active</FormLabel>
                        <FormDescription>
                          Enable or disable this provider.
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
                <FormField
                  control={form.control}
                  name="settings"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Settings (JSON)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder='{"host": "smtp.example.com", "port": 587, "username": "user", "password": "pass"}'
                          className="font-mono text-sm"
                          rows={6}
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Provider-specific settings in JSON format.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCloseDialog}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={creating || updating}>
                    {editingProvider ? "Update" : "Create"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
      <Separator />
      {providers.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-10">
            <Settings className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-sm text-muted-foreground">
              No providers found. Create your first provider to get started.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {providers.map((provider) => (
            <Card key={provider.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {provider.name}
                      {provider.is_active && (
                        <span className="text-xs bg-green-500 text-white px-2 py-1 rounded">
                          Active
                        </span>
                      )}
                      {!provider.is_active && (
                        <span className="text-xs bg-gray-500 text-white px-2 py-1 rounded">
                          Inactive
                        </span>
                      )}
                    </CardTitle>
                    <CardDescription>
                      Type: {provider.provider_type} • Created{" "}
                      {new Date(provider.date_created).toLocaleDateString()}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleOpenDialog(provider)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleDelete(provider.id)}
                      disabled={deleting}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

