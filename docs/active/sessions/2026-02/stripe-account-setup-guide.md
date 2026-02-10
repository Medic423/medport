# Stripe Account Setup Guide

**Created:** February 9, 2026  
**Purpose:** Step-by-step guide for setting up Stripe account for payment integration

---

## Overview

This guide will walk you through setting up a Stripe account, configuring it for development and production, and obtaining the necessary API keys for the TRACC payment integration.

---

## Step 1: Create Stripe Account

1. **Go to Stripe Website**
   - Visit: https://stripe.com
   - Click **"Sign up"** or **"Start now"** button

2. **Create Account**
   - Enter your email address
   - Create a password
   - Click **"Create account"**

3. **Verify Email**
   - Check your email inbox
   - Click the verification link from Stripe
   - Complete email verification

4. **Complete Account Setup**
   - Enter your business information:
     - Business name: **TRACC EMS** (or your business name)
     - Business type: **SaaS/Software**
     - Country: **United States**
   - Click **"Continue"**

---

## Step 2: Activate Test Mode

Stripe accounts start in **Test Mode** by default, which is perfect for development.

1. **Verify Test Mode**
   - Look at the top right of the Stripe Dashboard
   - You should see **"Test mode"** toggle (should be ON)
   - If it's OFF, click to enable Test Mode

2. **Test Mode Features**
   - Use test API keys (start with `sk_test_` and `pk_test_`)
   - Use test card numbers (no real charges)
   - Test webhooks locally
   - Perfect for development and testing

---

## Step 3: Get API Keys

### For Development (Test Mode)

1. **Navigate to API Keys**
   - In Stripe Dashboard, go to **Developers** → **API keys**
   - Or visit: https://dashboard.stripe.com/test/apikeys

2. **Copy Test Keys**
   - **Publishable key** (starts with `pk_test_`)
     - The full key should be visible: `pk_test_51SzJ6W...` (click to copy or select all)
     - If truncated, click on the key text to expand/copy the full key
     - This is safe to expose in frontend code
     - Copy this key
   - **Secret key** (starts with `sk_test_`)
     - The key is hidden by default showing: `sk_test_51SzJ6W…`
     - Click the **"Reveal test key"** button (eye icon or "Reveal" link) to show the full key
     - **⚠️ Keep this secret!** Never commit to git
     - After revealing, copy the complete key (it will be ~100+ characters long)
     - The key will auto-hide after a few seconds for security

3. **Save Keys Securely**
   - Store keys in a secure password manager
   - We'll add them to environment variables next

---

## Step 4: Set Up Webhooks (For Development)

Webhooks allow Stripe to notify your backend about payment events.

### Option A: Stripe CLI (Recommended for Local Development)

1. **Install Stripe CLI**
   ```bash
   # macOS (using Homebrew)
   brew install stripe/stripe-cli/stripe
   
   # Or download from: https://stripe.com/docs/stripe-cli
   ```

2. **Login to Stripe CLI**
   ```bash
   stripe login
   ```
   - This will open your browser
   - Click **"Allow access"** to authorize CLI

3. **Forward Webhooks to Local Server**
   ```bash
   # Forward webhooks to your local backend (port 5001)
   stripe listen --forward-to localhost:5001/api/payments/webhook
   ```
   - This will output a webhook signing secret (starts with `whsec_`)
   - **Copy this secret** - you'll need it for `STRIPE_WEBHOOK_SECRET`

4. **Test Webhook Events**
   ```bash
   # Trigger test events
   stripe trigger checkout.session.completed
   stripe trigger invoice.payment_succeeded
   ```

### Option B: Stripe Dashboard (For Production/Staging)

1. **Navigate to Webhooks**
   - Go to **Developers** → **Webhooks**
   - Or visit: https://dashboard.stripe.com/test/webhooks

2. **Add Endpoint**
   - Click **"Add endpoint"**
   - Enter endpoint URL:
     - Development: `http://localhost:5001/api/payments/webhook`
     - Production: `https://api.traccems.com/api/payments/webhook`
   - Select events to listen to:
     - `checkout.session.completed`
     - `customer.subscription.created`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
     - `invoice.payment_succeeded`
     - `invoice.payment_failed`
   - Click **"Add endpoint"**

3. **Get Webhook Signing Secret**
   - Click on the endpoint you just created
   - Click **"Reveal"** next to "Signing secret"
   - Copy the secret (starts with `whsec_`)

---

## Step 5: Configure Environment Variables

### Backend Environment Variables

Add to `backend/.env`:

```env
# Stripe Configuration (Test Mode)
STRIPE_SECRET_KEY=sk_test_51...
STRIPE_WEBHOOK_SECRET=whsec_...

# For production, use:
# STRIPE_SECRET_KEY=sk_live_51...
# STRIPE_WEBHOOK_SECRET=whsec_...
```

### Frontend Environment Variables

Add to `frontend/.env`:

```env
# Stripe Publishable Key (Test Mode)
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_51...

# For production, use:
# VITE_STRIPE_PUBLISHABLE_KEY=pk_live_51...
```

**⚠️ Important:**
- Never commit `.env` files to git
- Add `.env` to `.gitignore` (should already be there)
- Use different keys for development and production

---

## Step 6: Test Mode Configuration

### Enable Payment Methods

1. **Navigate to Settings**
   - Go to **Settings** → **Payment methods**
   - Or visit: https://dashboard.stripe.com/test/settings/payment_methods

