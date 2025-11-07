# TCC Production Deployment Guide

## Executive Summary

This comprehensive guide outlines the production deployment strategy for the TCC (Transport Control Center) system, addressing current deployment issues, establishing proper deployment phases, and implementing staging environments to ensure safe production releases.

## Current Deployment Status Assessment

### ✅ **What's Working**
- **Backend**: Vercel deployment configured with production schema
- **Frontend**: Vercel deployment (though currently outdated)
- **Database**: PostgreSQL production database with unified schema
- **Environment Variables**: Properly configured for production
- **Build Process**: Production build scripts and TypeScript configuration
- **Health Checks**: Comprehensive health monitoring endpoints

### ❌ **Current Issues**
- **Vercel Frontend**: Outdated and likely contains errors
- **No Staging Environment**: Direct deployment to production
- **Deployment Frequency**: No clear strategy for when to deploy
- **Environment Separation**: Potential conflicts between dev and production

## Deployment Strategy Overview

### **Three-Environment Approach**

1. **Development** (`main` branch)
   - Local development with siloed databases
   - Rapid iteration and testing
   - No production impact

2. **Staging** (`staging` branch)
   - Production-like environment for final testing
   - Validates changes before production
   - Identical to production configuration

3. **Production** (`production` branch)
   - Live system serving real users
   - Stable, tested, and reliable
   - Minimal deployment frequency

## Phase 1: Environment Setup & Staging Implementation

### **Priority 1: Create Staging Environment** 🔥 **CRITICAL**

#### **1.1 Staging Infrastructure Setup**

**Backend Staging (Vercel)**
- Create new Vercel project: `tcc-backend-staging`
- Use `staging` branch for deployment
- Separate PostgreSQL database: `tcc-staging-database`
- Environment: `NODE_ENV=staging`

**Frontend Staging (Vercel)**
- Create new Vercel project: `tcc-frontend-staging`
- Use `staging` branch for deployment
- Point to staging backend API
- Environment: `VITE_ENVIRONMENT=staging`

#### **1.2 Staging Environment Variables**

**Backend Staging (Vercel Environment Variables)**
```bash
NODE_ENV=staging
PORT=5001
JWT_SECRET=tcc-staging-jwt-secret-2024
DATABASE_URL=postgresql://staging_user:password@staging-db.vercel.com:5432/tcc_staging_db
FRONTEND_URL=https://tcc-frontend-staging.vercel.app
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

**Frontend Staging (Vercel Environment Variables)**
```bash
VITE_API_URL=https://tcc-backend-staging.vercel.app
VITE_ENVIRONMENT=staging
```

#### **1.3 Staging Deployment Configuration**

**Backend Staging (Vercel)**
- **Project Name**: `tcc-backend-staging`
- **Branch**: `staging`
- **Root Directory**: `backend`
- **Build Command**: `npm install && npm run build:prod`
- **Output Directory**: `dist`
- **Framework**: Node.js

**Frontend Staging (Vercel)**
- **Project Name**: `tcc-frontend-staging`
- **Branch**: `staging`
- **Root Directory**: `frontend`
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Framework**: Vite

### **Priority 2: Fix Current Production Issues** 🔥 **HIGH**

#### **2.1 Frontend Production Fix**

**Current Issues to Address**
- Outdated Vercel deployment with potential errors
- Missing environment variable configuration
- Potential build issues from recent changes

**Fix Steps**
1. **Audit Current Vercel Deployment**
   ```bash
   # Check current Vercel deployment status
   vercel ls
   vercel logs
   ```

2. **Update Production Frontend**
   ```bash
   # Switch to production branch
   git checkout production
   
   # Merge latest changes from main
   git merge main
   
   # Deploy to Vercel
   vercel --prod
   ```

3. **Verify Environment Variables**
   - Check Vercel dashboard for environment variables
   - Ensure `VITE_API_URL` points to production backend
   - Verify `VITE_ENVIRONMENT=production`

#### **2.2 Backend Production Validation**

**Health Check Validation**
```bash
# Test production backend health
curl https://your-backend-app.vercel.app/health

