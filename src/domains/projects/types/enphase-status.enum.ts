export enum EnphaseStatus {
  PENDING = 'PENDING',     // Waiting for configuration
  ACTIVE = 'ACTIVE',      // Monitoring active
  ERROR = 'ERROR',        // Integration error
  DISABLED = 'DISABLED',  // Manually disabled
  SYNCING = 'SYNCING'     // Currently syncing data
}