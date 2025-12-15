'use client'

import { useState } from 'react'
import { Button } from '@/presentation/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/presentation/components/ui/card'
import { Input } from '@/presentation/components/ui/input'
import { Label } from '@/presentation/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/presentation/components/ui/select'
import { Textarea } from '@/presentation/components/ui/textarea'
import { Badge } from '@/presentation/components/ui/badge'
import { toast } from 'sonner'
import {
  JourneyStepType,
  StepStatus
} from '@prisma/client'
import {
  Plus,
  X,
  Calendar,
  User,
  CheckCircle,
  Clock,
  AlertCircle,
  Save
} from 'lucide-react'

interface JourneyStep {
  id: string
  step: JourneyStepType
  status: StepStatus
  completedAt?: Date | null
  notes?: string | null
  assignedTo?: string | null
  createdAt: Date
  updatedAt: Date
}

interface JourneyStepEditorProps {
  leadId: string
  journey: JourneyStep[]
  onJourneyUpdate: () => void
}

const stepLabels: Record<JourneyStepType, string> = {
  INITIAL_CONTACT: 'Initial Contact',
  SITE_VISIT_SCHEDULED: 'Site Visit Scheduled',
  SITE_VISIT_COMPLETED: 'Site Visit Completed',
  PROPOSAL_CREATED: 'Proposal Created',
  PROPOSAL_SENT: 'Proposal Sent',
  CONTRACT_SIGNED: 'Contract Signed',
  INSTALLATION_SCHEDULED: 'Installation Scheduled',
  INSTALLATION_COMPLETED: 'Installation Completed',
  SYSTEM_ACTIVATED: 'System Activated',
  FOLLOW_UP_SCHEDULED: 'Follow Up Scheduled'
}

const statusColors: Record<StepStatus, string> = {
  PENDING: 'bg-gray-100 text-gray-800',
  IN_PROGRESS: 'bg-blue-100 text-blue-800',
  COMPLETED: 'bg-green-100 text-green-800',
  SKIPPED: 'bg-orange-100 text-orange-800',
  FAILED: 'bg-red-100 text-red-800'
}

const statusIcons: Record<StepStatus, any> = {
  PENDING: Clock,
  IN_PROGRESS: AlertCircle,
  COMPLETED: CheckCircle,
  SKIPPED: X,
  FAILED: AlertCircle
}