# Expected response
{
  "status": "healthy",
  "timestamp": "2025-10-05T20:00:00.000Z",
  "database": "connected"
}
```

**Database Connection Test**
```bash
# Test database connectivity
curl https://your-backend-app.vercel.app/api/trips

# Should return trip data or empty array
```

## Phase 1.5: Vercel-Specific Considerations

### **Vercel Deployment Strategy**

#### **Backend on Vercel (Serverless Functions)**
- **Advantages**: Auto-scaling, global CDN, zero-config deployments
- **Considerations**: Cold starts, function timeout limits, database connection pooling
- **Configuration**: Use Vercel's `vercel.json` for API routes and environment variables

#### **Frontend on Vercel (Static Site Generation)**
- **Advantages**: Fast global delivery, automatic HTTPS, preview deployments
- **Considerations**: Build-time environment variables, static asset optimization
- **Configuration**: Use Vite build with environment variable injection

#### **Database Considerations**
- **External PostgreSQL**: Use external database service (not Vercel's database)
- **Connection Pooling**: Implement connection pooling for serverless functions
- **Environment Variables**: Secure database credentials in Vercel dashboard

### **Vercel Configuration Files**

#### **Backend vercel.json**
```json
{
  "version": 2,
  "builds": [
    {
      "src": "backend/src/production-index.ts",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/backend/src/production-index.ts"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  }
}
```

#### **Frontend vercel.json**
```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ],
  "buildCommand": "npm run build",
  "outputDirectory": "dist"
}
```

## Phase 2: Deployment Workflow Implementation

### **Deployment Frequency Strategy**

#### **Development Phase (Current - High Change Rate)**
- **Deployment Frequency**: **Weekly** (every Friday)
- **Trigger Conditions**:
  - All tests passing
  - No critical bugs
  - Feature complete and tested locally
  - Documentation updated

#### **Stabilization Phase (After Core Features Complete)**
- **Deployment Frequency**: **Bi-weekly** (every other Friday)
- **Trigger Conditions**:
  - Full staging testing completed
  - Performance benchmarks met
  - Security review completed
  - User acceptance testing passed

#### **Production Phase (System Stable)**
- **Deployment Frequency**: **Monthly** (first Friday of month)
- **Trigger Conditions**:
  - Critical bug fixes only
  - Security patches
  - Performance improvements
  - Emergency hotfixes

### **Deployment Workflow Process**

#### **Step 1: Pre-Deployment Checklist**

**Code Quality Checks**
- [ ] All tests passing (`npm test`)
- [ ] No linting errors (`npm run lint`)
- [ ] TypeScript compilation successful
- [ ] Build process completes without errors
- [ ] Database migrations tested

**Security & Performance**
- [ ] Security scan completed
- [ ] Performance benchmarks met
- [ ] Environment variables secured
- [ ] Database backup created
- [ ] Rollback plan prepared

**Documentation & Communication**
- [ ] Changelog updated
- [ ] Deployment notes prepared
- [ ] Team notified of deployment
- [ ] Monitoring alerts configured

#### **Step 2: Staging Deployment**

```bash
# 1. Create staging branch from main
git checkout main
git pull origin main
git checkout -b staging
git push origin staging

# 2. Deploy to staging
# Backend will auto-deploy via Vercel
# Frontend will auto-deploy via Vercel

# 3. Test staging environment
curl https://tcc-backend-staging.vercel.app/health
# Test all critical user workflows
```

#### **Step 3: Production Deployment**

```bash
# 1. Merge staging to production
git checkout production
git pull origin production
git merge staging
git push origin production

# 2. Monitor deployment
# Check Vercel logs for backend
# Check Vercel logs for frontend

