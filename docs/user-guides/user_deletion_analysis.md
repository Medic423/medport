# User Deletion Analysis & Recommendations

**Date**: December 4, 2024  
**Issue**: No way to remove users and their data from the system  
**Problem User**: `nurse@altoonaregional.org` causing odd behavior  
**Context**: Transport Command is global scope for all Healthcare and EMS users

---

## Current State Analysis

### Admin Users Panel (`AdminUsersPanel.tsx`)
- **Location**: `frontend/src/components/AdminUsersPanel.tsx`
- **Current Features**:
  - View all users (CENTER, HEALTHCARE, EMS)
  - Filter by user type
  - Update user properties (`isActive`, `userType`, `orgAdmin`)
  - Reset passwords
  - **Missing**: Delete/Remove user functionality

### Backend User Management (`auth.ts`)
- **Location**: `backend/src/routes/auth.ts`
- **Current Endpoints**:
  - `GET /api/auth/users` - List users
  - `PATCH /api/auth/admin/users/:domain/:id` - Update user
  - `POST /api/auth/admin/users/:domain/:id/reset-password` - Reset password
  - **Missing**: `DELETE /api/auth/admin/users/:domain/:id` - Delete user

---

## Database Schema Relationships

### HealthcareUser Relationships

**Cascade Delete (Automatic)**:
- ✅ `HealthcareLocation[]` - `onDelete: Cascade`
- ✅ `HealthcareAgencyPreference[]` - `onDelete: Cascade`
- ✅ `HealthcareDestination[]` - `onDelete: Cascade`
- ✅ `HealthcareUser[]` (subUsers) - Parent relationship (no explicit cascade, but sub-users reference parent)

**No Cascade (Manual Handling Required)**:
- ⚠️ `TransportRequest.healthcareCreatedById` - **String field, NO foreign key constraint**
- ⚠️ `TransportRequest.createdById` - **String field, NO foreign key constraint**
- ⚠️ `HealthcareUser.parentUserId` - Self-referential (sub-users)

**Current Data**:
- 24 transport requests have `healthcareCreatedById` set
- 2 healthcare users have created trips

### EMSUser Relationships

**Cascade Delete (Automatic)**:
- ✅ None explicitly defined in schema

**No Cascade (Manual Handling Required)**:
- ⚠️ `EMSAgency.agencyId` - Optional relationship (no cascade)
- ⚠️ `EMSUser.parentUserId` - Self-referential (sub-users)
- ⚠️ `Unit.agencyId` - Units belong to agencies, not directly to users

**Note**: EMS users are linked to agencies, but deletion of EMS user doesn't cascade to agency

### CenterUser Relationships

**Cascade Delete (Automatic)**:
- ✅ `NotificationPreference[]` - `onDelete: Cascade`
- ✅ `NotificationLog[]` - `onDelete: Cascade`

**No Cascade (Manual Handling Required)**:
- ⚠️ `TransportRequest.createdById` - **String field, NO foreign key constraint**
- ⚠️ `SystemAnalytics.userId` - Optional String field (no constraint)

---

## Critical Data Relationships

### TransportRequest Fields (No Foreign Keys)
These fields reference user IDs but have **NO foreign key constraints**, meaning:
- Deleting a user won't automatically clean up these references
- These fields can contain orphaned user IDs
- **This is the source of "odd behavior"** - queries may fail or return unexpected results

**Fields to Handle**:
1. `healthcareCreatedById` - Healthcare user who created the trip
2. `createdById` - TCC/Admin user who created the trip (if created via Transport Command)

**Current Impact**:
- 24 trips have `healthcareCreatedById` set
- If user is deleted, these trips will have invalid user IDs
- Dashboard queries filtering by user may fail or show incorrect data

### Sub-User Relationships
- Healthcare users can have sub-users (`parentUserId` relationship)
- EMS users can have sub-users (`parentUserId` relationship)
- **Deletion Strategy**: Must handle sub-users before deleting parent

---

## Recommendations

### Option 1: Soft Delete (Recommended)

**Approach**: Mark users as deleted rather than removing them

**Implementation**:
1. Add `deletedAt` timestamp field to all user tables
2. Add `isDeleted` boolean field (or use `deletedAt IS NOT NULL`)
3. Update all queries to filter out deleted users
4. Keep `isActive` for temporary deactivation, `isDeleted` for permanent removal

**Benefits**:
- ✅ Preserves audit trail
- ✅ No data loss
- ✅ Can restore if needed
- ✅ Historical trips remain valid
- ✅ No cascade delete complications

