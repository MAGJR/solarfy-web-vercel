import { ProjectImage, ProjectImageWithRelations, CreateProjectImageInput, UpdateProjectImageInput, ProjectImageFilters, ProjectImageListResult } from '@/domains/projects/entities/project-image.entity'
import { prisma } from '@/infrastructure/database/prisma'

export class PrismaProjectImageRepository {
  async create(data: CreateProjectImageInput): Promise<ProjectImage> {
    const image = await prisma.projectImage.create({
      data,
      include: {
        project: {
          select: {
            id: true,
            name: true
          }
        },
        uploader: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    return this.mapToEntity(image)
  }

  async findById(id: string): Promise<ProjectImageWithRelations | null> {
    const image = await prisma.projectImage.findUnique({
      where: { id },
      include: {
        project: {
          select: {
            id: true,
            name: true
          }
        },
        uploader: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    return image ? this.mapToEntityWithRelations(image) : null
  }

  async findByProjectId(projectId: string): Promise<ProjectImageWithRelations[]> {
    const images = await prisma.projectImage.findMany({
      where: { projectId },
      include: {
        project: {
          select: {
            id: true,
            name: true
          }
        },
        uploader: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: [
        { order: 'asc' },
        { createdAt: 'desc' }
      ]
    })

    return images.map(image => this.mapToEntityWithRelations(image))
  }

  async findMany(filters: ProjectImageFilters): Promise<ProjectImageListResult> {
    const {
      projectId,
      category,
      uploadedBy,
      search,
      page = 1,
      limit = 20
    } = filters

    const where = {
      projectId,
      ...(category && { category }),
      ...(uploadedBy && { uploadedBy }),
      ...(search && {
        OR: [
          { originalName: { contains: search, mode: 'insensitive' as const } },
          { description: { contains: search, mode: 'insensitive' as const } }
        ]
      })
    }

    const [images, total] = await Promise.all([
      prisma.projectImage.findMany({
        where,
        include: {
          project: {
            select: {
              id: true,
              name: true
            }
          },
          uploader: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        },
        orderBy: [
          { order: 'asc' },
          { createdAt: 'desc' }
        ],
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.projectImage.count({ where })
    ])

    return {
      images: images.map(image => this.mapToEntityWithRelations(image)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    }
  }

  async update(id: string, data: UpdateProjectImageInput): Promise<ProjectImage> {
    const image = await prisma.projectImage.update({
      where: { id },
      data,
      include: {
        project: {
          select: {
            id: true,
            name: true
          }
        },
        uploader: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    return this.mapToEntity(image)
  }

  async updateOrder(id: string, order: number): Promise<ProjectImage> {
    return this.update(id, { order })
  }

  async reorderImages(projectId: string, imageOrders: Array<{ id: string; order: number }>): Promise<void> {
    await prisma.$transaction(
      imageOrders.map(({ id, order }) =>
        prisma.projectImage.update({
          where: { id },
          data: { order }
        })
      )
    )
  }

  async delete(id: string): Promise<void> {
    await prisma.projectImage.delete({
      where: { id }
    })
  }

  async deleteByProjectId(projectId: string): Promise<void> {
    await prisma.projectImage.deleteMany({
      where: { projectId }
    })
  }

  async countByProjectId(projectId: string): Promise<number> {
    return prisma.projectImage.count({
      where: { projectId }
    })
  }

  async getTotalSizeByProjectId(projectId: string): Promise<number> {
    const result = await prisma.projectImage.aggregate({
      where: { projectId },
      _sum: {
        size: true
      }
    })

    return result._sum.size || 0
  }

  private mapToEntity(data: any): ProjectImage {
    return {
      id: data.id,
      filename: data.filename,
      originalName: data.originalName,
      url: data.url,
      type: data.type,
      size: data.size,
      category: data.category,
      description: data.description,
      order: data.order,
      projectId: data.projectId,
      uploadedBy: data.uploadedBy,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt
    }
  }

  private mapToEntityWithRelations(data: any): ProjectImageWithRelations {
    return {
      ...this.mapToEntity(data),
      project: data.project ? {
        id: data.project.id,
        name: data.project.name
      } : undefined,
      uploader: data.uploader ? {
        id: data.uploader.id,
        name: data.uploader.name,
        email: data.uploader.email
      } : undefined
    }
  }
}