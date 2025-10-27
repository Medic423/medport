# TCC Backend Deployment Guide

## Development Environment

The development environment uses a unified database architecture for simplified development.

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
- **Database**: Uses unified medport_ems database
- **Schema**: `prisma/schema.prisma` (uses `DATABASE_URL`)
- **Environment**: `.env` file with single database URL
- **Port**: 5001

## Production Environment (Vercel/Render)

The production environment uses the same unified database architecture as development.

### Setup Production
```bash
# Install dependencies
npm install

# Generate Prisma client for production
npm run build

# Start production server
npm start
```

### Production Configuration
- **Database**: Uses unified medport_ems database
- **Schema**: `prisma/schema.prisma` (uses `DATABASE_URL`)
- **Environment**: Set `DATABASE_URL` in deployment platform
- **Build Command**: `npm run build`

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
| Database | Unified medport_ems | Unified medport_ems |
| Schema File | `schema.prisma` | `schema.prisma` |
| Build Command | `npm run build` | `npm run build` |
| Prisma Generate | `npm run db:generate` | `npm run db:generate` |
| Environment | `.env` | Platform env vars |

## Important Notes

- **Development and production use the same unified architecture**
- **Single database simplifies deployment and maintenance**
- **All legacy three-database references have been eliminated**
- **Standard build commands work for both environments**
