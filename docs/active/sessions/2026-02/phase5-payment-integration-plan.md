# Phase 5: Payment Integration Plan

**Created:** February 9, 2026  
**Status:** 📋 PLANNING  
**Dependencies:** Phases 1-4 Complete, Phase 2.4 Complete

---

## Overview

Implement payment processing to enable users to upgrade from free trial to paid subscriptions (REGULAR or PREMIUM plans). This phase will integrate a payment provider, handle subscription creation, manage recurring billing, and process subscription lifecycle events.

---

## Decisions Made ✅

### 1. Payment Provider Selection
- **✅ Selected:** **Stripe** (Recommended)
- **Rationale:** Robust subscription management, excellent documentation, supports subscriptions, webhooks, and multiple payment methods

### 2. Payment Methods
- **✅ Selected:** **All payment methods**
  - Credit/Debit cards (Visa, Mastercard, Amex, Discover)
  - ACH/Bank transfers
  - PayPal (via Stripe)
- **Implementation:** Stripe supports all these methods through their Checkout and Payment Intents API

### 3. Subscription Billing
- **✅ Selected:** **Allow monthly/annual choice at upgrade**
- **Implementation:** Monthly/annual toggle already exists in UpgradeModal component

### 4. Trial-to-Paid Conversion
- **✅ Selected:** **Option B - Trial continues until expiration, then paid subscription starts**
- **Rationale:** User gets full trial period value, subscription starts after trial ends
- **Implementation:** Set `subscriptionStartDate` to `trialEndDate` when user upgrades during trial

### 5. Subscription Renewals
- **✅ Selected:** **Auto-renew by default with email notification 7 days before renewal**
- **Implementation:** Stripe handles auto-renewal, we send email notification via webhook

### 6. Failed Payment Handling
- **✅ Selected:** **Option B - 7-day grace period with retries, then suspension**
- **Implementation:** Stripe retries failed payments, we monitor via webhooks and suspend after grace period

### 7. Cancellation Policy
- **✅ Selected:** **Option B - Cancel at period end (access continues until paid period expires)**
- **Implementation:** Set subscription to cancel at period end, maintain access until then

### 8. Refund Policy
- **✅ Selected:** **No refunds initially**
- **Implementation:** No refund processing needed initially, can add later if needed

### 9. Testing Environment
- **✅ Selected:** **Payment provider test mode (Stripe test cards)**
- **Implementation:** Use Stripe test mode for development and testing

### 10. Security & Compliance
- **✅ Selected:** **HIPAA considerations**
- **Implementation Notes:**
  - Use Stripe's hosted checkout (PCI compliant)
  - Never store card details or PHI in payment records
  - Ensure payment data is encrypted in transit
  - Payment records should not contain patient information
  - Use Stripe's secure webhook verification

---

## Implementation Plan ✅

### Phase 5.1: Payment Provider Setup
- [ ] Select payment provider (based on your preference)
- [ ] Create payment provider account (development/test)
- [ ] Install payment provider SDK/package
- [ ] Configure API keys (environment variables)
- [ ] Set up webhook endpoints (for subscription events)

### Phase 5.2: Backend Payment Processing
- [ ] Install Stripe SDK: `npm install stripe @types/stripe`
- [ ] Create payment service module (`backend/src/services/paymentService.ts`):
  - Initialize Stripe client
  - Create checkout session (supports cards, ACH, PayPal)
  - Create customer in Stripe
  - Create subscription in Stripe
  - Handle trial-to-paid conversion (subscriptionStartDate = trialEndDate)
- [ ] Create subscription management service (`backend/src/services/subscriptionService.ts`):
  - Update subscription status
  - Handle subscription lifecycle
  - Calculate next billing date