**Drawbacks**:
- ⚠️ Users remain in database (but hidden)
- ⚠️ Need to update all queries

**Schema Changes**:
```prisma
model HealthcareUser {
  // ... existing fields ...
  deletedAt DateTime?
  isDeleted Boolean @default(false)
}

model EMSUser {
  // ... existing fields ...
  deletedAt DateTime?
  isDeleted Boolean @default(false)
}

model CenterUser {
  // ... existing fields ...
  deletedAt DateTime?
  isDeleted Boolean @default(false)
}
```

### Option 2: Hard Delete with Data Preservation

**Approach**: Delete user but preserve associated data with anonymization

**Implementation**:
1. Before deletion, anonymize user references:
   - Set `healthcareCreatedById` to NULL or special "DELETED_USER" value
   - Set `createdById` to NULL or special value
   - Update `SystemAnalytics.userId` to NULL
2. Delete user record
3. Cascade deletes handle: locations, preferences, destinations, notifications

**Benefits**:
- ✅ Actually removes user from system
- ✅ Preserves trip data (anonymized)
- ✅ Clean database

**Drawbacks**:
- ⚠️ Loses audit trail of who created trips
- ⚠️ More complex implementation
- ⚠️ Need to handle sub-users first

**Implementation Steps**:
1. Check for sub-users → prevent deletion or delete sub-users first
2. Anonymize transport request references
3. Anonymize system analytics references
4. Delete user (cascade handles related data)

### Option 3: Hybrid Approach (Best of Both)

**Approach**: Soft delete by default, hard delete option for admins

**Implementation**:
1. Add `deletedAt` and `isDeleted` fields
2. Default behavior: Soft delete (hide user, preserve data)
3. Admin option: Hard delete with anonymization (after confirmation)
4. Show warning if user has created trips or has sub-users

**Benefits**:
- ✅ Flexible - can restore soft-deleted users
- ✅ Can permanently remove if needed
- ✅ Preserves data integrity
- ✅ Better audit trail

---

## Recommended Implementation Plan

### Phase 1: Database Schema Updates

1. **Add deletion fields**:
   ```prisma
   // Add to HealthcareUser, EMSUser, CenterUser
   deletedAt DateTime?
   isDeleted Boolean @default(false)
   ```

2. **Create migration**:
   - Add fields with default `false`
   - Set `deletedAt` to NULL for existing users

### Phase 2: Backend API

1. **Add DELETE endpoint**:
   ```
   DELETE /api/auth/admin/users/:domain/:id
   ```

2. **Implementation Logic**:
   ```typescript
   // Pseudo-code
   async deleteUser(domain, id) {
     // 1. Check if user exists and is not already deleted
     // 2. Check for sub-users → prevent deletion or require sub-user deletion first
     // 3. Count associated trips (for warning)
     // 4. Soft delete: Set deletedAt, isDeleted = true, isActive = false
     // 5. Optionally anonymize transport request references
     // 6. Return success with summary
   }
   ```

3. **Validation**:
   - Prevent deletion if user has sub-users (or cascade delete sub-users)
   - Show warning if user has created trips
   - Require admin confirmation

### Phase 3: Frontend UI

1. **Add Delete Button** to `AdminUsersPanel.tsx`:
   - Show delete button for each user
   - Disable if user has sub-users (with tooltip)
   - Show warning modal if user has created trips
   - Confirmation dialog with user details

2. **Delete Modal**:
   - Show user information
   - List associated data (trips created, sub-users, etc.)
   - Warning about data preservation
   - Confirmation checkbox
   - Delete button (disabled until confirmed)

3. **Post-Deletion**:
   - Refresh user list
   - Show success message
   - Optionally show "Restore" option for soft-deleted users

### Phase 4: Query Updates

1. **Update all user queries** to exclude deleted users:
   ```typescript
   // Example
   where: {
     isDeleted: false,
     // ... other filters
   }
   ```

2. **Update authentication** to prevent deleted users from logging in:
   ```typescript
   // In login logic
   if (user.isDeleted) {
     return { success: false, error: 'Account has been deleted' };
   }
   ```

---

## Specific Considerations

### Sub-Users Handling

**Option A: Prevent Parent Deletion**
- If user has sub-users, prevent deletion
- Require admin to delete sub-users first
- Show clear error message

**Option B: Cascade Delete Sub-Users**
- When deleting parent, also delete all sub-users
- Show warning: "This will also delete X sub-users"
- Require explicit confirmation

**Recommendation**: Option A (prevent deletion) - safer, more explicit

### Transport Request References

**Current Problem**: `healthcareCreatedById` and `createdById` are String fields with no foreign key

