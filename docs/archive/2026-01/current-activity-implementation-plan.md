# Current Activity Implementation Plan
**Date:** January 20, 2026  
**Feature:** Add "Current Activity" section showing currently logged-in/active users  
**Approach:** Activity-based tracking (users active within last X minutes)

---

## Design Decisions ✅ CONFIRMED

### 1. Activity Threshold
**✅ Selected:** **Option B - 15 minutes**
- Users active within last 15 minutes will be shown
- Balances accuracy with practical usefulness

### 2. User Visibility
**✅ Selected:** **Option B - Exclude current user**
- Current user will not see themselves in the list
- Cleaner UI, user knows they're logged in

### 3. User Types to Display
**✅ Selected:** **Option B - Only Healthcare and EMS**
- Admin users excluded from display
- Focus on external users (facilities and agencies)

### 4. Information Displayed
**✅ Selected:** **Custom Order**
Display order:
1. **Facility/Agency Name** (primary identifier)
2. **Location** (city, state)
3. **Last Activity Time** ("Active X minutes ago")
4. **Name** (user's name)

### 5. Auto-Refresh
**✅ Selected:** **Option B - 60 seconds**
- List refreshes every 60 seconds
- Less frequent than Recent Activity (30 seconds) to reduce load

---

## Implementation Plan

### Phase 1: Database Changes (pgAdmin)

#### Step 1.1: Add `lastActivity` Field to User Tables

**File:** `backend/migrations/04-add-lastactivity-to-user-tables.sql` ✅ **CREATED**

**SQL Script:** (File already created - load and execute in pgAdmin)
```sql
-- Migration: Add lastActivity field to user tables
-- Date: January 20, 2026
-- Purpose: Track user activity for "Current Activity" feature
-- Phase: Current Activity Implementation

-- Add lastActivity field to healthcare_users table
ALTER TABLE healthcare_users 
ADD COLUMN IF NOT EXISTS "lastActivity" TIMESTAMP(3);

-- Add lastActivity field to ems_users table
ALTER TABLE ems_users 
ADD COLUMN IF NOT EXISTS "lastActivity" TIMESTAMP(3);

-- Add lastActivity field to center_users table
ALTER TABLE center_users 
ADD COLUMN IF NOT EXISTS "lastActivity" TIMESTAMP(3);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS "healthcare_users_lastActivity_idx" ON healthcare_users("lastActivity");
CREATE INDEX IF NOT EXISTS "ems_users_lastActivity_idx" ON ems_users("lastActivity");
CREATE INDEX IF NOT EXISTS "center_users_lastActivity_idx" ON center_users("lastActivity");

-- Initialize lastActivity with lastLogin for existing users (if lastLogin exists)
UPDATE healthcare_users 
SET "lastActivity" = "lastLogin" 
WHERE "lastActivity" IS NULL AND "lastLogin" IS NOT NULL;

UPDATE ems_users 
SET "lastActivity" = "lastLogin" 
WHERE "lastActivity" IS NULL AND "lastLogin" IS NOT NULL;

UPDATE center_users 
SET "lastActivity" = "lastLogin" 
WHERE "lastActivity" IS NULL AND "lastLogin" IS NOT NULL;

-- Verify columns were added
SELECT 
    table_name,
    column_name,
    data_type
FROM information_schema.columns
WHERE table_name IN ('healthcare_users', 'ems_users', 'center_users')
AND column_name = 'lastActivity'
ORDER BY table_name;

-- Rollback SQL (if needed):
-- ALTER TABLE healthcare_users DROP COLUMN IF EXISTS "lastActivity";
-- ALTER TABLE ems_users DROP COLUMN IF EXISTS "lastActivity";
-- ALTER TABLE center_users DROP COLUMN IF EXISTS "lastActivity";
-- DROP INDEX IF EXISTS "healthcare_users_lastActivity_idx";
-- DROP INDEX IF EXISTS "ems_users_lastActivity_idx";
-- DROP INDEX IF EXISTS "center_users_lastActivity_idx";
```

**Execution:**
1. Open pgAdmin
2. Connect to database (local dev, dev-swa, or production)
3. Open Query Tool
4. Load and execute script using button WITHOUT '1' icon (or F5)
5. Verify 3 rows returned showing `lastActivity` columns

---

### Phase 2: Backend Implementation

#### Step 2.1: Update Prisma Schema

**File:** `backend/prisma/schema.prisma`

**Changes:**
```prisma
model CenterUser {
  // ... existing fields
  lastLogin               DateTime?
  lastActivity            DateTime?  // NEW
  createdAt               DateTime                 @default(now())
  updatedAt               DateTime                 @updatedAt

  @@index([isDeleted])
  @@index([lastLogin])
  @@index([lastActivity])  // NEW
  @@map("center_users")
}

model HealthcareUser {
  // ... existing fields
  lastLogin               DateTime?
  lastActivity            DateTime?  // NEW
  createdAt               DateTime                     @default(now())
  updatedAt               DateTime                     @updatedAt

  @@index([isDeleted])
  @@index([lastLogin])
  @@index([lastActivity])  // NEW
  @@map("healthcare_users")
}

model EMSUser {
  // ... existing fields
  lastLogin               DateTime?
  lastActivity            DateTime?  // NEW
  createdAt               DateTime   @default(now())
  updatedAt               DateTime   @updatedAt

  @@index([isDeleted])
  @@index([lastLogin])
  @@index([lastActivity])  // NEW
  @@map("ems_users")
}
```

**After schema update:**
```bash
npx prisma generate
```

---

#### Step 2.2: Update Authentication Middleware

**File:** `backend/src/middleware/authenticateAdmin.ts`

**Changes:**
Add `lastActivity` update after successful token verification:

```typescript
export const authenticateAdmin = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    // ... existing token extraction code ...

    const user = await authService.verifyToken(token);
    
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired token'
      });
    }

    // Update lastActivity timestamp
    try {
      const db = databaseManager.getPrismaClient();
      const now = new Date();
      
      if (user.userType === 'ADMIN' || user.userType === 'USER') {
        await db.centerUser.update({
          where: { id: user.id },
          data: { lastActivity: now }
        }).catch(err => {
          console.error('Error updating lastActivity for CenterUser:', err);
          // Don't fail request if update fails
        });
      } else if (user.userType === 'HEALTHCARE') {
        await db.healthcareUser.update({
          where: { id: user.id },
          data: { lastActivity: now }
        }).catch(err => {
          console.error('Error updating lastActivity for HealthcareUser:', err);
        });
      } else if (user.userType === 'EMS') {
        await db.eMSUser.update({
          where: { id: user.id },
          data: { lastActivity: now }
        }).catch(err => {
          console.error('Error updating lastActivity for EMSUser:', err);
        });
      }
    } catch (err) {
      console.error('Error updating lastActivity:', err);
      // Don't fail request if activity tracking fails
    }

    req.user = user;
    next();

  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(401).json({
      success: false,
      error: 'Authentication failed'
    });
  }
};
```

**Note:** Import `databaseManager` at top of file if not already imported.

---

#### Step 2.3: Add Method to AnalyticsService

**File:** `backend/src/services/analyticsService.ts`

**Add new method:**

```typescript
/**
 * Get currently active users (users with activity within threshold minutes)
 * OPTION B: One user per facility/agency (most recently active)
 * @param thresholdMinutes - Minutes threshold for "active" (default: 15)
 * @param excludeUserId - User ID to exclude from results (current user)
 * @returns List of active users by type (one per facility/agency)
 */
async getActiveUsers(
  thresholdMinutes: number = 15,
  excludeUserId?: string
): Promise<{
  healthcare: Array<{
    id: string;
    name: string;
    facilityName: string;
    city: string;
    state: string;
    lastActivity: string;
    minutesAgo: number;
  }>;
  ems: Array<{
    id: string;
    name: string;
    agencyName: string;
    city: string;
    state: string;
    lastActivity: string;
    minutesAgo: number;
  }>;
}> {
  const db = databaseManager.getPrismaClient();
  const threshold = new Date(Date.now() - thresholdMinutes * 60 * 1000);

  // Build where clause to exclude user if provided
  const excludeWhere = excludeUserId ? { id: { not: excludeUserId } } : {};

  // Get active healthcare users with location data
  // Order by lastActivity DESC to get most recent first
  const activeHealthcare = await db.healthcareUser.findMany({
    where: {
      ...excludeWhere,
      isActive: true,
      isDeleted: false,
      lastActivity: {
        gte: threshold
      }
    },
    select: {
      id: true,
      name: true,
      facilityName: true,
      lastActivity: true,
      locations: {
        where: {
          isActive: true,
          isPrimary: true  // Get primary location first
        },
        select: {
          city: true,
          state: true
        },
        take: 1
      }
    },
    orderBy: {
      lastActivity: 'desc'
    }
  });

  // Get active EMS users with agency location data
  const activeEMS = await db.eMSUser.findMany({
    where: {
      ...excludeWhere,
      isActive: true,
      isDeleted: false,
      lastActivity: {
        gte: threshold
      }
    },
    select: {
      id: true,
      name: true,
      agencyName: true,
      lastActivity: true,
      agency: {
        select: {
          city: true,
          state: true
        }
      }
    },
    orderBy: {
      lastActivity: 'desc'
    }
  });

  // OPTION B: Group by facilityName/agencyName and keep only most recent user per facility/agency
  const healthcareByFacility = new Map<string, any>();
  activeHealthcare.forEach(user => {
    const facilityName = user.facilityName;
    const existing = healthcareByFacility.get(facilityName);
    if (!existing || new Date(user.lastActivity) > new Date(existing.lastActivity)) {
      healthcareByFacility.set(facilityName, user);
    }
  });

  const emsByAgency = new Map<string, any>();
  activeEMS.forEach(user => {
    const agencyName = user.agencyName;
    const existing = emsByAgency.get(agencyName);
    if (!existing || new Date(user.lastActivity) > new Date(existing.lastActivity)) {
      emsByAgency.set(agencyName, user);
    }
  });

  // Calculate minutes ago for each user and format with location
  const now = Date.now();
  
  const formatHealthcareUser = (user: any) => {
    const lastActivityTime = user.lastActivity ? new Date(user.lastActivity).getTime() : 0;
    const minutesAgo = Math.floor((now - lastActivityTime) / (60 * 1000));
    const location = user.locations && user.locations.length > 0 
      ? user.locations[0] 
      : null;
    
    return {
      id: user.id,
      name: user.name,
      facilityName: user.facilityName,
      city: location?.city || 'N/A',
      state: location?.state || 'N/A',
      lastActivity: user.lastActivity?.toISOString() || '',
      minutesAgo
    };
  };

  const formatEMSUser = (user: any) => {
    const lastActivityTime = user.lastActivity ? new Date(user.lastActivity).getTime() : 0;
    const minutesAgo = Math.floor((now - lastActivityTime) / (60 * 1000));
    
    return {
      id: user.id,
      name: user.name,
      agencyName: user.agencyName,
      city: user.agency?.city || 'N/A',
      state: user.agency?.state || 'N/A',
      lastActivity: user.lastActivity?.toISOString() || '',
      minutesAgo
    };
  };

  return {
    healthcare: Array.from(healthcareByFacility.values()).map(formatHealthcareUser),
    ems: Array.from(emsByAgency.values()).map(formatEMSUser)
  };
}

/**
 * Get facilities/agencies online statistics (24h and 7 days)
 * @returns Count of distinct facilities/agencies with at least one active user
 */
async getFacilitiesOnlineStats(): Promise<{
  healthcare: {
    last24Hours: number;
    lastWeek: number;
  };
  ems: {
    last24Hours: number;
    lastWeek: number;
  };
  total: {
    last24Hours: number;
    lastWeek: number;
  };
}> {
  const db = databaseManager.getPrismaClient();
  const now = new Date();
  const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  // Healthcare: Count distinct facilities with at least one active user
  const healthcare24h = await db.healthcareUser.findMany({
    where: {
      isActive: true,
      isDeleted: false,
      lastActivity: { gte: last24Hours }
    },
    select: {
      facilityName: true
    },
    distinct: ['facilityName']
  });

  const healthcareWeek = await db.healthcareUser.findMany({
    where: {
      isActive: true,
      isDeleted: false,
      lastActivity: { gte: lastWeek }
    },
    select: {
      facilityName: true
    },
    distinct: ['facilityName']
  });

  // EMS: Count distinct agencies with at least one active user
  const ems24h = await db.eMSUser.findMany({
    where: {
      isActive: true,
      isDeleted: false,
      lastActivity: { gte: last24Hours }
    },
    select: {
      agencyName: true
    },
    distinct: ['agencyName']
  });

  const emsWeek = await db.eMSUser.findMany({
    where: {
      isActive: true,
      isDeleted: false,
      lastActivity: { gte: lastWeek }
    },
    select: {
      agencyName: true
    },
    distinct: ['agencyName']
  });

  return {
    healthcare: {
      last24Hours: healthcare24h.length,
      lastWeek: healthcareWeek.length
    },
    ems: {
      last24Hours: ems24h.length,
      lastWeek: emsWeek.length
    },
    total: {
      last24Hours: healthcare24h.length + ems24h.length,
      lastWeek: healthcareWeek.length + emsWeek.length
    }
  };
}
```

---

#### Step 2.4: Add Analytics Route

**File:** `backend/src/routes/analytics.ts`

**Add new endpoint:**

```typescript
/**
 * GET /api/tcc/analytics/active-users
 * Get currently active users
 * Query params:
 *   - threshold: Minutes threshold (default: 15)
 *   - excludeCurrent: Exclude current user (default: true)
 */
router.get('/active-users', authenticateAdmin, async (req: AuthenticatedRequest, res) => {
  try {
    const threshold = req.query.threshold 
      ? parseInt(req.query.threshold as string, 10) 
      : 15; // Default 15 minutes
    
    const excludeCurrent = req.query.excludeCurrent !== 'false'; // Default true
    const excludeUserId = excludeCurrent && req.user ? req.user.id : undefined;

    const activeUsers = await analyticsService.getActiveUsers(threshold, excludeUserId);

    res.json({
      success: true,
      data: activeUsers,
      threshold,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching active users:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch active users'
    });
  }
});

/**
 * GET /api/tcc/analytics/facilities-online
 * Get facilities/agencies online statistics (24h and 7 days)
 */
router.get('/facilities-online', authenticateAdmin, async (req: AuthenticatedRequest, res) => {
  try {
    const stats = await analyticsService.getFacilitiesOnlineStats();

    res.json({
      success: true,
      data: stats,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching facilities online stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch facilities online statistics'
    });
  }
});
```

---

### Phase 3: Frontend Implementation

#### Step 3.1: Add API Method

**File:** `frontend/src/services/api.ts`

**Add to `analyticsAPI` object:**

```typescript
export const analyticsAPI = {
  // ... existing methods ...
  
  getActiveUsers: (threshold?: number, excludeCurrent?: boolean) =>
    api.get('/api/tcc/analytics/active-users', { 
      params: { 
        threshold: threshold || 15,
        excludeCurrent: excludeCurrent !== false 
      } 
    }),
  
  getFacilitiesOnline: () =>
    api.get('/api/tcc/analytics/facilities-online'),
};
```

---

#### Step 3.2: Update TCCOverview Component

**File:** `frontend/src/components/TCCOverview.tsx`

**Add interfaces:**

```typescript
interface ActiveUserListItem {
  id: string;
  name: string;
  facilityName?: string;
  agencyName?: string;
  city: string;
  state: string;
  lastActivity: string;
  minutesAgo: number;
}

interface ActiveUsersList {
  healthcare: ActiveUserListItem[];
  ems: ActiveUserListItem[];
}
```

**Add state:**

```typescript
const [activeUsers, setActiveUsers] = useState<ActiveUsersList | null>(null);
const [activeUsersLoading, setActiveUsersLoading] = useState(false);
const [showActiveUsers, setShowActiveUsers] = useState(false);
const [facilitiesOnline, setFacilitiesOnline] = useState<{
  healthcare: { last24Hours: number; lastWeek: number };
  ems: { last24Hours: number; lastWeek: number };
  total: { last24Hours: number; lastWeek: number };
} | null>(null);
const [facilitiesOnlineLoading, setFacilitiesOnlineLoading] = useState(false);
```

**Add fetch functions:**

```typescript
const fetchActiveUsers = async () => {
  setActiveUsersLoading(true);
  try {
    const response = await analyticsAPI.getActiveUsers(15, true);
    if (response.data.success) {
      setActiveUsers(response.data.data);
    }
  } catch (error) {
    console.error('Error fetching active users:', error);
  } finally {
    setActiveUsersLoading(false);
  }
};

const fetchFacilitiesOnline = async () => {
  setFacilitiesOnlineLoading(true);
  try {
    const response = await analyticsAPI.getFacilitiesOnline();
    if (response.data.success) {
      setFacilitiesOnline(response.data.data);
    }
  } catch (error) {
    console.error('Error fetching facilities online stats:', error);
  } finally {
    setFacilitiesOnlineLoading(false);
  }
};
```

**Add to useEffect for auto-refresh:**

```typescript
useEffect(() => {
  fetchOverview();
  fetchActiveUsers();
  fetchFacilitiesOnline(); // Add this
  
  // Set up auto-refresh interval (60 seconds for active users, 30 seconds for overview)
  const overviewInterval = setInterval(() => {
    fetchOverview();
  }, 30000); // 30 seconds for overview
  
  const activeUsersInterval = setInterval(() => {
    if (showActiveUsers) {
      fetchActiveUsers();
    }
    fetchFacilitiesOnline(); // Refresh facilities online stats
  }, 60000); // 60 seconds for active users and facilities online

  return () => {
    clearInterval(overviewInterval);
    clearInterval(activeUsersInterval);
  };
}, [showActiveUsers]);
```

**Add UI section (after Recent Activity section):**

```typescript
{/* Current Activity Section */}
<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mt-6">
  <div className="flex items-center justify-between mb-4">
    <h2 className="text-lg font-bold text-gray-900">Current Activity</h2>
    <div className="flex items-center space-x-2">
      <Activity className="h-5 w-5 text-green-500" />
      <button
        onClick={() => {
          setShowActiveUsers(!showActiveUsers);
          if (!showActiveUsers && !activeUsers) {
            fetchActiveUsers();
          }
        }}
        className="text-sm text-blue-600 hover:text-blue-800 font-medium"
      >
        {showActiveUsers ? 'Hide' : 'Show'} List
      </button>
    </div>
  </div>
  
  {/* Facilities Online Stats */}
  {facilitiesOnlineLoading ? (
    <div className="text-center py-2">
      <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
    </div>
  ) : facilitiesOnline ? (
    <div className="grid grid-cols-2 gap-4 mb-4">
      <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
        <p className="font-semibold text-purple-800 text-lg">
          {facilitiesOnline.total.last24Hours}
        </p>
        <p className="text-sm text-gray-600">Facilities Online (24h)</p>
      </div>
      <div className="p-3 bg-indigo-50 rounded-lg border border-indigo-200">
        <p className="font-semibold text-indigo-800 text-lg">
          {facilitiesOnline.total.lastWeek}
        </p>
        <p className="text-sm text-gray-600">Facilities Online (Week)</p>
      </div>
    </div>
  ) : null}
  
  {activeUsersLoading ? (
    <div className="text-center py-4">
      <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
      <p className="mt-2 text-sm text-gray-600">Loading active users...</p>
    </div>
  ) : activeUsers ? (
    <div className="space-y-2">
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="p-3 bg-green-50 rounded-lg">
          <p className="font-semibold text-green-800">
            {activeUsers.healthcare.length + activeUsers.ems.length}
          </p>
          <p className="text-gray-600">Currently Active</p>
        </div>
        <div className="p-3 bg-blue-50 rounded-lg">
          <p className="font-semibold text-blue-800">{activeUsers.healthcare.length}</p>
          <p className="text-gray-600">Healthcare</p>
        </div>
        <div className="p-3 bg-red-50 rounded-lg">
          <p className="font-semibold text-red-800">{activeUsers.ems.length}</p>
          <p className="text-gray-600">EMS</p>
        </div>
      </div>
      
      {showActiveUsers && (
        <div className="mt-4 space-y-2 max-h-96 overflow-y-auto">
          {/* Healthcare Users */}
          {activeUsers.healthcare.map((user) => (
            <div key={user.id} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  {/* Display Order: 1. Facility Name, 2. Location, 3. Last Activity, 4. Name */}
                  <p className="font-semibold text-gray-900">{user.facilityName}</p>
                  <p className="text-sm text-gray-600 mt-1">
                    {user.city}, {user.state}
                  </p>
                  <div className="flex items-center space-x-2 mt-2">
                    <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                    <span className="text-xs text-gray-600">
                      {user.minutesAgo === 0 
                        ? 'Just now' 
                        : `Active ${user.minutesAgo} min${user.minutesAgo > 1 ? 's' : ''} ago`}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">{user.name}</p>
                </div>
                <div className="ml-4">
                  <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
                    Healthcare
                  </span>
                </div>
              </div>
            </div>
          ))}
          
          {/* EMS Users */}
          {activeUsers.ems.map((user) => (
            <div key={user.id} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  {/* Display Order: 1. Agency Name, 2. Location, 3. Last Activity, 4. Name */}
                  <p className="font-semibold text-gray-900">{user.agencyName}</p>
                  <p className="text-sm text-gray-600 mt-1">
                    {user.city}, {user.state}
                  </p>
                  <div className="flex items-center space-x-2 mt-2">
                    <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                    <span className="text-xs text-gray-600">
                      {user.minutesAgo === 0 
                        ? 'Just now' 
                        : `Active ${user.minutesAgo} min${user.minutesAgo > 1 ? 's' : ''} ago`}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">{user.name}</p>
                </div>
                <div className="ml-4">
                  <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-800">
                    EMS
                  </span>
                </div>
              </div>
            </div>
          ))}
          
          {/* Empty State */}
          {activeUsers.healthcare.length === 0 && 
           activeUsers.ems.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Activity className="h-12 w-12 mx-auto mb-2 text-gray-300" />
              <p>No active users at this time</p>
            </div>
          )}
        </div>
      )}
    </div>
  ) : (
    <div className="text-center py-4 text-gray-500">
      <p className="text-sm">Click "Show List" to view active users</p>
    </div>
  )}
</div>
```

---

## Testing Plan

### Local Dev Testing
1. [ ] Run database migration in pgAdmin
2. [ ] Update Prisma schema and regenerate client
3. [ ] Test middleware updates `lastActivity` on API calls
4. [ ] Test `/api/tcc/analytics/active-users` endpoint
5. [ ] Test frontend displays active users correctly
6. [ ] Test auto-refresh (30 seconds)
7. [ ] Test "Show List" / "Hide List" toggle
8. [ ] Test with multiple users logged in simultaneously

### Dev-SWA Testing
1. [ ] Run database migration in pgAdmin (dev-swa database)
2. [ ] Deploy backend changes
3. [ ] Deploy frontend changes
4. [ ] Test with real users
5. [ ] Verify activity tracking works across different user types

### Production Testing
1. [ ] Run database migration in pgAdmin (production database)
2. [ ] Deploy backend changes
3. [ ] Deploy frontend changes
4. [ ] Monitor for any performance issues
5. [ ] Verify activity tracking doesn't impact performance

---

## Performance Considerations

### Database Impact
- **Indexes:** Already created for `lastActivity` columns
- **Update Frequency:** Updates on every authenticated API request
- **Query Performance:** Indexed queries should be fast (< 50ms)

### Optimization Options (if needed)
1. **Throttle Updates:** Only update `lastActivity` if > 1 minute since last update
2. **Batch Updates:** Update multiple users in single query
3. **Caching:** Cache active users list for 10-15 seconds

---

## Rollback Plan

### Database Rollback
```sql
-- Remove lastActivity columns
ALTER TABLE healthcare_users DROP COLUMN IF EXISTS "lastActivity";
ALTER TABLE ems_users DROP COLUMN IF EXISTS "lastActivity";
ALTER TABLE center_users DROP COLUMN IF EXISTS "lastActivity";

-- Remove indexes
DROP INDEX IF EXISTS "healthcare_users_lastActivity_idx";
DROP INDEX IF EXISTS "ems_users_lastActivity_idx";
DROP INDEX IF EXISTS "center_users_lastActivity_idx";
```

### Code Rollback
- Revert backend middleware changes
- Revert analytics service changes
- Revert frontend component changes
- Redeploy previous versions

---

## Estimated Time

- **Database Migration:** 15 minutes (pgAdmin)
- **Backend Changes:** 2-3 hours
  - Prisma schema update: 15 min
  - Middleware update: 30 min
  - Analytics service: 45 min
  - Route endpoint: 30 min
  - Testing: 30 min
- **Frontend Changes:** 1-2 hours
  - API integration: 15 min
  - Component updates: 45 min
  - UI styling: 30 min
  - Testing: 30 min
- **Total:** 3-5 hours

---

## Additional Design Questions

### Question 1: Facility/Agency Grouping for "Current Activity"

**Context:** Healthcare organizations can have multiple users (1 org admin + N subusers) sharing the same `facilityName`. EMS agencies can similarly have multiple users sharing the same `agencyName`.

**Current Implementation:** Shows all active users individually, which could result in long lists if a facility has many active users.

**Options:**

**Option A: Show All Active Users (Current Plan)**
- ✅ Pros: Complete visibility, shows which specific users are active
- ❌ Cons: Can create very long lists for facilities with many users
- **Example:** "City Hospital" with 10 active users = 10 entries

**Option B: One User Per Facility/Agency (Most Recent)**
- ✅ Pros: Shorter, cleaner list; shows facility/agency activity, not individual users
- ❌ Cons: Less granular; doesn't show if multiple users from same facility are active
- **Implementation:** Group by `facilityName`/`agencyName`, show only the user with most recent `lastActivity`
- **Example:** "City Hospital" with 10 active users = 1 entry (most recent)

**Option C: One User Per Facility/Agency (Org Admin Preferred)**
- ✅ Pros: Shows the "primary" user; shorter list
- ❌ Cons: May not show actual most recent activity if org admin isn't active
- **Implementation:** Group by `facilityName`/`agencyName`, prefer `orgAdmin = true`, fallback to most recent
- **Example:** "City Hospital" with 10 active users = 1 entry (org admin if active, else most recent)

**Option D: Show Count Per Facility/Agency**
- ✅ Pros: Shows both facility activity AND how many users are active
- ❌ Cons: More complex UI; still need to decide which user to display
- **Implementation:** Group by `facilityName`/`agencyName`, show count + one representative user
- **Example:** "City Hospital (3 active users) - John Doe, Active 2 mins ago"

**✅ Selected:** **Option B (Most Recent)** - One user per facility/agency (most recently active)
- Cleanest for TCC admins who want to see which facilities/agencies are active
- Keeps lists shorter and more manageable
- Implementation: Group by `facilityName`/`agencyName`, show only the user with most recent `lastActivity`

---

### Question 2: Facilities Online in Last 24 Hours / One Week

**Question:** Should we add metrics showing "Facilities online in last 24 hours" and "Facilities online in last week"?

**Answer:** ✅ **No DB schema changes required** - Can be implemented with aggregation queries using existing `lastActivity` field.

**Implementation Approach:**

```typescript
// Example query structure (no schema changes needed)
async getFacilitiesOnlineStats() {
  const db = databaseManager.getPrismaClient();
  const now = new Date();
  const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  // Healthcare: Count distinct facilities with at least one active user
  const healthcare24h = await db.healthcareUser.groupBy({
    by: ['facilityName'],
    where: {
      isActive: true,
      isDeleted: false,
      lastActivity: { gte: last24Hours }
    },
    _count: { id: true }
  });

  const healthcareWeek = await db.healthcareUser.groupBy({
    by: ['facilityName'],
    where: {
      isActive: true,
      isDeleted: false,
      lastActivity: { gte: lastWeek }
    },
    _count: { id: true }
  });

  // EMS: Count distinct agencies with at least one active user
  const ems24h = await db.eMSUser.groupBy({
    by: ['agencyName'],
    where: {
      isActive: true,
      isDeleted: false,
      lastActivity: { gte: last24Hours }
    },
    _count: { id: true }
  });

  const emsWeek = await db.eMSUser.groupBy({
    by: ['agencyName'],
    where: {
      isActive: true,
      isDeleted: false,
      lastActivity: { gte: lastWeek }
    },
    _count: { id: true }
  });

  return {
    healthcare: {
      last24Hours: healthcare24h.length,
      lastWeek: healthcareWeek.length
    },
    ems: {
      last24Hours: ems24h.length,
      lastWeek: emsWeek.length
    },
    total: {
      last24Hours: healthcare24h.length + ems24h.length,
      lastWeek: healthcareWeek.length + emsWeek.length
    }
  };
}
```

**✅ Selected:** **Add to this phase** - Include "Facilities Online" metrics (24h/week)

**Where to Display:**
- Add as summary cards in "Current Activity" section
- Show: "Facilities Online (24h): X" and "Facilities Online (Week): Y"

**Performance:** Should be efficient with `lastActivity` indexes already in place.

---

## Success Criteria

- ✅ `lastActivity` field added to all three user tables
- ✅ Middleware updates `lastActivity` on authenticated requests
- ✅ Backend endpoint returns active users correctly (Healthcare and EMS only)
- ✅ One user per facility/agency (most recently active) - Option B
- ✅ Frontend displays active users with correct information in order: Facility/Agency Name → Location → Last Activity Time → Name
- ✅ Current user excluded from list
- ✅ Facilities Online stats (24h/week) displayed
- ✅ Auto-refresh works (updates every 60 seconds)
- ✅ No performance degradation
- ✅ Works correctly for all user types

---

## Notes

- **Activity Threshold:** 15 minutes (configurable via query param)
- **Update Frequency:** Updates on every authenticated API request
- **Refresh Rate:** Frontend refreshes every 60 seconds
- **User Types:** Healthcare and EMS only (Admin excluded)
- **Current User:** Excluded from list
- **Display Order:** Facility/Agency Name → Location → Last Activity Time → Name
- **Grouping:** One user per facility/agency (most recently active) - Option B
- **Facilities Online:** Shows count of distinct facilities/agencies active in last 24h and 7 days
- **Accuracy:** Shows users who made API requests within threshold window
- **Privacy:** Only shows active status, not specific actions or data