- [ ] Add payment routes (`backend/src/routes/payments.ts`):
  - `POST /api/payments/create-checkout-session` - Create Stripe checkout session
    - Accepts: planId, billingCycle (MONTHLY/ANNUAL), userType
    - Returns: checkout session URL
  - `GET /api/payments/subscription-status` - Get subscription payment status
  - `POST /api/payments/cancel-subscription` - Cancel subscription (at period end)
  - `POST /api/payments/update-payment-method` - Update payment method
  - `POST /api/payments/webhook` - Handle Stripe webhooks (verify signature)
- [ ] Update user subscription status on successful payment
- [ ] Handle subscription lifecycle events (renewal, cancellation, failure)
- [ ] Implement 7-day grace period logic for failed payments

### Phase 5.3: Database Updates
- [ ] Add payment-related fields to user tables (`center_users`, `healthcare_users`, `ems_users`):
  - `stripeCustomerId` (TEXT, nullable) - Stripe customer ID
  - `stripeSubscriptionId` (TEXT, nullable) - Stripe subscription ID
  - `paymentMethodId` (TEXT, nullable) - Last used payment method ID
  - `lastPaymentDate` (TIMESTAMP, nullable) - Last successful payment date
  - `nextBillingDate` (TIMESTAMP, nullable) - Next billing date
  - `paymentStatus` (TEXT, nullable) - Payment status (active, past_due, cancelled, etc.)
  - `gracePeriodEndDate` (TIMESTAMP, nullable) - End of grace period for failed payments
- [ ] Create `payment_history` table (for audit trail, HIPAA compliance):
  - `id` (TEXT, primary key)
  - `userId` (TEXT, foreign key)
  - `userType` (TEXT) - HEALTHCARE | EMS
  - `amount` (DECIMAL) - Payment amount
  - `currency` (TEXT) - USD
  - `status` (TEXT) - succeeded, failed, pending
  - `stripePaymentIntentId` (TEXT) - Stripe payment intent ID
  - `stripeInvoiceId` (TEXT, nullable) - Stripe invoice ID
  - `billingCycle` (TEXT) - MONTHLY | ANNUAL
  - `planName` (TEXT) - Plan name
  - `createdAt` (TIMESTAMP)
  - **Note:** No PHI stored in payment records (HIPAA compliance)
- [ ] Create migration scripts for pgAdmin 4:
  - `05-add-payment-fields-to-user-tables.sql`
  - `06-create-payment-history-table.sql`


### Phase 5.5: Webhook Handling
- [ ] Create webhook endpoint (`POST /api/payments/webhook`)
- [ ] Verify webhook signatures using `STRIPE_WEBHOOK_SECRET` (security)
- [ ] Handle webhook events:
  - `checkout.session.completed` - Payment successful, activate subscription
    - Set subscriptionStatus = 'ACTIVE'
    - Set subscriptionStartDate = trialEndDate (if upgrading during trial)
    - Set subscriptionEndDate = subscriptionStartDate + billing period
    - Set nextBillingDate
  - `customer.subscription.created` - Subscription created
  - `customer.subscription.updated` - Subscription updated (plan change, renewal)
  - `customer.subscription.deleted` - Subscription cancelled (at period end)
    - Set subscriptionStatus = 'CANCELLED'
    - Maintain access until subscriptionEndDate
  - `invoice.payment_succeeded` - Payment successful (renewal)
    - Update lastPaymentDate
    - Update nextBillingDate
    - Extend subscriptionEndDate
  - `invoice.payment_failed` - Payment failed
    - Set paymentStatus = 'past_due'
    - Set gracePeriodEndDate = now + 7 days
    - Send notification email
    - After grace period: Set subscriptionStatus = 'EXPIRED'
- [ ] Update database based on webhook events
- [ ] Send email notifications for payment events
- [ ] Log all webhook events for audit trail (HIPAA compliance)

### Phase 5.6: Email Notifications
- [ ] Create email templates:
  - Payment successful (upgrade confirmation)
  - Payment failed (with retry instructions)
  - Subscription renewed (auto-renewal confirmation)
  - Subscription renewal reminder (7 days before renewal)
  - Subscription cancelled (confirmation, access until period end)
  - Payment method updated (confirmation)
  - Grace period warning (payment failed, 3 days remaining)