# 3. Verify production health
curl https://your-backend-app.vercel.app/health
```

#### **Step 4: Post-Deployment Validation**

**Automated Health Checks**
- [ ] Backend health endpoint responding
- [ ] Database connectivity verified
- [ ] Frontend loading correctly
- [ ] API endpoints responding
- [ ] Authentication working

**Manual Testing**
- [ ] User login/logout flows
- [ ] Trip creation and management
- [ ] EMS dashboard functionality
- [ ] Healthcare dashboard functionality
- [ ] Critical user journeys

## Phase 3: Monitoring & Alerting

### **Production Monitoring Setup**

#### **3.1 Application Monitoring**

**Health Check Endpoints**
```bash
# Backend health
GET /health
Response: {"status": "healthy", "database": "connected"}

# Database connectivity
GET /api/trips
Response: Array of trips or empty array

# Authentication
GET /api/auth/verify
Response: Token validation status
```

**Uptime Monitoring**
- Set up UptimeRobot or similar service
- Monitor health endpoints every 5 minutes
- Alert on any downtime or errors
- Track response times and availability

#### **3.2 Error Tracking**

**Backend Error Monitoring**
```javascript
// Add to production-index.ts
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Production Error:', {
    error: err.message,
    stack: err.stack,
    timestamp: new Date().toISOString(),
    url: req.url,
    method: req.method,
    userAgent: req.get('User-Agent')
  });
  
  // Send to error tracking service (Sentry, LogRocket, etc.)
  res.status(500).json({
    success: false,
    error: 'Internal server error'
  });
});
```

**Frontend Error Monitoring**
```javascript
// Add to main.tsx
window.addEventListener('error', (event) => {
  console.error('Frontend Error:', {
    message: event.message,
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno,
    timestamp: new Date().toISOString()
  });
  
  // Send to error tracking service
});
```

### **Alert Configuration**

#### **Critical Alerts (Immediate Response)**
- Backend service down
- Database connection failure
- Authentication service failure
- Frontend build failures

#### **Warning Alerts (Response within 1 hour)**
- High error rates (>5% of requests)
- Slow response times (>5 seconds)
- Database performance issues
- High memory usage

#### **Info Alerts (Daily Summary)**
- Deployment success/failure
- Performance metrics
- User activity summaries
- System health reports

## Phase 4: Rollback & Recovery Procedures

### **Rollback Strategy**

#### **4.1 Automated Rollback Triggers**

**Backend Rollback Conditions**
- Health check failures for 3 consecutive checks
- Error rate >10% for 5 minutes
- Response time >10 seconds average
- Database connection failures

**Frontend Rollback Conditions**
- Build failures
- Critical JavaScript errors
- Authentication failures
- API connectivity issues

#### **4.2 Manual Rollback Procedures**

**Backend Rollback (Vercel)**
```bash
# 1. Identify last known good deployment
# Check Vercel dashboard for deployment history

# 2. Rollback to previous version
vercel rollback [deployment-url]

# 3. Verify rollback success
curl https://your-backend-app.vercel.app/health

# 4. Notify team of rollback
```

**Frontend Rollback (Vercel)**
```bash
# 1. Check Vercel deployment history
vercel ls

# 2. Rollback to previous deployment
vercel rollback [deployment-url]

# 3. Verify rollback success
# Test frontend functionality

# 4. Notify team of rollback
```

#### **4.3 Database Rollback Procedures**

**Database Backup Restoration**
```bash
# 1. Identify backup to restore
# Check backup timestamps and choose appropriate one

# 2. Restore database
# Use Vercel's database restore feature or pg_restore

# 3. Verify data integrity
# Run data validation queries

