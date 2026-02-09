# Account Approval Removal & Free-to-Paid Conversion Task

**Created:** February 9, 2026  
**Status:** 🚧 IN PROGRESS (Phases 1-4 Complete, Payment Integration Pending)  
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

#### 1.2 Add Subscription Plan System
- [x] Create `SubscriptionPlan` table in Prisma schema with fields:
  - `id` (String, primary key)
  - `name` (String, e.g., "FREE", "REGULAR", "PREMIUM")
  - `displayName` (String, e.g., "Free Trial", "Regular Plan", "Premium Plan")
  - `description` (String, plan description)
  - `userType` (String enum: 'HEALTHCARE' | 'EMS' | 'ALL') - **Which user type this plan applies to**
  - `monthlyPrice` (Decimal, monthly subscription price)
  - `annualPrice` (Decimal, annual subscription price - optional)
  - `features` (JSON array, list of features included)
  - `trialDays` (Int, number of trial days - 7 for FREE, 0 for paid plans)
  - `isActive` (Boolean, whether plan is available for selection)
  - `createdAt`, `updatedAt` (DateTime)
  - **Note:** Healthcare and EMS will have separate pricing structures, so plans are user-type specific
- [x] Add subscription fields to user tables:
  - `subscriptionPlanId` (String, foreign key to SubscriptionPlan)
  - `subscriptionStatus` (String enum: `'TRIAL' | 'ACTIVE' | 'EXPIRED' | 'CANCELLED'`)
  - `trialStartDate` (DateTime, defaults to createdAt)
  - `trialEndDate` (DateTime, calculated: createdAt + 7 days)
  - `subscriptionStartDate` (DateTime?, when paid subscription started)
  - `subscriptionEndDate` (DateTime?, when subscription expires/renews)
  - `billingCycle` (String?, 'MONTHLY' | 'ANNUAL')
- [x] Update Prisma schema with new models and fields

#### 1.3 Add Account Status Middleware
- [x] Create middleware to check account status on protected routes (`checkSubscriptionStatus.ts`)
- [x] Block access if trial expired and account not paid
- [x] Return appropriate error messages for expired trials
- [x] Created `getSubscriptionStatus()` helper function
- [x] Created `checkSubscriptionStatus` middleware
- [x] Updated login endpoints to return subscription status
- [x] Created `/api/auth/subscription/status` endpoint

#### 1.4 Database Migration (pgAdmin 4)
- [x] Created SQL scripts for pgAdmin 4 execution:
  - [x] `01-create-subscription-plans-table.sql` - Creates subscription_plans table
  - [x] `02-seed-subscription-plans.sql` - Seeds Healthcare and EMS plans
  - [x] `03-add-subscription-fields-to-user-tables.sql` - Adds subscription fields to user tables
  - [x] `04-backfill-existing-accounts.sql` - Assigns FREE plans to existing accounts
- [x] **COMPLETED:** All SQL scripts executed successfully in pgAdmin 4
  - [x] Subscription plans table created
  - [x] 6 plans seeded (3 Healthcare + 3 EMS)
  - [x] User tables updated with subscription fields
  - [x] Existing accounts backfilled with FREE plans

### 2. Frontend Changes

#### 2.1 Update Registration Endpoints
- [x] Updated healthcare registration to assign FREE plan and set trial dates
- [x] Updated EMS registration to assign FREE plan and set trial dates
- [x] Both endpoints now calculate `trialStartDate` and `trialEndDate` automatically

#### 2.1a Update Registration Success Messages
- [ ] Remove "account will be reviewed" messaging
- [ ] Add "free trial active for 7 days" messaging
- [ ] Update success screens for both Healthcare and EMS registration

#### 2.2 Add Trial Status Display
- [x] Show trial days remaining in dashboard header (`TrialStatusBadge` component)
- [x] Add trial expiration warning (e.g., "3 days left in your free trial")
- [x] Display account status badge with color coding:
  - Blue: 4+ days remaining
  - Orange: 2-3 days remaining
  - Red: 1 day or expired
