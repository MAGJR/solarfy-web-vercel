import { ProjectRequestRepository } from "@/domains/project-requests/repositories/project-request.repository.interface"
import {
  UpdateStatusInput,
  ProjectRequest,
  ProjectRequestStatus
} from "@/domains/project-requests/entities/project-request.entity"

export class UpdateProjectRequestStatusUseCase {
  constructor(private readonly projectRequestRepository: ProjectRequestRepository) {}

  async execute(requestId: string, input: UpdateStatusInput, reviewerId: string): Promise<ProjectRequest> {
    // Get the current request
    const currentRequest = await this.projectRequestRepository.findById(requestId)
    if (!currentRequest) {
      throw new Error('Project request not found')
    }

    // Validate status transition
    this.validateStatusTransition(currentRequest.status, input.status)

    // Validate required fields based on status
    this.validateStatusRequirements(input)

    // Update the status
    const updatedRequest = await this.projectRequestRepository.updateStatus(requestId, {
      ...input,
      reviewedBy: reviewerId,
    })

    return updatedRequest
  }

  async approveRequest(requestId: string, reviewerId: string, adminNotes?: string): Promise<ProjectRequest> {
    return this.execute(requestId, {
      status: ProjectRequestStatus.APPROVED,
      adminNotes,
    }, reviewerId)
  }

  async rejectRequest(requestId: string, reviewerId: string, rejectionReason: string): Promise<ProjectRequest> {
    if (!rejectionReason || rejectionReason.trim().length < 10) {
      throw new Error('Rejection reason must be at least 10 characters long')
    }

    return this.execute(requestId, {
      status: ProjectRequestStatus.REJECTED,
      rejectionReason,
    }, reviewerId)
  }

  async startReview(requestId: string, reviewerId: string): Promise<ProjectRequest> {
    return this.execute(requestId, {
      status: ProjectRequestStatus.UNDER_REVIEW,
    }, reviewerId)
  }

  async convertToProject(requestId: string, projectId: string): Promise<ProjectRequest> {
    // First, make sure the request is approved
    const currentRequest = await this.projectRequestRepository.findById(requestId)
    if (!currentRequest) {
      throw new Error('Project request not found')
    }

    if (currentRequest.status !== ProjectRequestStatus.APPROVED) {
      throw new Error('Only approved requests can be converted to projects')
    }

    // Convert to project
    return this.projectRequestRepository.convertToProject(requestId, projectId)
  }

  private validateStatusTransition(currentStatus: ProjectRequestStatus, newStatus: ProjectRequestStatus): void {
    const validTransitions: Record<ProjectRequestStatus, ProjectRequestStatus[]> = {
      [ProjectRequestStatus.PENDING]: [
        ProjectRequestStatus.UNDER_REVIEW,
        ProjectRequestStatus.APPROVED,
        ProjectRequestStatus.REJECTED
      ],
      [ProjectRequestStatus.UNDER_REVIEW]: [
        ProjectRequestStatus.APPROVED,
        ProjectRequestStatus.REJECTED,
        ProjectRequestStatus.PENDING // Back to pending if more info needed
      ],
      [ProjectRequestStatus.APPROVED]: [
        ProjectRequestStatus.CONVERTED_TO_PROJECT
        // Can't go back from approved
      ],
      [ProjectRequestStatus.REJECTED]: [
        // Can't change from rejected
      ],
      [ProjectRequestStatus.CONVERTED_TO_PROJECT]: [
        // Final state, can't change
      ]
    }

    if (!validTransitions[currentStatus].includes(newStatus)) {
      throw new Error(`Invalid status transition from ${currentStatus} to ${newStatus}`)
    }
  }

  private validateStatusRequirements(input: UpdateStatusInput): void {
    switch (input.status) {
      case ProjectRequestStatus.REJECTED:
        if (!input.rejectionReason || input.rejectionReason.trim().length < 10) {
          throw new Error('Rejection reason is required and must be at least 10 characters long')
        }
        break

      case ProjectRequestStatus.APPROVED:
        // No specific requirements for approval, but could add validation here
        break

      case ProjectRequestStatus.UNDER_REVIEW:
        // No specific requirements for starting review
        break

      case ProjectRequestStatus.CONVERTED_TO_PROJECT:
        // This should be handled by the convertToProject method
        break

      default:
        throw new Error(`Invalid status: ${input.status}`)
    }
  }
}