import { CrmUser, CrmUserStatus, ProductService, JourneyStepType, StepStatus } from '@/domains/crm/entities/crm-user.entity'

export const mockCrmUsers: CrmUser[] = [
  {
    id: '1',
    name: 'John Anderson',
    email: 'john.anderson@techcorp.com',
    phone: '(555) 123-4567',
    status: CrmUserStatus.LEAD,
    score: 75,
    assignee: 'John Doe',
    productService: ProductService.SOLAR_PANELS,
    startDate: new Date('2024-01-15'),
    company: 'TechCorp Industries',
    journey: [
      {
        id: 'j1-1',
        step: JourneyStepType.INITIAL_CONTACT,
        status: StepStatus.COMPLETED,
        completedAt: new Date('2024-01-15'),
        notes: 'Initial inquiry via website form',
        assignedTo: 'John Doe'
      },
      {
        id: 'j1-2',
        step: JourneyStepType.SITE_VISIT_SCHEDULED,
        status: StepStatus.IN_PROGRESS,
        assignedTo: 'John Doe'
      }
    ],
    lastActivity: new Date('2024-01-20'),
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-20')
  },
  {
    id: '2',
    name: 'Sarah Mitchell',
    email: 'sarah.mitchell@greenhomes.net',
    phone: '(555) 234-5678',
    status: CrmUserStatus.PROPOSAL_SENT,
    score: 92,
    assignee: 'Jane Smith',
    productService: ProductService.BATTERY_STORAGE,
    startDate: new Date('2024-01-10'),
    company: 'Green Homes Construction',
    journey: [
      {
        id: 'j2-1',
        step: JourneyStepType.INITIAL_CONTACT,
        status: StepStatus.COMPLETED,
        completedAt: new Date('2024-01-10'),
        notes: 'Referral from existing customer',
        assignedTo: 'Jane Smith'
      },
      {
        id: 'j2-2',
        step: JourneyStepType.SITE_VISIT_SCHEDULED,
        status: StepStatus.COMPLETED,
        completedAt: new Date('2024-01-12'),
        assignedTo: 'Jane Smith'
      },
      {
        id: 'j2-3',
        step: JourneyStepType.SITE_VISIT_COMPLETED,
        status: StepStatus.COMPLETED,
        completedAt: new Date('2024-01-15'),
        notes: 'Roof inspection completed, suitable for installation',
        assignedTo: 'Mike Wilson'
      },
      {
        id: 'j2-4',
        step: JourneyStepType.PROPOSAL_CREATED,
        status: StepStatus.COMPLETED,
        completedAt: new Date('2024-01-17'),
        assignedTo: 'Jane Smith'
      },
      {
        id: 'j2-5',
        step: JourneyStepType.PROPOSAL_SENT,
        status: StepStatus.COMPLETED,
        completedAt: new Date('2024-01-18'),
        notes: '10kW battery system proposal sent',
        assignedTo: 'Jane Smith'
      }
    ],
    lastActivity: new Date('2024-01-22'),
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-22')
  },
  {
    id: '3',
    name: 'Michael Chen',
    email: 'm.chen@solarsolutions.io',
    phone: '(555) 345-6789',
    status: CrmUserStatus.NEGOTIATION,
    score: 88,
    assignee: 'Bob Johnson',
    productService: ProductService.SOLAR_PANELS,
    startDate: new Date('2024-01-08'),
    company: 'Solar Solutions Inc.',
    journey: [
      {
        id: 'j3-1',
        step: JourneyStepType.INITIAL_CONTACT,
        status: StepStatus.COMPLETED,
        completedAt: new Date('2024-01-08'),
        assignedTo: 'Bob Johnson'
      },
      {
        id: 'j3-2',
        step: JourneyStepType.CONTRACT_SIGNED,
        status: StepStatus.COMPLETED,
        completedAt: new Date('2024-01-20'),
        notes: '15kW commercial installation contract signed',
        assignedTo: 'Bob Johnson'
      },
      {
        id: 'j3-3',
        step: JourneyStepType.INSTALLATION_SCHEDULED,
        status: StepStatus.IN_PROGRESS,
        assignedTo: 'Mike Wilson'
      }
    ],
    lastActivity: new Date('2024-01-23'),
    createdAt: new Date('2024-01-08'),
    updatedAt: new Date('2024-01-23')
  },
  {
    id: '4',
    name: 'Emily Rodriguez',
    email: 'emily.r@ecofriendly.com',
    phone: '(555) 456-7890',
    status: CrmUserStatus.CLOSED_WON,
    score: 95,
    assignee: 'Alice Brown',
    productService: ProductService.EV_CHARGING,
    startDate: new Date('2023-12-15'),
    company: 'EcoFriendly Living',
    journey: [
      {
        id: 'j4-1',
        step: JourneyStepType.INSTALLATION_COMPLETED,
        status: StepStatus.COMPLETED,
        completedAt: new Date('2024-01-05'),
        notes: '2 EV chargers installed successfully',
        assignedTo: 'Mike Wilson'
      },
      {
        id: 'j4-2',
        step: JourneyStepType.SYSTEM_ACTIVATED,
        status: StepStatus.COMPLETED,
        completedAt: new Date('2024-01-06'),
        assignedTo: 'Alice Brown'
      },
      {
        id: 'j4-3',
        step: JourneyStepType.FOLLOW_UP_SCHEDULED,
        status: StepStatus.COMPLETED,
        completedAt: new Date('2024-01-15'),
        notes: 'Customer satisfaction survey completed',
        assignedTo: 'Alice Brown'
      }
    ],
    lastActivity: new Date('2024-01-15'),
    createdAt: new Date('2023-12-15'),
    updatedAt: new Date('2024-01-15')
  },
  {
    id: '5',
    name: 'David Thompson',
    email: 'd.thompson@renewable.org',
    phone: '(555) 567-8901',
    status: CrmUserStatus.QUALIFIED,
    score: 70,
    assignee: 'Carol White',
    productService: ProductService.SOLAR_WATER_HEATER,
    startDate: new Date('2024-01-22'),
    company: 'Renewable Energy Foundation',
    journey: [
      {
        id: 'j5-1',
        step: JourneyStepType.INITIAL_CONTACT,
        status: StepStatus.COMPLETED,
        completedAt: new Date('2024-01-22'),
        notes: 'Non-profit organization interested in solar water heating',
        assignedTo: 'Carol White'
      }
    ],
    lastActivity: new Date('2024-01-22'),
    createdAt: new Date('2024-01-22'),
    updatedAt: new Date('2024-01-22')
  },
  {
    id: '6',
    name: 'Lisa Martinez',
    email: 'lisa.martinez@smartbuild.com',
    phone: '(555) 678-9012',
    status: CrmUserStatus.CONTACTED,
    score: 65,
    assignee: 'David Lee',
    productService: ProductService.ENERGY_AUDIT,
    startDate: new Date('2024-01-21'),
    company: 'Smart Building Co.',
    journey: [
      {
        id: 'j6-1',
        step: JourneyStepType.INITIAL_CONTACT,
        status: StepStatus.COMPLETED,
        completedAt: new Date('2024-01-21'),
        notes: 'Called, interested in comprehensive energy audit',
        assignedTo: 'David Lee'
      }
    ],
    lastActivity: new Date('2024-01-21'),
    createdAt: new Date('2024-01-21'),
    updatedAt: new Date('2024-01-21')
  },
  {
    id: '7',
    name: 'Robert Kim',
    email: 'r.kim@innovate.energy',
    phone: '(555) 789-0123',
    status: CrmUserStatus.ON_HOLD,
    score: 45,
    assignee: 'John Doe',
    productService: ProductService.SOLAR_PANELS,
    startDate: new Date('2024-01-05'),
    company: 'Innovate Energy Solutions',
    journey: [
      {
        id: 'j7-1',
        step: JourneyStepType.INITIAL_CONTACT,
        status: StepStatus.COMPLETED,
        completedAt: new Date('2024-01-05'),
        assignedTo: 'John Doe'
      },
      {
        id: 'j7-2',
        step: JourneyStepType.SITE_VISIT_SCHEDULED,
        status: StepStatus.FAILED,
        notes: 'Customer postponed due to budget constraints',
        assignedTo: 'John Doe'
      }
    ],
    lastActivity: new Date('2024-01-18'),
    createdAt: new Date('2024-01-05'),
    updatedAt: new Date('2024-01-18')
  },
  {
    id: '8',
    name: 'Jennifer Foster',
    email: 'j.foster@commercial.net',
    phone: '(555) 890-1234',
    status: CrmUserStatus.CLOSED_LOST,
    score: 60,
    assignee: 'Jane Smith',
    productService: ProductService.MAINTENANCE,
    startDate: new Date('2023-12-20'),
    company: 'Commercial Properties LLC',
    journey: [
      {
        id: 'j8-1',
        step: JourneyStepType.INITIAL_CONTACT,
        status: StepStatus.COMPLETED,
        completedAt: new Date('2023-12-20'),
        assignedTo: 'Jane Smith'
      },
      {
        id: 'j8-2',
        step: JourneyStepType.PROPOSAL_SENT,
        status: StepStatus.COMPLETED,
        completedAt: new Date('2024-01-02'),
        notes: 'Maintenance contract proposal sent',
        assignedTo: 'Jane Smith'
      }
    ],
    lastActivity: new Date('2024-01-10'),
    createdAt: new Date('2023-12-20'),
    updatedAt: new Date('2024-01-10')
  }
]