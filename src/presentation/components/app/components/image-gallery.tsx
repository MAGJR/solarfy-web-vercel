'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogTrigger } from '@/presentation/components/ui/dialog'
import { Button } from '@/presentation/components/ui/button'
import { ProjectImageWithRelations } from '@/domains/projects/entities/project-image.entity'
import {
  ChevronLeft,
  ChevronRight,
  Download,
  Maximize2,
  X,
  FileText,
  Image as ImageIcon
} from 'lucide-react'
import { Badge } from '@/presentation/components/ui/badge'

interface ImageGalleryProps {
  images: ProjectImageWithRelations[]
  className?: string
}

interface LightboxProps {
  images: ProjectImageWithRelations[]
  initialIndex: number
  open: boolean
  onOpenChange: (open: boolean) => void
}

function Lightbox({ images, initialIndex, open, onOpenChange }: LightboxProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex)

  const currentImage = images[currentIndex]
  const isImage = currentImage.type.startsWith('image/')

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length)
  }

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length)
  }

  const handleDownload = () => {
    const link = document.createElement('a')
    link.href = currentImage.url
    link.download = currentImage.originalName
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleKeyDown = (e: KeyboardEvent) => {
    if (!open) return

    switch (e.key) {
      case 'ArrowLeft':
        goToPrevious()
        break
      case 'ArrowRight':
        goToNext()
        break
      case 'Escape':
        onOpenChange(false)
        break
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl w-full h-[90vh] p-0 overflow-hidden">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex-1">
              <h3 className="text-lg font-semibold truncate">{currentImage.originalName}</h3>
              <div className="flex items-center gap-2 mt-1">
                {currentImage.category && (
                  <Badge variant="secondary" className="text-xs">
                    {currentImage.category}
                  </Badge>
                )}
                <span className="text-sm text-muted-foreground">
                  {currentIndex + 1} / {images.length}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={handleDownload}
                className="h-8 w-8 p-0"
              >
                <Download className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="h-8 w-8 p-0"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 flex items-center justify-center bg-black/5 relative">
            {images.length > 1 && (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={goToPrevious}
                  className="absolute left-2 top-1/2 -translate-y-1/2 h-10 w-10 p-0 bg-white/80 hover:bg-white"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={goToNext}
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-10 w-10 p-0 bg-white/80 hover:bg-white"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </>
            )}

            {isImage ? (
              <img
                src={currentImage.url}
                alt={currentImage.originalName}
                className="max-w-full max-h-full object-contain"
              />
            ) : (
              <div className="flex flex-col items-center justify-center p-8">
                <FileText className="w-16 h-16 text-muted-foreground mb-4" />
                <p className="text-lg font-medium">{currentImage.originalName}</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Document preview not available
                </p>
                <Button
                  onClick={handleDownload}
                  className="mt-4"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download Document
                </Button>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t">
            {currentImage.description && (
              <p className="text-sm text-muted-foreground">
                {currentImage.description}
              </p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default function ImageGallery({ images, className = '' }: ImageGalleryProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)

  if (images.length === 0) {
    return null
  }

  const openLightbox = (index: number) => {
    setSelectedImageIndex(index)
    setLightboxOpen(true)
  }

  return (
    <>
      <div className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 ${className}`}>
        {images.map((image, index) => {
          const isImage = image.type.startsWith('image/')

          return (
            <div
              key={image.id}
              className="relative group cursor-pointer aspect-square bg-muted rounded-lg overflow-hidden"
              onClick={() => openLightbox(index)}
            >
              {isImage ? (
                <img
                  src={image.url}
                  alt={image.originalName}
                  className="w-full h-full object-cover transition-transform group-hover:scale-105"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center p-4">
                  <FileText className="w-8 h-8 text-muted-foreground mb-2" />
                  <p className="text-xs text-center text-muted-foreground line-clamp-2">
                    {image.originalName}
                  </p>
                </div>
              )}

              {/* Overlay */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                  {isImage ? (
                    <Maximize2 className="w-6 h-6 text-white" />
                  ) : (
                    <FileText className="w-6 h-6 text-white" />
                  )}
                </div>
              </div>

              {/* Category badge */}
              {image.category && (
                <div className="absolute top-2 left-2">
                  <Badge variant="secondary" className="text-xs bg-black/70 text-white">
                    {image.category}
                  </Badge>
                </div>
              )}
            </div>
          )
        })}
      </div>

      <Lightbox
        images={images}
        initialIndex={selectedImageIndex}
        open={lightboxOpen}
        onOpenChange={setLightboxOpen}
      />
    </>
  )
}