import React from 'react'
import {
  Grid3X3,
  BarChart3,
  FileText,
  Settings,
  Building,
  MessageSquare,
  Users
} from 'lucide-react'

interface IconProps {
  className?: string
}

export const OverviewIcon: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
  <Grid3X3 className={className} />
)

export const MonitoringIcon: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
  <BarChart3 className={className} />
)

export const ReportsIcon: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
  <FileText className={className} />
)

export const ProjectsIcon: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
  <Building className={className} />
)

export const SettingsIcon: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
  <Settings className={className} />
)

export const SupportIcon: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
  <MessageSquare className={className} />
)

export const LeadsIcon: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
  <Users className={className} />
)