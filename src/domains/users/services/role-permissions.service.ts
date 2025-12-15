import { UserRole, Permission } from '../entities/user.entity'

/**
 * Domain Service for managing role-based permissions
 * Follows Domain-Driven Design principles
 */
export class RolePermissionsService {
  /**
   * Get default permissions for each role
   */
  static getDefaultPermissionsForRole(role: UserRole): Permission[] {
    switch (role) {
      case UserRole.ADMIN:
        return [
          // User Management
          Permission.CREATE_USER,
          Permission.READ_USERS,
          Permission.UPDATE_USER,
          Permission.DELETE_USER,
          Permission.INVITE_USER,

          // Customer Management
          Permission.CREATE_CUSTOMER,
          Permission.READ_CUSTOMERS,
          Permission.UPDATE_CUSTOMER,
          Permission.DELETE_CUSTOMER,

          // Project Management
          Permission.CREATE_PROJECT,
          Permission.READ_PROJECTS,
          Permission.UPDATE_PROJECT,
          Permission.DELETE_PROJECT,

          // Equipment Management
          Permission.CREATE_EQUIPMENT,
          Permission.READ_EQUIPMENT,
          Permission.UPDATE_EQUIPMENT,
          Permission.DELETE_EQUIPMENT,

          // Analytics
          Permission.VIEW_ANALYTICS,
          Permission.EXPORT_REPORTS,

          // System
          Permission.MANAGE_TENANT,
          Permission.MANAGE_PERMISSIONS
        ]

      case UserRole.MANAGER:
        return [
          // User Management (limited)
          Permission.READ_USERS,
          Permission.INVITE_USER,

          // Customer Management
          Permission.CREATE_CUSTOMER,
          Permission.READ_CUSTOMERS,
          Permission.UPDATE_CUSTOMER,

          // Project Management
          Permission.CREATE_PROJECT,
          Permission.READ_PROJECTS,
          Permission.UPDATE_PROJECT,

          // Equipment Management
          Permission.READ_EQUIPMENT,
          Permission.UPDATE_EQUIPMENT,

          // Analytics
          Permission.VIEW_ANALYTICS,
          Permission.EXPORT_REPORTS
        ]

      case UserRole.SALES_REP:
        return [
          // Customer Management (sales focused)
          Permission.CREATE_CUSTOMER,
          Permission.READ_CUSTOMERS,
          Permission.UPDATE_CUSTOMER,

          // Project Management (for proposals)
          Permission.READ_PROJECTS,
          Permission.CREATE_PROJECT, // for creating proposals

          // Equipment Management (read only for proposals)
          Permission.READ_EQUIPMENT,

          // Analytics (limited)
          Permission.VIEW_ANALYTICS
        ]

      case UserRole.TECHNICIAN:
        return [
          // Project Management (installation focused)
          Permission.READ_PROJECTS,
          Permission.UPDATE_PROJECT, // for updating installation status

          // Equipment Management
          Permission.READ_EQUIPMENT,

          // Customer Management (read only for assigned projects)
          Permission.READ_CUSTOMERS
        ]

      case UserRole.VIEWER:
        return [
          // Read-only access
          Permission.READ_CUSTOMERS,
          Permission.READ_PROJECTS,
          Permission.READ_EQUIPMENT,

          // Project Request permissions
          Permission.CREATE_PROJECT_REQUEST,
          Permission.READ_PROJECT_REQUESTS
        ]

      default:
        return []
    }
  }

  /**
   * Check if a role has a specific permission
   */
  static hasPermission(role: UserRole, permission: Permission): boolean {
    const permissions = this.getDefaultPermissionsForRole(role)
    return permissions.includes(permission)
  }

  /**
   * Get navigation permissions for UI rendering
   * This translates domain permissions to UI navigation rules
   */
  static getNavigationPermissions(role: UserRole) {
    const permissions = this.getDefaultPermissionsForRole(role)

    return {
      canViewDashboard: true, // All roles can see some form of dashboard
      canViewMonitoring: [
        UserRole.ADMIN,
        UserRole.MANAGER,
        UserRole.TECHNICIAN,
        UserRole.VIEWER
      ].includes(role),
      canViewReports: [
        UserRole.ADMIN,
        UserRole.MANAGER,
        UserRole.SALES_REP,
        UserRole.TECHNICIAN
      ].includes(role),
      canViewProjects: [
        UserRole.ADMIN,
        UserRole.MANAGER,
        UserRole.SALES_REP,
        UserRole.TECHNICIAN
      ].includes(role),
      canViewLeads: [
        UserRole.ADMIN,
        UserRole.MANAGER,
        UserRole.SALES_REP
      ].includes(role),
      canViewCRM: [
        UserRole.ADMIN,
        UserRole.MANAGER,
        UserRole.SALES_REP
      ].includes(role),
      canViewSettings: true, // All roles have some settings access
      canViewSupport: true, // All roles can access support
      canViewProjectRequests: [
        UserRole.ADMIN,
        UserRole.MANAGER,
        UserRole.VIEWER
      ].includes(role),
      canManageProjectRequests: permissions.includes(Permission.MANAGE_PROJECT_REQUESTS),
      canManageUsers: permissions.includes(Permission.INVITE_USER),
      canManageCompany: [
        UserRole.ADMIN,
        UserRole.MANAGER
      ].includes(role),
      canManageBilling: [
        UserRole.ADMIN
      ].includes(role)
    }
  }

  /**
   * Get sidebar items for a specific role
   */
  static getSidebarItems(role: UserRole) {
    const navPerms = this.getNavigationPermissions(role)

    const allItems = [
      {
        name: 'Dashboard',
        href: '/app',
        icon: 'OverviewIcon',
        available: navPerms.canViewDashboard
      },
      {
        name: 'Leads',
        href: '/app/leads',
        icon: 'LeadsIcon',
        available: navPerms.canViewLeads
      },
      {
        name: 'Project Requests',
        href: '/app/project-requests',
        icon: 'FileTextIcon',
        available: navPerms.canManageProjectRequests
      },
      {
        name: 'Monitoring',
        href: '/app/monitoring',
        icon: 'MonitoringIcon',
        available: navPerms.canViewMonitoring
      },
      {
        name: 'Reports',
        href: '/app/reports',
        icon: 'ReportsIcon',
        available: navPerms.canViewReports
      },
      {
        name: 'Projects',
        href: '/app/projects',
        icon: 'ProjectsIcon',
        available: navPerms.canViewProjects
      },
      {
        name: 'Support',
        href: '/app/support',
        icon: 'SupportIcon',
        available: navPerms.canViewSupport
      },
      {
        name: 'Settings',
        href: '/app/settings',
        icon: 'SettingsIcon',
        available: navPerms.canViewSettings
      }
    ]

    return allItems.filter(item => item.available)
  }
}