- [ ] Integrate with existing email service (SendGrid/Twilio)
- [ ] Send notifications on payment events (via webhooks)
- [ ] Ensure emails contain no PHI (HIPAA compliance)

### Phase 5.7: Subscription Management
- [ ] Update `checkSubscriptionStatus` middleware to check payment status:
  - Check if subscription is past_due and within grace period
  - Allow access during grace period (7 days)
  - Block access after grace period expires
- [ ] Handle expired subscriptions:
  - Payment failed → Set to past_due, start grace period
  - Grace period expired → Set to EXPIRED, block access
  - Cancelled → Maintain access until subscriptionEndDate
- [ ] Implement grace period logic:
  - Check gracePeriodEndDate
  - Allow access if within grace period
  - Send warnings at 3 days and 1 day remaining
- [ ] Update subscription status based on Stripe subscription status:
  - active → ACTIVE
  - past_due → Check grace period
  - cancelled → CANCELLED (access until period end)
  - unpaid → EXPIRED

### Phase 5.8: Testing
- [ ] Test payment flow end-to-end:
  - Upgrade from trial to REGULAR plan (monthly) - Test all payment methods
  - Upgrade from trial to PREMIUM plan (annual) - Test all payment methods
  - Upgrade from REGULAR to PREMIUM (plan change)
  - Payment success scenarios (cards, ACH, PayPal)
  - Payment failure scenarios (declined card, insufficient funds)
- [ ] Test trial-to-paid conversion:
  - Upgrade during trial → Verify subscriptionStartDate = trialEndDate
  - Verify trial continues until expiration
  - Verify paid subscription starts after trial ends
- [ ] Test webhook handling:
  - Simulate webhook events using Stripe CLI
  - Verify database updates
  - Verify email notifications
  - Test webhook signature verification
- [ ] Test subscription lifecycle:
  - Auto-renewal (simulate with test mode)
  - Cancellation (verify access until period end)
  - Payment failure and grace period (7 days)
  - Grace period expiration and account suspension
- [ ] Test edge cases:
  - Multiple simultaneous upgrade attempts
  - Webhook retries
  - Network failures during payment
  - Stripe webhook signature verification failures
- [ ] Test HIPAA compliance:
  - Verify no PHI in payment records
  - Verify payment data encryption
  - Verify audit trail completeness

### Phase 5.9: Documentation
- [ ] Document payment flow
- [ ] Document webhook setup
- [ ] Document subscription management
- [ ] Create admin guide for managing subscriptions
- [ ] Update user documentation

---

## Technical Architecture

### Payment Flow (Stripe Implementation)

```
1. User clicks "Upgrade" → UpgradeModal opens
2. User selects plan (REGULAR/PREMIUM) and billing cycle (MONTHLY/ANNUAL) → Clicks "Upgrade"
3. Frontend calls POST /api/payments/create-checkout-session
   - Payload: { planId, billingCycle, userType }
4. Backend creates Stripe Checkout Session:
   - Creates/retrieves Stripe customer
   - Sets subscription start date = trialEndDate (if in trial)
   - Configures payment methods (cards, ACH, PayPal)
   - Returns checkout session URL
5. Frontend redirects to Stripe Checkout (hosted page)
6. User selects payment method and enters details → Stripe processes payment
7. Stripe redirects to success URL → Frontend shows PaymentSuccess page
8. Stripe sends webhook (checkout.session.completed) → Backend updates subscription status
9. Backend updates database:
   - subscriptionStatus = 'ACTIVE'
   - subscriptionStartDate = trialEndDate
   - subscriptionEndDate = subscriptionStartDate + billing period
   - nextBillingDate = subscriptionEndDate
10. User's account upgraded → Access to paid features enabled
```

