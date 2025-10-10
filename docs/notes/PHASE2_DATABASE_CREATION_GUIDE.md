# Phase 2: Vercel Postgres Database Creation Guide
**Date**: October 9, 2025  
**Status**: 🔄 IN PROGRESS

---

## 🎯 **OBJECTIVE**

Create a Vercel Postgres database for the TCC backend and automatically link it to the backend project.

---

## 📋 **STEP-BY-STEP INSTRUCTIONS**

### **Step 1: Access Vercel Dashboard**

1. Open your web browser
2. Go to: **https://vercel.com/dashboard**
3. You should be logged in as **medic423** / **chuck-ferrells-projects**

---

### **Step 2: Navigate to Storage**

**Option A: From Projects View**
1. Click on your **backend** project in the project list
2. Click on the **Storage** tab at the top
3. Click **Create Database** button

**Option B: From Dashboard**
1. Click **Storage** in the left sidebar
2. Click **Create Database** button
3. Select **Postgres** as the database type

---

### **Step 3: Configure Database**

**Database Configuration Screen:**

1. **Database Name**: `tcc-production`
   - This is what you'll see in the Vercel dashboard
   - Can be anything descriptive

2. **Region**: Choose based on your users' location
   - **us-east-1** (Virginia) - East Coast USA
   - **us-west-1** (Oregon) - West Coast USA
   - **eu-west-1** (Frankfurt) - Europe
   - **Recommended**: `us-east-1` (if users are primarily East Coast)

3. **Pricing Plan**: Choose based on needs
   - **Hobby (Free)**:
     - 256 MB storage
     - Good for development/testing
     - 60 hours of compute per month
   - **Pro ($20/month)**:
     - 512 MB storage
     - Better for production
     - Unlimited compute
   - **Recommended**: Start with **Hobby** (free), upgrade if needed

4. **Connect to Project** (IMPORTANT):
   - ✅ **Select**: `backend` project
   - This automatically links the database to your backend
   - Environment variables will be auto-created

---

### **Step 4: Create Database**

1. Review your settings:
   ```
   Name: tcc-production
   Region: us-east-1 (or your choice)
   Plan: Hobby (or Pro)
   Project: backend
   ```

2. Click **Create** button

3. Wait for provisioning (takes 30-60 seconds)
   - You'll see a progress indicator
   - Database will show "Ready" when complete

---

### **Step 5: Verify Database Created**

**You should see:**

1. **Database Overview Page** with:
   - Database name: `tcc-production`
   - Status: ● Ready (green dot)
   - Region: Your selected region
   - Storage usage: 0 B (empty)

2. **Connection Details** (Important - we'll need these):
   - Database URL (will be masked)
   - Prisma URL (for connection pooling)
   - Direct URL (for migrations)

3. **Connected Projects**:
   - Should show: `backend` project linked

---

### **Step 6: Note Environment Variables**

**Vercel automatically creates these environment variables** in your backend project:

```
POSTGRES_URL              - Standard PostgreSQL connection
POSTGRES_PRISMA_URL       - Optimized for Prisma (connection pooling)
POSTGRES_URL_NON_POOLING  - Direct connection (for migrations)
POSTGRES_USER             - Database username
POSTGRES_HOST             - Database hostname
POSTGRES_PASSWORD         - Database password
POSTGRES_DATABASE         - Database name
```

**Plus it creates**:
```
DATABASE_URL - Alias to POSTGRES_PRISMA_URL (what Prisma uses)
```

**You don't need to copy these** - they're automatically available to your backend!

---

### **Step 7: Verify Environment Variables Created**

**In Terminal** (I'll do this for you):
```bash
cd /Users/scooper/Code/tcc-new-project/backend
vercel env ls
```

**Expected Output**:
```
POSTGRES_URL
POSTGRES_PRISMA_URL
POSTGRES_URL_NON_POOLING
DATABASE_URL
... (and potentially others)
```

---

## 🎯 **WHAT HAPPENS AUTOMATICALLY**

When you link the database to the backend project, Vercel:

1. ✅ Creates the Postgres database
2. ✅ Generates secure credentials
3. ✅ Creates all environment variables
4. ✅ Links them to the backend project
5. ✅ Makes them available for deployments
6. ✅ Provides connection pooling URL
7. ✅ Provides direct connection URL (for migrations)

**You don't need to manually configure anything!**

---

## 📊 **DATABASE INFORMATION TO DOCUMENT**

Once created, note these details:

- **Database Name**: `tcc-production` (or what you chose)
- **Region**: (e.g., us-east-1)
- **Plan**: (Hobby or Pro)
- **Status**: Should be "Ready"
- **Linked Project**: `backend`

---

## ⚠️ **IMPORTANT NOTES**

### **Don't Copy Connection Strings**
- Vercel manages these automatically
- They're encrypted and rotatable
- Available as environment variables
- Never hardcode them

### **Database is Empty**
- Newly created database has no tables
- Phase 5 will run Prisma migrations
- This creates all tables and schema

### **Free Tier Limits** (Hobby Plan)
- 256 MB storage (plenty for TCC)
- 60 hours compute/month
- Can upgrade anytime if needed

### **Connection Pooling**
- `POSTGRES_PRISMA_URL` uses pooling
- Better performance for serverless
- Prisma will use this automatically

---

## ✅ **SUCCESS CHECKLIST**

After completing the steps above, verify:

- [ ] Database shows "Ready" status
- [ ] Database named `tcc-production` (or your name)
- [ ] Database linked to `backend` project
- [ ] Can see connection details (masked)
- [ ] Region selected matches your preference
- [ ] Pricing plan selected (Hobby or Pro)

---

## 🚨 **TROUBLESHOOTING**

### **Can't Find Storage Tab**
- Make sure you're in the correct team (chuck-ferrells-projects)
- Storage might be under "Add-ons" or "Integrations" depending on UI

### **Database Creation Fails**
- Check your account has available databases (free tier allows 1-2)
- Verify billing is set up (even for free tier)
- Try a different region

### **Can't Link to Backend Project**
- Make sure backend project exists
- Try creating database first, then linking after

---

## 📝 **NEXT STEPS (Phase 3)**

Once database is created:

1. Verify environment variables (I'll do this via CLI)
2. Pull environment variables locally (for testing)
3. Prepare for database migration (Phase 5)

---

## 🎯 **WHEN YOU'RE DONE**

**Tell me:**
1. ✅ Database creation successful
2. Database name you chose
3. Region you selected
4. Plan you selected (Hobby or Pro)

**Then I'll:**
1. Verify environment variables via CLI
2. Check database connection
3. Prepare for Phase 3 (confirming linkage)

---

**Ready to create the database!** Follow the steps above, then let me know when complete.

