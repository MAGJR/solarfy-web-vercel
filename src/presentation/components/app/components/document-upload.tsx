'use client'

import { useState, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/presentation/components/ui/card'
import { Button } from '@/presentation/components/ui/button'
import { Progress } from '@/presentation/components/ui/progress'
import { Badge } from '@/presentation/components/ui/badge'
import { useDropzone } from 'react-dropzone'
import {
  Upload,
  FileText,
  Download,
  Trash2,
  File,
  Image,
  FileSpreadsheet,
  FileIcon,
  CheckCircle,
  AlertCircle,
  X
} from 'lucide-react'
import { toast } from 'sonner'

interface DocumentFile {
  id: string
  name: string
  size: number
  type: string
  uploadedAt: Date
  url?: string
  status: 'uploading' | 'completed' | 'error'
  progress?: number
  error?: string
}

interface DocumentUploadProps {
  leadId: string
  documents?: DocumentFile[]
  onDocumentUpload?: (document: DocumentFile) => void
  onDocumentDelete?: (documentId: string) => void
}

const ALLOWED_FILE_TYPES = {
  'application/pdf': { icon: FileText, color: 'text-red-500', label: 'PDF' },
  'application/msword': { icon: FileText, color: 'text-blue-500', label: 'Word' },
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': { icon: FileText, color: 'text-blue-500', label: 'Word' },
  'application/vnd.ms-excel': { icon: FileSpreadsheet, color: 'text-green-500', label: 'Excel' },
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': { icon: FileSpreadsheet, color: 'text-green-500', label: 'Excel' },
  'image/jpeg': { icon: Image, color: 'text-purple-500', label: 'Image' },
  'image/png': { icon: Image, color: 'text-purple-500', label: 'Image' },
  'text/plain': { icon: File, color: 'text-gray-500', label: 'Text' }
}

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

export default function DocumentUpload({
  leadId,
  documents = [],
  onDocumentUpload,
  onDocumentDelete
}: DocumentUploadProps) {
  const [uploadFiles, setUploadFiles] = useState<DocumentFile[]>(documents)
  const [isDragging, setIsDragging] = useState(false)

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getFileIcon = (type: string) => {
    const fileInfo = ALLOWED_FILE_TYPES[type as keyof typeof ALLOWED_FILE_TYPES]
    const Icon = fileInfo?.icon || FileIcon
    return { Icon, color: fileInfo?.color || 'text-gray-500', label: fileInfo?.label || 'File' }
  }

  const simulateUpload = (file: File): Promise<DocumentFile> => {
    return new Promise((resolve) => {
      const documentId = `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      const uploadDoc: DocumentFile = {
        id: documentId,
        name: file.name,
        size: file.size,
        type: file.type,
        uploadedAt: new Date(),
        status: 'uploading',
        progress: 0
      }

      setUploadFiles(prev => [...prev, uploadDoc])

      let progress = 0
      const interval = setInterval(() => {
        progress += Math.random() * 30
        if (progress >= 100) {
          progress = 100
          clearInterval(interval)

          const completedDoc: DocumentFile = {
            ...uploadDoc,
            status: 'completed',
            progress: 100,
            url: URL.createObjectURL(file) // Mock URL
          }

          setUploadFiles(prev =>
            prev.map(doc => doc.id === documentId ? completedDoc : doc)
          )

          onDocumentUpload?.(completedDoc)
          resolve(completedDoc)
        } else {
          setUploadFiles(prev =>
            prev.map(doc => doc.id === documentId ? { ...doc, progress } : doc)
          )
        }
      }, 200)
    })
  }

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const validFiles = acceptedFiles.filter(file => {
      if (file.size > MAX_FILE_SIZE) {
        toast.error(`File "${file.name}" is too large. Maximum size is 10MB.`)
        return false
      }

      const isAllowedType = Object.keys(ALLOWED_FILE_TYPES).includes(file.type)
      if (!isAllowedType) {
        toast.error(`File type "${file.type}" is not supported. Please upload PDF, Word, Excel, images, or text files.`)
        return false
      }

      return true
    })

    for (const file of validFiles) {
      try {
        await simulateUpload(file)
        toast.success(`File "${file.name}" uploaded successfully!`)
      } catch (error) {
        toast.error(`Failed to upload "${file.name}"`)
      }
    }
  }, [onDocumentUpload])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    onDragEnter: () => setIsDragging(true),
    onDragLeave: () => setIsDragging(false),
    accept: Object.keys(ALLOWED_FILE_TYPES).reduce((acc, type) => {
      acc[type] = []
      return acc
    }, {} as Record<string, string[]>),
    maxSize: MAX_FILE_SIZE,
    multiple: true
  })

  const handleDeleteDocument = (documentId: string) => {
    setUploadFiles(prev => prev.filter(doc => doc.id !== documentId))
    onDocumentDelete?.(documentId)
    toast.success('Document deleted successfully!')
  }

  const handleDownloadDocument = (document: DocumentFile) => {
    if (document.url) {
      const link = document.createElement('a')
      link.href = document.url
      link.download = document.name
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-indigo-600" />
          Documents
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Upload Area */}
        <div
          {...getRootProps()}
          className={`
            border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all
            ${isDragActive || isDragging
              ? 'border-primary bg-primary/5 scale-[1.02]'
              : 'border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/25'
            }
          `}
        >
          <input {...getInputProps()} />
          <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <div className="space-y-2">
            <h3 className="text-lg font-medium">
              {isDragActive ? 'Drop your files here' : 'Upload Documents'}
            </h3>
            <p className="text-sm text-muted-foreground">
              Drag and drop files here, or click to select files
            </p>
            <div className="flex flex-wrap justify-center gap-2 text-xs text-muted-foreground">
              <Badge variant="outline">PDF</Badge>
              <Badge variant="outline">Word</Badge>
              <Badge variant="outline">Excel</Badge>
              <Badge variant="outline">Images</Badge>
              <Badge variant="outline">Text</Badge>
              <Badge variant="outline">Max 10MB</Badge>
            </div>
          </div>
        </div>

        {/* Documents List */}
        {uploadFiles.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium">Uploaded Documents</h4>
            <div className="space-y-2">
              {uploadFiles.map((document) => {
                const { Icon, color, label } = getFileIcon(document.type)

                return (
                  <div
                    key={document.id}
                    className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg border border-border"
                  >
                    <div className="flex-shrink-0">
                      <Icon className={`w-5 h-5 ${color}`} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-medium truncate">{document.name}</p>
                        <Badge variant="outline" className="text-xs">
                          {label}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>{formatFileSize(document.size)}</span>
                        <span>{document.uploadedAt.toLocaleDateString()}</span>

                        {document.status === 'uploading' && (
                          <div className="flex items-center gap-2 flex-1">
                            <div className="flex-1">
                              <Progress value={document.progress} className="h-1" />
                            </div>
                            <span>{document.progress}%</span>
                          </div>
                        )}

                        {document.status === 'completed' && (
                          <div className="flex items-center gap-1 text-green-600">
                            <CheckCircle className="w-3 h-3" />
                            <span>Completed</span>
                          </div>
                        )}

                        {document.status === 'error' && (
                          <div className="flex items-center gap-1 text-red-600">
                            <AlertCircle className="w-3 h-3" />
                            <span>Error</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      {document.status === 'completed' && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDownloadDocument(document)}
                          className="h-8 w-8 p-0"
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                      )}

                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteDocument(document.id)}
                        className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {uploadFiles.length === 0 && (
          <div className="text-center py-8">
            <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No documents uploaded yet</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}