# Production and Development Environment Separation Guide

## 🎯 **Overview**
This guide outlines the proper procedure to maintain complete separation between your local development environment and production environments (Vercel + DigitalOcean), and how to safely reconnect to production when needed.

## 🚨 **Why This Separation is Critical**
- **Prevents accidental production deployments** from development
- **Avoids environment variable conflicts** (dev vs prod API URLs)
- **Protects against database corruption** from dev testing
- **Maintains stable production** while allowing experimental development
- **Prevents the 6-hour restoration nightmare** you just experienced

---

## 📋 **Pre-Production Reconnection Checklist**

### **1. Environment Isolation Setup**

#### **A. Local Development Environment**
- **Frontend**: `http://localhost:3000` (Vite dev server)
- **Backend**: `http://localhost:5001` (Node.js + Express)
- **Database**: Local PostgreSQL (3 databases: medport_center, medport_hospital, medport_ems)
- **API Base URL**: `http://localhost:5001` (hardcoded for dev)
- **Environment**: `NODE_ENV=development`

#### **B. Production Environment**
- **Frontend**: `https://traccems.com` (Vercel)
- **Backend**: `https://api.traccems.com` (DigitalOcean)
- **Database**: Production PostgreSQL (DigitalOcean managed)
- **API Base URL**: `https://api.traccems.com` (environment-based)
- **Environment**: `NODE_ENV=production`

### **2. Environment Variable Management**

#### **Development Environment Variables**
```bash
# backend/.env
DATABASE_URL="postgresql://scooper@localhost:5432/medport_center"
DATABASE_URL_HOSPITAL="postgresql://scooper@localhost:5432/medport_hospital"
DATABASE_URL_EMS="postgresql://scooper@localhost:5432/medport_ems"
JWT_SECRET="tcc-super-secret-jwt-key-2024"
PORT=5001
NODE_ENV="development"
FRONTEND_URL="http://localhost:3000"
```

#### **Production Environment Variables**
```bash
# Vercel Environment Variables (Frontend)
VITE_API_URL="https://api.traccems.com"
VITE_ENVIRONMENT="production"

# DigitalOcean Environment Variables (Backend)
DATABASE_URL="postgresql://user:pass@prod-db:5432/medport_center"
JWT_SECRET="production-jwt-secret-key"
PORT=5001
NODE_ENV="production"
FRONTEND_URL="https://traccems.com"
```

### **3. Code Configuration Changes**

#### **Frontend API Configuration**
```typescript
// frontend/src/services/api.ts
const API_BASE_URL = import.meta.env.VITE_API_URL || 
  (import.meta.env.DEV ? 'http://localhost:5001' : 'https://api.traccems.com');

// Ensure development always uses localhost
if (import.meta.env.DEV) {
  console.log('TCC_DEBUG: Running in DEVELOPMENT mode - using localhost:5001');
} else {
  console.log('TCC_DEBUG: Running in PRODUCTION mode - using api.traccems.com');
}
```

#### **Backend Environment Detection**
```typescript
// backend/src/index.ts
const isDevelopment = process.env.NODE_ENV === 'development';
const isProduction = process.env.NODE_ENV === 'production';

if (isDevelopment) {
  console.log('🚀 TCC Backend running in DEVELOPMENT mode');
  console.log('📊 Local database connections enabled');
} else {
  console.log('🚀 TCC Backend running in PRODUCTION mode');
  console.log('📊 Production database connections enabled');
}
```

---

## 🔧 **Step-by-Step Production Reconnection Procedure**

### **Phase 1: Environment Preparation**

#### **Step 1.1: Verify Local Development is Stable**
```bash
# 1. Ensure local development works perfectly
npm run dev

# 2. Test all functionality
# - Login as admin, healthcare, EMS users
# - Create/edit hospitals and agencies
# - Test trip creation and management
# - Verify all API endpoints work

# 3. Create backup before any production changes
./backup.sh
```

#### **Step 1.2: Create Environment-Specific Configurations**
```bash
# 1. Create production-specific environment files
cp backend/.env backend/.env.production
cp frontend/.env.local frontend/.env.production

# 2. Update production environment variables
# (See environment variable section above)

# 3. Create deployment scripts
# - deploy-frontend-to-vercel.sh
# - deploy-backend-to-digitalocean.sh
```

### **Phase 2: Vercel Frontend Reconnection**

#### **Step 2.1: Vercel Account Verification**
```bash
# 1. Verify Vercel CLI is installed
npm install -g vercel

# 2. Login to Vercel
vercel login

# 3. Verify project connection
vercel projects ls
# Should show: tcc-frontend or similar

# 4. Check current deployment status
vercel ls
```

#### **Step 2.2: Vercel Environment Configuration**
```bash
# 1. Set production environment variables
vercel env add VITE_API_URL production
# Value: https://api.traccems.com

vercel env add VITE_ENVIRONMENT production  
# Value: production

# 2. Verify environment variables
vercel env ls

# 3. Pull environment variables to local
vercel env pull .env.production
```

#### **Step 2.3: Vercel Deployment**
```bash
# 1. Build for production
cd frontend
npm run build

# 2. Deploy to Vercel
vercel --prod

# 3. Verify deployment
# Check: https://traccems.com
# Should show TCC app (not Vercel branding)
```

### **Phase 3: DigitalOcean Backend Reconnection**

