'use client'

import { useState } from 'react'
import { Button } from '@/presentation/components/ui/button'
import { Input } from '@/presentation/components/ui/input'
import { Textarea } from '@/presentation/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/presentation/components/ui/select'
import { Label } from '@/presentation/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/presentation/components/ui/card'
import { X, MapPin, Phone, Mail, Home, Building, Factory, Check, Star, Wrench, Zap, Users, BarChart, Settings } from 'lucide-react'

interface Service {
  id: string
  type: string
  title: string
  description: string
  icon: React.ReactNode
  features: string[]
  priceRange?: string
  duration?: string
  popular?: boolean
}

interface ServiceRequestModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: any) => Promise<void>
  isLoading?: boolean
}

interface FormData {
  serviceType: string
  clientName: string
  clientEmail: string
  clientPhone: string
  address: string
  city: string
  state: string
  zipCode: string
  propertyType: string
  message: string
}

const services: Service[] = [
  {
    id: 'RESIDENTIAL_INSTALLATION',
    type: 'RESIDENTIAL_INSTALLATION',
    title: 'Instalação Residencial',
    description: 'Instalação completa de sistema de energia solar para sua residência.',
    icon: <Home className="h-6 w-6" />,
    features: [
      'Avaliação do local e projeto',
      'Painéis solares de alta eficiência',
      'Inversor e estrutura de montagem',
      'Instalação profissional',
      'Documentação e homologação'
    ],
    priceRange: 'R$ 15.000 - 50.000',
    duration: '1-2 dias',
    popular: true
  },
  {
    id: 'COMMERCIAL_INSTALLATION',
    type: 'COMMERCIAL_INSTALLATION',
    title: 'Instalação Comercial',
    description: 'Soluções de energia solar para empresas e comércios.',
    icon: <Building className="h-6 w-6" />,
    features: [
      'Análise de consumo energético',
      'Projeto customizado',
      'Estrutura metálica pesada',
      'Monitoramento remoto',
      'Manutenção preventiva'
    ],
    priceRange: 'R$ 50.000 - 500.000',
    duration: '3-5 dias'
  },
  {
    id: 'MAINTENANCE',
    type: 'MAINTENANCE',
    title: 'Manutenção',
    description: 'Serviços de manutenção e limpeza para seu sistema solar.',
    icon: <Wrench className="h-6 w-6" />,
    features: [
      'Limpeza dos painéis',
      'Inspeção elétrica',
      'Verificação de desempenho',
      'Substituição de peças',
      'Relatório técnico'
    ],
    priceRange: 'R$ 200 - 800',
    duration: '2-4 horas'
  },
  {
    id: 'REPAIR',
    type: 'REPAIR',
    title: 'Reparo',
    description: 'Serviços de reparo e correção de problemas em sistemas solares.',
    icon: <Settings className="h-6 w-6" />,
    features: [
      'Diagnóstico completo',
      'Reparo de inversores',
      'Substituição de painéis',
      'Correção de fiação',
      'Teste de segurança'
    ],
    priceRange: 'R$ 300 - 2.000',
    duration: 'Depende do problema'
  },
  {
    id: 'UPGRADE',
    type: 'UPGRADE',
    title: 'Upgrade/Ampliação',
    description: 'Ampliação ou modernização do seu sistema solar existente.',
    icon: <Zap className="h-6 w-6" />,
    features: [
      'Análise de capacidade atual',
      'Projeto de ampliação',
      'Integração com sistema existente',
      'Upgrade de tecnologia',
      'Otimização de desempenho'
    ],
    priceRange: 'R$ 10.000 - 100.000',
    duration: '1-3 dias'
  },
  {
    id: 'CONSULTATION',
    type: 'CONSULTATION',
    title: 'Consultoria',
    description: 'Análise técnica e viabilidade para instalação solar.',
    icon: <Users className="h-6 w-6" />,
    features: [
      'Análise de viabilidade',
      'Cálculo de economia',
      'Estudo de sombreamento',
      'Recomendações técnicas',
      'Proposta comercial'
    ],
    priceRange: 'R$ 500 - 2.000',
    duration: '1-2 horas'
  },
  {
    id: 'MONITORING_SETUP',
    type: 'MONITORING_SETUP',
    title: 'Monitoramento',
    description: 'Instalação de sistema de monitoramento inteligente.',
    icon: <BarChart className="h-6 w-6" />,
    features: [
      'Instalação de sensores',
      'Configuração de software',
      'Dashboard online',
      'Alertas automáticos',
      'Relatórios periódicos'
    ],
    priceRange: 'R$ 800 - 3.000',
    duration: '4-6 horas'
  },
  {
    id: 'OTHER',
    type: 'OTHER',
    title: 'Outros Serviços',
    description: 'Soluções personalizadas para necessidades específicas.',
    icon: <Settings className="h-6 w-6" />,
    features: [
      'Soluções customizadas',
      'Projetos especiais',
      'Atendimento dedicado',
      'Orçamento personalizado',
      'Suporte técnico'
    ],
    priceRange: 'Sob consulta',
    duration: 'Variável'
  }
]

