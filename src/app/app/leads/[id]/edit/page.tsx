"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/presentation/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/presentation/components/ui/card"
import { Input } from "@/presentation/components/ui/input"
import { Label } from "@/presentation/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/presentation/components/ui/select"
import { Textarea } from "@/presentation/components/ui/textarea"
import { Badge } from "@/presentation/components/ui/badge"
import { Slider } from "@/presentation/components/ui/slider"
import { toast } from "sonner"
import {
  ArrowLeft,
  Save,
  User,
  Building,
  Phone,
  Mail,
  FileText,
  Target,
  Building2,
  Zap,
  Settings
} from "lucide-react"
import { CrmUserStatus, ProductService } from "@prisma/client"
import { CrmLeadWithJourney } from "@/infrastructure/repositories/prisma-crm-lead.repository"
import JourneyStepEditor from "@/presentation/components/app/components/journey-step-editor"

interface LeadFormData {
  name: string
  email: string
  phone?: string
  company: string
  productService: ProductService
  notes?: string
  score: number
  status: CrmUserStatus
  assignee?: string
}

export default function EditLeadPage() {
  const params = useParams()
  const router = useRouter()
  const [lead, setLead] = useState<CrmLeadWithJourney | null>(null)
  const [formData, setFormData] = useState<LeadFormData>({
    name: "",
    email: "",
    phone: "",
    company: "",
    productService: ProductService.SOLAR_PANELS,
    notes: "",
    score: 50,
    status: CrmUserStatus.LEAD,
    assignee: ""
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Function to reload lead data including journey steps
  const reloadLeadData = async () => {
    try {
      const response = await fetch(`/api/crm/leads/${params.id}`)
      if (response.ok) {
        const leadData = await response.json()
        setLead(leadData)
      }
    } catch (error) {
      console.error("Error reloading lead data:", error)
    }
  }

  useEffect(() => {
    const fetchLead = async () => {
      try {
        const response = await fetch(`/api/crm/leads/${params.id}`)
        if (response.ok) {
          const leadData = await response.json()
          setLead(leadData)
          setFormData({
            name: leadData.name,
            email: leadData.email,
            phone: leadData.phone || "",
            company: leadData.company,
            productService: leadData.productService,
            notes: leadData.notes || "",
            score: leadData.score,
            status: leadData.status,
            assignee: leadData.assignee || ""
          })
        } else {
          toast.error("Lead not found")
          router.push("/app/leads")
        }
      } catch (error) {
        console.error("Error fetching lead:", error)
        toast.error("Error loading lead")
        router.push("/app/leads")
      } finally {
        setIsLoading(false)
      }
    }

    if (params.id) {
      fetchLead()
    }
  }, [params.id, router])

  const updateFormData = (field: keyof LeadFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name || !formData.email || !formData.company) {
      toast.error("Please fill all required fields")
      return
    }

    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/crm/leads/${params.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone || undefined,
          company: formData.company,
          productService: formData.productService,
          notes: formData.notes || undefined,
          score: formData.score,
          status: formData.status,
          assignee: formData.assignee || undefined
        }),
      })

      if (response.ok) {
        toast.success("Lead updated successfully!")
        router.push("/app/leads")
      } else {
        const error = await response.json()
        toast.error(error.message || "Error updating lead")
      }
    } catch (error) {
      console.error("Error updating lead:", error)
      toast.error("Error updating lead. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6 w-full py-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading lead...</p>
        </div>
      </div>
    )
  }

  if (!lead) {
    return (
      <div className="space-y-6 w-full py-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Lead Not Found</h2>
          <p className="text-muted-foreground mb-4">The lead you're looking for doesn't exist.</p>
          <Button onClick={() => router.push('/app/leads')}>
            Back to Leads
          </Button>
        </div>
      </div>
    )
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
            <h1 className="text-3xl font-bold text-foreground">Edit Lead</h1>
            <p className="text-muted-foreground">Update {lead.name}'s information</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Main Content - 2 columns */}
          <div className="xl:col-span-2 space-y-6">
            {/* Basic Information Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-blue-600" />
                  </div>
                  Basic Information
                </CardTitle>
                <CardDescription>
                  Lead's contact and company details
                </CardDescription>
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

            {/* Lead Details Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <Target className="w-4 h-4 text-purple-600" />
                  </div>
                  Lead Details
                </CardTitle>
                <CardDescription>
                  Service interest and additional information
                </CardDescription>
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

            {/* Customer Journey Management */}
            <JourneyStepEditor
              leadId={params.id as string}
              journey={lead?.journey || []}
              onJourneyUpdate={reloadLeadData}
            />
          </div>

          {/* Sidebar - 1 column */}
          <div className="space-y-6">
            {/* Lead Score Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <Target className="w-4 h-4 text-green-600" />
                  </div>
                  Lead Score
                </CardTitle>
                <CardDescription>
                  Drag to adjust lead priority
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="text-center">
                    <div className={`text-4xl font-bold ${getScoreColor(formData.score)}`}>
                      {formData.score}
                    </div>
                    <div className="flex items-center justify-center gap-2 mt-2">
                      <Badge
                        variant="outline"
                        className={`${getScoreColor(formData.score)} border-current`}
                      >
                        {getScoreLabel(formData.score)}
                      </Badge>
                    </div>
                  </div>

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

                  <div className="text-xs text-muted-foreground bg-muted p-3 rounded-lg">
                    {formData.score < 30 && "Low priority lead - May need additional nurturing"}
                    {formData.score >= 30 && formData.score < 70 && "Medium priority lead - Good potential"}
                    {formData.score >= 70 && "High priority lead - Ready for immediate follow-up"}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Status & Assignment Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                    <Settings className="w-4 h-4 text-orange-600" />
                  </div>
                  Status & Assignment
                </CardTitle>
                <CardDescription>
                  Lead status and responsibility
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => updateFormData("status", value as CrmUserStatus)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select the status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={CrmUserStatus.LEAD}>
                        <Badge className="bg-blue-100 text-blue-800">Lead</Badge>
                      </SelectItem>
                      <SelectItem value={CrmUserStatus.CONTACTED}>
                        <Badge className="bg-yellow-100 text-yellow-800">Contacted</Badge>
                      </SelectItem>
                      <SelectItem value={CrmUserStatus.QUALIFIED}>
                        <Badge className="bg-green-100 text-green-800">Qualified</Badge>
                      </SelectItem>
                      <SelectItem value={CrmUserStatus.PROPOSAL_SENT}>
                        <Badge className="bg-purple-100 text-purple-800">Proposal Sent</Badge>
                      </SelectItem>
                      <SelectItem value={CrmUserStatus.NEGOTIATION}>
                        <Badge className="bg-orange-100 text-orange-800">Negotiation</Badge>
                      </SelectItem>
                      <SelectItem value={CrmUserStatus.CLOSED_WON}>
                        <Badge className="bg-emerald-100 text-emerald-800">Closed Won</Badge>
                      </SelectItem>
                      <SelectItem value={CrmUserStatus.CLOSED_LOST}>
                        <Badge className="bg-red-100 text-red-800">Closed Lost</Badge>
                      </SelectItem>
                      <SelectItem value={CrmUserStatus.ON_HOLD}>
                        <Badge className="bg-gray-100 text-gray-800">On Hold</Badge>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

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
                </div>
              </CardContent>
            </Card>

            {/* Actions Card */}
            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
                <CardDescription>
                  Save or cancel your changes
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {isSubmitting ? "Saving..." : "Save Changes"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/app/leads")}
                  className="w-full"
                >
                  Cancel
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  )
}