'use client'

import { useState, useCallback, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/presentation/components/ui/card'
import { Button } from '@/presentation/components/ui/button'
import { Progress } from '@/presentation/components/ui/progress'
import { Badge } from '@/presentation/components/ui/badge'
import { Input } from '@/presentation/components/ui/input'
import { Textarea } from '@/presentation/components/ui/textarea'
import { Label } from '@/presentation/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/presentation/components/ui/select'
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
  Eye,
  Edit,
  X,
  GripVertical
} from 'lucide-react'
import { toast } from 'sonner'
import { ProjectImageWithRelations, ProjectImageCategory } from '@/domains/projects/entities/project-image.entity'
import ImageGallery from './image-gallery'

interface ProjectImageFile {
  id: string
  filename: string
  originalName: string
  url: string
  type: string
  size: number
  category?: string
  description?: string
  order: number
  status: 'uploading' | 'completed' | 'error'
  progress?: number
  error?: string
}

interface ProjectImageUploadProps {
  projectId: string
  images?: ProjectImageWithRelations[]
  onImageUpload?: (image: ProjectImageFile) => void
  onImageUpdate?: (imageId: string, data: Partial<ProjectImageFile>) => void
  onImageDelete?: (imageId: string) => void
  readOnly?: boolean
}

const ALLOWED_FILE_TYPES = {
  'image/jpeg': { icon: Image, color: 'text-purple-500', label: 'JPEG' },
  'image/png': { icon: Image, color: 'text-purple-500', label: 'PNG' },
  'image/webp': { icon: Image, color: 'text-purple-500', label: 'WebP' },
  'image/gif': { icon: Image, color: 'text-purple-500', label: 'GIF' },
  'application/pdf': { icon: FileText, color: 'text-red-500', label: 'PDF' },
  'application/msword': { icon: FileText, color: 'text-blue-500', label: 'Word' },
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': { icon: FileText, color: 'text-blue-500', label: 'Word' }
}

const CATEGORY_LABELS = {
  [ProjectImageCategory.SITE_PHOTO]: 'Site Photos',
  [ProjectImageCategory.BLUEPRINT]: 'Blueprints',
  [ProjectImageCategory.DOCUMENT]: 'Documents',
  [ProjectImageCategory.INSTALLATION]: 'Installation',
  [ProjectImageCategory.COMPLETION]: 'Completion',
  [ProjectImageCategory.MILESTONE]: 'Milestones',
  [ProjectImageCategory.OTHER]: 'Other'
}

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

