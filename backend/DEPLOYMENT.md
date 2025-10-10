# TCC Backend Deployment Guide

## Development Environment

The development environment uses siloed databases and is configured for local development.

### Setup Development
```bash
# Install dependencies
npm install

# Generate Prisma client for development
npm run db:generate

# Start development server
npm run dev
```

### Development Configuration
- **Database**: Uses siloed databases (center, ems, hospital)
- **Schema**: `prisma/schema.prisma` (uses `DATABASE_URL_CENTER`)
- **Environment**: `.env` file with siloed database URLs
- **Port**: 5001

## Production Environment (Render)

The production environment uses a unified database schema for Render deployment.

### Setup Production
```bash
# Install dependencies
npm install

# Generate Prisma client for production
npm run db:generate:prod

# Build for production
npm run build:prod

# Start production server
npm start
```

### Production Configuration
- **Database**: Uses unified database
- **Schema**: `prisma/schema-production.prisma` (uses `DATABASE_URL`)
- **Environment**: Set `DATABASE_URL` in Render dashboard
- **Build Command**: `npm run build:prod`

## Render Deployment

### Option 1: Using render.yaml (Recommended)

1. **Push the production branch to GitHub**
2. **Connect your GitHub repository to Render**
3. **Use the included `render.yaml` configuration file**
4. **Render will automatically:**
   - Create a PostgreSQL database
   - Set up environment variables
   - Deploy the backend service

### Option 2: Manual Configuration

1. **Create a new Web Service in Render Dashboard:**
   - **Name:** `tcc-backend`
   - **Environment:** `Node`
   - **Region:** `Oregon` (or closest to your users)
   - **Branch:** `production`
   - **Root Directory:** `backend`

2. **Set Environment Variables:**
   - `NODE_ENV`: `production`
   - `PORT`: `5001`
   - `JWT_SECRET`: Generate a secure random string
   - `DATABASE_URL`: Your PostgreSQL database URL (from Render database)
   - `FRONTEND_URL`: `https://your-frontend-app.onrender.com`
   - `SMTP_HOST`: `smtp.gmail.com`
   - `SMTP_PORT`: `587`
   - `SMTP_USER`: Your email address
   - `SMTP_PASS`: Your app password

3. **Build Command:** `npm install && npm run build:prod`

4. **Start Command:** `npm start`

### Database Setup

1. **Create a PostgreSQL database in Render:**
   - **Name:** `tcc-database`
   - **Plan:** `Starter` (free tier)
   - **Region:** Same as your service

2. **The database will be automatically provisioned with the unified schema**

### Health Check

After deployment, verify the service is running:
```bash
curl https://your-backend-app.onrender.com/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2025-09-06T18:30:55.904Z",
  "databases": "connected"
}
```

## Key Differences

| Aspect | Development | Production |
|--------|-------------|------------|
| Database | Siloed (3 databases) | Unified (1 database) |
| Schema File | `schema.prisma` | `schema-production.prisma` |
| Build Command | `npm run build` | `npm run build:prod` |
| Prisma Generate | `npm run db:generate` | `npm run db:generate:prod` |
| Environment | `.env` | Render env vars |

## Important Notes

- **Development and production are completely separate**
- **Never change the development schema for production fixes**
- **Use production-specific commands for Render deployment**
- **Development environment remains unaffected by production changes**
