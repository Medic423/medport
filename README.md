# MedPort - Medical Portal

## Description
MedPort is a comprehensive medical portal application built with modern web technologies, designed to provide secure and efficient medical information management.

## Project Structure
```
medport/
├── backend/          # Express.js + TypeScript + Prisma backend
├── frontend/         # React + TypeScript + Vite frontend
├── docs/            # Project documentation
├── scripts/         # Development and deployment scripts
└── README.md        # This file
```

## Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- PostgreSQL database
- Git

## Quick Start

### 1. Clone and Setup
```bash
git clone <repository-url>
cd medport
```

### 2. Install Dependencies
```bash
# Backend dependencies
cd backend
npm install

# Frontend dependencies
cd ../frontend
npm install
```

### 3. Environment Configuration
```bash
# Backend
cd backend
cp .env.example .env
# Edit .env with your database credentials

# Frontend
cd ../frontend
cp .env.example .env
# Edit .env with your API configuration
```

### 4. Database Setup
```bash
cd backend
npx prisma generate
npx prisma db push
```

### 5. Start Development Environment
```bash
# From project root
./scripts/start-dev-complete.sh
```

## Development

### Backend
- **Port**: 5001
- **Scripts**: 
  - `npm run dev` - Start development server
  - `npm run build` - Build for production
  - `npm start` - Start production server

### Frontend
- **Port**: 3002
- **Scripts**:
  - `npm run dev` - Start development server
  - `npm run build` - Build for production
  - `npm run preview` - Preview production build

## Technologies

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Security**: Helmet, CORS

### Frontend
- **Framework**: React 18
- **Language**: TypeScript
- **Build Tool**: Vite
- **Routing**: React Router DOM

## Database Models

### User
- Basic user information
- Authentication data
- Timestamps

## API Endpoints

### Health Check
- `GET /` - API status
- `GET /health` - Health check with timestamp

## Development Workflow

1. **Start Development**: Use `./scripts/start-dev-complete.sh`
2. **Backend Changes**: Auto-reload with nodemon
3. **Frontend Changes**: Hot module replacement with Vite
4. **Database Changes**: Use Prisma migrations

## Deployment

### Production Build
```bash
# Backend
cd backend
npm run build

# Frontend
cd ../frontend
npm run build
```

### Environment Variables
- `DATABASE_URL` - PostgreSQL connection string
- `PORT` - Server port (default: 5001)
- `NODE_ENV` - Environment (development/production)

## Contributing

1. Follow the established project structure
2. Use TypeScript for all new code
3. Follow the existing code style
4. Test your changes thoroughly

## License

[Your License Here]

## Support

For questions or issues, please contact the development team.