### Trial-to-Paid Conversion Flow

```
1. User is in trial (subscriptionStatus = 'TRIAL')
2. User upgrades during trial (e.g., day 3 of 7-day trial)
3. Payment processed successfully
4. Backend sets:
   - subscriptionStatus = 'ACTIVE'
   - subscriptionStartDate = trialEndDate (not today!)
   - subscriptionEndDate = trialEndDate + billing period
5. Trial continues until trialEndDate
6. Paid subscription starts automatically after trial ends
7. User gets full trial value + paid subscription
```

### Webhook Flow

```
1. Stripe sends webhook to POST /api/payments/webhook
2. Backend verifies webhook signature
3. Backend processes event:
   - checkout.session.completed → Activate subscription
   - invoice.payment_succeeded → Renew subscription
   - invoice.payment_failed → Mark as past_due, send notification
   - customer.subscription.deleted → Cancel subscription
4. Backend updates database
5. Backend sends email notification (if applicable)
```

---

## Environment Variables Needed

```env
# Backend (.env)
STRIPE_SECRET_KEY=sk_test_...  # Stripe secret key (test mode)
STRIPE_WEBHOOK_SECRET=whsec_...  # Webhook signing secret

# Frontend (.env)
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...  # Stripe publishable key (test mode)
```

**Note:** For production, use `sk_live_...` and `pk_live_...` keys.

---

## Estimated Timeline

- **Phase 5.1-5.2:** 2-3 days (Payment provider setup + backend routes)
- **Phase 5.3:** 1 day (Database updates)
- **Phase 5.4:** 2-3 days (Frontend integration)
- **Phase 5.5:** 2 days (Webhook handling)
- **Phase 5.6:** 1 day (Email notifications)
- **Phase 5.7:** 2 days (Subscription management)
- **Phase 5.8:** 2-3 days (Testing)
- **Phase 5.9:** 1 day (Documentation)

**Total:** 13-16 days (2.5-3 weeks)

---

## Risks & Considerations

1. **Payment Provider Selection:** ✅ Stripe selected - robust and reliable
2. **Webhook Reliability:** Must handle webhook failures and retries (Stripe retries automatically)
3. **Security:** Never store card details, always use Stripe's hosted checkout (PCI compliant)
4. **HIPAA Compliance:** 
   - No PHI in payment records
   - Payment data encrypted in transit
   - Audit trail for all payment events
   - Use Stripe's secure webhook verification
5. **Testing:** Thoroughly test with Stripe test cards before going live
6. **Error Handling:** Graceful handling of payment failures and edge cases
7. **Trial-to-Paid Conversion:** Ensure subscriptionStartDate = trialEndDate (not current date)
8. **Grace Period:** Implement 7-day grace period with warnings before suspension
9. **Cancellation:** Maintain access until subscriptionEndDate (cancel at period end)
10. **Multiple Payment Methods:** Test all payment methods (cards, ACH, PayPal) thoroughly

---

## Next Steps ✅

1. ✅ **Decisions made** - All questions answered
2. ✅ **Payment provider confirmed** - Stripe selected
3. ⏭️ **Set up Stripe account** (test/development) - Required before implementation
4. ⏭️ **Begin implementation** starting with Phase 5.1

## Implementation Order

1. **Phase 5.1:** Set up Stripe account and get API keys
2. **Phase 5.2:** Backend payment processing (install Stripe SDK, create services)
3. **Phase 5.3:** Database updates (migration scripts)
4. **Phase 5.4:** Frontend integration (update UpgradeModal)
5. **Phase 5.5:** Webhook handling
6. **Phase 5.6:** Email notifications
7. **Phase 5.7:** Subscription management updates
8. **Phase 5.8:** Testing
9. **Phase 5.9:** Documentation

**Ready to begin implementation!** 🚀

---

**Note:** This plan assumes Stripe as the payment provider. If you choose a different provider, the implementation details will need to be adjusted accordingly.
