# How to Find Complete Stripe API Keys

**Quick Guide:** Finding your full Stripe API keys in the Dashboard

---

## Step-by-Step Instructions

### 1. Navigate to API Keys Page

1. Log into Stripe Dashboard: https://dashboard.stripe.com
2. Make sure you're in **Test mode** (toggle in top right should show "Test mode")
3. Go to **Developers** → **API keys**
   - Or direct link: https://dashboard.stripe.com/test/apikeys

### 2. Get Publishable Key (Frontend)

**Location:** Under "Standard keys" section

- **Publishable key** shows as: `pk_test_51...` (truncated)
- **To get full key:**
  1. Click on the key text itself (or the copy icon next to it)
  2. The full key will be copied to clipboard
  3. Or click "Reveal" if there's a reveal button
  4. Full key format: `pk_test_51[YOUR_ACTUAL_KEY_HERE]` (about 100+ characters)

**Note:** Publishable keys are safe to expose in frontend code.

### 3. Get Secret Key (Backend)

**Location:** Under "Standard keys" section, next to "Secret key"

- **Secret key** shows as: `sk_test_51...` (truncated)
- **To reveal full key:**
  1. Look for a button/link that says:
     - **"Reveal test key"** or
     - **"Reveal"** or
     - An **eye icon** 👁️
  2. Click that button
  3. The full secret key will be displayed
  4. **Quickly copy it** (it may auto-hide after a few seconds)
  5. Full key format: `sk_test_51[YOUR_ACTUAL_KEY_HERE]` (about 100+ characters)

**⚠️ Important:** 
- Secret keys are sensitive - never share publicly
- The key will hide automatically for security
- If it hides, click "Reveal" again

### 4. Alternative: Create New Keys

If you can't reveal the existing keys:

1. Click **"Create restricted key"** or **"Create key"**
2. Or go to **Settings** → **API keys** → **Create key**
3. Copy the new keys immediately (they're shown once)

---

## Visual Guide

```
Stripe Dashboard → Developers → API keys

┌─────────────────────────────────────────┐
│ Standard keys                           │
├─────────────────────────────────────────┤
│                                         │
│ Publishable key                         │
│ pk_test_51...  [Copy] [Reveal]         │ ← Click to copy full key
│                                         │
│ Secret key                              │
│ sk_test_51...  [Reveal test key]       │ ← Click to reveal full key
│                                         │
└─────────────────────────────────────────┘
```

---

## What the Keys Look Like

### Publishable Key (Frontend)
```
pk_test_51[YOUR_ACTUAL_KEY_HERE]
```
- Starts with: `pk_test_`
- About 100+ characters long
- Safe to use in frontend code
- **Note:** Replace `[YOUR_ACTUAL_KEY_HERE]` with your actual key from Stripe Dashboard

### Secret Key (Backend)
```
sk_test_51[YOUR_ACTUAL_KEY_HERE]
```
- Starts with: `sk_test_`
- About 100+ characters long
- **MUST be kept secret** - only use in backend
- **Note:** Replace `[YOUR_ACTUAL_KEY_HERE]` with your actual key from Stripe Dashboard

---

## Troubleshooting

### Issue: "I can't see the full key"
- **Solution:** Click the "Reveal" button or eye icon
- Keys are truncated by default for security
- Secret keys require explicit reveal action

### Issue: "The key disappeared after revealing"
- **Solution:** This is normal security behavior
- Click "Reveal" again to see it
- Copy it quickly before it auto-hides

### Issue: "I only see partial keys"
- **Solution:** 
  1. Click directly on the key text to copy
  2. Or click the "Copy" button next to the key
  3. The clipboard will have the full key even if display is truncated

### Issue: "I can't find the Reveal button"
- **Solution:**
  1. Look for an eye icon 👁️
  2. Or look for text "Reveal test key" or "Reveal"
  3. It's usually next to or below the truncated key
  4. Try refreshing the page

---

## Quick Copy Method

**Easiest way to get both keys:**

1. **Publishable key:**
   - Click the **copy icon** (📋) next to `pk_test_...`
   - Or click directly on the key text
   - Paste into `frontend/.env` as `VITE_STRIPE_PUBLISHABLE_KEY`

2. **Secret key:**
   - Click **"Reveal test key"** button
   - Immediately click the **copy icon** (📋) that appears
   - Or select all and copy (Cmd+C / Ctrl+C)
   - Paste into `backend/.env` as `STRIPE_SECRET_KEY`

---

## Next Steps After Getting Keys

1. ✅ Copy publishable key → Add to `frontend/.env`
2. ✅ Copy secret key → Add to `backend/.env`
3. ⏭️ Get webhook secret (next step)
4. ⏭️ Test the connection

---

**Your account ID:** `acct_15zJ6WAJoLNCcSPq` ✅  
**Next:** Get the webhook signing secret for local development
