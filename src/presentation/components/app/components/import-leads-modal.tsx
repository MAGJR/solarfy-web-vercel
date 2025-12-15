'use client'

import { useState, useCallback } from 'react'
import { useAuth } from '@/presentation/hooks/use-auth'
import { Button } from '@/presentation/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/presentation/components/ui/card'
import { Progress } from '@/presentation/components/ui/progress'
import { Alert, AlertDescription } from '@/presentation/components/ui/alert'
import { Badge } from '@/presentation/components/ui/badge'
import { Upload, FileText, CheckCircle, XCircle, AlertCircle, Loader2, Eye, ArrowRight, ArrowLeft, Sparkles } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/presentation/components/ui/dialog'
import { CSVValidatorService, type ValidationError, type CSVParseResult } from '@/domains/crm/services/csv-validator.service'

type ImportPhase = 'upload' | 'validation' | 'preview' | 'processing' | 'results'

interface ImportError {
  row: number
  email?: string
  error: string
  field?: string
  value?: string
  suggestion?: string
}

interface ImportResult {
  success: boolean
  message: string
  data: {
    total: number
    imported: number
    failed: number
    skipped: number
    duration: number
    errors: ImportError[]
    importedLeads: any[]
  }
}

interface ImportLeadsModalProps {
  open: boolean
  onClose: () => void
}

const PHASES = [
  { id: 'upload', label: 'Upload', icon: Upload },
  { id: 'validation', label: 'Validation', icon: Sparkles },
  { id: 'preview', label: 'Preview', icon: Eye },
  { id: 'processing', label: 'Processing', icon: Loader2 },
  { id: 'results', label: 'Results', icon: CheckCircle },
] as const

