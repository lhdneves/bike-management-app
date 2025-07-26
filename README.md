# Bicycle Maintenance Management System

A comprehensive full-stack application for managing bicycle maintenance, expenses, and component tracking.

## Features

- User authentication and authorization
- Bicycle registration and management
- Component tracking and lifecycle management
- Maintenance scheduling and history
- Mechanic directory and services
- Automated maintenance reminders
- Expense tracking and reporting
- Admin dashboard for system management

## Tech Stack

### Frontend
- **Next.js** - React framework for production
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **React Hook Form** - Forms with validation
- **Axios** - HTTP client for API calls

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **TypeScript** - Type-safe JavaScript
- **Prisma** - Next-generation ORM
- **JWT** - JSON Web Tokens for authentication
- **bcrypt** - Password hashing
- **Nodemailer** - Email service integration

### Database
- **PostgreSQL** (via Supabase) - Relational database
- **Prisma** - Database ORM and migration tool

## Project Structure

```
projeto001/
├── frontend/           # Next.js frontend application
├── backend/           # Express.js backend API
├── docs/             # Project documentation
├── package.json      # Root package.json for workspace
└── README.md         # This file
```

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- PostgreSQL database (or Supabase account)

### Installation

1. Clone the repository and install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
# Copy environment files
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local
```

3. Configure your database connection in `backend/.env`

4. Run database migrations:
```bash
npm run db:migrate
```

5. Start the development servers:
```bash
npm run dev
```

The frontend will be available at `http://localhost:3000` and the backend API at `http://localhost:5000`.

## Available Scripts

- `npm run dev` - Start both frontend and backend in development mode
- `npm run build` - Build both applications for production
- `npm run start` - Start the production server
- `npm run db:migrate` - Run database migrations
- `npm run db:seed` - Seed the database with initial data
- `npm run test` - Run tests for both applications

## API Documentation

The API documentation is available at `http://localhost:5000/api-docs` when running the backend server.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests
5. Submit a pull request

## License

This project is licensed under the ISC License.