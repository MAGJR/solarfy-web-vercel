export enum EmailType {
  EMAIL_VERIFICATION = 'email_verification',
  PASSWORD_RESET = 'password_reset',
  WELCOME = 'welcome',
  PROJECT_STATUS_UPDATE = 'project_status_update',
  PROPOSAL_SENT = 'proposal_sent',
  INSTALLATION_SCHEDULED = 'installation_scheduled',
  MAINTENANCE_REMINDER = 'maintenance_reminder'
}

export enum EmailStatus {
  PENDING = 'pending',
  SENT = 'sent',
  FAILED = 'failed',
  DELIVERED = 'delivered',
  BOUNCED = 'bounced'
}