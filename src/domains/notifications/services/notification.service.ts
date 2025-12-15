import { SupportTicket, TicketResponse } from '@/domains/support/entities/support-ticket.entity'
import { UserRole } from '@/domains/users/entities/user.entity'

export interface NotificationPayload {
  to: string[]
  subject: string
  htmlContent: string
  textContent?: string
}

export class NotificationService {
  /**
   * Send notification when a new ticket is created
   */
  async notifyNewTicket(ticket: SupportTicket, recipients: Array<{ email: string; name: string; role: string }>) {
    const subject = `New Support Ticket: ${ticket.subject}`

    const htmlContent = this.generateNewTicketEmail(ticket)
    const textContent = this.generateNewTicketText(ticket)

    const technicianEmails = recipients
      .filter(r => r.role === UserRole.TECHNICIAN || r.role === UserRole.ADMIN || r.role === UserRole.MANAGER)
      .map(r => r.email)

    if (technicianEmails.length === 0) {
      console.log('No technicians or admins to notify about new ticket')
      return
    }

    await this.sendEmail({
      to: technicianEmails,
      subject,
      htmlContent,
      textContent,
    })
  }

  /**
   * Send notification when a ticket is assigned to a technician
   */
  async notifyTicketAssignment(ticket: SupportTicket, technicianEmail: string, technicianName: string) {
    const subject = `Ticket Assigned: ${ticket.subject}`

    const htmlContent = this.generateAssignmentEmail(ticket, technicianName)
    const textContent = this.generateAssignmentText(ticket, technicianName)

    await this.sendEmail({
      to: [technicianEmail],
      subject,
      htmlContent,
      textContent,
    })
  }

  /**
   * Send notification when a new response is added to a ticket
   */
  async notifyNewResponse(response: TicketResponse, ticket: SupportTicket, otherParticipants: Array<{ email: string; name: string; role: string }>) {
    const subject = `New Response on Ticket: ${ticket.subject}`

    const htmlContent = this.generateNewResponseEmail(response, ticket)
    const textContent = this.generateNewResponseText(response, ticket)

    const recipientEmails = otherParticipants.map(p => p.email)

    if (recipientEmails.length === 0) {
      console.log('No other participants to notify about new response')
      return
    }

    await this.sendEmail({
      to: recipientEmails,
      subject,
      htmlContent,
      textContent,
    })
  }

  /**
   * Send notification when ticket status changes
   */
  async notifyStatusChange(ticket: SupportTicket, previousStatus: string, recipients: Array<{ email: string; name: string; role: string }>) {
    const subject = `Ticket Status Updated: ${ticket.subject}`

    const htmlContent = this.generateStatusChangeEmail(ticket, previousStatus)
    const textContent = this.generateStatusChangeText(ticket, previousStatus)

    const recipientEmails = recipients.map(r => r.email)

    if (recipientEmails.length === 0) {
      console.log('No recipients to notify about status change')
      return
    }

    await this.sendEmail({
      to: recipientEmails,
      subject,
      htmlContent,
      textContent,
    })
  }

  private async sendEmail(payload: NotificationPayload): Promise<void> {
    try {
      // This would integrate with your existing email system
      // For now, we'll just log the email that would be sent
      console.log('📧 Email Notification:', {
        to: payload.to,
        subject: payload.subject,
        content: payload.htmlContent,
      })

      // TODO: Integrate with your existing email service
      // Example: await emailService.send(payload)

    } catch (error) {
      console.error('Failed to send email notification:', error)
      // Don't throw the error to avoid breaking the main flow
    }
  }

  private generateNewTicketEmail(ticket: SupportTicket): string {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb; margin-bottom: 20px;">🎫 New Support Ticket Created</h2>

        <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h3 style="color: #1e293b; margin-bottom: 15px;">${ticket.subject}</h3>

          <div style="margin-bottom: 15px;">
            <strong>Ticket ID:</strong> #${ticket.id}
          </div>

          <div style="margin-bottom: 15px;">
            <strong>Priority:</strong>
            <span style="background-color: ${this.getPriorityColor(ticket.priority)}; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px;">
              ${ticket.priority}
            </span>
          </div>

          <div style="margin-bottom: 15px;">
            <strong>Category:</strong> ${ticket.category}
          </div>

          <div style="margin-bottom: 15px;">
            <strong>Description:</strong>
            <p style="margin-top: 8px; line-height: 1.5;">${ticket.description}</p>
          </div>

          <div style="color: #64748b; font-size: 14px;">
            <strong>Created:</strong> ${new Date(ticket.createdAt).toLocaleString()}
          </div>
        </div>

        <div style="text-align: center; margin-top: 30px;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/app/support"
             style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            View Ticket
          </a>
        </div>

        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0; color: #64748b; font-size: 12px;">
          This is an automated notification from the Solarfy Support System.
        </div>
      </div>
    `
  }

  private generateNewTicketText(ticket: SupportTicket): string {
    return `
New Support Ticket Created

Ticket ID: #${ticket.id}
Subject: ${ticket.subject}
Priority: ${ticket.priority}
Category: ${ticket.category}

Description:
${ticket.description}

Created: ${new Date(ticket.createdAt).toLocaleString()}

View this ticket at: ${process.env.NEXT_PUBLIC_APP_URL}/app/support
    `
  }

  private generateAssignmentEmail(ticket: SupportTicket, technicianName: string): string {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb; margin-bottom: 20px;">🔧 Ticket Assigned to You</h2>

        <p>Hello ${technicianName},</p>

        <p>A new support ticket has been assigned to you:</p>

        <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h3 style="color: #1e293b; margin-bottom: 15px;">${ticket.subject}</h3>

          <div style="margin-bottom: 15px;">
            <strong>Ticket ID:</strong> #${ticket.id}
          </div>

          <div style="margin-bottom: 15px;">
            <strong>Priority:</strong>
            <span style="background-color: ${this.getPriorityColor(ticket.priority)}; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px;">
              ${ticket.priority}
            </span>
          </div>

          <div style="margin-bottom: 15px;">
            <strong>Description:</strong>
            <p style="margin-top: 8px; line-height: 1.5;">${ticket.description}</p>
          </div>
        </div>

        <div style="text-align: center; margin-top: 30px;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/app/support"
             style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            View and Respond
          </a>
        </div>
      </div>
    `
  }