export function ServiceRequestModal({ isOpen, onClose, onSubmit, isLoading = false }: ServiceRequestModalProps) {
  const [formData, setFormData] = useState<FormData>({
    serviceType: '',
    clientName: '',
    clientEmail: '',
    clientPhone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    propertyType: '',
    message: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.serviceType) newErrors.serviceType = 'Service type is required'
    if (!formData.clientName?.trim()) newErrors.clientName = 'Name is required'
    if (!formData.clientEmail?.trim()) newErrors.clientEmail = 'Email is required'
    if (!formData.clientPhone?.trim()) newErrors.clientPhone = 'Phone is required'
    if (!formData.address?.trim()) newErrors.address = 'Address is required'
    if (!formData.city?.trim()) newErrors.city = 'City is required'
    if (!formData.state?.trim()) newErrors.state = 'State is required'
    if (!formData.zipCode?.trim()) newErrors.zipCode = 'Zip code is required'
    if (!formData.propertyType) newErrors.propertyType = 'Property type is required'

    // Email validation
    if (formData.clientEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.clientEmail)) {
      newErrors.clientEmail = 'Invalid email'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    try {
      await onSubmit(formData)
      // Reset form on success
      setFormData({
        serviceType: '',
        clientName: '',
        clientEmail: '',
        clientPhone: '',
        address: '',
        city: '',
        state: '',
        zipCode: '',
        propertyType: '',
        message: '',
      })
      setErrors({})
    } catch (error) {
      // Error handling is done by the parent component
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-2xl flex items-center gap-2">
              <Star className="h-6 w-6" />
              Request Service
            </CardTitle>
            <CardDescription>
              Provide your information to request solar installation service
            </CardDescription>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Service Selection */}
            <div>
              <h3 className="text-lg font-medium mb-4">Selecione o Tipo de Serviço</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {services.map((service) => {
                  const isSelected = formData.serviceType === service.type
                  return (
                    <Card
                      key={service.id}
                      className={`cursor-pointer transition-all hover:shadow-md ${
                        isSelected
                          ? 'ring-2 ring-primary border-primary'
                          : 'hover:border-primary/50'
                      }`}
                      onClick={() => handleInputChange('serviceType', service.type)}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className={`p-2 rounded-lg ${
                              isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted'
                            }`}>
                              {service.icon}
                            </div>
                            <CardTitle className="text-sm">{service.title}</CardTitle>
                          </div>
                          {service.popular && (
                            <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
                              Popular
                            </span>
                          )}
                        </div>
                        <CardDescription className="text-xs">
                          {service.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="pt-0">
                        {service.priceRange && (
                          <div className="text-xs text-muted-foreground mb-2">
                            <strong>Preço:</strong> {service.priceRange}
                          </div>
                        )}
                        {service.duration && (
                          <div className="text-xs text-muted-foreground mb-3">
                            <strong>Duração:</strong> {service.duration}
                          </div>
                        )}
                        <div className="space-y-1">
                          {service.features.slice(0, 3).map((feature, index) => (
                            <div key={index} className="flex items-center gap-1 text-xs">
                              <Check className="h-3 w-3 text-green-500 flex-shrink-0" />
                              <span className="line-clamp-1">{feature}</span>
                            </div>
                          ))}
                          {service.features.length > 3 && (
                            <div className="text-xs text-muted-foreground">
                              +{service.features.length - 3} mais benefícios
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
              {errors.serviceType && (
                <p className="text-sm text-red-500 mt-2">{errors.serviceType}</p>
              )}
            </div>

            {/* Client Information */}
            <div>
              <h3 className="text-lg font-medium mb-4">Your Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="clientName">Full Name *</Label>
                  <Input
                    id="clientName"
                    value={formData.clientName}
                    onChange={(e) => handleInputChange('clientName', e.target.value)}
                    className={errors.clientName ? 'border-red-500' : ''}
                    placeholder="Your full name"
                  />
                  {errors.clientName && (
                    <p className="text-sm text-red-500">{errors.clientName}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="clientEmail">Email *</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="clientEmail"
                      type="email"
                      value={formData.clientEmail}
                      onChange={(e) => handleInputChange('clientEmail', e.target.value)}
                      className={`pl-10 ${errors.clientEmail ? 'border-red-500' : ''}`}
                      placeholder="your@email.com"
                    />
                  </div>
                  {errors.clientEmail && (
                    <p className="text-sm text-red-500">{errors.clientEmail}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="clientPhone">Phone *</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="clientPhone"
                      value={formData.clientPhone}
                      onChange={(e) => handleInputChange('clientPhone', e.target.value)}
                      className={`pl-10 ${errors.clientPhone ? 'border-red-500' : ''}`}
                      placeholder="(00) 00000-0000"
                    />
                  </div>
                  {errors.clientPhone && (
                    <p className="text-sm text-red-500">{errors.clientPhone}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Location Information */}
            <div>
              <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Service Address
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="address">Street Address *</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    className={errors.address ? 'border-red-500' : ''}
                    placeholder="Street, number, apartment"
                  />
                  {errors.address && (
                    <p className="text-sm text-red-500">{errors.address}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="city">City *</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    className={errors.city ? 'border-red-500' : ''}
                    placeholder="Your city"
                  />
                  {errors.city && (
                    <p className="text-sm text-red-500">{errors.city}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="state">State *</Label>
                  <Input
                    id="state"
                    value={formData.state}
                    onChange={(e) => handleInputChange('state', e.target.value)}
                    className={errors.state ? 'border-red-500' : ''}
                    placeholder="State"
                    maxLength={2}
                  />
                  {errors.state && (
                    <p className="text-sm text-red-500">{errors.state}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="zipCode">Zip Code *</Label>
                  <Input
                    id="zipCode"
                    value={formData.zipCode}
                    onChange={(e) => handleInputChange('zipCode', e.target.value)}
                    className={errors.zipCode ? 'border-red-500' : ''}
                    placeholder="00000-000"
                  />
                  {errors.zipCode && (
                    <p className="text-sm text-red-500">{errors.zipCode}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="propertyType">Property Type *</Label>
                  <Select
                    value={formData.propertyType}
                    onValueChange={(value) => handleInputChange('propertyType', value)}
                  >
                    <SelectTrigger className={errors.propertyType ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="RESIDENTIAL">
                        <div className="flex items-center gap-2">
                          <Home className="h-4 w-4" />
                          Residential
                        </div>
                      </SelectItem>
                      <SelectItem value="COMMERCIAL">
                        <div className="flex items-center gap-2">
                          <Building className="h-4 w-4" />
                          Commercial
                        </div>
                      </SelectItem>
                      <SelectItem value="INDUSTRIAL">
                        <div className="flex items-center gap-2">
                          <Factory className="h-4 w-4" />
                          Industrial
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.propertyType && (
                    <p className="text-sm text-red-500">{errors.propertyType}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Additional Information */}
            <div>
              <h3 className="text-lg font-medium mb-4">Additional Information</h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="message">
                    Message or Notes
                    <span className="text-xs text-muted-foreground ml-2">
                      Optional
                    </span>
                  </Label>
                  <Textarea
                    id="message"
                    value={formData.message}
                    onChange={(e) => handleInputChange('message', e.target.value)}
                    rows={3}
                    placeholder="Tell us a bit more about your specific needs..."
                  />
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? 'Sending...' : 'Send Request'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}