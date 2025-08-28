# MedPort - Medical Transport Coordination System

A Progressive Web App (PWA) designed to coordinate interfacility EMS transfers, optimizing ambulance availability, loaded miles, and routing efficiency across hospital service areas.

## 🚀 Features

- **Transport Request Management**: HIPAA-compliant patient transfer coordination
- **Route Optimization**: Advanced algorithms for minimizing empty miles and maximizing revenue
- **Agency Portal**: Public-facing interface for transport agencies to bid on routes
- **Real-time Tracking**: GPS integration for transport units
- **PWA Capabilities**: Offline functionality, installable on any device
- **Revenue Optimization**: Chained trip suggestions to maximize transport agency profits

## 🏗️ Architecture

- **Frontend**: React-based PWA with TypeScript
- **Backend**: Node.js/Express API with Prisma ORM
- **Database**: PostgreSQL with comprehensive schema
- **Deployment**: Render for production
- **Offline Support**: Service workers with localStorage persistence

## 📋 Prerequisites

- Node.js 18+ and npm
- PostgreSQL 14+
- Git

## 🚀 Quick Start

### 1. Clone and Install Dependencies

```bash
git clone <repository-url>
cd medport
npm install
cd backend && npm install
cd ../frontend && npm install
```

### 2. Database Setup

```bash
# Start PostgreSQL service
brew services start postgresql  # macOS
# or
sudo systemctl start postgresql  # Linux

# Run database setup script
cd backend
./scripts/setup-db.sh
```

### 3. Environment Configuration

```bash
# Backend
cd backend
cp env.example .env
# Edit .env with your database credentials and API keys

# Frontend
cd ../frontend
cp env.example .env
# Edit .env with your API configuration
```

### 4. Start Development Servers

```bash
# From project root
npm run dev

# Or start individually
npm run dev:backend    # Backend on port 5000
npm run dev:frontend   # Frontend on port 3000
```

## 🔧 Development Scripts

### Root Level
- `npm run dev` - Start both frontend and backend
- `npm run build` - Build both frontend and backend
- `npm run lint` - Lint both frontend and backend
- `npm run format` - Format code with Prettier

### Backend
- `npm run dev` - Start development server with nodemon
- `npm run build` - Build TypeScript to JavaScript
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run format` - Format with Prettier

### Frontend
- `npm run dev` - Start Vite development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run format` - Format with Prettier

## 🗄️ Database Schema

The application uses a comprehensive Prisma schema with the following main entities:

- **Users**: Role-based access control (Admin, Coordinator, Billing Staff, Transport Agency)
- **Facilities**: Hospitals, nursing homes, cancer centers, rehab facilities
- **Transport Requests**: Patient transfers with HIPAA-compliant identifiers
- **Transport Agencies**: EMS services with capabilities and contact info
- **Units**: Available EMS units with capabilities and status
- **Distance Matrix**: Pre-calculated distances between facilities
- **Routes**: Optimized transport assignments

## 🔐 Authentication & Security

- JWT-based authentication with refresh tokens
- Role-based access control
- HIPAA compliance for patient data
- Password hashing with bcrypt
- CORS configuration for security

## 📱 PWA Features

- Service worker for offline functionality
- Web app manifest for installation
- Background sync capabilities
- Local storage for offline data
- Responsive design for all devices

## 🚀 Deployment

### Render Deployment

1. Connect your GitHub repository to Render
2. Create a new Web Service for the backend
3. Create a new Static Site for the frontend
4. Configure environment variables
5. Deploy!

## 🧪 Testing

```bash
# Run linting
npm run lint

# Check formatting
npm run format:check

# Run tests (when implemented)
npm test
```

## 📚 API Documentation

The API includes the following main endpoints:

- `/api/auth` - Authentication routes (login, register, refresh)
- `/api/protected` - Protected routes requiring authentication
- `/api/transport-requests` - Transport request management
- `/api/facilities` - Facility management
- `/api/agencies` - Transport agency management
- `/api/routes` - Route optimization and assignment

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run linting and tests
5. Submit a pull request

## 📄 License

This project is proprietary software. All rights reserved.

## 🆘 Support

For support and questions, please contact the development team.

---

**MedPort** - Optimizing medical transport coordination for better patient care and agency efficiency.
# Force deployment trigger - Thu Aug 28 09:05:28 EDT 2025
