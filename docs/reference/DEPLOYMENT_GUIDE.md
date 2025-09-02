

# 🚀 MedPort Deployment Guide - Render Production Setup

This guide will walk you through setting up MedPort on Render for production deployment.

## 📋 **Prerequisites**

- ✅ GitHub account with MedPort repository
- ✅ Render account (linked to GitHub)
- ✅ PostgreSQL database (Render will provide this)
- ✅ Google Maps API key (optional, for distance calculations)
- ✅ Twilio account (optional, for notifications)

---

## 🎯 **Step 1: Prepare Your Repository**

### **1.1 Commit All Changes**
```bash
git add .
git commit -m "Prepare for production deployment on Render"
git push origin main
```

### **1.2 Verify Repository Structure**
Your repository should have:
```
medport/
├── backend/          # Node.js API server
├── frontend/         # React frontend
├── render.yaml       # Render configuration
├── DEPLOYMENT_GUIDE.md
└── README.md
```

---

## 🌐 **Step 2: Set Up Render Account**

### **2.1 Access Render Dashboard**
1. Go to [render.com](https://render.com)
2. Sign in with GitHub (Medics423 account)
3. You'll see your existing Chartcoach project

### **2.2 Create New Web Service for Backend**
1. Click **"New +"** → **"Web Service"**
2. Connect your GitHub repository
3. Select the `medport` repository
4. Configure the service:

**Basic Settings:**
- **Name**: `medport-backend`
- **Environment**: `Node`
- **Region**: Choose closest to your users
- **Branch**: `main`

**Build & Deploy:**
- **Build Command**: `cd backend && npm install && npm run build`
- **Start Command**: `cd backend && npm start`
- **Plan**: `Starter` (free tier)

### **2.3 Create PostgreSQL Database**
1. Click **"New +"** → **"PostgreSQL"**
2. Configure:
   - **Name**: `medport-database`
   - **Database**: `medport_prod`
   - **User**: `medport_user`
   - **Plan**: `Starter` (free tier)
   - **Region**: Same as backend service

### **2.4 Create Static Site for Frontend**
1. Click **"New +"** → **"Static Site"**
2. Configure:
   - **Name**: `medport-frontend`
   - **Build Command**: `cd frontend && npm install && npm run build`
   - **Publish Directory**: `frontend/dist`
   - **Plan**: `Starter` (free tier)

---

## ⚙️ **Step 3: Configure Environment Variables**

### **3.1 Backend Environment Variables**
In your `medport-backend` service, add these environment variables:

**Required:**
```
NODE_ENV=production
PORT=10000
DATABASE_URL=<from PostgreSQL service>
JWT_SECRET=<generate a secure random string>
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=7d
CORS_ORIGIN=https://medport-frontend.onrender.com
BCRYPT_ROUNDS=12
```

**Optional:**
```
GOOGLE_MAPS_API_KEY=<your-google-maps-api-key>
TWILIO_ACCOUNT_SID=<your-twilio-account-sid>
TWILIO_AUTH_TOKEN=<your-twilio-auth-token>
TWILIO_PHONE_NUMBER=<your-twilio-phone-number>
```

### **3.2 Frontend Environment Variables**
In your `medport-frontend` service, add:

```
VITE_API_BASE_URL=https://medport-backend.onrender.com/api
VITE_APP_NAME=MedPort
VITE_APP_VERSION=1.0.0
VITE_DEBUG_MODE=false
VITE_LOG_LEVEL=info
```

---

## 🔧 **Step 4: Database Setup**

### **4.1 Run Database Migrations**
1. In your backend service, go to **"Shell"** tab
2. Run these commands:
```bash
cd backend
npx prisma migrate deploy
npx prisma generate
npx prisma db seed
```

### **4.2 Verify Database Connection**
Check the logs to ensure the database connection is successful.

---

## 🚀 **Step 5: Deploy and Test**

### **5.1 Deploy Backend**
1. Click **"Manual Deploy"** → **"Deploy latest commit"**
2. Monitor the build logs for any errors
3. Wait for deployment to complete

### **5.2 Deploy Frontend**
1. Go to your frontend service
2. Click **"Manual Deploy"** → **"Deploy latest commit"**
3. Monitor the build process

### **5.3 Test Your Application**
1. **Backend Health Check**: Visit `https://medport-backend.onrender.com/health`
2. **Frontend**: Visit `https://medport-frontend.onrender.com`
3. **Test Login**: Use demo credentials to verify functionality

---

## 🔍 **Step 6: Troubleshooting Common Issues**

### **6.1 Build Failures**
- Check Node.js version compatibility
- Verify all dependencies are in package.json
- Check build logs for specific error messages

### **6.2 Database Connection Issues**
- Verify DATABASE_URL is correct
- Check if database service is running
- Ensure database migrations have run

### **6.3 CORS Issues**
- Verify CORS_ORIGIN matches your frontend URL exactly
- Check browser console for CORS errors

### **6.4 Environment Variable Issues**
- Verify all required variables are set
- Check variable names match exactly (case-sensitive)
- Restart service after adding new variables

---

## 📊 **Step 7: Monitor and Maintain**

### **7.1 Set Up Monitoring**
- Enable **"Auto-Deploy"** for automatic updates
- Monitor service logs regularly
- Set up alerts for service failures

### **7.2 Performance Optimization**
- Monitor response times
- Check database query performance
- Optimize build times if needed

---

## 🌟 **Production URLs**

After successful deployment, your services will be available at:

- **Frontend**: `https://medport-frontend.onrender.com`
- **Backend API**: `https://medport-backend.onrender.com`
- **Health Check**: `https://medport-backend.onrender.com/health`

---

## 🔐 **Security Considerations**

### **Production Security:**
- ✅ JWT_SECRET is auto-generated and secure
- ✅ CORS is properly configured
- ✅ Environment variables are encrypted
- ✅ Database connection uses SSL
- ✅ Helmet.js security headers enabled

### **API Keys:**
- Store sensitive keys as environment variables
- Never commit API keys to repository
- Rotate keys regularly for production use

---

## 📞 **Support and Maintenance**

### **Render Support:**
- Render provides excellent documentation
- Community forums available
- Email support for paid plans

### **MedPort Specific:**
- Check service logs for application errors
- Monitor database performance
- Regular security updates

---

## 🎉 **Congratulations!**

You now have a fully functional, production-ready MedPort system running on Render!

**Next Steps:**
1. Test all functionality thoroughly
2. Set up monitoring and alerts
3. Configure custom domain (optional)
4. Set up CI/CD for automatic deployments

---

**Need Help?**
- Check Render documentation: [docs.render.com](https://docs.render.com)
- Review service logs for specific errors
- Verify environment variable configuration
- Test database connectivity

**Happy Deploying! 🚀**
