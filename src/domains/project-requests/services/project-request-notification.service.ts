import { NotificationService } from '@/domains/notifications/services/notification.service'
import { ProjectRequest } from '../entities/project-request.entity'
import { UserRole } from '@/domains/users/entities/user.entity'

export interface AdminRecipient {
  id: string
  name: string
  email: string
  role: string
}

export class ProjectRequestNotificationService {
  constructor(private notificationService: NotificationService) {}

  /**
   * Send notification to all admins when a new project request is created
   */
  async notifyNewProjectRequest(projectRequest: ProjectRequest, admins: AdminRecipient[]) {
    const subject = `Nova Solicitação de Projeto: ${projectRequest.title}`

    const adminEmails = admins
      .filter(admin => admin.role === UserRole.ADMIN || admin.role === UserRole.MANAGER)
      .map(admin => admin.email)

    if (adminEmails.length === 0) {
      console.log('No admins to notify about new project request')
      return
    }

    const htmlContent = this.generateNewProjectRequestEmail(projectRequest)
    const textContent = this.generateNewProjectRequestText(projectRequest)

    await this.notificationService.sendEmail({
      to: adminEmails,
      subject,
      htmlContent,
      textContent,
    })
  }

  /**
   * Send notification when a project request is assigned to an admin
   */
  async notifyProjectRequestAssigned(projectRequest: ProjectRequest, assignedAdmin: AdminRecipient) {
    const subject = `Solicitação de Projeto Atribuída: ${projectRequest.title}`

    const htmlContent = this.generateAssignedRequestEmail(projectRequest, assignedAdmin.name)
    const textContent = this.generateAssignedRequestText(projectRequest, assignedAdmin.name)

    await this.notificationService.sendEmail({
      to: [assignedAdmin.email],
      subject,
      htmlContent,
      textContent,
    })
  }

  /**
   * Send notification when a project request is approved
   */
  async notifyProjectRequestApproved(projectRequest: ProjectRequest, clientEmail: string) {
    const subject = `Sua Solicitação de Projeto foi Aprovada!`

    const htmlContent = this.generateApprovedRequestEmail(projectRequest)
    const textContent = this.generateApprovedRequestText(projectRequest)

    await this.notificationService.sendEmail({
      to: [clientEmail],
      subject,
      htmlContent,
      textContent,
    })
  }

  /**
   * Send notification when a project request is rejected
   */
  async notifyProjectRequestRejected(projectRequest: ProjectRequest, clientEmail: string) {
    const subject = `Sua Solicitação de Projeto`

    const htmlContent = this.generateRejectedRequestEmail(projectRequest)
    const textContent = this.generateRejectedRequestText(projectRequest)

    await this.notificationService.sendEmail({
      to: [clientEmail],
      subject,
      htmlContent,
      textContent,
    })
  }

