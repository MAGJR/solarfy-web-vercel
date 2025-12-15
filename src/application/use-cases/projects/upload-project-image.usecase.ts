import { ProjectImage, CreateProjectImageInput } from '@/domains/projects/entities/project-image.entity'
import { PrismaProjectImageRepository } from '@/infrastructure/repositories/prisma-project-image.repository'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { v4 as uuidv4 } from 'uuid'

export interface UploadProjectImageData {
  file: File
  projectId: string
  uploadedBy: string
  category?: string
  description?: string
}

export class UploadProjectImageUseCase {
  constructor(private readonly projectImageRepository: PrismaProjectImageRepository) {}

  async execute(data: UploadProjectImageData): Promise<ProjectImage> {
    // Validar o arquivo
    this.validateFile(data.file)

    // Gerar nome único para o arquivo
    const fileExtension = this.getFileExtension(data.file.name)
    const uniqueFilename = `${uuidv4()}${fileExtension}`

    // Definir o caminho de armazenamento
    const uploadDir = join(process.cwd(), 'public', 'uploads', 'projects', data.projectId)
    const filePath = join(uploadDir, uniqueFilename)

    // Criar diretório se não existir
    await mkdir(uploadDir, { recursive: true })

    // Salvar arquivo no disco
    const buffer = Buffer.from(await data.file.arrayBuffer())
    await writeFile(filePath, buffer)

    // Gerar URL pública
    const publicUrl = `/uploads/projects/${data.projectId}/${uniqueFilename}`

    // Obter a próxima ordem
    const existingImages = await this.projectImageRepository.findByProjectId(data.projectId)
    const nextOrder = existingImages.length

    // Salvar no banco de dados
    const createData: CreateProjectImageInput = {
      filename: uniqueFilename,
      originalName: data.file.name,
      url: publicUrl,
      type: data.file.type,
      size: data.file.size,
      category: data.category,
      description: data.description,
      order: nextOrder,
      projectId: data.projectId,
      uploadedBy: data.uploadedBy
    }

    return this.projectImageRepository.create(createData)
  }

  private validateFile(file: File): void {
    const maxSize = 10 * 1024 * 1024 // 10MB
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/gif',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ]

    if (file.size > maxSize) {
      throw new Error('File size exceeds 10MB limit')
    }

    if (!allowedTypes.includes(file.type)) {
      throw new Error('File type not allowed. Only images and PDF documents are accepted')
    }
  }

  private getFileExtension(filename: string): string {
    const lastDot = filename.lastIndexOf('.')
    return lastDot !== -1 ? filename.substring(lastDot) : ''
  }
}