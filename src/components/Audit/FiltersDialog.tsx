import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface FiltersDialogProps {
  isOpen: boolean
  onClose: () => void
  fields: Record<string, string[]>
  activeFilters: Record<string, string>
  setActiveFilters: (filters: Record<string, string>) => void
}

export function FiltersDialog({
  isOpen,
  onClose,
  fields,
  activeFilters,
  setActiveFilters
}: FiltersDialogProps) {
  const [localFilters, setLocalFilters] = useState(activeFilters)

  const handleFilterChange = (key: string, value: string) => {
    setLocalFilters(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const handleApplyFilters = () => {
    setActiveFilters(localFilters)
    onClose()
  }

  const handleClearFilters = () => {
    setLocalFilters({})
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Filters</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Type</Label>
            <Select
              value={localFilters.type || "all"}
              onValueChange={(value) => handleFilterChange('type', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All types</SelectItem>
                {['landing', 'article', 'event', 'form', 'listing', 'product', 'legal', 'support'].map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {Object.entries(fields).map(([fieldType, options]) => (
            <div key={fieldType}>
              <Label>{fieldType}</Label>
              <Select
                value={localFilters[fieldType] || "all"}
                onValueChange={(value) => handleFilterChange(fieldType, value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder={`Select ${fieldType}`} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All {fieldType}</SelectItem>
                  {options.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ))}
          <div>
            <Label>URL Filter</Label>
            <Input
              placeholder="URL contains..."
              value={localFilters.urlContains || ''}
              onChange={(e) => handleFilterChange('urlContains', e.target.value)}
            />
          </div>
        </div>
        <div className="flex justify-between mt-4">
          <Button onClick={handleClearFilters} variant="outline">Clear All</Button>
          <Button onClick={handleApplyFilters}>Apply Filters</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}