- [x] Added to TopMenuBar (TCC Dashboard)
- [x] Added to HealthcareDashboard header
- [x] Added to EMSDashboard header
- [x] Badge is clickable and navigates to `/pricing` page

#### 2.2 Create Subscription Plans API Endpoint
- [x] Created `GET /api/public/subscription-plans` endpoint
- [x] Supports filtering by `userType` query parameter
- [x] Returns plans sorted by userType and plan name (FREE first, then REGULAR, then PREMIUM)
- [x] **TESTED:** All endpoints working correctly
  - [x] Healthcare plans endpoint returns 3 plans with correct pricing
  - [x] EMS plans endpoint returns 3 plans with correct pricing
  - [x] All plans endpoint returns all 6 plans

#### 2.3 Add Pricing Page
- [x] Create `/pricing` route in `frontend/src/App.tsx`
- [x] Create `PricingPage.tsx` component with:
  - [x] **User type selection** (Healthcare vs EMS) - toggle buttons
  - [x] Display subscription plans filtered by user type
  - [x] **Healthcare plans section:** FREE, REGULAR, PREMIUM (healthcare pricing)
  - [x] **EMS plans section:** FREE, REGULAR, PREMIUM (EMS pricing)
  - [x] Plan name, description, and pricing (monthly/annual) - different for each user type
  - [x] Feature comparison list (user-type specific features)
  - [x] "Select Plan" buttons (for paid plans - shows alert for now)
  - [x] "Start Free Trial" button (for FREE plan - redirects to registration)
  - [x] Responsive design matching landing page style
  - [x] FAQ section
- [x] Create API endpoint `GET /api/public/subscription-plans?userType=HEALTHCARE` or `?userType=EMS`
  - Returns plans filtered by userType
  - Default: return all plans if no userType specified
  - Fixed sorting: FREE first, then REGULAR, then PREMIUM
- [x] Update Navigation component:
  - [x] Add "Pricing" link to desktop navigation menu
  - [x] Link navigates to `/pricing`
- [x] Update Footer component:
  - [x] Changed Pricing link from `#` to `/pricing`
- [ ] Update "Ready to Get Started?" section:
  - Add "View Pricing" link/button (optional enhancement - can be done later)

#### 2.4 Add Upgrade/Conversion UI
- [ ] Create "Upgrade to Paid" button/component
- [ ] Add pricing information display in dashboard
- [ ] Create conversion flow (payment integration)
- [ ] Show upgrade prompts as trial expiration approaches
- [ ] Add trial countdown/timer in dashboard header

### 3. Database Migration

- [ ] Create migration to:
  - [ ] Create `subscription_plans` table with `userType` field
  - [ ] Seed Healthcare plans:
    - FREE plan (userType: 'HEALTHCARE', trialDays: 7, monthlyPrice: 0)
    - REGULAR plan (userType: 'HEALTHCARE', trialDays: 0, monthlyPrice: TBD)
    - PREMIUM plan (userType: 'HEALTHCARE', trialDays: 0, monthlyPrice: TBD)
  - [ ] Seed EMS plans:
    - FREE plan (userType: 'EMS', trialDays: 7, monthlyPrice: 0)
    - REGULAR plan (userType: 'EMS', trialDays: 0, monthlyPrice: TBD - different from healthcare)
    - PREMIUM plan (userType: 'EMS', trialDays: 0, monthlyPrice: TBD - different from healthcare)
  - [ ] Add subscription fields to `center_users` table:
    - `subscriptionPlanId` (String, foreign key, default to FREE plan)
    - `subscriptionStatus` (String, default 'TRIAL')
    - `trialStartDate` (DateTime, default to createdAt)
    - `trialEndDate` (DateTime, calculated)
    - `subscriptionStartDate` (DateTime?, nullable)
    - `subscriptionEndDate` (DateTime?, nullable)
    - `billingCycle` (String?, nullable)
  - [ ] Add subscription fields to `healthcare_users` table (same fields)
  - [ ] Add subscription fields to `ems_users` table (same fields)
  - [ ] Set existing accounts to appropriate status:
    - Healthcare accounts → subscriptionPlanId = FREE plan (userType: 'HEALTHCARE')
    - EMS accounts → subscriptionPlanId = FREE plan (userType: 'EMS')
    - All existing accounts → subscriptionStatus = 'TRIAL' (if within 7 days) or 'EXPIRED'
    - Backfill `trialStartDate` from `createdAt` for existing accounts
    - Calculate `trialEndDate` = createdAt + 7 days for existing accounts

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

