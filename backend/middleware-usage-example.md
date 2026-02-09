# Subscription Status Middleware Usage

## Overview

The `checkSubscriptionStatus` middleware checks if a user's trial has expired and blocks access to protected routes if the trial is expired and no paid subscription is active.

## Usage

### Option 1: Apply to Specific Routes

```typescript
import { checkSubscriptionStatus } from '../middleware/checkSubscriptionStatus';
import { authenticateToken } from '../middleware/authenticateAdmin';

// Apply to a specific route
router.get('/protected-route', authenticateToken, checkSubscriptionStatus, async (req, res) => {
  // Route handler
  // Subscription info is available at (req as any).subscriptionInfo
});
```

### Option 2: Apply to All Routes in a Router

```typescript
import { checkSubscriptionStatus } from '../middleware/checkSubscriptionStatus';
import { authenticateToken } from '../middleware/authenticateAdmin';

// Apply to all routes in this router
router.use(authenticateToken);
router.use(checkSubscriptionStatus);

// All routes below will check subscription status
router.get('/route1', async (req, res) => { ... });
router.post('/route2', async (req, res) => { ... });
```

## Important Notes

1. **Order Matters**: `checkSubscriptionStatus` must come AFTER `authenticateToken` or `authenticateAdmin` because it needs `req.user` to be set.

2. **Trial Expired Response**: If a trial is expired, the middleware returns a 403 response with:
   ```json
   {
     "success": false,
     "error": "Your free trial has expired. Please upgrade to a paid account to continue using TRACC.",
     "subscriptionStatus": "EXPIRED",
     "upgradeUrl": "/pricing",
     "daysRemaining": 0
   }
   ```

3. **Subscription Info in Request**: If the check passes, subscription info is added to the request:
   ```typescript
   const subscriptionInfo = (req as any).subscriptionInfo;
   // Contains: status, daysRemaining, trialEndDate, subscriptionPlanName
   ```

4. **Response Headers**: For TRIAL status, the middleware adds `X-Trial-Days-Remaining` header for frontend use.

## When to Use

- **Use**: For routes that require an active subscription (most protected routes)
- **Don't Use**: For public routes, login/registration routes, or routes that should be accessible even with expired trials (like the pricing page)

## Example: Applying to Trips Routes

```typescript
// In routes/trips.ts
import { checkSubscriptionStatus } from '../middleware/checkSubscriptionStatus';

// Apply to all trip creation/management routes
router.post('/', authenticateAdmin, checkSubscriptionStatus, async (req, res) => {
  // Only users with active trial or paid subscription can create trips
});

router.get('/', authenticateAdmin, checkSubscriptionStatus, async (req, res) => {
  // Only users with active trial or paid subscription can view trips
});
```

## Testing

To test expired trial blocking:

1. Create a test user
2. Manually set `trialEndDate` to a past date in the database
3. Try to access a protected route
4. Should receive 403 with upgrade message
