import { MonitoringData, CustomerType, EquipmentStatus, AlertLevel } from '@/domains/monitoring/entities/monitoring.entity'

export const mockMonitoringData: MonitoringData[] = [
  {
    id: '1',
    customerName: 'João Silva',
    type: CustomerType.RESIDENTIAL,
    address: 'Rua das Flores, 123 - São Paulo, SP',
    peakKwp: 5.2,
    energyTodayKwh: 24.8,
    equipmentStatus: EquipmentStatus.ONLINE,
    alertLevel: AlertLevel.NORMAL,
    lastUpdate: new Date('2024-01-15T14:30:00')
  },
  {
    id: '2',
    customerName: 'Fazenda Boa Vista',
    type: CustomerType.FARM,
    address: 'Rodovia BR-116, km 150 - Campinas, SP',
    peakKwp: 15.8,
    energyTodayKwh: 89.2,
    equipmentStatus: EquipmentStatus.WARNING,
    alertLevel: AlertLevel.WARNING,
    lastUpdate: new Date('2024-01-15T14:25:00')
  },
  {
    id: '3',
    customerName: 'Maria Santos',
    type: CustomerType.RESIDENTIAL,
    address: 'Av. Paulista, 456 - São Paulo, SP',
    peakKwp: 3.6,
    energyTodayKwh: 18.4,
    equipmentStatus: EquipmentStatus.ONLINE,
    alertLevel: AlertLevel.NORMAL,
    lastUpdate: new Date('2024-01-15T14:32:00')
  },
  {
    id: '4',
    customerName: 'Comércio Central Ltda',
    type: CustomerType.COMMERCIAL,
    address: 'Rua Comércio, 789 - São Paulo, SP',
    peakKwp: 8.4,
    energyTodayKwh: 42.1,
    equipmentStatus: EquipmentStatus.OFFLINE,
    alertLevel: AlertLevel.CRITICAL,
    lastUpdate: new Date('2024-01-15T13:45:00')
  },
  {
    id: '5',
    customerName: 'Carlos Oliveira',
    type: CustomerType.RESIDENTIAL,
    address: 'Rua Verde, 321 - Rio de Janeiro, RJ',
    peakKwp: 4.8,
    energyTodayKwh: 22.6,
    equipmentStatus: EquipmentStatus.ONLINE,
    alertLevel: AlertLevel.NORMAL,
    lastUpdate: new Date('2024-01-15T14:28:00')
  },
  {
    id: '6',
    customerName: 'Fazenda Estrela',
    type: CustomerType.FARM,
    address: 'Estrada Rural, km 25 - Minas Gerais, MG',
    peakKwp: 22.5,
    energyTodayKwh: 156.3,
    equipmentStatus: EquipmentStatus.MAINTENANCE,
    alertLevel: AlertLevel.WARNING,
    lastUpdate: new Date('2024-01-15T12:15:00')
  },
  {
    id: '7',
    customerName: 'Ana Costa',
    type: CustomerType.RESIDENTIAL,
    address: 'Alameda Santos, 654 - São Paulo, SP',
    peakKwp: 6.2,
    energyTodayKwh: 31.7,
    equipmentStatus: EquipmentStatus.ONLINE,
    alertLevel: AlertLevel.NORMAL,
    lastUpdate: new Date('2024-01-15T14:31:00')
  },
  {
    id: '8',
    customerName: 'Indústria ABC',
    type: CustomerType.COMMERCIAL,
    address: 'Avenida Industrial, 1000 - São Paulo, SP',
    peakKwp: 18.9,
    energyTodayKwh: 124.5,
    equipmentStatus: EquipmentStatus.ONLINE,
    alertLevel: AlertLevel.NORMAL,
    lastUpdate: new Date('2024-01-15T14:29:00')
  }
]