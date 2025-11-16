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
import { Textarea } from "@/components/ui/textarea"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "@/components/ui/use-toast"
import { 
  useEntryLabels, 
  useCreateEntryLabel, 
  useUpdateEntryLabel, 
  useDeleteEntryLabel, 
  type EntryLabel 
} from "@/hooks/useEntryLabels"
import { Plus, Trash2, Edit2, Tag } from "lucide-react"

const labelFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, "Color must be a valid hex color (e.g., #FF0000)").default("#000000"),
})

type LabelFormValues = z.infer<typeof labelFormSchema>

export default function LabelsPage() {
  const { labels, loading, error, refetch } = useEntryLabels()
  const { createLabel, loading: creating } = useCreateEntryLabel()
  const { updateLabel, loading: updating } = useUpdateEntryLabel()
  const { deleteLabel, loading: deleting } = useDeleteEntryLabel()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingLabel, setEditingLabel] = useState<EntryLabel | null>(null)

  const form = useForm<LabelFormValues>({
    resolver: zodResolver(labelFormSchema),
    defaultValues: {
      name: "",
      description: "",
      color: "#000000",
    },
  })

  const handleOpenDialog = (label?: EntryLabel) => {
    if (label) {
      setEditingLabel(label)
      form.reset({
        name: label.name,
        description: label.description || "",
        color: label.color || "#000000",
      })
    } else {
      setEditingLabel(null)
      form.reset({
        name: "",
        description: "",
        color: "#000000",
      })
    }
    setIsDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setIsDialogOpen(false)
    setEditingLabel(null)
    form.reset()
  }

  const onSubmit = async (data: LabelFormValues) => {
    try {
      if (editingLabel) {
        await updateLabel({
          id: editingLabel.id,
          name: data.name,
          description: data.description || undefined,
          color: data.color,
        })
        toast({
          title: "Label updated",
          description: "The label has been updated successfully.",
        })
      } else {
        await createLabel({
          name: data.name,
          description: data.description || undefined,
          color: data.color,
        })
        toast({
          title: "Label created",
          description: "The label has been created successfully.",
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
    if (!confirm("Are you sure you want to delete this label?")) {
      return
    }

    try {
      await deleteLabel(id)
      toast({
        title: "Label deleted",
        description: "The label has been deleted successfully.",
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
    return <div>Loading labels...</div>
  }

  if (error) {
    return <div className="text-destructive">Error: {error.message}</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Entry Labels</h3>
          <p className="text-sm text-muted-foreground">
            Manage labels for organizing and categorizing form entries.
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
            Add Label
          </Button>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingLabel ? "Edit Label" : "Create Label"}
              </DialogTitle>
              <DialogDescription>
                {editingLabel
                  ? "Update the label details below."
                  : "Create a new label to organize your form entries."}
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
                        <Input placeholder="Important" {...field} />
                      </FormControl>
                      <FormDescription>
                        A unique name for this label.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Optional description for this label"
                          className="resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        An optional description to help identify this label.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="color"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Color</FormLabel>
                      <div className="flex items-center gap-3">
                        <FormControl>
                          <div className="flex items-center gap-2">
                            <input
                              type="color"
                              value={field.value}
                              onChange={(e) => field.onChange(e.target.value)}
                              className="h-10 w-20 rounded border border-input cursor-pointer"
                            />
                            <Input
                              placeholder="#000000"
                              value={field.value}
                              onChange={field.onChange}
                              className="flex-1"
                            />
                          </div>
                        </FormControl>
                      </div>
                      <FormDescription>
                        Choose a color to visually identify this label.
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
                    {editingLabel ? "Update" : "Create"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
      <Separator />
      {labels.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-10">
            <Tag className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-sm text-muted-foreground">
              No labels found. Create your first label to get started.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {labels.map((label) => (
            <Card key={label.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: label.color || "#000000" }}
                    />
                    <div>
                      <CardTitle>{label.name}</CardTitle>
                      <CardDescription>
                        {label.description || `Created ${new Date(label.date_created).toLocaleDateString()}`}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleOpenDialog(label)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleDelete(label.id)}
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

