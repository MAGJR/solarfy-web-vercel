# Solarfy - Solar Energy Management System

A comprehensive solar energy project management system built with Next.js 16, Prisma, Neon.tech, and Better-Auth following Domain-Driven Design (DDD) principles.

## Tech Stack

- **Framework**: Next.js 16 with TypeScript
- **Database**: PostgreSQL with Neon.tech
- **ORM**: Prisma
- **Authentication**: Better-Auth
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI
- **Architecture**: Domain-Driven Design (DDD)

## Project Structure

```
src/
├── domains/                 # Business domains
│   ├── authentication/     # User authentication
│   ├── customers/          # Customer management
│   ├── projects/           # Project management
│   ├── equipment/          # Equipment catalog
│   ├── proposals/          # Proposals and quotes
│   ├── installations/      # Installation management
│   └── metrics/            # Monitoring and analytics
├── shared/                 # Shared resources
│   ├── infrastructure/     # External integrations
│   ├── types/             # Type definitions
│   ├── utils/             # Utility functions
│   └── constants/         # Application constants
├── application/            # Application layer
│   ├── controllers/       # API controllers
│   ├── middleware/        # Custom middleware
│   └── routes/           # Route definitions
└── presentation/          # UI layer
    ├── pages/            # Next.js pages
    ├── components/       # React components
    └── hooks/           # Custom hooks
```

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database (Neon.tech recommended)

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env.local
   ```

   Configure your database URL and authentication secrets in `.env.local`.

4. Set up the database:
   ```bash
   npm run db:push
   ```

5. Run the development server:
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run db:generate` - Generate Prisma client
- `npm run db:push` - Push schema to database
- `npm run db:migrate` - Run database migrations
- `npm run db:studio` - Open Prisma Studio
- `npm run test` - Run tests
- `npm run test:watch` - Run tests in watch mode

## Domain Architecture

### Customer Management
- Customer registration and profile management
- SSN/EIN validation for US customers
- Address validation with ZIP code verification

### Project Management
- Solar project lifecycle management
- Status tracking from planning to completion
- Equipment assignment and cost estimation

### Equipment Catalog
- Solar panels, inverters, batteries management
- Power ratings and pricing information
- Equipment availability tracking

### Proposal System
- Automated quote generation
- Cost calculation based on equipment selection
- Proposal tracking and approval workflow

### Installation Management
- Installation scheduling and tracking
- Performance monitoring integration
- Maintenance records

## Features

- 🔐 Secure authentication with Better-Auth
- 🏗️ Domain-Driven Design architecture
- 📊 Real-time project tracking
- 💰 Automated proposal generation
- 📈 Performance monitoring
- 🇺🇸 US-specific validations (SSN, EIN, ZIP codes)
- 📱 Responsive design
- 🌙 Dark mode support

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## License

This project is licensed under the MIT License.