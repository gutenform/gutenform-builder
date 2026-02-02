import { __ } from "@/lib/i18n"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { createFieldBlock } from "@/lib/create-field-block"
import { useDispatch } from "@wordpress/data"

interface MissingFieldsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  missingFields: string[]
  formClientId: string
  onFieldsAdded?: () => void
}

export function MissingFieldsDialog({
  open,
  onOpenChange,
  missingFields,
  formClientId,
  onFieldsAdded,
}: MissingFieldsDialogProps) {
  const { insertBlocks } = useDispatch('core/block-editor')

  const handleAddFields = () => {
    if (missingFields.length === 0 || !formClientId) {
      return
    }

    // Create blocks for all missing fields
    const blocks = missingFields.map(fieldName => createFieldBlock(fieldName, formClientId))

    // Insert blocks at the end of the form
    insertBlocks(blocks, undefined, formClientId)

    // Callback to notify parent
    if (onFieldsAdded) {
      onFieldsAdded()
    }

    // Close dialog
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{__("missingFields") || "Missing Fields"}</DialogTitle>
          <DialogDescription>
            {__("missingFieldsDescription") || "The following fields are referenced in the provider but not present in the form:"}
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <ul className="list-disc list-inside space-y-2">
            {missingFields.map((field, index) => (
              <li key={index} className="font-mono text-sm">
                {`{${field}}`}
              </li>
            ))}
          </ul>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {__("cancel") || "Cancel"}
          </Button>
          <Button onClick={handleAddFields}>
            {__("addMissingFields") || "Add Missing Fields"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