export default function JourneyStepEditor({ leadId, journey, onJourneyUpdate }: JourneyStepEditorProps) {
  const [isAddingStep, setIsAddingStep] = useState(false)
  const [editingStepId, setEditingStepId] = useState<string | null>(null)
  const [newStep, setNewStep] = useState({
    step: '' as JourneyStepType,
    status: StepStatus.PENDING,
    notes: '',
    assignedTo: ''
  })
  const [editingStep, setEditingStep] = useState({
    status: StepStatus.PENDING,
    notes: '',
    assignedTo: ''
  })
  const [isLoading, setIsLoading] = useState(false)

  const formatDate = (date: Date | string | null | undefined) => {
    if (!date) return 'Not set'
    const dateObj = typeof date === 'string' ? new Date(date) : date
    return dateObj.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const handleAddStep = async () => {
    if (!newStep.step) {
      toast.error('Please select a journey step')
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch(`/api/crm/leads/${leadId}/journey-steps`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          step: newStep.step,
          status: newStep.status,
          notes: newStep.notes || undefined,
          assignedTo: newStep.assignedTo || undefined
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to add journey step')
      }

      toast.success('Journey step added successfully!')
      setNewStep({
        step: '' as JourneyStepType,
        status: StepStatus.PENDING,
        notes: '',
        assignedTo: ''
      })
      setIsAddingStep(false)
      onJourneyUpdate()
    } catch (error) {
      console.error('Error adding journey step:', error)
      toast.error('Failed to add journey step')
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdateStep = async (stepId: string) => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/crm/leads/${leadId}/journey-steps/${stepId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editingStep),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update journey step')
      }

      toast.success('Journey step updated successfully!')
      setEditingStepId(null)
      onJourneyUpdate()
    } catch (error) {
      console.error('Error updating journey step:', error)
      toast.error('Failed to update journey step')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteStep = async (stepId: string) => {
    if (!confirm('Are you sure you want to delete this journey step?')) {
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch(`/api/crm/leads/${leadId}/journey-steps/${stepId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to delete journey step')
      }

      toast.success('Journey step deleted successfully!')
      onJourneyUpdate()
    } catch (error) {
      console.error('Error deleting journey step:', error)
      toast.error('Failed to delete journey step')
    } finally {
      setIsLoading(false)
    }
  }

  const startEditStep = (step: JourneyStep) => {
    setEditingStepId(step.id)
    setEditingStep({
      status: step.status,
      notes: step.notes || '',
      assignedTo: step.assignedTo || ''
    })
  }

  const cancelEdit = () => {
    setEditingStepId(null)
    setEditingStep({
      status: StepStatus.PENDING,
      notes: '',
      assignedTo: ''
    })
  }

  const availableSteps = Object.values(JourneyStepType).filter(
    stepType => !journey.some(journeyStep => journeyStep.step === stepType)
  )

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-green-600" />
            Customer Journey Management
          </CardTitle>
          <Button
            onClick={() => setIsAddingStep(true)}
            disabled={availableSteps.length === 0 || isLoading}
            size="sm"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Step
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Add New Step Form */}
        {isAddingStep && (
          <div className="border rounded-lg p-4 bg-muted/50">
            <h3 className="font-medium mb-4">Add New Journey Step</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="step-select">Journey Step</Label>
                  <Select
                    value={newStep.step}
                    onValueChange={(value) => setNewStep({ ...newStep, step: value as JourneyStepType })}
                  >
                    <SelectTrigger id="step-select">
                      <SelectValue placeholder="Select a step" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableSteps.map((step) => (
                        <SelectItem key={step} value={step}>
                          {stepLabels[step]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status-select">Status</Label>
                  <Select
                    value={newStep.status}
                    onValueChange={(value) => setNewStep({ ...newStep, status: value as StepStatus })}
                  >
                    <SelectTrigger id="status-select">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={StepStatus.PENDING}>Pending</SelectItem>
                      <SelectItem value={StepStatus.IN_PROGRESS}>In Progress</SelectItem>
                      <SelectItem value={StepStatus.COMPLETED}>Completed</SelectItem>
                      <SelectItem value={StepStatus.SKIPPED}>Skipped</SelectItem>
                      <SelectItem value={StepStatus.FAILED}>Failed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="assignedTo">Assigned To</Label>
                <Input
                  id="assignedTo"
                  value={newStep.assignedTo}
                  onChange={(e) => setNewStep({ ...newStep, assignedTo: e.target.value })}
                  placeholder="Name of the person responsible"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={newStep.notes}
                  onChange={(e) => setNewStep({ ...newStep, notes: e.target.value })}
                  placeholder="Add notes about this step..."
                  rows={3}
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsAddingStep(false)
                    setNewStep({
                      step: '' as JourneyStepType,
                      status: StepStatus.PENDING,
                      notes: '',
                      assignedTo: ''
                    })
                  }}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={handleAddStep}
                  disabled={isLoading || !newStep.step}
                >
                  <Save className="w-4 h-4 mr-2" />
                  {isLoading ? 'Adding...' : 'Add Step'}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Existing Steps */}
        <div className="space-y-4">
          <h3 className="font-medium">Current Journey Steps</h3>
          {journey.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="w-8 h-8 mx-auto mb-2" />
              <p>No journey steps recorded yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {journey.map((step, index) => (
                <div key={step.id} className="border rounded-lg p-4">
                  {editingStepId === step.id ? (
                    // Edit Mode
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Step</Label>
                          <div className="font-medium">{stepLabels[step.step]}</div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`status-${step.id}`}>Status</Label>
                          <Select
                            value={editingStep.status}
                            onValueChange={(value) => setEditingStep({ ...editingStep, status: value as StepStatus })}
                          >
                            <SelectTrigger id={`status-${step.id}`}>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value={StepStatus.PENDING}>Pending</SelectItem>
                              <SelectItem value={StepStatus.IN_PROGRESS}>In Progress</SelectItem>
                              <SelectItem value={StepStatus.COMPLETED}>Completed</SelectItem>
                              <SelectItem value={StepStatus.SKIPPED}>Skipped</SelectItem>
                              <SelectItem value={StepStatus.FAILED}>Failed</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor={`assigned-${step.id}`}>Assigned To</Label>
                        <Input
                          id={`assigned-${step.id}`}
                          value={editingStep.assignedTo}
                          onChange={(e) => setEditingStep({ ...editingStep, assignedTo: e.target.value })}
                          placeholder="Name of the person responsible"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor={`notes-${step.id}`}>Notes</Label>
                        <Textarea
                          id={`notes-${step.id}`}
                          value={editingStep.notes}
                          onChange={(e) => setEditingStep({ ...editingStep, notes: e.target.value })}
                          placeholder="Add notes about this step..."
                          rows={3}
                        />
                      </div>

                      <div className="flex justify-end space-x-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={cancelEdit}
                          disabled={isLoading}
                        >
                          Cancel
                        </Button>
                        <Button
                          type="button"
                          onClick={() => handleUpdateStep(step.id)}
                          disabled={isLoading}
                        >
                          <Save className="w-4 h-4 mr-2" />
                          {isLoading ? 'Updating...' : 'Update'}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    // View Mode
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                          {(() => {
                            const Icon = statusIcons[step.status]
                            return <Icon className="w-4 h-4 text-green-600" />
                          })()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-medium">{stepLabels[step.step]}</h4>
                            <Badge className={statusColors[step.status]}>
                              {step.status.replace('_', ' ')}
                            </Badge>
                          </div>
                          {step.notes && (
                            <p className="text-sm text-muted-foreground mb-2">{step.notes}</p>
                          )}
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            {step.completedAt && (
                              <span>Completed: {formatDate(step.completedAt)}</span>
                            )}
                            {step.assignedTo && (
                              <span className="flex items-center gap-1">
                                <User className="w-3 h-3" />
                                {step.assignedTo}
                              </span>
                            )}
                            <span>Created: {formatDate(step.createdAt)}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => startEditStep(step)}
                          disabled={isLoading}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteStep(step.id)}
                          disabled={isLoading}
                          className="text-red-600 hover:text-red-700"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}