# TCC Architecture Documentation

## 🏗️ **System Architecture**

### **Database Architecture (3 Siloed Databases)**
- **Hospital DB (Port 5432)**: Hospital users, facilities, transport requests
- **EMS DB (Port 5433)**: EMS agencies and units
- **Center DB (Port 5434)**: System administration and analytics

### **Backend Architecture**
- **Framework**: Node.js + Express + TypeScript
- **ORM**: Prisma with 3 separate clients
- **Authentication**: JWT-based admin authentication
- **API**: RESTful endpoints for all operations

### **Frontend Architecture**
- **Framework**: React + TypeScript
- **Styling**: Tailwind CSS
- **State Management**: React hooks
- **Routing**: React Router

## 🔐 **Security Model**
- **Admin-Only Access**: Single admin login system
- **JWT Tokens**: Secure authentication
- **Database Isolation**: Separate databases for data security

## 📊 **API Endpoints**
- **Authentication**: `/api/auth/*`
- **Hospitals**: `/api/tcc/hospitals/*`
- **Agencies**: `/api/tcc/agencies/*`
- **Facilities**: `/api/tcc/facilities/*`
- **Analytics**: `/api/tcc/analytics/*`

## 🚀 **Deployment**
- **Development**: Local development servers
- **Production**: Ready for Render deployment
- **Database**: PostgreSQL (local or cloud)
