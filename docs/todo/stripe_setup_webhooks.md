# Stripe Webhook Setup - TODO

**Created:** February 10, 2026  
**Status:** 🔴 PENDING  
**Priority:** Medium  
**Related:** Phase 5.2 - Webhook Handling

---

## Overview

This document tracks the remaining work to complete Stripe webhook setup for payment integration. The Stripe account setup guide documents the process, but webhooks have not been configured yet.

---

## ✅ What's Already Complete

- [x] Stripe account created
- [x] Test mode activated
- [x] API keys obtained and configured
- [x] Environment variables set up (except webhook secret)
- [x] Payment checkout flow working (Phase 5.1 complete)
- [x] Webhook endpoint code implemented (`/api/payments/webhook`)

---

## 🔴 TODO: Step 4 - Set Up Webhooks

### Option A: Stripe CLI (Recommended for Local Development)

- [ ] **Install Stripe CLI**
  ```bash
  # macOS (using Homebrew)
  brew install stripe/stripe-cli/stripe
  
  # Or download from: https://stripe.com/docs/stripe-cli
  ```

- [ ] **Login to Stripe CLI**
  ```bash
  stripe login
  ```
  - This will open your browser
  - Click **"Allow access"** to authorize CLI

- [ ] **Forward Webhooks to Local Server**
  ```bash
  # Forward webhooks to your local backend (port 5001)
  stripe listen --forward-to localhost:5001/api/payments/webhook
  ```
  - This will output a webhook signing secret (starts with `whsec_`)
  - **Copy this secret** - you'll need it for `STRIPE_WEBHOOK_SECRET`

- [ ] **Add Webhook Secret to Environment Variables**
  - Update `backend/.env.local`:
    ```env
    STRIPE_WEBHOOK_SECRET=whsec_...  # Replace empty string with actual secret
    ```

- [ ] **Test Webhook Events**
  ```bash
  # Trigger test events
  stripe trigger checkout.session.completed
  stripe trigger invoice.payment_succeeded
  ```

### Option B: Stripe Dashboard (For Production/Staging)

- [ ] **Set Up Public URL** (if using for local development)
  - Install ngrok: `brew install ngrok/ngrok/ngrok`
  - Create tunnel: `ngrok http 5001`
  - Copy the HTTPS URL (e.g., `https://abc123.ngrok.io`)

- [ ] **Navigate to Webhooks in Stripe Dashboard**
  - Go to **Developers** → **Webhooks**
  - Or visit: https://dashboard.stripe.com/test/webhooks

- [ ] **Add Endpoint**
  - Click **"Add endpoint"**
  - Enter endpoint URL:
    - Development: `http://localhost:5001/api/payments/webhook` (won't work) OR `https://your-ngrok-url.ngrok.io/api/payments/webhook`
    - Production: `https://api.traccems.com/api/payments/webhook`
  - Select events to listen to:
    - `checkout.session.completed`
    - `customer.subscription.created`
    - `customer.subscription.updated`
    - `customer.subscription.deleted`
    - `invoice.payment_succeeded`
    - `invoice.payment_failed`
  - Click **"Add endpoint"**

- [ ] **Get Webhook Signing Secret**
  - Click on the endpoint you just created
  - Click **"Reveal"** next to "Signing secret"
  - Copy the secret (starts with `whsec_`)

- [ ] **Add Webhook Secret to Environment Variables**
  - Update `backend/.env.local`:
    ```env
    STRIPE_WEBHOOK_SECRET=whsec_...  # Replace empty string with actual secret
    ```

---

## 🔴 TODO: Phase 5.2 - Webhook Handling Testing

- [ ] **Verify Webhook Endpoint is Receiving Events**
  - Check backend logs when webhook events are triggered
  - Verify webhook signature verification is working
  - Ensure webhook events are being processed correctly

- [ ] **Test checkout.session.completed Event**
  - Complete a test checkout flow
  - Verify webhook is received
  - Check that subscription is activated in database
  - Verify user subscription status is updated

- [ ] **Test invoice.payment_succeeded Event**
  - Trigger a test invoice payment
  - Verify webhook is received
  - Check that subscription renewal is processed
  - Verify subscription end date is updated

- [ ] **Test invoice.payment_failed Event**
  - Trigger a test payment failure
  - Verify webhook is received
  - Check that grace period is started
  - Verify user subscription status is set to 'PAST_DUE'

- [ ] **Test customer.subscription.deleted Event**
  - Cancel a test subscription
  - Verify webhook is received
  - Check that subscription cancellation is processed
  - Verify user subscription status is updated

---

## 🔴 TODO: Phase 5.3 - Subscription Management Testing

- [ ] **Test Subscription Activation After Payment**
  - Complete a test payment with test card `4242 4242 4242 4242`
  - Verify subscription is activated in Stripe
  - Verify user record is updated in database:
    - `subscriptionStatus` = 'ACTIVE'
    - `stripeSubscriptionId` is set
    - `subscriptionStartDate` is set
    - `subscriptionEndDate` is calculated correctly

- [ ] **Test Subscription Renewal**
  - Wait for or simulate a subscription renewal
  - Verify `invoice.payment_succeeded` webhook is received
  - Verify subscription end date is extended
  - Verify `lastPaymentDate` is updated

- [ ] **Test Payment Failure Handling (Grace Period)**
  - Trigger a payment failure (use test card `4000 0000 0000 0002`)
  - Verify `invoice.payment_failed` webhook is received
  - Verify user subscription status is set to 'PAST_DUE'
  - Verify `gracePeriodEndDate` is set (7 days from failure)
  - Verify user still has access during grace period

- [ ] **Test Subscription Cancellation**
  - Cancel a subscription (at period end)
  - Verify `customer.subscription.deleted` webhook is received
  - Verify user subscription status is set to 'CANCELLED'
  - Verify subscription end date is preserved
  - Verify user loses access after subscription end date

---

## 📝 Notes

### Current Status
- Webhook endpoint code is implemented and ready
- `STRIPE_WEBHOOK_SECRET` is currently empty in `backend/.env.local`
- Backend webhook handler supports both verified and unverified webhooks (for development)

### Development vs Production
- **Development:** Use Stripe CLI (Option A) - easiest for local testing
- **Production:** Use Stripe Dashboard (Option B) - requires production URL

### Testing Strategy
1. Start with Stripe CLI for local development
2. Test all webhook events using test triggers
3. Test end-to-end payment flow with test cards
4. Set up production webhooks when ready to deploy

---

## 🔗 Related Documentation

- **Stripe Account Setup Guide:** `/docs/active/sessions/2026-02/stripe-account-setup-guide.md`
- **Payment Integration Plan:** `/docs/active/sessions/2026-02/phase5-payment-integration-plan.md`
- **Account Approval Removal Task:** `/docs/active/sessions/2026-02/account-approval-removal-task.md`

---

## 📚 Resources

- **Stripe Webhooks Guide:** https://stripe.com/docs/webhooks
- **Stripe CLI:** https://stripe.com/docs/stripe-cli
- **Stripe Testing Guide:** https://stripe.com/docs/testing
- **ngrok:** https://ngrok.com/ (for local webhook testing)

---

**Last Updated:** February 10, 2026