### Subscription Plan Database Schema

```prisma
model SubscriptionPlan {
  id            String   @id @default(cuid())
  name          String   // "FREE", "REGULAR", "PREMIUM"
  displayName   String   // "Free Trial", "Regular Plan", "Premium Plan"
  description   String   // Plan description
  userType      String   // "HEALTHCARE" | "EMS" | "ALL" - Which user type this plan applies to
  monthlyPrice  Decimal  @db.Decimal(10, 2) // Monthly subscription price
  annualPrice   Decimal? @db.Decimal(10, 2) // Annual subscription price (optional)
  features      Json     // Array of features: ["Feature 1", "Feature 2"]
  trialDays     Int      @default(0) // Number of trial days (7 for FREE, 0 for paid)
  isActive      Boolean  @default(true)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  // Relations
  centerUsers      CenterUser[]
  healthcareUsers  HealthcareUser[]
  emsUsers         EMSUser[]
  
  @@unique([name, userType]) // Ensure unique plan names per user type
  @@index([userType]) // Index for filtering plans by user type
  @@index([isActive]) // Index for filtering active plans
  @@map("subscription_plans")
}
```

**Important:** Healthcare and EMS have different pricing structures, so:
- Healthcare plans: `userType = 'HEALTHCARE'`
- EMS plans: `userType = 'EMS'`
- FREE plan can be `userType = 'ALL'` (applies to both) or separate FREE plans per type

### Account Status Logic

```typescript
enum SubscriptionStatus {
  TRIAL = 'TRIAL',        // Free trial active (0-7 days)
  ACTIVE = 'ACTIVE',      // Paid subscription active
  EXPIRED = 'EXPIRED',    // Trial expired, payment required
  CANCELLED = 'CANCELLED' // Subscription cancelled
}

function getSubscriptionStatus(user: User): SubscriptionStatus {
  const now = new Date();
  
  // If user has active paid subscription
  if (user.subscriptionStatus === 'ACTIVE' && 
      user.subscriptionEndDate && 
      now < user.subscriptionEndDate) {
    return SubscriptionStatus.ACTIVE;
  }
  
  // If subscription was cancelled
  if (user.subscriptionStatus === 'CANCELLED') {
    return SubscriptionStatus.CANCELLED;
  }
  
  // Check trial status
  if (user.trialEndDate && now > user.trialEndDate) {
    return SubscriptionStatus.EXPIRED;
  }
  
  // Default to trial if within trial period
  return SubscriptionStatus.TRIAL;
}

function getDaysRemainingInTrial(user: User): number {
  if (!user.trialEndDate) return 0;
  const now = new Date();
  const diff = user.trialEndDate.getTime() - now.getTime();
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
  return Math.max(0, days);
}
```

### Middleware Example

