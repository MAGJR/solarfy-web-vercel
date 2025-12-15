"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/presentation/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/presentation/components/ui/card"
import { Input } from "@/presentation/components/ui/input"
import { Label } from "@/presentation/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/presentation/components/ui/select"
import { Textarea } from "@/presentation/components/ui/textarea"
import { Slider } from "@/presentation/components/ui/slider"
import { toast } from "sonner"
import {
  User,
  Building,
  Phone,
  Mail,
  FileText,
  Target,
  ArrowLeft,
  ArrowRight,
  Check,
  Zap,
  Building2
} from "lucide-react"
import { ProductService } from "@/domains/crm/entities/crm-user.entity"
import { createLead } from "../action"

interface LeadFormData {
  // Step 1: Basic Information
  name: string
  email: string
  phone?: string
  company: string

  // Step 2: Lead Details
  productService: ProductService
  notes?: string

  // Step 3: Classification
  score: number
  assignee?: string
}

const INITIAL_DATA: LeadFormData = {
  name: "",
  email: "",
  phone: "",
  company: "",
  productService: ProductService.SOLAR_PANELS,
  notes: "",
  score: 50,
  assignee: ""
}

export default function NewLeadPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<LeadFormData>(INITIAL_DATA)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const totalSteps = 3
  const progressPercentage = (currentStep / totalSteps) * 100

  const updateFormData = (field: keyof LeadFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const validateCurrentStep = (): boolean => {
    switch (currentStep) {
      case 1:
        return !!(formData.name && formData.email && formData.company)
      case 2:
        return !!formData.productService
      case 3:
        return !!(formData.score >= 0 && formData.score <= 100)
      default:
        return false
    }
  }

  const handleNext = () => {
    if (validateCurrentStep() && currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
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
      const result = await createLead(formData)

      if (result.success) {
        toast.success(result.message || "Lead created successfully!")
        router.push("/app/leads")
      } else {
        // Handle validation errors
        if (result.errors) {
          const errorMessages = Object.values(result.errors).flat()
          errorMessages.forEach(message => {
            toast.error(message)
          })
        } else {
          toast.error(result.message || "Error creating lead")
        }
      }
    } catch (error) {
      console.error("Error creating lead:", error)
      toast.error("Error creating lead. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 70) return 'text-green-600'
    if (score >= 40) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getScoreLabel = (score: number) => {
    if (score >= 70) return 'High Priority'
    if (score >= 40) return 'Medium Priority'
    return 'Low Priority'
  }

  const getServiceIcon = (service: ProductService) => {
    switch (service) {
      case ProductService.SOLAR_PANELS:
        return <Zap className="w-4 h-4" />
      case ProductService.BATTERY_STORAGE:
        return <Building2 className="w-4 h-4" />
      default:
        return <Target className="w-4 h-4" />
    }
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">Basic Information</h3>
                    <p className="text-sm text-muted-foreground">Essential contact data</p>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name *</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => updateFormData("name", e.target.value)}
                        placeholder="Lead name"
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => updateFormData("email", e.target.value)}
                        placeholder="email@example.com"
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => updateFormData("phone", e.target.value)}
                        placeholder="(00) 00000-0000"
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="company">Company *</Label>
                    <div className="relative">
                      <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="company"
                        value={formData.company}
                        onChange={(e) => updateFormData("company", e.target.value)}
                        placeholder="Company name"
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                    <Target className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">Lead Details</h3>
                    <p className="text-sm text-muted-foreground">Interests and specific needs</p>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Interest in</Label>
                  <Select
                    value={formData.productService}
                    onValueChange={(value) => updateFormData("productService", value as ProductService)}
                  >
                    <SelectTrigger className="pl-10">
                      <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                        {getServiceIcon(formData.productService)}
                      </div>
                      <SelectValue placeholder="Select the service" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={ProductService.SOLAR_PANELS}>
                        <div className="flex items-center gap-2">
                          <Zap className="w-4 h-4 text-yellow-600" />
                          Solar Panels
                        </div>
                      </SelectItem>
                      <SelectItem value={ProductService.SOLAR_WATER_HEATER}>
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 bg-orange-500 rounded-full"></div>
                          Solar Water Heater
                        </div>
                      </SelectItem>
                      <SelectItem value={ProductService.BATTERY_STORAGE}>
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-blue-600" />
                          Battery Storage
                        </div>
                      </SelectItem>
                      <SelectItem value={ProductService.EV_CHARGING}>
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                          EV Chargers
                        </div>
                      </SelectItem>
                      <SelectItem value={ProductService.ENERGY_AUDIT}>
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                          Energy Audit
                        </div>
                      </SelectItem>
                      <SelectItem value={ProductService.MAINTENANCE}>
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 bg-gray-500 rounded-full"></div>
                          Maintenance
                        </div>
                      </SelectItem>
                      <SelectItem value={ProductService.CONSULTING}>
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 bg-indigo-500 rounded-full"></div>
                          Consulting
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => updateFormData("notes", e.target.value)}
                    placeholder="Add additional information about this lead..."
                    rows={4}
                    className="resize-none"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              {/* Lead Score Card - 2 colunas */}
              <Card className="xl:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <FileText className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">Lead Score</h3>
                      <p className="text-sm text-muted-foreground">Drag to adjust lead priority</p>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="text-center">
                        <div className={`text-5xl font-bold ${getScoreColor(formData.score)}`}>
                          {formData.score}
                        </div>
                        <div className="flex items-center justify-center gap-2 mt-2">
                          <span className="text-sm font-medium text-muted-foreground">
                            {getScoreLabel(formData.score)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-3">
                        <div className="flex justify-between text-sm text-muted-foreground">
                          <span>Priority</span>
                          <span>{formData.score}/100</span>
                        </div>
                        <Slider
                          value={[formData.score]}
                          onValueChange={(value) => updateFormData("score", value[0])}
                          max={100}
                          min={0}
                          step={1}
                          className="w-full"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="text-xs text-muted-foreground bg-muted p-3 rounded-lg">
                    {formData.score < 30 && "Low priority lead - May need additional nurturing"}
                    {formData.score >= 30 && formData.score < 70 && "Medium priority lead - Good potential"}
                    {formData.score >= 70 && "High priority lead - Ready for immediate follow-up"}
                  </div>
                </CardContent>
              </Card>

              {/* Assignment Card - 1 coluna */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">Assignment</h3>
                      <p className="text-sm text-muted-foreground">Who will handle this lead?</p>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="assignee">Assignee</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="assignee"
                        value={formData.assignee}
                        onChange={(e) => updateFormData("assignee", e.target.value)}
                        placeholder="Name of responsible person"
                        className="pl-10"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Optional: Assign this lead to a specific team member
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="space-y-6 w-full py-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-0"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Create New Lead</h1>
            <p className="text-muted-foreground">Fill in the information in {totalSteps} simple steps</p>
          </div>
        </div>
      </div>

      {/* Progress Indicator */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Step {currentStep} of {totalSteps}</span>
              <span className="text-muted-foreground">{Math.round(progressPercentage)}% complete</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
            <div className="text-center">
              <h3 className="font-semibold">
                {currentStep === 1 && "Basic Information"}
                {currentStep === 2 && "Lead Details"}
                {currentStep === 3 && "Classification"}
              </h3>
              <p className="text-sm text-muted-foreground">
                {currentStep === 1 && "Essential contact data"}
                {currentStep === 2 && "Interests and specific needs"}
                {currentStep === 3 && "Score and assignment"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Step Content */}
      {renderStepContent()}

      {/* Navigation */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 1}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Previous
            </Button>

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
                {isSubmitting ? "Creating..." : "Create Lead"}
                <Check className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}