  private generateAssignmentText(ticket: SupportTicket, technicianName: string): string {
    return `
Hello ${technicianName},

A new support ticket has been assigned to you:

Ticket ID: #${ticket.id}
Subject: ${ticket.subject}
Priority: ${ticket.priority}

Description:
${ticket.description}

View this ticket at: ${process.env.NEXT_PUBLIC_APP_URL}/app/support
    `
  }

  private generateNewResponseEmail(response: TicketResponse, ticket: SupportTicket): string {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb; margin-bottom: 20px;">💬 New Response on Ticket</h2>

        <p>A new response has been added to ticket "${ticket.subject}":</p>

        <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <div style="margin-bottom: 15px;">
            <strong>From:</strong> ${response.user?.name || 'Unknown'}
          </div>

          <div style="margin-bottom: 15px;">
            <strong>Response:</strong>
            <p style="margin-top: 8px; line-height: 1.5; background-color: white; padding: 15px; border-radius: 6px; border-left: 4px solid #2563eb;">
              ${response.content}
            </p>
          </div>

          <div style="color: #64748b; font-size: 14px;">
            <strong>Time:</strong> ${new Date(response.createdAt).toLocaleString()}
          </div>
        </div>

        <div style="text-align: center; margin-top: 30px;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/app/support"
             style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            View Full Conversation
          </a>
        </div>
      </div>
    `
  }

  private generateNewResponseText(response: TicketResponse, ticket: SupportTicket): string {
    return `
New response on ticket "${ticket.subject}"

From: ${response.user?.name || 'Unknown'}
Time: ${new Date(response.createdAt).toLocaleString()}

Response:
${response.content}

View full conversation at: ${process.env.NEXT_PUBLIC_APP_URL}/app/support
    `
  }

  private generateStatusChangeEmail(ticket: SupportTicket, previousStatus: string): string {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb; margin-bottom: 20px;">📊 Ticket Status Updated</h2>

        <p>The status of ticket "${ticket.subject}" has been updated:</p>

        <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <div style="margin-bottom: 15px;">
            <strong>Ticket ID:</strong> #${ticket.id}
          </div>

          <div style="margin-bottom: 15px;">
            <strong>Status Change:</strong><br>
            <span style="background-color: #e2e8f0; padding: 4px 8px; border-radius: 4px; font-size: 12px;">
              ${previousStatus}
            </span>
            →
            <span style="background-color: ${this.getStatusColor(ticket.status)}; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px;">
              ${ticket.status}
            </span>
          </div>

          ${ticket.resolvedAt ? `
          <div style="margin-bottom: 15px;">
            <strong>Resolved:</strong> ${new Date(ticket.resolvedAt).toLocaleString()}
          </div>
          ` : ''}
        </div>

        <div style="text-align: center; margin-top: 30px;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/app/support"
             style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            View Ticket
          </a>
        </div>
      </div>
    `
  }

  private generateStatusChangeText(ticket: SupportTicket, previousStatus: string): string {
    return `
Ticket status updated for "${ticket.subject}"

Ticket ID: #${ticket.id}
Status Change: ${previousStatus} → ${ticket.status}
${ticket.resolvedAt ? `Resolved: ${new Date(ticket.resolvedAt).toLocaleString()}` : ''}

View ticket at: ${process.env.NEXT_PUBLIC_APP_URL}/app/support
    `
  }

  private getPriorityColor(priority: string): string {
    switch (priority) {
      case 'URGENT': return '#dc2626'
      case 'HIGH': return '#ea580c'
      case 'MEDIUM': return '#ca8a04'
      case 'LOW': return '#16a34a'
      default: return '#6b7280'
    }
  }

  private getStatusColor(status: string): string {
    switch (status) {
      case 'OPEN': return '#2563eb'
      case 'IN_PROGRESS': return '#ca8a04'
      case 'RESOLVED': return '#16a34a'
      case 'CLOSED': return '#6b7280'
      default: return '#6b7280'
    }
  }
}