```typescript
export const checkSubscriptionStatus = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const user = req.user;
  const status = getSubscriptionStatus(user);
  
  if (status === SubscriptionStatus.EXPIRED) {
    return res.status(403).json({
      success: false,
      error: 'Your free trial has expired. Please upgrade to a paid account to continue using TRACC.',
      subscriptionStatus: 'EXPIRED',
      upgradeUrl: '/pricing',
      daysRemaining: 0
    });
  }
  
  if (status === SubscriptionStatus.TRIAL) {
    const daysRemaining = getDaysRemainingInTrial(user);
    // Add trial info to response headers for frontend display
    res.setHeader('X-Trial-Days-Remaining', daysRemaining.toString());
  }
  
  next();
};
```

### Subscription Plan Seed Data

**Healthcare Plans:**

```typescript
const healthcarePlans = [
  {
    name: 'FREE',
    displayName: 'Free Trial',
    description: '7-day free trial to explore TRACC features',
    userType: 'HEALTHCARE',
    monthlyPrice: 0,
    annualPrice: 0,
    features: [
      'Create transport requests',
      'View available EMS providers',
      'Track transport status',
      'Basic analytics',
      'Email notifications'
    ],
    trialDays: 7,
    isActive: true
  },
  {
    name: 'REGULAR',
    displayName: 'Regular Plan',
    description: 'Full access to TRACC for small to medium healthcare facilities',
    userType: 'HEALTHCARE',
    monthlyPrice: 99.00, // TBD - placeholder pricing for healthcare
    annualPrice: 990.00, // TBD - placeholder (save 2 months)
    features: [
      'All Free Trial features',
      'Unlimited transport requests',
      'Advanced analytics and reporting',
      'Priority support',
      'SMS notifications',
      'Multi-location management',
      'Custom integrations'
    ],
    trialDays: 0,
    isActive: true
  },
  {
    name: 'PREMIUM',
    displayName: 'Premium Plan',
    description: 'Enterprise features for large healthcare systems',
    userType: 'HEALTHCARE',
    monthlyPrice: 299.00, // TBD - placeholder pricing for healthcare
    annualPrice: 2990.00, // TBD - placeholder (save 2 months)
    features: [
      'All Regular Plan features',
      'Dedicated account manager',
      'Custom API access',
      'Advanced route optimization',
      'White-label options',
      '24/7 phone support',
      'Custom training sessions'
    ],
    trialDays: 0,
    isActive: true
  }
];
```

**EMS Plans:**

```typescript
const emsPlans = [
  {
    name: 'FREE',
    displayName: 'Free Trial',
    description: '7-day free trial to explore TRACC features',
    userType: 'EMS',
    monthlyPrice: 0,
    annualPrice: 0,
    features: [
      'Receive trip notifications',
      'View available trips',
      'Accept/decline requests',
      'Track completed transports',
      'Basic analytics'
    ],
    trialDays: 7,
    isActive: true
  },
  {
    name: 'REGULAR',
    displayName: 'Regular Plan',
    description: 'Full access to TRACC for small to medium EMS agencies',
    userType: 'EMS',
    monthlyPrice: 79.00, // TBD - placeholder pricing for EMS (different from healthcare)
    annualPrice: 790.00, // TBD - placeholder (save 2 months)
    features: [
      'All Free Trial features',
      'Unlimited trip responses',
      'Advanced analytics and reporting',
      'Priority trip notifications',
      'SMS notifications',
      'Multi-unit management',
      'Route optimization'
    ],
    trialDays: 0,
    isActive: true
  },
  {
    name: 'PREMIUM',
    displayName: 'Premium Plan',
    description: 'Enterprise features for large EMS operations',
    userType: 'EMS',
    monthlyPrice: 199.00, // TBD - placeholder pricing for EMS (different from healthcare)
    annualPrice: 1990.00, // TBD - placeholder (save 2 months)
    features: [
      'All Regular Plan features',
      'Dedicated account manager',
      'Custom API access',
      'Advanced route optimization',
      'Revenue analytics',
      '24/7 phone support',
      'Custom training sessions'
    ],
    trialDays: 0,
    isActive: true
  }
];
```