  private generateNewProjectRequestEmail(projectRequest: ProjectRequest): string {
    const priorityColors = {
      LOW: '#10b981',
      NORMAL: '#3b82f6',
      HIGH: '#f59e0b',
      URGENT: '#ef4444'
    }

    const serviceTypeLabels = {
      RESIDENTIAL_INSTALLATION: 'Instalação Residencial',
      COMMERCIAL_INSTALLATION: 'Instalação Comercial',
      MAINTENANCE: 'Manutenção',
      REPAIR: 'Reparo',
      UPGRADE: 'Upgrade',
      CONSULTATION: 'Consulta',
      MONITORING_SETUP: 'Configuração de Monitoramento',
      OTHER: 'Outro'
    }

    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb; margin-bottom: 20px;">📋 Nova Solicitação de Projeto Recebida</h2>

        <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h3 style="color: #1e293b; margin-bottom: 15px;">${projectRequest.title}</h3>

          <div style="margin-bottom: 15px;">
            <strong>ID da Solicitação:</strong> #${projectRequest.id}
          </div>

          <div style="margin-bottom: 15px;">
            <strong>Prioridade:</strong>
            <span style="background-color: ${priorityColors[projectRequest.priority]}; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px;">
              ${projectRequest.priority}
            </span>
          </div>

          <div style="margin-bottom: 15px;">
            <strong>Tipo de Serviço:</strong> ${serviceTypeLabels[projectRequest.serviceType] || projectRequest.serviceType}
          </div>

          <div style="margin-bottom: 15px;">
            <strong>Cliente:</strong> ${projectRequest.clientName}
          </div>

          <div style="margin-bottom: 15px;">
            <strong>Email:</strong> ${projectRequest.clientEmail}
          </div>

          <div style="margin-bottom: 15px;">
            <strong>Telefone:</strong> ${projectRequest.clientPhone}
          </div>

          <div style="margin-bottom: 15px;">
            <strong>Endereço:</strong><br>
            ${projectRequest.address}<br>
            ${projectRequest.city}, ${projectRequest.state} - ${projectRequest.zipCode}
          </div>

          <div style="margin-bottom: 15px;">
            <strong>Descrição:</strong>
            <p style="margin-top: 8px; line-height: 1.5; background-color: white; padding: 15px; border-radius: 6px; border-left: 4px solid #2563eb;">
              ${projectRequest.description}
            </p>
          </div>

          ${projectRequest.estimatedBudget ? `
          <div style="margin-bottom: 15px;">
            <strong>Orçamento Estimado:</strong> R$ ${projectRequest.estimatedBudget.toLocaleString('pt-BR')}
          </div>
          ` : ''}

          ${projectRequest.estimatedSize ? `
          <div style="margin-bottom: 15px;">
            <strong>Tamanho Estimado:</strong> ${projectRequest.estimatedSize} kW
          </div>
          ` : ''}

          <div style="color: #64748b; font-size: 14px;">
            <strong>Recebida:</strong> ${new Date(projectRequest.createdAt).toLocaleString('pt-BR')}
          </div>
        </div>

        <div style="text-align: center; margin-top: 30px;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/app/project-requests"
             style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Ver Solicitação
          </a>
        </div>

        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0; color: #64748b; font-size: 12px;">
          Esta é uma notificação automática do Sistema Solarfy.
        </div>
      </div>
    `
  }

  private generateNewProjectRequestText(projectRequest: ProjectRequest): string {
    return `
Nova Solicitação de Projeto Recebida

ID: #${projectRequest.id}
Título: ${projectRequest.title}
Prioridade: ${projectRequest.priority}
Tipo de Serviço: ${projectRequest.serviceType}

Cliente: ${projectRequest.clientName}
Email: ${projectRequest.clientEmail}
Telefone: ${projectRequest.clientPhone}

Endereço: ${projectRequest.address}, ${projectRequest.city}, ${projectRequest.state} - ${projectRequest.zipCode}

Descrição:
${projectRequest.description}

${projectRequest.estimatedBudget ? `Orçamento Estimado: R$ ${projectRequest.estimatedBudget.toLocaleString('pt-BR')}` : ''}
${projectRequest.estimatedSize ? `Tamanho Estimado: ${projectRequest.estimatedSize} kW` : ''}

Recebida: ${new Date(projectRequest.createdAt).toLocaleString('pt-BR')}

Acesse o sistema para ver os detalhes: ${process.env.NEXT_PUBLIC_APP_URL}/app/project-requests
    `
  }

  private generateAssignedRequestEmail(projectRequest: ProjectRequest, adminName: string): string {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb; margin-bottom: 20px;">📋 Solicitação de Projeto Atribuída a Você</h2>

        <p>Olá ${adminName},</p>

        <p>Uma nova solicitação de projeto foi atribuída a você:</p>

        <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h3 style="color: #1e293b; margin-bottom: 15px;">${projectRequest.title}</h3>

          <div style="margin-bottom: 15px;">
            <strong>ID da Solicitação:</strong> #${projectRequest.id}
          </div>

          <div style="margin-bottom: 15px;">
            <strong>Cliente:</strong> ${projectRequest.clientName} (${projectRequest.clientEmail})
          </div>

          <div style="margin-bottom: 15px;">
            <strong>Tipo de Serviço:</strong> ${projectRequest.serviceType}
          </div>

          <div style="margin-bottom: 15px;">
            <strong>Endereço:</strong><br>
            ${projectRequest.address}, ${projectRequest.city}, ${projectRequest.state}
          </div>
        </div>

        <div style="text-align: center; margin-top: 30px;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/app/project-requests/${projectRequest.id}"
             style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Ver e Gerenciar Solicitação
          </a>
        </div>
      </div>
    `
  }

  private generateAssignedRequestText(projectRequest: ProjectRequest, adminName: string): string {
    return `
Olá ${adminName},

Uma nova solicitação de projeto foi atribuída a você:

ID: #${projectRequest.id}
Título: ${projectRequest.title}
Cliente: ${projectRequest.clientName} (${projectRequest.clientEmail})
Tipo de Serviço: ${projectRequest.serviceType}
Endereço: ${projectRequest.address}, ${projectRequest.city}, ${projectRequest.state}

Acesse o sistema para ver e gerenciar: ${process.env.NEXT_PUBLIC_APP_URL}/app/project-requests/${projectRequest.id}
    `
  }

