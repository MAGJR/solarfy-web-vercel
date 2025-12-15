'use client'

import { useState } from 'react'
import { CrmUserStatus, ProductService } from '@prisma/client'
import { CrmLeadWithJourney, UpdateCrmLeadInput } from '@/infrastructure/repositories/prisma-crm-lead.repository'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/presentation/components/ui/dialog"
import { Button } from "@/presentation/components/ui/button"
import { Input } from "@/presentation/components/ui/input"
import { Label } from "@/presentation/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/presentation/components/ui/select"

interface CrmUserEditModalProps {
  user: CrmLeadWithJourney | null
  isOpen: boolean
  onClose: () => void
  onSave: (userId: string, updates: UpdateCrmLeadInput) => void
}

export default function CrmUserEditModal({
  user,
  isOpen,
  onClose,
  onSave
}: CrmUserEditModalProps) {
  const [formData, setFormData] = useState<UpdateCrmLeadInput>({
    name: user?.name || '',
    phone: user?.phone || '',
    status: user?.status,
    score: user?.score,
    assignee: user?.assignee || '',
    productService: user?.productService,
  })

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSave = () => {
    if (!user) return

    // Only include fields that have actually changed
    const updates: UpdateCrmLeadInput = {}

    if (formData.name !== user.name) updates.name = formData.name
    if (formData.phone !== user.phone) updates.phone = formData.phone || undefined
    if (formData.status !== user.status) updates.status = formData.status
    if (formData.score !== user.score) updates.score = formData.score
    if (formData.assignee !== user.assignee) updates.assignee = formData.assignee || undefined
    if (formData.productService !== user.productService) updates.productService = formData.productService

    onSave(user.id, updates)
    onClose()
  }

  const resetForm = () => {
    setFormData({
      name: user?.name || '',
      phone: user?.phone || '',
      status: user?.status,
      score: user?.score,
      assignee: user?.assignee || '',
      productService: user?.productService,
    })
  }

  // Reset form when user changes
  if (user && (formData.name !== user.name || formData.phone !== user.phone)) {
    resetForm()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit CRM User</DialogTitle>
          <DialogDescription>
            Make changes to the user information below. Click save when you're done.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className="col-span-3"
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="phone" className="text-right">
              Phone
            </Label>
            <Input
              id="phone"
              value={formData.phone || ''}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              className="col-span-3"
              placeholder="(555) 123-4567"
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="status" className="text-right">
              Status
            </Label>
            <Select
              value={formData.status}
              onValueChange={(value) => handleInputChange('status', value as CrmUserStatus)}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {Object.values(CrmUserStatus).map(status => (
                  <SelectItem key={status} value={status}>
                    {status.replace('_', ' ')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="score" className="text-right">
              Score
            </Label>
            <Input
              id="score"
              type="number"
              min="0"
              max="100"
              value={formData.score}
              onChange={(e) => handleInputChange('score', parseInt(e.target.value) || 0)}
              className="col-span-3"
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="assignee" className="text-right">
              Assignee
            </Label>
            <Input
              id="assignee"
              value={formData.assignee || ''}
              onChange={(e) => handleInputChange('assignee', e.target.value)}
              className="col-span-3"
              placeholder="Assign to..."
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="productService" className="text-right">
              Product/Service
            </Label>
            <Select
              value={formData.productService}
              onValueChange={(value) => handleInputChange('productService', value as ProductService)}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select product/service" />
              </SelectTrigger>
              <SelectContent>
                {Object.values(ProductService).map(service => (
                  <SelectItem key={service} value={service}>
                    {service.replace('_', ' ')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="button" onClick={handleSave}>
            Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}