**Note:** Pricing structures are different for Healthcare vs EMS:
- Healthcare plans focus on creating requests and managing facilities
- EMS plans focus on receiving notifications and managing trips/units
- Pricing will be set separately for each user type (placeholders shown above)

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
- `backend/prisma/schema.prisma` - Database schema (needs SubscriptionPlan model)
- `frontend/src/components/landing/Navigation.tsx` - Landing page navigation (needs Pricing link)
- `frontend/src/components/landing/Footer.tsx` - Landing page footer (needs Pricing link)
- `frontend/src/components/PricingPage.tsx` - NEW: Pricing page component (to be created)
- `docs/user-guides/get_started_quick_start.md` - Quick Start Guide (already updated)

---

## Questions to Resolve

1. What happens to accounts that were pending approval when this change goes live?
   - **Answer:** Set them to active with trial period starting from approval date (or creation date)

2. Should there be a grace period after trial expiration?
   - **Answer:** TBD - recommend 3-day grace period with warnings

3. What are the pricing tiers?
   - **Answer:** Three tiers per user type (different pricing for Healthcare vs EMS):
     - **Healthcare Plans:**
       - **FREE:** 7-day trial, $0/month
       - **REGULAR:** Full access, $99/month (TBD - placeholder pricing)
       - **PREMIUM:** Enterprise features, $299/month (TBD - placeholder pricing)
     - **EMS Plans:**
       - **FREE:** 7-day trial, $0/month
       - **REGULAR:** Full access, $79/month (TBD - placeholder pricing, different from healthcare)
       - **PREMIUM:** Enterprise features, $199/month (TBD - placeholder pricing, different from healthcare)
   - **Note:** Actual pricing to be determined - using placeholders for now. Healthcare and EMS have separate pricing structures.

---

## Database Requirements Summary

### New Table: `subscription_plans`

**Purpose:** Centralized storage for subscription plan definitions and pricing

**Key Fields:**
- Plan identification: `name` (FREE/REGULAR/PREMIUM), `displayName`
- **User type:** `userType` ('HEALTHCARE' | 'EMS' | 'ALL') - **Critical: Different pricing per user type**
- Pricing: `monthlyPrice`, `annualPrice` (optional) - **Different for Healthcare vs EMS**
- Features: `features` (JSON array) - **User-type specific features**
- Trial: `trialDays` (7 for FREE, 0 for paid plans)
- Status: `isActive` (enable/disable plans)

**Relationships:**
- One-to-many with `center_users`, `healthcare_users`, `ems_users`
- Plans are filtered by `userType` when assigning to users

**Important Design Decision:**
- Healthcare facilities and EMS agencies have different needs and pricing
- Same plan names (FREE, REGULAR, PREMIUM) but different pricing/features per user type
- FREE plan can be shared (userType: 'ALL') or separate per type

### User Table Updates

**Add to all three user tables (`center_users`, `healthcare_users`, `ems_users`):**

**Subscription Fields:**
- `subscriptionPlanId` → Foreign key to `subscription_plans`
- `subscriptionStatus` → Enum: 'TRIAL' | 'ACTIVE' | 'EXPIRED' | 'CANCELLED'
- `trialStartDate` → When trial started (defaults to createdAt)
- `trialEndDate` → When trial ends (calculated: createdAt + 7 days)
- `subscriptionStartDate` → When paid subscription started (nullable)
- `subscriptionEndDate` → When subscription expires/renews (nullable)
- `billingCycle` → 'MONTHLY' | 'ANNUAL' (nullable)

**Indexes for Performance:**
- Index on `subscriptionPlanId` (for plan lookups)
- Index on `subscriptionStatus` (for filtering by status)
- Index on `trialEndDate` (for finding expiring trials)

### Migration Strategy

