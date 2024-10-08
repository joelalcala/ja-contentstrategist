import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface AddFieldModalProps {
  isOpen: boolean
  onClose: () => void
  onAddField: (fieldType: string, options: string[]) => void
}

export function AddFieldModal({ isOpen, onClose, onAddField }: AddFieldModalProps) {
  const [fieldType, setFieldType] = useState("")
  const [fieldOptions, setFieldOptions] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (fieldType && fieldOptions) {
      onAddField(fieldType, fieldOptions.split("\n").map(o => o.trim()).filter(Boolean))
      setFieldType("")
      setFieldOptions("")
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Field</DialogTitle>
          <DialogDescription>
            Create a new field type with its options.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="field-type">Field Type</Label>
            <Input
              id="field-type"
              value={fieldType}
              onChange={(e) => setFieldType(e.target.value)}
              placeholder="e.g., Priority, Status"
            />
          </div>
          <div>
            <Label htmlFor="field-options">
              Options (one per line)
            </Label>
            <Textarea
              id="field-options"
              value={fieldOptions}
              onChange={(e) => setFieldOptions(e.target.value)}
              placeholder="e.g.,&#10;High&#10;Medium&#10;Low"
              rows={5}
            />
          </div>
          <Button type="submit">Add Field</Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}