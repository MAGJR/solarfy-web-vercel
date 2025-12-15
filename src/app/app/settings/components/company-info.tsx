'use client'

import { useState, useEffect } from 'react'
import { saveCompanyInfo, getCompanyInfo } from '../actions'

interface User {
  id: string
  name: string | null
  email: string
  role: string
  tenantId: string | null
  createdAt: string
  status: 'active' | 'inactive'
}

interface CompanyInfoProps {
  user: User
}

export default function CompanyInfo({ user }: CompanyInfoProps) {
  const [isSaving, setIsSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'success' | 'error' | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [companyInfo, setCompanyInfo] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    website: '',
    description: '',
    taxId: ''
  })

  // Load company info on component mount
  useEffect(() => {
    const loadCompanyInfo = async () => {
      try {
        const result = await getCompanyInfo()
        if (result.success && result.data) {
          setCompanyInfo({
            name: result.data.name || '',
            email: result.data.email || '',
            phone: result.data.phone || '',
            address: result.data.address || '',
            website: result.data.website || '',
            description: result.data.description || '',
            taxId: result.data.taxId || ''
          })
        }
      } catch (error) {
        console.error('Error loading company info:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadCompanyInfo()
  }, [])

  const refreshCompanyInfo = async () => {
    console.log('🔄 refreshCompanyInfo: Iniciando recarregamento de dados')
    try {
      const result = await getCompanyInfo()
      console.log('📊 refreshCompanyInfo: Resultado da API:', {
        success: result.success,
        hasData: !!result.data,
        data: result.data,
        error: result.error
      })

      if (result.success && result.data) {
        const newCompanyInfo = {
          name: result.data.name || '',
          email: result.data.email || '',
          phone: result.data.phone || '',
          address: result.data.address || '',
          website: result.data.website || '',
          description: result.data.description || '',
          taxId: result.data.taxId || ''
        }
        console.log('💾 refreshCompanyInfo: Atualizando estado local:', newCompanyInfo)
        setCompanyInfo(newCompanyInfo)
        console.log('✅ refreshCompanyInfo: Estado atualizado com sucesso')
      } else {
        console.log('❌ refreshCompanyInfo: Falha ao obter dados:', result.error)
      }
    } catch (error) {
      console.error('💥 refreshCompanyInfo: Erro ao recarregar informações:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSaving(true)
    setSaveStatus(null)

    try {
      const formData = new FormData(e.currentTarget)
      const result = await saveCompanyInfo(formData)

      if (result.success) {
        setSaveStatus('success')
        // Recarregar dados para garantir que o estado local esteja atualizado
        await refreshCompanyInfo()
        setTimeout(() => setSaveStatus(null), 3000)
      } else {
        setSaveStatus('error')
        setTimeout(() => setSaveStatus(null), 3000)
      }
    } catch (error) {
      setSaveStatus('error')
      setTimeout(() => setSaveStatus(null), 3000)
    } finally {
      setIsSaving(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setCompanyInfo(prev => ({
      ...prev,
      [field]: value
    }))
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="bg-card border border-border rounded-lg shadow-sm">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="bg-card border border-border rounded-lg shadow-sm">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-foreground mb-4">
            Company Information
          </h3>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label htmlFor="name" className="block text-sm font-medium text-foreground">
                  Company Name
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="name"
                    id="name"
                    value={companyInfo.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="shadow-sm focus:ring-violet-500 focus:border-violet-500 block w-full sm:text-sm border-border rounded-md p-2 bg-background text-foreground"
                  />
                </div>
              </div>

              <div className="sm:col-span-1">
                <label htmlFor="email" className="block text-sm font-medium text-foreground">
                  Email
                </label>
                <div className="mt-1">
                  <input
                    type="email"
                    name="email"
                    id="email"
                    value={companyInfo.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="shadow-sm focus:ring-violet-500 focus:border-violet-500 block w-full sm:text-sm border-border rounded-md p-2 bg-background text-foreground"
                  />
                </div>
              </div>

              <div className="sm:col-span-1">
                <label htmlFor="phone" className="block text-sm font-medium text-foreground">
                  Phone
                </label>
                <div className="mt-1">
                  <input
                    type="tel"
                    name="phone"
                    id="phone"
                    value={companyInfo.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="shadow-sm focus:ring-violet-500 focus:border-violet-500 block w-full sm:text-sm border-border rounded-md p-2 bg-background text-foreground"
                  />
                </div>
              </div>

              <div className="sm:col-span-1">
                <label htmlFor="website" className="block text-sm font-medium text-foreground">
                  Website
                </label>
                <div className="mt-1">
                  <input
                    type="url"
                    name="website"
                    id="website"
                    value={companyInfo.website}
                    onChange={(e) => handleInputChange('website', e.target.value)}
                    className="shadow-sm focus:ring-violet-500 focus:border-violet-500 block w-full sm:text-sm border-border rounded-md p-2 bg-background text-foreground"
                  />
                </div>
              </div>

              <div className="sm:col-span-1">
                <label htmlFor="taxId" className="block text-sm font-medium text-foreground">
                  Tax ID
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="taxId"
                    id="taxId"
                    value={companyInfo.taxId}
                    onChange={(e) => handleInputChange('taxId', e.target.value)}
                    className="shadow-sm focus:ring-violet-500 focus:border-violet-500 block w-full sm:text-sm border-border rounded-md p-2 bg-background text-foreground"
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="address" className="block text-sm font-medium text-foreground">
                  Address
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="address"
                    id="address"
                    value={companyInfo.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    className="shadow-sm focus:ring-violet-500 focus:border-violet-500 block w-full sm:text-sm border-border rounded-md p-2 bg-background text-foreground"
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="description" className="block text-sm font-medium text-foreground">
                  Description
                </label>
                <div className="mt-1">
                  <textarea
                    name="description"
                    id="description"
                    rows={3}
                    value={companyInfo.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    className="shadow-sm focus:ring-violet-500 focus:border-violet-500 block w-full sm:text-sm border-border rounded-md p-2 bg-background text-foreground"
                  />
                </div>
              </div>
            </div>

            {/* Status Messages */}
            {saveStatus === 'success' && (
              <div className="rounded-md bg-emerald-950 border border-emerald-800 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-emerald-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-emerald-300">
                      Company information saved successfully!
                    </p>
                  </div>
                </div>
              </div>
            )}

            {saveStatus === 'error' && (
              <div className="rounded-md bg-red-950 border border-red-800 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-red-300">
                      Failed to save company information. Please try again.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="pt-5">
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-violet-600 hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500 disabled:opacity-50 transition-colors"
                >
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}