# 4. Update application to match database state
```

### **Recovery Testing**

#### **Monthly Recovery Drills**
- [ ] Test rollback procedures
- [ ] Verify backup restoration
- [ ] Test monitoring and alerting
- [ ] Validate emergency contacts
- [ ] Document lessons learned

## Phase 5: Security & Performance Optimization

### **Security Hardening**

#### **5.1 Production Security Checklist**

**Environment Security**
- [ ] All environment variables secured
- [ ] JWT secrets rotated regularly
- [ ] Database credentials protected
- [ ] API endpoints properly authenticated
- [ ] CORS configuration secure

**Application Security**
- [ ] Helmet.js security headers enabled
- [ ] Input validation on all endpoints
- [ ] SQL injection prevention
- [ ] XSS protection implemented
- [ ] Rate limiting configured

#### **5.2 Performance Optimization**

**Backend Performance**
- [ ] Database query optimization
- [ ] Connection pooling configured
- [ ] Caching strategies implemented
- [ ] Response compression enabled
- [ ] Memory usage optimized

**Frontend Performance**
- [ ] Bundle size optimization
- [ ] Image optimization
- [ ] CDN configuration
- [ ] Lazy loading implemented
- [ ] Service worker caching

## Deployment Timeline

### **Week 1: Vercel Environment Setup**
- **Days 1-2**: Create staging projects on Vercel (frontend + backend)
- **Days 3-4**: Configure Vercel environment variables and database connections
- **Day 5**: Test staging deployment process and health checks

### **Week 2: Production Fixes**
- **Days 1-2**: Fix current Vercel production issues and update configurations
- **Days 3-4**: Validate production backend health and database connectivity
- **Day 5**: Test production deployment process and rollback procedures

### **Week 3: Workflow Implementation**
- **Days 1-2**: Implement Vercel deployment workflow and branch strategies
- **Days 3-4**: Set up monitoring, alerting, and Vercel-specific optimizations
- **Day 5**: Test rollback procedures and recovery processes

### **Week 4: Security & Performance**
- **Days 1-2**: Implement security hardening for Vercel serverless functions
- **Days 3-4**: Optimize performance for Vercel's global CDN and edge functions
- **Day 5**: Final testing, documentation, and team training

## Success Criteria

### **Phase 1 Complete When**
- [ ] Staging environment operational
- [ ] Production issues resolved
- [ ] Deployment workflow documented
- [ ] Monitoring configured

### **Phase 2 Complete When**
- [ ] Weekly deployment schedule established
- [ ] All deployments successful
- [ ] No production downtime
- [ ] Team trained on procedures

### **Phase 3 Complete When**
- [ ] Monitoring and alerting operational
- [ ] Error tracking implemented
- [ ] Performance metrics established
- [ ] Recovery procedures tested

## Risk Assessment

### **High Risk Items**
- **Production Downtime**: Risk during deployment
- **Data Loss**: Risk during database changes
- **Security Vulnerabilities**: Risk of exposed credentials
- **Performance Degradation**: Risk of slow deployments

### **Mitigation Strategies**
- **Staging Environment**: Test all changes before production
- **Rollback Procedures**: Quick recovery from failures
- **Monitoring**: Early detection of issues
- **Backup Strategy**: Regular backups and restore testing

## Questions & Considerations

### **Deployment Frequency**
**Q: How often should we deploy during active development?**
**A: Weekly deployments during development phase, reducing to bi-weekly during stabilization, and monthly during production phase.**

### **Staging Environment**
**Q: Do we need a staging environment?**
**A: Yes, absolutely. Staging prevents production issues and allows safe testing of changes.**

### **Production Stability**
**Q: How do we ensure we don't break the working site?**
**A: Three-layer approach: 1) Staging testing, 2) Automated health checks, 3) Quick rollback procedures.**

### **Change Management**
**Q: When should we deploy changes?**
**A: Deploy when: all tests pass, staging validation complete, no critical bugs, and team approval received.**

---

**Document Status**: ✅ **READY FOR IMPLEMENTATION**  
**Created**: October 5, 2025  
**Target Implementation**: October 6-30, 2025  
**Next Review**: Weekly during implementation phase
