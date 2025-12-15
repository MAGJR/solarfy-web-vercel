export enum CustomerType {
  RESIDENTIAL = 'RESIDENTIAL',
  COMMERCIAL = 'COMMERCIAL',
  FARM = 'FARM'
}

export enum EquipmentStatus {
  ONLINE = 'ONLINE',
  WARNING = 'WARNING',
  OFFLINE = 'OFFLINE',
  MAINTENANCE = 'MAINTENANCE'
}

export enum AlertLevel {
  NORMAL = 'NORMAL',
  WARNING = 'WARNING',
  CRITICAL = 'CRITICAL'
}

export interface MonitoringData {
  id: string
  customerName: string
  type: CustomerType
  address: string
  peakKwp: number
  energyTodayKwh: number
  equipmentStatus: EquipmentStatus
  alertLevel: AlertLevel
  lastUpdate: Date
}

export interface MonitoringTableProps {
  data?: MonitoringData[]
}