1. **Create `subscription_plans` table** with `userType` field
2. **Seed Healthcare plans** (FREE, REGULAR, PREMIUM with userType: 'HEALTHCARE')
3. **Seed EMS plans** (FREE, REGULAR, PREMIUM with userType: 'EMS')
4. **Add subscription fields** to all three user tables
5. **Set defaults** for existing accounts:
   - Healthcare accounts → `subscriptionPlanId` = FREE plan (userType: 'HEALTHCARE')
   - EMS accounts → `subscriptionPlanId` = FREE plan (userType: 'EMS')
   - All existing accounts → `subscriptionStatus` = 'TRIAL' (if within 7 days) or 'EXPIRED'
   - Backfill `trialStartDate` = `createdAt`
   - Calculate `trialEndDate` = `createdAt` + 7 days
6. **Verify** all accounts have valid subscription plan assignments matching their user type
7. **Add constraint:** Ensure users can only be assigned plans matching their userType

4. How do we handle payment failures?
   - **Answer:** TBD - need payment retry logic

---

## Timeline

- **Phase 1:** Remove approval requirement (✅ COMPLETE)
- **Phase 2:** Database schema and subscription plan system (✅ COMPLETE)
  - ✅ Create SubscriptionPlan model
  - ✅ Add subscription fields to user tables
  - ✅ Create migration with seed data
  - ✅ Run migrations in pgAdmin 4
  - ✅ Test API endpoints
- **Phase 3:** Pricing page and navigation (✅ COMPLETE)
  - ✅ Create PricingPage component
  - ✅ Add Pricing links to navigation and footer
  - ✅ Design pricing display with plan comparison
  - ✅ User type toggle (Healthcare/EMS)
  - ✅ Plan cards with features and pricing
- **Phase 4:** Trial tracking and status checks (✅ COMPLETE)
  - ✅ Update registration to set subscription plan (already done in Phase 2)
  - ✅ Add subscription status middleware (`checkSubscriptionStatus.ts`)
  - ✅ Add trial countdown display (`TrialStatusBadge` component)
  - ✅ Update login endpoints to return subscription info
  - ✅ Add subscription status API endpoint
  - ✅ Integrate badge into all dashboard headers
- **Phase 5:** Payment integration (1-2 weeks)
  - Research and select payment provider
  - Implement payment processing
  - Handle subscription upgrades
- **Phase 6:** Testing and refinement (1 week)

**Total Estimated Time:** 4-5 weeks (excluding payment integration)

---

## Database Schema Design

### New Table: subscription_plans

**Purpose:** Store subscription plan definitions and pricing

**Fields:**
- `id` (String, primary key, cuid)
- `name` (String, unique) - "FREE", "REGULAR", "PREMIUM"
- `displayName` (String) - User-friendly name
- `description` (String) - Plan description
- `monthlyPrice` (Decimal) - Monthly subscription price
- `annualPrice` (Decimal, nullable) - Annual subscription price
- `features` (JSON) - Array of feature strings
- `trialDays` (Int) - Number of trial days (7 for FREE, 0 for paid)
- `isActive` (Boolean) - Whether plan is available
- `createdAt`, `updatedAt` (DateTime)

### User Table Updates

**Add to `center_users`, `healthcare_users`, `ems_users`:**

- `subscriptionPlanId` (String, foreign key to subscription_plans, default: FREE plan)
- `subscriptionStatus` (String enum: 'TRIAL' | 'ACTIVE' | 'EXPIRED' | 'CANCELLED', default: 'TRIAL')
- `trialStartDate` (DateTime, default: createdAt)
- `trialEndDate` (DateTime, calculated: createdAt + 7 days)
- `subscriptionStartDate` (DateTime, nullable)
- `subscriptionEndDate` (DateTime, nullable)
- `billingCycle` (String enum: 'MONTHLY' | 'ANNUAL', nullable)

**Indexes:**
- `@@index([subscriptionPlanId])`
- `@@index([subscriptionStatus])`
- `@@index([trialEndDate])`

---

**Note:** This task was identified during Quick Start Guide creation on February 9, 2026. The guide has been updated to reflect the new free trial model.