export default function ImportLeadsModal({ open, onClose }: ImportLeadsModalProps) {
  const { user } = useAuth()
  const [currentPhase, setCurrentPhase] = useState<ImportPhase>('upload')
  const [file, setFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [result, setResult] = useState<ImportResult | null>(null)
  const [csvValidation, setCsvValidation] = useState<CSVParseResult | null>(null)
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([])
  const [csvValidator] = useState(() => new CSVValidatorService())

  const resetForm = useCallback(() => {
    setFile(null)
    setIsProcessing(false)
    setProgress(0)
    setResult(null)
    setCsvValidation(null)
    setValidationErrors([])
    setCurrentPhase('upload')
  }, [])

  const handleClose = useCallback(() => {
    resetForm()
    onClose()
  }, [resetForm, onClose])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile && droppedFile.name.toLowerCase().endsWith('.csv')) {
      handleFileSelect(droppedFile)
    }
  }, [])

  const handleFileSelect = useCallback(async (selectedFile: File) => {
    setFile(selectedFile)

    // Phase 1: Upload - Validate file
    const fileErrors = csvValidator.validateFile(selectedFile)

    if (fileErrors.length > 0) {
      setValidationErrors(fileErrors)
      return
    }

    try {
      // Read and parse CSV content
      const csvContent = await selectedFile.text()
      const lines = csvContent.split('\n').filter(line => line.trim())

      if (lines.length < 2) {
        setValidationErrors([{
          row: 1,
          error: 'CSV file must contain at least a header and one data row',
          suggestion: 'Add data rows to your CSV file'
        }])
        return
      }

      // Parse headers and first data row for structure validation
      const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''))
      const firstDataRow = lines[1].split(',').map(h => h.trim().replace(/^"|"$/g, ''))

      // Validate CSV structure
      const { errors: structureErrors, structure } = csvValidator.validateStructure(headers, firstDataRow)

      if (structureErrors.length > 0 || !structure) {
        setValidationErrors(structureErrors)
        return
      }

      // Validate all content
      const validationResult = await csvValidator.validateContent(csvContent, structure)

      if (validationResult.errors.length > 0) {
        setCsvValidation(validationResult)
        setValidationErrors(validationResult.errors)
        setCurrentPhase('validation')
      } else {
        setCsvValidation(validationResult)
        setCurrentPhase('preview')
      }
    } catch (error) {
      setValidationErrors([{
        row: 0,
        error: error instanceof Error ? error.message : 'Failed to parse CSV file',
        suggestion: 'Check your CSV file format and try again'
      }])
    }
  }, [csvValidator])

  const handleProceedWithErrors = useCallback(() => {
    if (csvValidation && csvValidation.leads.length > 0) {
      setCurrentPhase('preview')
    }
  }, [csvValidation])

  const handleImport = useCallback(async () => {
    if (!file || !user?.id) {
      return
    }

    setIsProcessing(true)
    setCurrentPhase('processing')
    setProgress(10)

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 80))
      }, 300)

      const formData = new FormData()
      formData.append('file', file)
      formData.append('userId', user.id)

      const response = await fetch('/api/leads/import', {
        method: 'POST',
        body: formData,
      })

      clearInterval(progressInterval)
      setProgress(90)

      const result: ImportResult = await response.json()
      setProgress(100)
      setResult(result)
      setCurrentPhase('results')

    } catch (error) {
      setResult({
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        data: {
          total: 0,
          imported: 0,
          failed: 0,
          skipped: 0,
          duration: 0,
          errors: [{ row: 0, error: error instanceof Error ? error.message : 'Unknown error' }],
          importedLeads: []
        }
      })
      setCurrentPhase('results')
    } finally {
      setIsProcessing(false)
    }
  }, [file, user?.id])

  const goToPhase = useCallback((phase: ImportPhase) => {
    if (phase === 'upload') {
      resetForm()
    } else if (phase === 'validation' && validationErrors.length === 0) {
      // Can't go to validation if no errors
      return
    } else if (phase === 'preview' && !csvValidation) {
      // Can't go to preview without validation
      return
    } else {
      setCurrentPhase(phase)
    }
  }, [resetForm, validationErrors.length, csvValidation])

  const getCurrentPhaseIndex = () => {
    return PHASES.findIndex(phase => phase.id === currentPhase)
  }

  const canGoToNextPhase = () => {
    const currentIndex = getCurrentPhaseIndex()
    if (currentIndex >= PHASES.length - 1) return false

    switch (currentPhase) {
      case 'upload':
        return file !== null && validationErrors.length === 0
      case 'validation':
        return csvValidation !== null
      case 'preview':
        return true
      case 'processing':
        return false
      case 'results':
        return false
      default:
        return false
    }
  }

  const canGoToPreviousPhase = () => {
    const currentIndex = getCurrentPhaseIndex()
    if (currentIndex <= 0) return false

    switch (currentPhase) {
      case 'validation':
        return true
      case 'preview':
        return true
      case 'processing':
        return csvValidation !== null
      case 'results':
        return true
      default:
        return false
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Import Leads from CSV</DialogTitle>
          <DialogDescription>
            Upload and validate your CSV file before importing leads.
          </DialogDescription>
        </DialogHeader>

        {/* Phase Indicator */}
        <div className="flex items-center justify-between mb-6">
          {PHASES.map((phase, index) => {
            const Icon = phase.icon
            const isActive = phase.id === currentPhase
            const isCompleted = getCurrentPhaseIndex() > index
            const canNavigate = index <= getCurrentPhaseIndex()

            return (
              <div key={phase.id} className="flex items-center flex-1">
                <button
                  onClick={() => canNavigate && goToPhase(phase.id as ImportPhase)}
                  disabled={!canNavigate}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : isCompleted
                      ? 'bg-green-100 text-green-700 hover:bg-green-200'
                      : canNavigate
                      ? 'bg-muted hover:bg-muted/80 cursor-pointer'
                      : 'bg-muted/50 text-muted-foreground cursor-not-allowed'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm font-medium hidden sm:inline">{phase.label}</span>
                </button>
                {index < PHASES.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-2 ${
                    getCurrentPhaseIndex() > index ? 'bg-green-500' : 'bg-muted'
                  }`} />
                )}
              </div>
            )
          })}
        </div>

        {/* Navigation Buttons */}
        {canGoToPreviousPhase() && (
          <div className="flex justify-start mb-4">
            <Button
              variant="outline"
              onClick={() => goToPhase(PHASES[getCurrentPhaseIndex() - 1].id as ImportPhase)}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Previous
            </Button>
          </div>
        )}

        <div className="space-y-6">
          {/* Phase 1: Upload */}
          {currentPhase === 'upload' && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Upload className="w-5 h-5 mr-2" />
                  Upload CSV File
                </CardTitle>
                <CardDescription>
                  Select a CSV file containing your leads data.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* CSV Format Instructions */}
                <div className="mb-6">
                  <h4 className="font-medium mb-2">Required CSV Format:</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <Badge variant="destructive" className="mb-1">Required</Badge>
                      <ul className="space-y-1 ml-4">
                        <li>• <code className="bg-muted px-1 rounded">Name</code></li>
                        <li>• <code className="bg-muted px-1 rounded">Owner Email</code></li>
                      </ul>
                    </div>
                    <div>
                      <Badge variant="secondary" className="mb-1">Optional</Badge>
                      <ul className="space-y-1 ml-4">
                        <li>• <code className="bg-muted px-1 rounded">Owner Phone</code></li>
                        <li>• <code className="bg-muted px-1 rounded">My Company's Reference</code></li>
                      </ul>
                    </div>
                  </div>
                  <Alert className="mt-3">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Email domains are automatically classified: Gmail/Yahoo = Owner, Enphase/Sunnova = Lease
                    </AlertDescription>
                  </Alert>
                </div>

                {/* File Upload Area */}
                <div
                  className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                    isDragging
                      ? 'border-primary bg-primary/5'
                      : 'border-muted-foreground/25 hover:border-muted-foreground/50'
                  }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">Drop your CSV file here</h3>
                  <p className="text-muted-foreground mb-4">or click to browse</p>
                  <input
                    type="file"
                    accept=".csv"
                    onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                    className="hidden"
                    id="file-upload"
                  />
                  <label htmlFor="file-upload">
                    <Button variant="outline" asChild>
                      <span>Choose File</span>
                    </Button>
                  </label>
                </div>

                {/* Selected File */}
                {file && (
                  <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <FileText className="w-8 h-8 text-blue-500" />
                        <div>
                          <p className="font-medium">{file.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {(file.size / 1024).toFixed(1)} KB
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setFile(null)
                          setValidationErrors([])
                          setCsvValidation(null)
                        }}
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                )}

                {/* Validation Errors */}
                {validationErrors.length > 0 && (
                  <div className="mt-4">
                    <Alert variant="destructive">
                      <XCircle className="h-4 w-4" />
                      <AlertDescription>
                        <strong>File validation failed:</strong>
                        <ul className="mt-2 space-y-1">
                          {validationErrors.slice(0, 3).map((error, index) => (
                            <li key={index}>• {error.error}</li>
                          ))}
                          {validationErrors.length > 3 && (
                            <li>• ... and {validationErrors.length - 3} more issues</li>
                          )}
                        </ul>
                      </AlertDescription>
                    </Alert>
                  </div>
                )}

                {/* Next Button */}
                {canGoToNextPhase() && (
                  <div className="flex justify-end mt-6">
                    <Button onClick={() => goToPhase('validation')}>
                      Next Phase
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Phase 2: Validation */}
          {currentPhase === 'validation' && csvValidation && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Sparkles className="w-5 h-5 mr-2" />
                  Validation Results
                </CardTitle>
                <CardDescription>
                  Review validation errors and fix issues before importing.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{csvValidation.validRows}</div>
                    <div className="text-sm text-green-700">Valid Rows</div>
                  </div>
                  <div className="text-center p-4 bg-red-50 rounded-lg">
                    <div className="text-2xl font-bold text-red-600">{csvValidation.invalidRows}</div>
                    <div className="text-sm text-red-700">Invalid Rows</div>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{csvValidation.totalRows}</div>
                    <div className="text-sm text-blue-700">Total Rows</div>
                  </div>
                </div>

                {/* Validation Errors */}
                {validationErrors.length > 0 && (
                  <div className="space-y-4">
                    <h4 className="font-medium text-red-600">Validation Issues Found:</h4>
                    <div className="max-h-64 overflow-y-auto space-y-2">
                      {validationErrors.map((error, index) => (
                        <div key={index} className="p-3 bg-red-50 border border-red-200 rounded-lg">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="font-medium text-red-700">
                                Row {error.row}: {error.error}
                              </div>
                              {error.field && error.value && (
                                <div className="text-sm text-red-600 mt-1">
                                  Field: <strong>{error.field}</strong> | Value: "{error.value}"
                                </div>
                              )}
                              {error.suggestion && (
                                <div className="text-sm text-red-600 mt-1">
                                  💡 {error.suggestion}
                                </div>
                              )}
                            </div>
                            <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 ml-2" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex justify-between mt-6">
                  {csvValidation.validRows > 0 ? (
                    <div className="text-sm text-yellow-700 bg-yellow-50 p-3 rounded-lg">
                      ⚠️ {csvValidation.validRows} valid rows can be imported.
                      Invalid rows will be skipped.
                    </div>
                  ) : (
                    <div className="text-sm text-red-700 bg-red-50 p-3 rounded-lg">
                      ❌ No valid rows found. Please fix all errors before proceeding.
                    </div>
                  )}

                  <div className="space-x-2">
                    {csvValidation.validRows > 0 && (
                      <Button
                        onClick={handleProceedWithErrors}
                        disabled={csvValidation.validRows === 0}
                      >
                        Proceed with Valid Rows ({csvValidation.validRows})
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Phase 3: Preview */}
          {currentPhase === 'preview' && csvValidation && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Eye className="w-5 h-5 mr-2" />
                  Preview Import Data
                </CardTitle>
                <CardDescription>
                  Review the {csvValidation.leads.length} leads that will be imported.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-4 p-4 bg-blue-50 rounded-lg">
                  <div className="text-sm text-blue-700">
                    <strong>Ready to import:</strong> {csvValidation.leads.length} leads
                    {csvValidation.invalidRows > 0 && (
                      <> (skipping {csvValidation.invalidRows} invalid rows)</>
                    )}
                  </div>
                </div>

                {/* Preview Table */}
                <div className="border rounded-lg overflow-hidden">
                  <div className="max-h-64 overflow-y-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-muted sticky top-0">
                        <tr>
                          <th className="px-3 py-2 text-left">Row</th>
                          <th className="px-3 py-2 text-left">Name</th>
                          <th className="px-3 py-2 text-left">Email</th>
                          <th className="px-3 py-2 text-left">Phone</th>
                          <th className="px-3 py-2 text-left">Reference</th>
                          <th className="px-3 py-2 text-left">Type</th>
                        </tr>
                      </thead>
                      <tbody>
                        {csvValidation.leads.slice(0, 10).map((lead, index) => (
                          <tr key={index} className="border-t">
                            <td className="px-3 py-2">{lead.rowNumber}</td>
                            <td className="px-3 py-2">{lead.name}</td>
                            <td className="px-3 py-2">{lead.email}</td>
                            <td className="px-3 py-2">{lead.phone || '-'}</td>
                            <td className="px-3 py-2">{lead.referenceId || '-'}</td>
                            <td className="px-3 py-2">
                              <Badge variant={lead.customerType === 'OWNER' ? 'default' : 'secondary'}>
                                {lead.customerType}
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {csvValidation.leads.length > 10 && (
                    <div className="px-3 py-2 bg-muted text-sm text-center">
                      ... and {csvValidation.leads.length - 10} more rows
                    </div>
                  )}
                </div>

                {/* Import Button */}
                <div className="flex justify-end mt-6">
                  <Button
                    onClick={handleImport}
                    disabled={isProcessing}
                    size="lg"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        Import {csvValidation.leads.length} Leads
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Phase 4: Processing */}
          {currentPhase === 'processing' && (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center space-y-4">
                  <Loader2 className="w-12 h-12 mx-auto animate-spin text-primary" />
                  <h3 className="text-lg font-semibold">Importing Leads...</h3>
                  <p className="text-muted-foreground">
                    Processing {csvValidation?.leads.length || 0} leads
                  </p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span>{progress}%</span>
                    </div>
                    <Progress value={progress} className="w-full" />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Phase 5: Results */}
          {currentPhase === 'results' && result && (
            <Card>
              <CardHeader>
                <div className="flex items-center space-x-2">
                  {result.success ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-500" />
                  )}
                  <CardTitle className="text-lg">
                    {result.success ? 'Import Completed' : 'Import Failed'}
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Summary */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold">{result.data.total}</div>
                      <div className="text-sm text-muted-foreground">Total</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-500">{result.data.imported}</div>
                      <div className="text-sm text-muted-foreground">Imported</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-yellow-500">{result.data.skipped}</div>
                      <div className="text-sm text-muted-foreground">Skipped</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-500">{result.data.failed}</div>
                      <div className="text-sm text-muted-foreground">Failed</div>
                    </div>
                  </div>

                  {/* Duration */}
                  <p className="text-sm text-muted-foreground text-center">
                    Completed in {(result.data.duration / 1000).toFixed(2)} seconds
                  </p>

                  {/* Errors */}
                  {result.data.errors.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2 text-red-600">Import Errors:</h4>
                      <div className="max-h-32 overflow-y-auto space-y-1">
                        {result.data.errors.slice(0, 10).map((error, index) => (
                          <div key={index} className="text-sm text-red-600 p-2 bg-red-50 rounded">
                            Row {error.row}: {error.error}
                            {error.email && ` (${error.email})`}
                          </div>
                        ))}
                        {result.data.errors.length > 10 && (
                          <div className="text-sm text-muted-foreground">
                            ... and {result.data.errors.length - 10} more errors
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex justify-between">
                    <Button variant="outline" onClick={resetForm}>
                      Import Another File
                    </Button>
                    <Button onClick={handleClose}>
                      Done
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}