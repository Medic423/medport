# Account Approval Removal & Free-to-Paid Conversion Task

**Created:** February 9, 2026  
**Status:** 📋 TODO  
**Priority:** Medium

---

## Overview

Remove the account approval requirement and implement a free trial period with automatic conversion to paid accounts.

---

## Current Behavior

- **Healthcare accounts:** Require admin approval before activation (24-hour review period)
- **EMS accounts:** Active immediately upon creation
- **Account status:** Accounts are either active or inactive (pending approval)

---

## Target Behavior

- **All accounts:** Active immediately upon creation
- **Free trial period:** 7 days from account creation
- **After trial:** Accounts must convert to paid subscription to continue using TRACC
- **Account status:** Active (free trial) → Active (paid) or Inactive (trial expired)

---

## Tasks Required

### 1. Backend Changes

#### 1.1 Remove Account Approval Logic
- [ ] Update `backend/src/routes/auth.ts`:
  - [ ] Healthcare registration: Set `isActive: true` instead of `isActive: false`
  - [ ] Remove `requiresReview: true` flag from Hospital creation
  - [ ] Remove admin approval workflow

#### 1.2 Add Trial Period Tracking
- [ ] Add `trialStartDate` field to user tables (or use `createdAt`)
- [ ] Add `trialEndDate` calculated field (createdAt + 7 days)
- [ ] Add `accountStatus` enum: `'TRIAL' | 'PAID' | 'EXPIRED'`
- [ ] Update Prisma schema with new fields

#### 1.3 Add Account Status Middleware
- [ ] Create middleware to check account status on protected routes
- [ ] Block access if trial expired and account not paid
- [ ] Return appropriate error messages for expired trials

### 2. Frontend Changes

#### 2.1 Update Registration Success Messages
- [ ] Remove "account will be reviewed" messaging
- [ ] Add "free trial active for 7 days" messaging
- [ ] Update success screens for both Healthcare and EMS registration

#### 2.2 Add Trial Status Display
- [ ] Show trial days remaining in dashboard header
- [ ] Add trial expiration warning (e.g., "3 days left in your free trial")
- [ ] Display account status badge

#### 2.3 Add Upgrade/Conversion UI
- [ ] Create "Upgrade to Paid" button/component
- [ ] Add pricing information display
- [ ] Create conversion flow (payment integration)
- [ ] Show upgrade prompts as trial expiration approaches

### 3. Database Migration

- [ ] Create migration to:
  - [ ] Add `accountStatus` field to all user tables
  - [ ] Set existing accounts to appropriate status
  - [ ] Calculate trial end dates for existing accounts
  - [ ] Backfill `trialStartDate` from `createdAt` for existing accounts

### 4. Payment Integration (Future)

- [ ] Research payment provider (Stripe, PayPal, etc.)
- [ ] Set up payment processing
- [ ] Create subscription management
- [ ] Handle payment webhooks
- [ ] Update account status on successful payment

### 5. Documentation Updates

- [ ] Update Quick Start Guide (already done - mentions free trial)
- [ ] Update user documentation
- [ ] Update admin documentation
- [ ] Create pricing page/FAQ

---

## Implementation Notes

### Account Status Logic

```typescript
enum AccountStatus {
  TRIAL = 'TRIAL',      // Free trial active (0-7 days)
  PAID = 'PAID',        // Paid subscription active
  EXPIRED = 'EXPIRED'   // Trial expired, payment required
}

function getAccountStatus(user: User): AccountStatus {
  const trialEndDate = new Date(user.createdAt);
  trialEndDate.setDate(trialEndDate.getDate() + 7);
  const now = new Date();
  
  if (user.subscriptionStatus === 'ACTIVE') {
    return AccountStatus.PAID;
  }
  
  if (now > trialEndDate) {
    return AccountStatus.EXPIRED;
  }
  
  return AccountStatus.TRIAL;
}
```

### Middleware Example

```typescript
export const checkAccountStatus = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const user = req.user;
  const status = getAccountStatus(user);
  
  if (status === AccountStatus.EXPIRED) {
    return res.status(403).json({
      success: false,
      error: 'Your free trial has expired. Please upgrade to a paid account to continue using TRACC.',
      accountStatus: 'EXPIRED',
      upgradeUrl: '/upgrade'
    });
  }
  
  next();
};
```

---

## Testing Checklist

- [ ] New Healthcare accounts are active immediately
- [ ] New EMS accounts are active immediately
- [ ] Trial period is exactly 7 days
- [ ] Accounts are blocked after trial expiration
- [ ] Upgrade flow works correctly
- [ ] Payment processing updates account status
- [ ] Existing accounts are handled correctly (migration)

---

## Related Files

- `backend/src/routes/auth.ts` - Registration endpoints
- `backend/src/middleware/authenticateAdmin.ts` - Auth middleware (may need updates)
- `frontend/src/components/HealthcareRegistration.tsx` - Healthcare registration form
- `frontend/src/components/EMSRegistration.tsx` - EMS registration form
- `backend/prisma/schema.prisma` - Database schema
- `docs/user-guides/get_started_quick_start.md` - Quick Start Guide (already updated)

---

## Questions to Resolve

1. What happens to accounts that were pending approval when this change goes live?
   - **Answer:** Set them to active with trial period starting from approval date (or creation date)

2. Should there be a grace period after trial expiration?
   - **Answer:** TBD - recommend 3-day grace period with warnings

3. What are the pricing tiers?
   - **Answer:** TBD - need to define pricing structure

4. How do we handle payment failures?
   - **Answer:** TBD - need payment retry logic

---

## Timeline

- **Phase 1:** Remove approval requirement (1-2 days)
- **Phase 2:** Add trial tracking (2-3 days)
- **Phase 3:** Add account status checks (2-3 days)
- **Phase 4:** Payment integration (1-2 weeks)
- **Phase 5:** Testing and refinement (1 week)

**Total Estimated Time:** 3-4 weeks (excluding payment integration)

---

**Note:** This task was identified during Quick Start Guide creation on February 9, 2026. The guide has been updated to reflect the new free trial model.
