# TCC - Transport Control Center

A modern web application for managing hospital transport requests and EMS coordination.

## 🚀 Features

- **Hospital Management**: Add, edit, and manage hospitals in the system
- **EMS Agency Management**: Manage EMS agencies and their units
- **Facility Management**: Manage healthcare facilities
- **Analytics Dashboard**: Monitor system performance and activity
- **Admin Authentication**: Secure admin-only access

## 🏗️ Architecture

### Backend (Node.js + Express + TypeScript)
- **3 Siloed PostgreSQL Databases**:
  - Hospital DB (Port 5432): Hospital users, facilities, transport requests
  - EMS DB (Port 5433): EMS agencies and units
  - Center DB (Port 5434): System administration and analytics
- **JWT Authentication**: Secure admin access
- **RESTful APIs**: Clean API endpoints for all operations
- **Prisma ORM**: Type-safe database operations

### Frontend (React + TypeScript + Tailwind CSS)
- **Modern React**: Functional components with hooks
- **Responsive Design**: Mobile-first approach
- **TypeScript**: Full type safety
- **Tailwind CSS**: Utility-first styling

## 📋 Prerequisites

- Node.js 18+ 
- PostgreSQL 13+
- npm or yarn

## 🛠️ Installation

### 1. Clone the repository
```bash
git clone <repository-url>
cd tcc-new-project
```

### 2. Set up databases
Create three PostgreSQL databases:
```sql
-- Hospital Database
CREATE DATABASE tcc_hospital;

-- EMS Database  
CREATE DATABASE tcc_ems;

-- Center Database
CREATE DATABASE tcc_center;
```

### 3. Configure environment variables
```bash
cd backend
cp env.example .env
```

Edit `.env` with your database credentials:
```env
DATABASE_URL_HOSPITAL="postgresql://username:password@localhost:5432/tcc_hospital?schema=public"
DATABASE_URL_EMS="postgresql://username:password@localhost:5433/tcc_ems?schema=public"
DATABASE_URL_CENTER="postgresql://username:password@localhost:5434/tcc_center?schema=public"
JWT_SECRET="your-super-secret-jwt-key-here"
```

### 4. Install dependencies
```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 5. Set up databases
```bash
cd backend
npm run db:generate
npm run db:push
npm run db:seed
```

### 6. Start the application
```bash
# Backend (Terminal 1)
cd backend
npm run dev

# Frontend (Terminal 2)
cd frontend
npm run dev
```

## 🔐 Default Login Credentials

- **Email**: admin@tcc.com
- **Password**: admin123

## 📊 API Endpoints

### Authentication
- `POST /api/auth/login` - Admin login
- `POST /api/auth/logout` - Logout
- `GET /api/auth/verify` - Verify token

### Hospitals
- `GET /api/tcc/hospitals` - List hospitals
- `POST /api/tcc/hospitals` - Create hospital
- `GET /api/tcc/hospitals/:id` - Get hospital
- `PUT /api/tcc/hospitals/:id` - Update hospital
- `DELETE /api/tcc/hospitals/:id` - Delete hospital

### EMS Agencies
- `GET /api/tcc/agencies` - List agencies
- `POST /api/tcc/agencies` - Create agency
- `GET /api/tcc/agencies/:id` - Get agency
- `PUT /api/tcc/agencies/:id` - Update agency
- `DELETE /api/tcc/agencies/:id` - Delete agency

### Facilities
- `GET /api/tcc/facilities` - List facilities
- `POST /api/tcc/facilities` - Create facility
- `GET /api/tcc/facilities/:id` - Get facility
- `PUT /api/tcc/facilities/:id` - Update facility
- `DELETE /api/tcc/facilities/:id` - Delete facility

### Analytics
- `GET /api/tcc/analytics/overview` - System overview
- `GET /api/tcc/analytics/trips` - Trip statistics
- `GET /api/tcc/analytics/agencies` - Agency performance
- `GET /api/tcc/analytics/hospitals` - Hospital activity

## 🧪 Testing

```bash
# Backend health check
curl http://localhost:5001/health

# Test login
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@tcc.com","password":"admin123"}'
```

## 📁 Project Structure

```
tcc-new-project/
├── backend/
│   ├── src/
│   │   ├── routes/          # API routes
│   │   ├── services/        # Business logic
│   │   ├── middleware/      # Auth middleware
│   │   └── index.ts         # Main server file
│   ├── prisma/              # Database schemas
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── services/        # API services
│   │   └── main.tsx         # App entry point
│   └── package.json
└── README.md
```

## 🚀 Development

### Backend Development
```bash
cd backend
npm run dev          # Start with hot reload
npm run build        # Build for production
npm run start        # Start production build
```

### Frontend Development
```bash
cd frontend
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
```

## 🔧 Configuration

### Database Configuration
The application uses three separate PostgreSQL databases for data isolation:
- **Hospital DB**: Patient transport requests and hospital data
- **EMS DB**: EMS agencies and unit management
- **Center DB**: System administration and analytics

### Environment Variables
See `backend/env.example` for all available configuration options.

## 📝 License

This project is proprietary software.

## 🤝 Contributing

This is a private project. Please contact the development team for contribution guidelines.

## 📞 Support

For support, please contact the development team.
