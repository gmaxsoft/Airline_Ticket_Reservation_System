# Airline Ticket Reservation System

A modern, scalable backend system for airline ticket reservations built with Nest.js, Prisma ORM, and PostgreSQL.

## 🚀 Tech Stack

- **[Nest.js](https://nestjs.com/)** - Progressive Node.js framework for building efficient server-side applications
- **[Prisma](https://www.prisma.io/)** - Next-generation ORM for Node.js and TypeScript
- **[PostgreSQL](https://www.postgresql.org/)** - Open-source relational database
- **[Docker](https://www.docker.com/)** - Containerization platform for PostgreSQL
- **[TypeScript](https://www.typescriptlang.org/)** - Typed superset of JavaScript

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- Node.js 20.x or higher
- npm or yarn
- Docker and Docker Compose

## 🔧 Installation

1. Clone the repository:
```bash
git clone https://github.com/gmaxsoft/Airline_Ticket_Reservation_System.git
cd Airline_Ticket_Reservation_System
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file from the example:
```bash
cp .env.example .env
```

4. Update the `.env` file with your database configuration if needed.

## 🐳 Database Setup

Start PostgreSQL using Docker Compose:

```bash
npm run docker:up
```

This will start a PostgreSQL container with the following default configuration:
- **User:** postgres
- **Password:** postgres
- **Database:** airline_reservation
- **Port:** 5432

To stop the database:
```bash
npm run docker:down
```

To view database logs:
```bash
npm run docker:logs
```

## 🗄️ Database Migrations

After setting up the database, generate Prisma Client and run migrations:

```bash
# Generate Prisma Client
npm run prisma:generate

# Create and apply migrations
npm run prisma:migrate

# Open Prisma Studio (database GUI)
npm run prisma:studio
```

## 🏃 Running the Application

```bash
# Development mode
npm run start:dev

# Production mode
npm run build
npm run start:prod

# Debug mode
npm run start:debug
```

The application will be available at `http://localhost:3000`.

## 🧪 Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov

# Watch mode
npm run test:watch
```

## 📝 Available Scripts

- `npm run build` - Build the application
- `npm run start` - Start the application
- `npm run start:dev` - Start in development mode with watch
- `npm run start:prod` - Start in production mode
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier
- `npm run prisma:generate` - Generate Prisma Client
- `npm run prisma:migrate` - Create and apply migrations
- `npm run prisma:studio` - Open Prisma Studio
- `npm run docker:up` - Start Docker containers
- `npm run docker:down` - Stop Docker containers
- `npm run docker:logs` - View Docker logs

## 📂 Project Structure

```
src/
├── main.ts           # Application entry point
├── app.module.ts     # Root module
├── app.controller.ts # Root controller
└── app.service.ts    # Root service
prisma/
├── schema.prisma     # Database schema
└── migrations/       # Database migrations
```

## 🛠️ Development

This project uses:
- **ESLint** for code linting
- **Prettier** for code formatting
- **Jest** for testing
- **GitHub Actions** for CI/CD

## 📚 Documentation

- [Nest.js Documentation](https://docs.nestjs.com)
- [Prisma Documentation](https://www.prisma.io/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)

## 📄 License

This project is private and proprietary.
