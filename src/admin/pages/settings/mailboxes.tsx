"use client"

import { __ } from "@/lib/i18n";
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
import { Switch } from "@/components/ui/switch"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "@/components/ui/use-toast"
import { useMailboxes, useCreateMailbox, useUpdateMailbox, useDeleteMailbox, type Mailbox } from "@/hooks/useMailboxes"
import { Plus, Trash2, Edit2, Mail } from "lucide-react"

const mailboxFormSchema = z.object({
  title: z.string().min(1, __("titleRequired")),
  is_default: z.boolean().default(false),
})

type MailboxFormValues = z.infer<typeof mailboxFormSchema>

export default function MailboxesPage() {
  const { mailboxes, loading, error, refetch } = useMailboxes()
  const { createMailbox, loading: creating } = useCreateMailbox()
  const { updateMailbox, loading: updating } = useUpdateMailbox()
  const { deleteMailbox, loading: deleting } = useDeleteMailbox()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingMailbox, setEditingMailbox] = useState<Mailbox | null>(null)

  const form = useForm<MailboxFormValues>({
    resolver: zodResolver(mailboxFormSchema),
    defaultValues: {
      title: "",
      is_default: false,
    },
  })

  const handleOpenDialog = (mailbox?: Mailbox) => {
    if (mailbox) {
      setEditingMailbox(mailbox)
      form.reset({
        title: mailbox.title,
        is_default: mailbox.is_default,
      })
    } else {
      setEditingMailbox(null)
      form.reset({
        title: "",
        is_default: false,
      })
    }
    setIsDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setIsDialogOpen(false)
    setEditingMailbox(null)
    form.reset()
  }

  const onSubmit = async (data: MailboxFormValues) => {
    try {
      if (editingMailbox) {
        await updateMailbox({
          id: editingMailbox.id,
          ...data,
        })
        toast({
          title: __("mailboxUpdated"),
          description: __("mailboxUpdatedDesc"),
        })
      } else {
        await createMailbox(data)
        toast({
          title: __("mailboxCreated"),
          description: __("mailboxCreatedDesc"),
        })
      }
      refetch()
      handleCloseDialog()
    } catch (err) {
      toast({
        title: __("error"),
        description: err instanceof Error ? err.message : __("errorOccurred"),
        variant: "destructive",
      })
    }
  }

  const handleDelete = async (id: number) => {
    // Find the mailbox to check if it's default
    const mailbox = mailboxes.find(m => m.id === id)
    
    if (mailbox?.is_default) {
      toast({
        title: __("cannotDeleteDefaultMailbox"),
        description: __("cannotDeleteDefaultMailboxDesc"),
        variant: "destructive",
      })
      return
    }

    if (!confirm(__("confirmDeleteMailbox"))) {
      return
    }

    try {
      await deleteMailbox(id)
      toast({
        title: __("mailboxDeleted"),
        description: __("mailboxDeletedDesc"),
      })
      refetch()
    } catch (err) {
      toast({
        title: __("error"),
        description: err instanceof Error ? err.message : __("errorOccurred"),
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return <div>{__('loadingMailboxes')}</div>
  }

  if (error) {
    return <div className="text-destructive">{__('errorMailboxes')} {error.message}</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">{__('mailboxes')}</h3>
          <p className="text-sm text-muted-foreground">
            {__('manageMailboxes')}
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
            {__('addMailbox')}
          </Button>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingMailbox ? __("editMailbox") : __("createMailbox")}
              </DialogTitle>
              <DialogDescription>
                {editingMailbox
                  ? __("updateMailboxDescription")
                  : __("createMailboxDescription")}
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{__('title')}</FormLabel>
                      <FormControl>
                        <Input placeholder={__("myMailbox")} {...field} />
                      </FormControl>
                      <FormDescription>
                        {__('mailboxTitleDescription')}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="is_default"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">{__('defaultMailbox')}</FormLabel>
                        <FormDescription>
                          {__('defaultMailboxDescription')}
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
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCloseDialog}
                  >
                    {__('cancel')}
                  </Button>
                  <Button type="submit" disabled={creating || updating}>
                    {editingMailbox ? __("update") : __("create")}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
      <Separator />
      {mailboxes.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-10">
            <Mail className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-sm text-muted-foreground">
              {__('noMailboxesFound')}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {mailboxes.map((mailbox) => (
            <Card key={mailbox.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {mailbox.title}
                      {mailbox.is_default && (
                        <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded">
                          {__('default')}
                        </span>
                      )}
                    </CardTitle>
                    <CardDescription>
                      {__('created')} {new Date(mailbox.date_created).toLocaleDateString()}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleOpenDialog(mailbox)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleDelete(mailbox.id)}
                      disabled={deleting || mailbox.is_default}
                      title={mailbox.is_default ? __("defaultMailboxCannotBeDeleted") : __("deleteMailbox")}
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

