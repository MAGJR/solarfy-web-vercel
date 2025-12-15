import { PrismaProjectImageRepository } from '@/infrastructure/repositories/prisma-project-image.repository'
import { unlink } from 'fs/promises'
import { join } from 'path'

export interface DeleteProjectImageData {
  imageId: string
  projectId?: string // Opcional, para validação de segurança
  uploadedBy?: string // Opcional, para validação de permissão
}

export class DeleteProjectImageUseCase {
  constructor(private readonly projectImageRepository: PrismaProjectImageRepository) {}

  async execute(data: DeleteProjectImageData): Promise<void> {
    // Buscar a imagem para obter informações antes de deletar
    const image = await this.projectImageRepository.findById(data.imageId)

    if (!image) {
      throw new Error('Image not found')
    }

    // Validação de segurança opcional - verificar se o usuário tem permissão
    if (data.uploadedBy && image.uploader?.id !== data.uploadedBy) {
      throw new Error('You do not have permission to delete this image')
    }

    // Validação opcional - verificar se a imagem pertence ao projeto informado
    if (data.projectId && image.projectId !== data.projectId) {
      throw new Error('Image does not belong to the specified project')
    }

    // Tentar deletar o arquivo físico
    try {
      const filePath = this.getFilePath(image.url)
      await unlink(filePath)
    } catch (error) {
      // Se o arquivo não existir, apenas logar o erro e continuar
      console.warn('Failed to delete physical file:', error)
    }

    // Deletar do banco de dados
    await this.projectImageRepository.delete(data.imageId)
  }

  async deleteAllByProjectId(projectId: string): Promise<void> {
    // Buscar todas as imagens do projeto para deletar os arquivos físicos
    const images = await this.projectImageRepository.findByProjectId(projectId)

    // Deletar arquivos físicos em paralelo
    await Promise.allSettled(
      images.map(async (image) => {
        try {
          const filePath = this.getFilePath(image.url)
          await unlink(filePath)
        } catch (error) {
          console.warn(`Failed to delete physical file ${image.url}:`, error)
        }
      })
    )

    // Deletar do banco de dados
    await this.projectImageRepository.deleteByProjectId(projectId)
  }

  private getFilePath(url: string): string {
    // Converter URL pública para caminho do arquivo físico
    if (url.startsWith('/uploads/')) {
      return join(process.cwd(), 'public', url.substring(1))
    }

    // Se não for uma URL local, retornar como está (caso esteja em serviço externo)
    return url
  }
}