2. **Enable Payment Methods**
   - ✅ **Cards** (enabled by default)
   - ✅ **ACH Direct Debit** (enable if needed)
   - ✅ **PayPal** (enable if needed)
   - Click **"Save"**

### Configure Checkout Settings

1. **Navigate to Checkout Settings**
   - Go to **Settings** → **Checkout**
   - Or visit: https://dashboard.stripe.com/test/settings/checkout

2. **Configure Settings**
   - **Customer email:** Required
   - **Billing address:** Optional (recommended)
   - **Phone number:** Optional
   - **Save payment method:** Enable (for subscriptions)
   - Click **"Save"**

---

## Step 7: Test Card Numbers

Use these test card numbers in Test Mode (no real charges):

### Successful Payments

```
Card Number: 4242 4242 4242 4242
Expiry: Any future date (e.g., 12/25)
CVC: Any 3 digits (e.g., 123)
ZIP: Any 5 digits (e.g., 12345)
```

### Declined Cards

```
Card Number: 4000 0000 0000 0002
Expiry: Any future date
CVC: Any 3 digits
ZIP: Any 5 digits
```

### More Test Cards

See full list: https://stripe.com/docs/testing#cards

---

## Step 8: Activate Live Mode (For Production)

**⚠️ Only activate Live Mode when ready for production!**

1. **Complete Business Information**
   - Go to **Settings** → **Business settings**
   - Complete all required business information:
     - Business name and type
     - Tax ID (EIN)
     - Business address
     - Bank account for payouts

2. **Add Bank Account**
   - Go to **Settings** → **Bank accounts and scheduling**
   - Add your business bank account
   - Verify account (Stripe will make small test deposits)

3. **Switch to Live Mode**
   - Toggle **"Test mode"** to OFF in top right
   - You'll now see **"Live mode"**

4. **Get Live API Keys**
   - Go to **Developers** → **API keys**
   - Copy **Live publishable key** (`pk_live_...`)
   - Copy **Live secret key** (`sk_live_...`)
   - Update environment variables with live keys

5. **Set Up Production Webhooks**
   - Go to **Developers** → **Webhooks**
   - Add production endpoint: `https://api.traccems.com/api/payments/webhook`
   - Select same events as test mode
   - Copy production webhook signing secret

---

## Step 9: Verify Setup

### Test API Connection

1. **Backend Test**
   ```bash
   # In backend directory
   npm install stripe @types/stripe
   
   # Create test file: test-stripe.js
   const Stripe = require('stripe');
   const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
   
   stripe.customers.list({ limit: 1 })
     .then(customers => {
       console.log('✅ Stripe connection successful!');
       console.log('Customers:', customers);
     })
     .catch(error => {
       console.error('❌ Stripe connection failed:', error);
     });
   ```

2. **Frontend Test**
   ```javascript
   // In browser console
   console.log('Stripe key:', import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);
   // Should show: pk_test_...
   ```

### Test Webhook Endpoint

1. **Using Stripe CLI**
   ```bash
   stripe listen --forward-to localhost:5001/api/payments/webhook
   ```

2. **Trigger Test Event**
   ```bash
   stripe trigger checkout.session.completed
   ```

3. **Verify Webhook Received**
   - Check your backend logs
   - Should see webhook event logged

---

## Step 10: Security Checklist

- [ ] API keys stored in `.env` files (not committed to git)
- [ ] `.env` files added to `.gitignore`
- [ ] Test keys used for development
- [ ] Live keys only used in production
- [ ] Webhook signing secret configured
- [ ] Webhook signature verification implemented (in code)
- [ ] HTTPS enabled for production webhooks
- [ ] No card details stored in database (use Stripe customer IDs only)

---

## Troubleshooting

### Issue: "Invalid API Key"
- **Solution:** Verify you're using the correct key (test vs live)
- Check that key starts with `sk_test_` for test mode
- Ensure key is copied completely (no extra spaces)

### Issue: "Webhook signature verification failed"
- **Solution:** Verify `STRIPE_WEBHOOK_SECRET` matches your webhook endpoint secret
- Ensure webhook secret starts with `whsec_`
- Check that raw request body is used for signature verification

### Issue: "Payment method not supported"
- **Solution:** Enable payment methods in Stripe Dashboard
- Go to Settings → Payment methods
- Enable Cards, ACH, PayPal as needed

### Issue: "Cannot create subscription"
- **Solution:** Verify Stripe customer exists
- Check that plan ID matches Stripe product/price ID
- Ensure billing cycle matches Stripe price interval

---

## Next Steps

After completing this setup:

1. ✅ **API keys obtained** and added to environment variables
2. ⏭️ **Begin Phase 5.1** - Install Stripe SDK and create payment services
3. ⏭️ **Test payment flow** using test card numbers
4. ⏭️ **Set up production keys** when ready to go live

---

## Resources

- **Stripe Dashboard:** https://dashboard.stripe.com
- **Stripe Documentation:** https://stripe.com/docs
- **Stripe Testing Guide:** https://stripe.com/docs/testing
- **Stripe Webhooks Guide:** https://stripe.com/docs/webhooks
- **Stripe CLI:** https://stripe.com/docs/stripe-cli

---

## Support

If you encounter issues:
1. Check Stripe Dashboard for error messages
2. Review Stripe documentation
3. Check Stripe status page: https://status.stripe.com
4. Contact Stripe support through Dashboard

---

**Ready to proceed with Phase 5 implementation once Stripe account is set up!** 🚀
