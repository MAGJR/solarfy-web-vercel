import { ProjectRequestRepository } from "@/domains/project-requests/repositories/project-request.repository.interface"
import { ProjectRequest } from "@/domains/project-requests/entities/project-request.entity"
import { UserRole } from "@/domains/users/entities/user.entity"

export class AssignProjectRequestUseCase {
  constructor(private readonly projectRequestRepository: ProjectRequestRepository) {}

  async execute(requestId: string, adminId: string, assignerId: string): Promise<ProjectRequest> {
    // Validate that the request exists
    const currentRequest = await this.projectRequestRepository.findById(requestId)
    if (!currentRequest) {
      throw new Error('Project request not found')
    }

    // Validate that the admin exists and has proper role
    // This would require a user repository - for now, we'll assume validation is done at the API level

    // Validate status transition
    if (currentRequest.status !== 'PENDING') {
      throw new Error('Only pending requests can be assigned')
    }

    // Assign the request
    const assignedRequest = await this.projectRequestRepository.assignToAdmin(requestId, adminId)

    return assignedRequest
  }

  async unassignRequest(requestId: string, unassignerId: string): Promise<ProjectRequest> {
    // Validate that the request exists
    const currentRequest = await this.projectRequestRepository.findById(requestId)
    if (!currentRequest) {
      throw new Error('Project request not found')
    }

    // Only allow unassigning if the request is under review
    if (currentRequest.status !== 'UNDER_REVIEW') {
      throw new Error('Only requests under review can be unassigned')
    }

    // Check if the user has permission to unassign (admin or the assigned user)
    // This would require proper authentication/authorization check

    // Unassign the request
    const unassignedRequest = await this.projectRequestRepository.unassign(requestId)

    return unassignedRequest
  }

  async autoAssignRequest(requestId: string, tenantId: string): Promise<ProjectRequest> {
    // This would implement logic to automatically assign requests to available admins
    // For example: round-robin, least busy admin, or based on service type specialization

    // For now, this is a placeholder for future implementation
    throw new Error('Auto-assignment not implemented yet')
  }
}