export default function ProjectImageUpload({
  projectId,
  images = [],
  onImageUpload,
  onImageUpdate,
  onImageDelete,
  readOnly = false
}: ProjectImageUploadProps) {
  const [uploadImages, setUploadImages] = useState<ProjectImageFile[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [editingImage, setEditingImage] = useState<string | null>(null)
  const [editForm, setEditForm] = useState({
    category: '',
    description: ''
  })

  // Load existing images
  useEffect(() => {
    const convertedImages: ProjectImageFile[] = images.map(img => ({
      id: img.id,
      filename: img.filename,
      originalName: img.originalName,
      url: img.url,
      type: img.type,
      size: img.size,
      category: img.category,
      description: img.description,
      order: img.order,
      status: 'completed' as const
    }))
    setUploadImages(convertedImages)
  }, [images])

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

  const uploadFile = async (file: File, category?: string, description?: string): Promise<ProjectImageFile> => {
    const formData = new FormData()
    formData.append('file', file)
    if (category) formData.append('category', category)
    if (description) formData.append('description', description)

    const response = await fetch(`/api/projects/${projectId}/images`, {
      method: 'POST',
      body: formData
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Upload failed')
    }

    const result = await response.json()
    return {
      ...result.data,
      status: 'completed' as const
    }
  }

  const updateImage = async (imageId: string, data: { category?: string; description?: string }) => {
    const response = await fetch(`/api/projects/${projectId}/images/${imageId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Update failed')
    }

    const result = await response.json()
    return result.data
  }

  const deleteImage = async (imageId: string) => {
    const response = await fetch(`/api/projects/${projectId}/images/${imageId}`, {
      method: 'DELETE'
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Delete failed')
    }
  }

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (readOnly) return

    const validFiles = acceptedFiles.filter(file => {
      if (file.size > MAX_FILE_SIZE) {
        toast.error(`File "${file.name}" is too large. Maximum size is 10MB.`)
        return false
      }

      const isAllowedType = Object.keys(ALLOWED_FILE_TYPES).includes(file.type)
      if (!isAllowedType) {
        toast.error(`File type "${file.type}" is not supported.`)
        return false
      }

      return true
    })

    for (const file of validFiles) {
      try {
        const uploadedImage = await uploadFile(file)
        setUploadImages(prev => [...prev, uploadedImage])
        onImageUpload?.(uploadedImage)
        toast.success(`File "${file.name}" uploaded successfully!`)
      } catch (error) {
        toast.error(`Failed to upload "${file.name}": ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
    }
  }, [projectId, readOnly, onImageUpload])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    onDragEnter: () => setIsDragging(true),
    onDragLeave: () => setIsDragging(false),
    accept: Object.keys(ALLOWED_FILE_TYPES).reduce((acc, type) => {
      acc[type] = []
      return acc
    }, {} as Record<string, string[]>),
    maxSize: MAX_FILE_SIZE,
    multiple: true,
    disabled: readOnly
  })

  const handleEditImage = (image: ProjectImageFile) => {
    setEditingImage(image.id)
    setEditForm({
      category: image.category || '',
      description: image.description || ''
    })
  }

  const handleSaveEdit = async (imageId: string) => {
    try {
      const updatedImage = await updateImage(imageId, editForm)
      setUploadImages(prev =>
        prev.map(img => img.id === imageId
          ? { ...img, category: updatedImage.category, description: updatedImage.description }
          : img
        )
      )
      onImageUpdate?.(imageId, editForm)
      setEditingImage(null)
      toast.success('Image updated successfully!')
    } catch (error) {
      toast.error(`Failed to update image: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  const handleDeleteImage = async (imageId: string) => {
    try {
      await deleteImage(imageId)
      setUploadImages(prev => prev.filter(img => img.id !== imageId))
      onImageDelete?.(imageId)
      toast.success('Image deleted successfully!')
    } catch (error) {
      toast.error(`Failed to delete image: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  const handleDownloadImage = (image: ProjectImageFile) => {
    const link = document.createElement('a')
    link.href = image.url
    link.download = image.originalName
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleViewImage = (image: ProjectImageFile) => {
    window.open(image.url, '_blank')
  }

  const sortedImages = [...uploadImages].sort((a, b) => a.order - b.order)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Image className="w-5 h-5 text-indigo-600" />
          Project Images & Documents
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {!readOnly && (
          /* Upload Area */
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
                {isDragActive ? 'Drop your files here' : 'Upload Images & Documents'}
              </h3>
              <p className="text-sm text-muted-foreground">
                Drag and drop files here, or click to select files
              </p>
              <div className="flex flex-wrap justify-center gap-2 text-xs text-muted-foreground">
                <Badge variant="outline">Images</Badge>
                <Badge variant="outline">PDF</Badge>
                <Badge variant="outline">Word</Badge>
                <Badge variant="outline">Max 10MB</Badge>
              </div>
            </div>
          </div>
        )}

        {/* Images Gallery */}
        {sortedImages.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Uploaded Files ({sortedImages.length})</h4>
              <div className="text-sm text-muted-foreground">
                {sortedImages.filter(img => img.type.startsWith('image/')).length} images,
                {sortedImages.filter(img => !img.type.startsWith('image/')).length} documents
              </div>
            </div>

            {/* Gallery View */}
            <div className="space-y-4">
              <div>
                <h5 className="text-sm font-medium mb-2">Gallery View</h5>
                <ImageGallery
                  images={sortedImages}
                  className="border rounded-lg p-4 bg-background"
                />
              </div>

              {/* Detailed List View */}
              <div>
                <h5 className="text-sm font-medium mb-2">Detailed View</h5>
                <div className="space-y-2">
                  {sortedImages.map((image) => {
                    const { Icon, color, label } = getFileIcon(image.type)
                    const isEditing = editingImage === image.id

                    return (
                      <div
                        key={image.id}
                        className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg border border-border"
                      >
                        <div className="flex-shrink-0">
                          <Icon className={`w-5 h-5 ${color}`} />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="text-sm font-medium truncate">{image.originalName}</p>
                            <Badge variant="outline" className="text-xs">
                              {label}
                            </Badge>
                            {image.category && (
                              <Badge variant="secondary" className="text-xs">
                                {CATEGORY_LABELS[image.category as keyof typeof CATEGORY_LABELS] || image.category}
                              </Badge>
                            )}
                          </div>

                          <div className="flex items-center gap-4 text-xs text-muted-foreground mb-2">
                            <span>{formatFileSize(image.size)}</span>
                            {image.description && !isEditing && (
                              <span className="truncate">{image.description}</span>
                            )}
                          </div>

                          {isEditing && (
                            <div className="space-y-2 mt-2">
                              <div>
                                <Label htmlFor={`category-${image.id}`} className="text-xs">Category</Label>
                                <Select
                                  value={editForm.category}
                                  onValueChange={(value) => setEditForm(prev => ({ ...prev, category: value }))}
                                >
                                  <SelectTrigger id={`category-${image.id}`} className="h-8 text-xs">
                                    <SelectValue placeholder="Select category" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
                                      <SelectItem key={value} value={value} className="text-xs">
                                        {label}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              <div>
                                <Label htmlFor={`description-${image.id}`} className="text-xs">Description</Label>
                                <Textarea
                                  id={`description-${image.id}`}
                                  value={editForm.description}
                                  onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                                  placeholder="Add a description..."
                                  className="min-h-[60px] text-xs"
                                />
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  onClick={() => handleSaveEdit(image.id)}
                                  className="text-xs"
                                >
                                  Save
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => setEditingImage(null)}
                                  className="text-xs"
                                >
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleViewImage(image)}
                            className="h-8 w-8 p-0"
                            title="View"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>

                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDownloadImage(image)}
                            className="h-8 w-8 p-0"
                            title="Download"
                          >
                            <Download className="w-4 h-4" />
                          </Button>

                          {!readOnly && (
                            <>
                              {!isEditing && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleEditImage(image)}
                                  className="h-8 w-8 p-0"
                                  title="Edit"
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                              )}

                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleDeleteImage(image.id)}
                                className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50"
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {sortedImages.length === 0 && (
          <div className="text-center py-8">
            <Image className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              {readOnly ? 'No files available for this project' : 'No files uploaded yet'}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}