"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/presentation/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/presentation/components/ui/card"
import { Input } from "@/presentation/components/ui/input"
import { Label } from "@/presentation/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/presentation/components/ui/select"
import { Textarea } from "@/presentation/components/ui/textarea"
import { Progress } from "@/presentation/components/ui/progress"
import { toast } from "sonner"
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Building,
  MapPin,
  DollarSign,
  Zap,
  FileText,
  Mail,
  Phone
} from "lucide-react"
import ProjectMap from "./project-map"
import { createProject, CreateProjectData } from "@/app/app/projects/action"
import { getAvailableLeads } from "@/app/app/projects/action"

interface CrmLeadOption {
  id: string
  name: string
  email: string
  phone?: string
  company: string
  status: string
}

interface ProjectFormData {
  // Step 1: Lead Selection
  crmLeadId: string
  name: string
  description?: string

  // Step 2: Contact Information
  address?: string
  email?: string
  phone?: string

  // Step 3: Technical Information
  estimatedKw: number
  estimatedPrice: number

  // Step 4: Location (Map)
  latitude?: number
  longitude?: number
}

const INITIAL_DATA: ProjectFormData = {
  crmLeadId: "",
  name: "",
  description: "",
  address: "",
  email: "",
  phone: "",
  estimatedKw: 0,
  estimatedPrice: 0,
  latitude: undefined,
  longitude: undefined,
}