  private generateApprovedRequestEmail(projectRequest: ProjectRequest): string {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #16a34a; margin-bottom: 20px;">✅ Ótimas Notícias! Sua Solicitação foi Aprovada</h2>

        <p>Prezado(a) ${projectRequest.clientName},</p>

        <p>Temos o prazer de informar que sua solicitação de projeto <strong>"${projectRequest.title}"</strong> foi aprovada pela nossa equipe!</p>

        <div style="background-color: #f0fdf4; padding: 20px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #16a34a;">
          <h3 style="color: #166534; margin-bottom: 15px;">Próximos Passos</h3>
          <ul style="margin: 0; padding-left: 20px; line-height: 1.6;">
            <li>Nossa equipe entrará em contato dentro de 24 horas úteis</li>
            <li>Agendaremos uma visita técnica para avaliação detalhada</li>
            <li>Apresentaremos uma proposta personalizada</li>
            <li>Definiremos o cronograma de instalação</li>
          </ul>
        </div>

        <div style="text-align: center; margin-top: 30px;">
          <p style="margin-bottom: 15px;">Em caso de dúvidas, entre em contato:</p>
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/app/support"
             style="background-color: #16a34a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Falar com Suporte
          </a>
        </div>

        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0; color: #64748b; font-size: 12px;">
          Esta é uma notificação automática do Sistema Solarfy.
        </div>
      </div>
    `
  }

  private generateApprovedRequestText(projectRequest: ProjectRequest): string {
    return `
Prezado(a) ${projectRequest.clientName},

Ótimas notícias! Sua solicitação de projeto "${projectRequest.title}" foi aprovada pela nossa equipe.

Próximos Passos:
- Nossa equipe entrará em contato dentro de 24 horas úteis
- Agendaremos uma visita técnica para avaliação detalhada
- Apresentaremos uma proposta personalizada
- Definiremos o cronograma de instalação

Em caso de dúvidas, entre em contato conosco.

Atenciosamente,
Equipe Solarfy
    `
  }

  private generateRejectedRequestEmail(projectRequest: ProjectRequest): string {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #dc2626; margin-bottom: 20px;">📋 Sua Solicitação de Projeto</h2>

        <p>Prezado(a) ${projectRequest.clientName},</p>

        <p>Agradecemos seu interesse em nossos serviços de energia solar. Após análise detalhada, sua solicitação <strong>"${projectRequest.title}"</strong> não pôde ser aprovada neste momento.</p>

        ${projectRequest.rejectionReason ? `
        <div style="background-color: #fef2f2; padding: 20px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #dc2626;">
          <h3 style="color: #991b1b; margin-bottom: 10px;">Motivo:</h3>
          <p style="margin: 0; line-height: 1.6;">${projectRequest.rejectionReason}</p>
        </div>
        ` : ''}

        <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h3 style="color: #1e293b; margin-bottom: 15px;">O que podemos fazer?</h3>
          <ul style="margin: 0; padding-left: 20px; line-height: 1.6;">
            <li>Revisar os requisitos da sua solicitação</li>
            <li>Entrar em contato para entender melhor suas necessidades</li>
            <li>Explorar alternativas que possam atender ao seu perfil</li>
          </ul>
        </div>

        <div style="text-align: center; margin-top: 30px;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/app/support"
             style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Falar com Especialista
          </a>
        </div>

        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0; color: #64748b; font-size: 12px;">
          Esta é uma notificação automática do Sistema Solarfy.
        </div>
      </div>
    `
  }

  private generateRejectedRequestText(projectRequest: ProjectRequest): string {
    return `
Prezado(a) ${projectRequest.clientName},

Agradecemos seu interesse em nossos serviços de energia solar. Após análise detalhada, sua solicitação "${projectRequest.title}" não pôde ser aprovada neste momento.

${projectRequest.rejectionReason ? `\nMotivo: ${projectRequest.rejectionReason}` : ''}

O que podemos fazer?
- Revisar os requisitos da sua solicitação
- Entrar em contato para entender melhor suas necessidades
- Explorar alternativas que possam atender ao seu perfil

Entre em contato conosco para falar com um especialista.

Atenciosamente,
Equipe Solarfy
    `
  }
}