**Solution Options**:
1. **Anonymize**: Set to NULL or special value before deletion
2. **Preserve**: Keep user ID but mark user as deleted (soft delete)
3. **Migrate**: Transfer ownership to admin user or system user

**Recommendation**: Option 2 (soft delete) - preserves audit trail

### Data Integrity

**Before Deletion, Check**:
- ✅ Number of trips created (`healthcareCreatedById` count)
- ✅ Number of sub-users
- ✅ Active status
- ✅ Last login date (if tracked)

**Display in Delete Modal**:
- User name and email
- User type
- Number of trips created
- Number of sub-users
- Account creation date
- Last activity (if available)

---

## Implementation Priority

### High Priority (Fix Current Issue)
1. ✅ Add soft delete fields to schema
2. ✅ Create DELETE endpoint with soft delete
3. ✅ Add delete button to AdminUsersPanel
4. ✅ Update queries to exclude deleted users

### Medium Priority (Enhancement)
1. ⏸️ Add restore functionality for soft-deleted users
2. ⏸️ Add hard delete option (with anonymization)
3. ⏸️ Add deletion audit log

### Low Priority (Future)
1. ⏸️ Add bulk delete functionality
2. ⏸️ Add scheduled deletion (auto-delete after X days)
3. ⏸️ Add export user data before deletion

---

## Testing Considerations

### Test Cases
1. ✅ Delete healthcare user with no trips
2. ✅ Delete healthcare user with trips created
3. ✅ Delete healthcare user with sub-users (should fail)
4. ✅ Delete EMS user with no agency assignments
5. ✅ Delete EMS user with agency assignment
6. ✅ Delete admin user
7. ✅ Verify deleted users don't appear in user lists
8. ✅ Verify deleted users can't log in
9. ✅ Verify trips remain accessible (with anonymized creator)
10. ✅ Verify cascade deletes work (locations, preferences, destinations)

### Edge Cases
- User with both trips created and sub-users
- User who is both parent and sub-user
- User with very old trips (data integrity)
- Concurrent deletion attempts

---

## Security Considerations

1. **Authorization**: Only ADMIN users can delete
2. **Confirmation**: Require explicit confirmation with user details
3. **Audit Trail**: Log all deletions (who, when, what)
4. **Reversibility**: Soft delete allows restoration
5. **Data Protection**: Preserve trip data even if user is deleted

---

## Migration Path

### For Existing Problem Users (e.g., `nurse@altoonaregional.org`)

1. **Immediate Fix**: Soft delete the user
   - Set `isDeleted = true`
   - Set `isActive = false`
   - Set `deletedAt = NOW()`

2. **Data Cleanup**: 
   - Optionally anonymize `healthcareCreatedById` references
   - Or leave as-is (soft delete preserves references)

3. **Verification**:
   - User no longer appears in lists
   - User can't log in
   - Trips remain accessible
   - No errors in queries

---

## Recommended Approach Summary

**Use Soft Delete** as the primary deletion method:
- ✅ Preserves data integrity
- ✅ Maintains audit trail
- ✅ Allows restoration
- ✅ Simpler implementation
- ✅ No cascade delete complications

**Add Hard Delete** as admin option:
- For cases where user must be completely removed
- With proper anonymization of references
- After explicit confirmation and warnings

**Implementation Order**:
1. Schema migration (add deletion fields)
2. Backend DELETE endpoint (soft delete)
3. Frontend delete button and modal
4. Query updates (exclude deleted users)
5. Testing with problem user (`nurse@altoonaregional.org`)

---

## Files to Modify

### Backend
- `backend/prisma/schema.prisma` - Add deletion fields
- `backend/src/routes/auth.ts` - Add DELETE endpoint
- `backend/src/services/authService.ts` - Add delete logic
- Create migration file

### Frontend
- `frontend/src/components/AdminUsersPanel.tsx` - Add delete button and modal
- `frontend/src/services/api.ts` - Add delete API call
- Update user queries to exclude deleted users

### Testing
- Create test cases for deletion scenarios
- Test with `nurse@altoonaregional.org` user

---

## Questions to Resolve

1. **Sub-Users**: Delete parent with sub-users, or prevent deletion?
   - **Recommendation**: Prevent deletion, require sub-user deletion first

2. **Trip References**: Anonymize or preserve?
   - **Recommendation**: Preserve (soft delete keeps references valid)

3. **Restore Functionality**: Needed immediately or can wait?
   - **Recommendation**: Can wait, but plan for it

4. **Hard Delete**: Needed or soft delete sufficient?
   - **Recommendation**: Add as admin option, but soft delete is primary

