# Stripe Webhook Setup via Dashboard (Option 2)

**Quick Guide:** Setting up webhooks using Stripe Dashboard instead of CLI

---

## Step-by-Step Instructions

### Step 1: Navigate to Webhooks Page

1. **Log into Stripe Dashboard**
   - Go to: https://dashboard.stripe.com
   - Make sure you're in **Test mode** (toggle in top right)

2. **Go to Webhooks Section**
   - Click **"Developers"** in the left sidebar
   - Click **"Webhooks"**
   - Or direct link: https://dashboard.stripe.com/test/webhooks

### Step 2: Add Webhook Endpoint

1. **Click "Add endpoint" button**
   - Located at the top right of the webhooks page

2. **Enter Endpoint URL**
   - For **local development:**
     ```
     http://localhost:5001/api/payments/webhook
     ```
   - For **production** (later):
     ```
     https://api.traccems.com/api/payments/webhook
     ```
   - **Note:** Start with local development URL

3. **Select Events to Listen To**
   - Click **"Select events"** or **"Add events"**
   - Select these events (check the boxes):
     - ✅ `checkout.session.completed` - Payment successful
     - ✅ `customer.subscription.created` - Subscription created
     - ✅ `customer.subscription.updated` - Subscription updated/renewed
     - ✅ `customer.subscription.deleted` - Subscription cancelled
     - ✅ `invoice.payment_succeeded` - Payment successful (renewal)
     - ✅ `invoice.payment_failed` - Payment failed
   
   - **Quick way:** You can also select **"Select all events"** to listen to everything (easier for testing)

4. **Click "Add endpoint"**
   - This creates the webhook endpoint

### Step 3: Get Webhook Signing Secret

1. **Click on the endpoint you just created**
   - It will show details about the endpoint

2. **Find "Signing secret"**
   - Look for a section labeled **"Signing secret"** or **"Signing secret (whsec_...)"**
   - It will show: `whsec_...` (truncated)

3. **Reveal the full secret**
   - Click **"Reveal"** button or **"Click to reveal"** link
   - The full signing secret will be displayed
   - **Copy it immediately** (it may auto-hide)

4. **Full secret format:**
   ```
   whsec_AbCdEfGhIjKlMnOpQrStUvWxYz1234567890AbCdEfGhIjKlMnOpQrStUvWxYz...
   ```
   - Starts with: `whsec_`
   - About 100+ characters long

### Step 4: Add Secret to Environment File

1. **Open** `backend/.env.local`

2. **Update the webhook secret:**
   ```env
   STRIPE_WEBHOOK_SECRET="whsec_your_full_secret_here"
   ```

3. **Save the file**

---

## Important Notes

### For Local Development

**⚠️ Problem:** Stripe Dashboard webhooks can't reach `localhost:5001` directly.

**Solutions:**

1. **Use ngrok** (Recommended for local testing):
   ```bash
   # Install ngrok: https://ngrok.com/download
   ngrok http 5001
   ```
   - This gives you a public URL like: `https://abc123.ngrok.io`
   - Use this URL in Stripe webhook endpoint: `https://abc123.ngrok.io/api/payments/webhook`

2. **Test webhooks manually** using Stripe Dashboard:
   - Go to your webhook endpoint
   - Click **"Send test webhook"**
   - Select an event type
   - This sends a test event (but won't reach localhost)

3. **Skip webhook setup for now:**
   - We can implement payment flow first
   - Add webhook secret later when deploying to staging/production
   - For now, leave `STRIPE_WEBHOOK_SECRET=""` empty

### For Production/Staging

When deploying to production:
1. Use production webhook URL: `https://api.traccems.com/api/payments/webhook`
2. Get production webhook secret (switch to Live mode in Stripe)
3. Add to production environment variables

---

## Quick Setup Summary

**For now (local development without ngrok):**

1. ✅ Create webhook endpoint in Stripe Dashboard
2. ✅ Copy the signing secret
3. ⏭️ **Skip adding it to .env for now** (we'll add it when we deploy)
4. ⏭️ Proceed with payment implementation
5. ⏭️ Test webhooks later using ngrok or in staging environment

**Alternative:** We can proceed with Phase 5.1 implementation and add webhook handling later. The payment flow will work, we just won't receive webhook events locally until we set up ngrok or deploy.

---

## Next Steps

1. ✅ **Webhook endpoint created** in Stripe Dashboard
2. ✅ **Signing secret copied** (save it securely)
3. ⏭️ **Proceed with Phase 5.1** - We can implement payment flow
4. ⏭️ **Add webhook secret** when ready to test webhooks (via ngrok or staging)

**Ready to proceed with implementation!** The webhook secret can be added later when we're ready to test webhook events.
