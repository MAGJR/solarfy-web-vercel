export interface ProjectImage {
  id: string
  filename: string
  originalName: string
  url: string
  type: string
  size: number
  category?: string
  description?: string
  order: number
  projectId: string
  uploadedBy: string
  createdAt: Date
  updatedAt: Date
}

export interface ProjectImageWithRelations extends ProjectImage {
  project?: {
    id: string
    name: string
  }
  uploader?: {
    id: string
    name: string
    email: string
  }
}

export interface CreateProjectImageInput {
  filename: string
  originalName: string
  url: string
  type: string
  size: number
  category?: string
  description?: string
  order?: number
  projectId: string
  uploadedBy: string
}

export interface UpdateProjectImageInput {
  filename?: string
  originalName?: string
  url?: string
  type?: string
  size?: number
  category?: string
  description?: string
  order?: number
}

export interface ProjectImageFilters {
  projectId: string
  category?: string
  uploadedBy?: string
  search?: string
  page?: number
  limit?: number
}

export interface ProjectImageListResult {
  images: ProjectImageWithRelations[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export enum ProjectImageCategory {
  SITE_PHOTO = 'site_photo',
  BLUEPRINT = 'blueprint',
  DOCUMENT = 'document',
  INSTALLATION = 'installation',
  COMPLETION = 'completion',
  MILESTONE = 'milestone',
  OTHER = 'other'
}