export default function ProjectForm() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<ProjectFormData>(INITIAL_DATA)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [leads, setLeads] = useState<CrmLeadOption[]>([])
  const [isLoadingLeads, setIsLoadingLeads] = useState(true)

  const totalSteps = 4
  const progressPercentage = (currentStep / totalSteps) * 100

  // Load CRM leads when component mounts
  useEffect(() => {
    loadCrmLeads()
  }, [])

  const loadCrmLeads = async () => {
    try {
      const result = await getAvailableLeads()

      if (result.success) {
        setLeads(result.data || [])
        if (!result.data || result.data.length === 0) {
          toast.error("No CRM leads found. Please create some leads first.")
        }
      } else {
        toast.error(result.message || "Error loading CRM leads")
      }
    } catch (error) {
      toast.error("Error loading CRM leads")
    } finally {
      setIsLoadingLeads(false)
    }
  }

  // Get selected lead name for map display
  const getSelectedLeadName = () => {
    const selectedLead = leads.find(lead => lead.id === formData.crmLeadId)
    return selectedLead?.name || formData.name
  }

  const updateFormData = (field: keyof ProjectFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  // Auto-fill contact information when lead is selected
  const updateLeadSelection = (leadId: string) => {
    const selectedLead = leads.find(lead => lead.id === leadId)

    // Update the lead ID
    setFormData(prev => ({
      ...prev,
      crmLeadId: leadId
    }))

    // Auto-fill contact information from selected lead
    if (selectedLead) {
      setFormData(prev => ({
        ...prev,
        email: selectedLead.email,
        phone: selectedLead.phone || prev.phone || '', // Use lead phone, then existing, then empty
        address: prev.address || '', // Keep existing address or empty
        name: prev.name || `${selectedLead.name}'s Project` // Suggest project name
      }))
    }
  }

  const validateCurrentStep = (): boolean => {
    switch (currentStep) {
      case 1:
        return !!(formData.name && formData.crmLeadId)
      case 2:
        return true // Step 2 is now optional - address not required
      case 3:
        return !!(formData.estimatedKw > 0 && formData.estimatedPrice > 0)
      case 4:
        return true // Step 4 (map) is now optional - coordinates not required
      default:
        return false
    }
  }

  const handleNext = () => {
    if (validateCurrentStep() && currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
    } else {
      // Show validation error for current step
      switch (currentStep) {
        case 1:
          if (!formData.name) toast.error("Project name is required")
          if (!formData.crmLeadId) toast.error("Please select a CRM lead")
          break
        case 3:
          if (formData.estimatedKw <= 0) toast.error("Estimated kW must be greater than 0")
          if (formData.estimatedPrice <= 0) toast.error("Estimated price must be greater than 0")
          break
              }
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = async () => {
    if (!validateCurrentStep()) {
      toast.error("Please correct the errors before continuing")
      return
    }

    setIsSubmitting(true)
    try {
      const projectData: CreateProjectData = {
        name: formData.name,
        description: formData.description,
        estimatedKw: formData.estimatedKw,
        estimatedPrice: formData.estimatedPrice,
        crmLeadId: formData.crmLeadId,
        address: formData.address,
        email: formData.email,
        phone: formData.phone,
        latitude: formData.latitude,
        longitude: formData.longitude,
      }

      const result = await createProject(projectData)

      if (result.success) {
        toast.success(result.message || "Project created successfully!")
        router.push("/app/projects")
      } else {
        // Handle validation errors
        if (result.errors) {
          const errorMessages = Object.values(result.errors).flat()
          errorMessages.forEach(message => {
            toast.error(message)
          })
        } else {
          toast.error(result.message || "Error creating project")
        }
      }
    } catch (error) {
      console.error("Error creating project:", error)
      toast.error("Error creating project. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <Building className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold">Lead Selection</h3>
              <p className="text-sm text-gray-600">Select a CRM lead and provide basic project information</p>
              <p className="text-xs text-blue-600 mt-1">✓ Contact details will be auto-filled from the selected lead</p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="crmLeadId">CRM Lead *</Label>
                <Select
                  value={formData.crmLeadId}
                  onValueChange={(value) => updateLeadSelection(value)}
                  disabled={isLoadingLeads}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={isLoadingLeads ? "Loading leads..." : leads.length > 0 ? "Select a CRM lead" : "No leads available"} />
                  </SelectTrigger>
                  <SelectContent>
                    {leads.length === 0 ? (
                      <div className="p-2 text-sm text-muted-foreground">
                        No CRM leads found
                      </div>
                    ) : (
                      leads.map((lead) => (
                        <SelectItem key={lead.id} value={lead.id}>
                          {lead.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                {leads.length === 0 && !isLoadingLeads && (
                  <p className="text-sm text-gray-500">
                    No CRM leads available. Please create a lead first.
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Project Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => updateFormData("name", e.target.value)}
                  placeholder="Enter project name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => updateFormData("description", e.target.value)}
                  placeholder="Project description and details..."
                  rows={4}
                />
              </div>
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <FileText className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold">Contact Information</h3>
              <p className="text-sm text-gray-600">Email and phone auto-filled from selected lead (editable)</p>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email (from lead)</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => updateFormData("email", e.target.value)}
                      placeholder="Auto-filled from selected lead"
                      className="pl-10"
                    />
                  </div>
                  {formData.email && (
                    <p className="text-xs text-green-600">✓ Auto-filled from lead</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => updateFormData("phone", e.target.value)}
                      placeholder="Auto-filled from lead"
                      className="pl-10"
                    />
                  </div>
                  {formData.phone && (
                    <p className="text-xs text-green-600">✓ Auto-filled from lead</p>
                  )}
                  <p className="text-xs text-muted-foreground">You can edit the phone number if needed</p>
                </div>
              </div>
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <div className="mx-auto w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                <DollarSign className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold">Technical Information</h3>
              <p className="text-sm text-gray-600">Provide technical and financial specifications</p>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="estimatedKw">Estimated Power (kW) *</Label>
                  <div className="relative">
                    <Zap className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="estimatedKw"
                      type="number"
                      step="0.1"
                      min="0.1"
                      value={formData.estimatedKw}
                      onChange={(e) => updateFormData("estimatedKw", parseFloat(e.target.value) || 0)}
                      placeholder="5.5"
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="estimatedPrice">Estimated Price ($) *</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="estimatedPrice"
                      type="number"
                      step="0.01"
                      min="0.01"
                      value={formData.estimatedPrice}
                      onChange={(e) => updateFormData("estimatedPrice", parseFloat(e.target.value) || 0)}
                      placeholder="25000.00"
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>

              {formData.estimatedKw > 0 && (
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Estimated System Size:</strong> {formData.estimatedKw.toFixed(1)} kWp
                  </p>
                  <p className="text-sm text-blue-600">
                    This would typically require approximately {Math.ceil(formData.estimatedKw * 7)} solar panels (assuming 400W panels)
                  </p>
                </div>
              )}
            </div>
          </div>
        )

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <div className="mx-auto w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-4">
                <MapPin className="w-6 h-6 text-orange-600" />
              </div>
              <h3 className="text-lg font-semibold">Project Location (Optional)</h3>
              <p className="text-sm text-gray-600">Select the exact project location on the map</p>
            </div>

            <ProjectMap
              address={formData.address}
              latitude={formData.latitude}
              longitude={formData.longitude}
              onLocationChange={(lat, lng) => {
                updateFormData("latitude", lat)
                updateFormData("longitude", lng)
              }}
              onAddressChange={(address) => updateFormData("address", address)}
              readonly={false}
              showAddressInput={true}
              personName={getSelectedLeadName()}
            />
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="space-y-6 w-full py-6">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Create New Project
            </h1>
            <p className="text-gray-600">
              Fill in the information in {totalSteps} steps
            </p>
          </div>
        </div>

        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">
              Step {currentStep} of {totalSteps}
            </span>
            <span className="text-sm text-gray-600">
              {Math.round(progressPercentage)}% complete
            </span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-center">
              Step {currentStep}: {
                currentStep === 1 ? "Lead Selection" :
                currentStep === 2 ? "Contact Information" :
                currentStep === 3 ? "Technical Information" :
                "Project Location (Optional)"
              }
            </CardTitle>
            <CardDescription className="text-center">
              {
                currentStep === 1 ? "Select a CRM lead and basic project details" :
                currentStep === 2 ? "Contact information and project address" :
                currentStep === 3 ? "Technical specifications and pricing" :
                "Select the exact project location on the map (optional)"
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            {renderStepContent()}

            <div className="flex justify-between mt-8">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentStep === 1}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>

              <div className="flex gap-2">
                {currentStep === 4 && (
                  <Button
                    variant="outline"
                    onClick={handleSubmit}
                    disabled={!validateCurrentStep() || isSubmitting}
                  >
                    {isSubmitting ? "Creating..." : "Skip Map & Create"}
                    <Check className="w-4 h-4 ml-2" />
                  </Button>
                )}

                {currentStep < totalSteps ? (
                  <Button
                    onClick={handleNext}
                    disabled={!validateCurrentStep()}
                  >
                    Next
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                ) : (
                  <Button
                    onClick={handleSubmit}
                    disabled={!validateCurrentStep() || isSubmitting}
                  >
                    {isSubmitting ? "Creating..." : "Create Project"}
                    <Check className="w-4 h-4 ml-2" />
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
    </div>
  )
}