#### **Step 3.1: DigitalOcean Account Verification**
```bash
# 1. Verify DigitalOcean CLI is installed
# Install doctl if not present

# 2. Login to DigitalOcean
doctl auth init

# 3. Verify droplet access
doctl compute droplet list
# Should show your TCC backend droplet

# 4. Check database status
doctl databases list
# Should show your PostgreSQL database
```

#### **Step 3.2: Database Connection Setup**
```bash
# 1. Get production database credentials
doctl databases connection-string <database-id>

# 2. Test database connection
psql "<connection-string>"

# 3. Verify database schemas exist
# - medport_center
# - medport_hospital  
# - medport_ems
```

#### **Step 3.3: Backend Deployment**
```bash
# 1. Build production backend
cd backend
npm run build:prod

# 2. Deploy to DigitalOcean
# (Use your existing deployment script)
./deploy-to-production.sh

# 3. Verify backend health
curl https://api.traccems.com/health
```

### **Phase 4: Integration Testing**

#### **Step 4.1: Production Environment Testing**
```bash
# 1. Test frontend → backend communication
# Visit: https://traccems.com
# Login and verify API calls go to api.traccems.com

# 2. Test all user types
# - Admin login
# - Healthcare login  
# - EMS login

# 3. Test core functionality
# - Hospital management
# - Agency management
# - Trip creation and management
```

#### **Step 4.2: Environment Isolation Verification**
```bash
# 1. Verify local development still works
npm run dev
# Should use localhost:5001

# 2. Verify production uses production URLs
# Check browser network tab
# Should show api.traccems.com calls

# 3. Test environment switching
# No conflicts between dev and prod
```

---

## 🛡️ **Environment Protection Measures**

### **1. Git Branch Protection**
```bash
# 1. Create production branch
git checkout -b production

# 2. Set up branch protection rules
# - Require pull requests for production branch
# - Require status checks to pass
# - Restrict pushes to production branch

# 3. Use feature branches for all development
# Never commit directly to production branch
```

### **2. Environment Detection Guards**
```typescript
// Add to critical files
if (process.env.NODE_ENV === 'production' && !process.env.PRODUCTION_CONFIRMED) {
  throw new Error('Production deployment not confirmed. Set PRODUCTION_CONFIRMED=true');
}
```

### **3. Database Protection**
```bash
# 1. Separate database users
# - dev_user (local development)
# - prod_user (production only)

# 2. Database connection validation
# - Verify environment before connecting
# - Use different connection strings per environment

# 3. Backup before any production changes
# - Always backup production database
# - Test changes on staging first
```

### **4. Deployment Safety Checks**
```bash
# 1. Pre-deployment validation
# - Environment variables set correctly
# - Database connections tested
# - All tests passing

# 2. Rollback procedures
# - Quick rollback scripts ready
# - Previous version backups available
# - Database restore procedures tested

# 3. Monitoring and alerts
# - Health check endpoints
# - Error logging and alerting
# - Performance monitoring
```

---

## 🚨 **Emergency Procedures**

### **If Production Breaks Development Again**

#### **Immediate Response**
```bash
# 1. Stop all development servers
pkill -f 'node|npm|vite|nodemon'

# 2. Restore from backup
./workflow.sh restore /path/to/last-working-backup

# 3. Verify local development works
npm run dev

# 4. Investigate what caused the conflict
```

#### **Root Cause Analysis**
```bash
# 1. Check environment variables
cat frontend/.env.local
cat backend/.env

# 2. Check API configuration
grep -r "api.traccems.com" frontend/src/

# 3. Check Vite configuration
cat frontend/vite.config.ts

# 4. Check for cached configurations
rm -rf frontend/dist frontend/node_modules/.vite
```

### **If Development Breaks Production**

#### **Immediate Response**
```bash
# 1. Rollback production deployment
vercel rollback
# or
doctl compute droplet-action power-cycle <droplet-id>

# 2. Restore production database from backup
# (Use your production backup procedures)

# 3. Verify production is stable
curl https://api.traccems.com/health
```

---

## 📊 **Monitoring and Maintenance**

### **Daily Checks**
- [ ] Local development environment works
- [ ] Production environment accessible
- [ ] No environment variable conflicts
- [ ] Database connections stable

### **Weekly Checks**
- [ ] Run full test suite
- [ ] Verify backup procedures
- [ ] Check deployment scripts
- [ ] Review environment configurations

### **Before Any Production Changes**
- [ ] Create full backup
- [ ] Test changes locally first
- [ ] Use staging environment if available
- [ ] Have rollback plan ready

---

## 🎯 **Success Criteria**

### **Environment Separation is Successful When:**
- ✅ Local development always uses localhost:5001
- ✅ Production always uses api.traccems.com
- ✅ No accidental cross-environment calls
- ✅ Database changes don't affect other environments
- ✅ Deployments are intentional and controlled
- ✅ Rollback procedures work quickly

### **Production Reconnection is Successful When:**
- ✅ Frontend deployed to Vercel and accessible
- ✅ Backend deployed to DigitalOcean and healthy
- ✅ Database connections working
- ✅ All user types can login and function
- ✅ Local development remains unaffected
- ✅ Environment switching works seamlessly

---

## 📝 **Important Notes**

1. **Never mix development and production configurations**
2. **Always test locally before deploying to production**
3. **Keep backups before any production changes**
4. **Use the workflow script for all development**
5. **Monitor environment variables carefully**
6. **Have rollback procedures ready**
7. **Document any custom configurations**

This guide ensures you can safely reconnect to production while maintaining complete separation from your development environment.
