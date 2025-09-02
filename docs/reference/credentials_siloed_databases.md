# 🔐 Siloed Database Authentication Credentials

**Last Updated**: September 2, 2025  
**Phase**: 3 - Application Integration Complete

## 📋 Test User Credentials

### Center Login (Transport Center/Coordinator)
- **Endpoint**: `POST /api/siloed-auth/center-login`
- **Role**: `COORDINATOR`
- **Email**: `test@medport.test`
- **Password**: `testpass123`
- **User Type**: `CENTER`

### Hospital Login (Admin)
- **Endpoint**: `POST /api/siloed-auth/hospital-login`
- **Role**: `ADMIN`
- **Email**: `admin@medport.test`
- **Password**: `testpass123`
- **User Type**: `CENTER`

### EMS Login (Transport Agency)
- **Endpoint**: `POST /api/siloed-auth/ems-login`
- **Role**: `TRANSPORT_AGENCY`
- **Email**: `.`
- **Password**: `testpass123`
- **User Type**: `CENTER`

## 🧪 Testing Commands

### Center Login Test
```bash
curl -X POST http://localhost:5001/api/siloed-auth/center-login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@medport.test","password":"testpass123"}'
```

### Hospital Login Test
```bash
curl -X POST http://localhost:5001/api/siloed-auth/hospital-login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@medport.test","password":"testpass123"}'
```

### EMS Login Test
```bash
curl -X POST http://localhost:5001/api/siloed-auth/ems-login \
  -H "Content-Type: application/json" \
  -d '{"email":"ems@medport.test","password":"testpass123"}'
```

## 🔧 Database Configuration

### Environment Variables
- **Hospital DB**: `postgresql://scooper@localhost:5432/medport_hospital`
- **EMS DB**: `postgresql://scooper@localhost:5432/medport_ems`
- **Center DB**: `postgresql://scooper@localhost:5432/medport_center`
- **JWT Secret**: `test-secret-key-for-database-siloing`

### Database Architecture
- **Center DB**: All user accounts, system configuration, analytics
- **Hospital DB**: Transport requests, facilities, hospital users
- **EMS DB**: EMS agencies, units, bids, routes

## 🎯 Expected Responses

### Successful Login Response
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "cmf2wpubr0000cc7v9722r6j7",
    "email": "test@medport.test",
    "name": "Test User",
    "role": "COORDINATOR",
    "userType": "CENTER"
  }
}
```

### Invalid Credentials Response
```json
{
  "success": false,
  "message": "Invalid credentials"
}
```

## 🚀 Server Status

- **Backend Server**: Running on port 5001
- **Health Check**: `GET http://localhost:5001/health`
- **Database Connections**: All three siloed databases connected
- **Authentication**: Fully functional with JWT tokens

## 📝 Notes

1. **All users are stored in the Center DB** regardless of their role
2. **JWT tokens include userType and role** for proper authorization
3. **Password hashing** uses bcrypt with 12 salt rounds
4. **Token expiration** is set to 24 hours
5. **Cross-database operations** are handled by DatabaseManager

## 🔄 Creating New Test Users

To create additional test users, use the registration endpoint:

```bash
curl -X POST http://localhost:5001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newuser@medport.test",
    "password": "testpass123",
    "name": "New User",
    "role": "COORDINATOR"
  }'
```

**Available Roles**:
- `ADMIN` - Hospital administrators
- `COORDINATOR` - Transport center coordinators
- `BILLING_STAFF` - Billing department staff
- `TRANSPORT_AGENCY` - EMS agency users

---

**Status**: ✅ All authentication endpoints tested and working  
**Phase 3**: Complete - Application successfully integrated with siloed databases
