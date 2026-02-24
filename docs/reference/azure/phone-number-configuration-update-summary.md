# Phone Number Configuration Update Summary

**Date:** February 3, 2026  
**Old Phone Number:** `+18339675959` (released)  
**New Phone Number:** `+18663667374`  
**Application ID:** `35e65296-1dee-4d7d-970b-43d4dac831e3`

---

## ✅ Completed Updates

### 1. Local Backend Configuration
- [x] **Updated:** `backend/.env.local`
  - Changed: `AZURE_COMMUNICATION_PHONE_NUMBER="+18663667374"`
  - Status: ✅ Complete

### 2. Documentation Updates
- [x] **Updated:** `docs/reference/azure/azure-sms-env-vars-setup.md`
- [x] **Updated:** `docs/reference/azure/phase4-environment-variables-guide.md`
- [x] **Created:** `docs/reference/azure/toll-free-verification-submitted-application.md`
- [x] **Updated:** `docs/reference/azure/toll-free-verification-final-submission-checklist.md`

---

## ⏳ Manual Updates Required

### 1. GitHub Secrets (Manual Update Required)

**Action:** Update GitHub Secrets via web interface

**Steps:**
1. Go to: GitHub → Your Repository → Settings → Secrets and variables → Actions
2. Find secret: `AZURE_COMMUNICATION_PHONE_NUMBER`
3. Click **Update** or **Edit**
4. Change value from: `+18339675959`
5. To: `+18663667374`
6. Click **Update secret**
7. Repeat for all environments (dev, prod)

**Locations:**
- Repository Secrets (if used by workflows)
- Environment Secrets (if using environments)

**Note:** I cannot access GitHub directly - this must be done manually.

---

### 2. Azure App Services (Manual Update Required)

**Action:** Update via Azure Portal or Azure CLI

#### Option A: Azure Portal (Recommended)

**TraccEms-Dev-Backend:**
1. Go to: Azure Portal → App Services → TraccEms-Dev-Backend
2. Click: **Configuration** → **Application settings**
3. Find: `AZURE_COMMUNICATION_PHONE_NUMBER`
4. Click **Edit** (pencil icon)
5. Change value to: `+18663667374`
6. Click **OK**
7. Click **Save** at top
8. Wait for restart (automatic)

**TraccEms-Prod-Backend:**
1. Go to: Azure Portal → App Services → TraccEms-Prod-Backend
2. Click: **Configuration** → **Application settings**
3. Find: `AZURE_COMMUNICATION_PHONE_NUMBER`
4. Click **Edit** (pencil icon)
5. Change value to: `+18663667374`
6. Click **OK**
7. Click **Save** at top
8. Wait for restart (automatic)

#### Option B: Azure CLI (If Available)

**TraccEms-Dev-Backend:**
```bash
az webapp config appsettings set \
  --name TraccEms-Dev-Backend \
  --resource-group TraccEms-Dev-USCentral \
  --settings AZURE_COMMUNICATION_PHONE_NUMBER=+18663667374
```

**TraccEms-Prod-Backend:**
```bash
az webapp config appsettings set \
  --name TraccEms-Prod-Backend \
  --resource-group TraccEms-Prod-USCentral \
  --settings AZURE_COMMUNICATION_PHONE_NUMBER=+18663667374
```

**Note:** Azure CLI had permission issues - use Portal method if CLI doesn't work.

---

## Verification Checklist

After updating all locations:

- [ ] **Local .env.local:** Updated ✅
- [ ] **GitHub Secrets:** Updated (manual)
- [ ] **TraccEms-Dev-Backend:** Updated (manual)
- [ ] **TraccEms-Prod-Backend:** Updated (manual)

**Verify Updates:**
- [ ] Check backend logs after restart
- [ ] Verify SMS service initializes with new number
- [ ] Test SMS sending (after application approval)

---

## Quick Reference

**Old Number:** `+18339675959` (released)  
**New Number:** `+18663667374`  
**Application ID:** `35e65296-1dee-4d7d-970b-43d4dac831e3`

**Variable Name:** `AZURE_COMMUNICATION_PHONE_NUMBER`  
**New Value:** `+18663667374`

---

---

## February 20, 2026 Rejection - Remediation Plan

**Rejection Date:** February 20, 2026  
**Application ID:** `35e65296-1dee-4d7d-970b-43d4dac831e3`  
**Phone Number:** `+18663667374`

### Rejection Codes to Address

| Code | Issue | Severity | Status |
|------|-------|----------|--------|
| 1112 | Business registration number is missing or invalid | High | ⏳ Pending |
| 1413 | Opt-in - consent for messaging is a requirement for service | High | ✅ Complete |
| 1203 | Website is password protected or requires login | High | ⏳ Pending |

---

### Plan: Code 1112 - Business Registration Number

**Issue:** Business registration number is missing or invalid.

**Current Value:** Tax ID `81-3112142` (from final submission checklist)

**Remediation Steps:**

1. **Verify correct field usage**
   - Confirm whether Azure/aggregator expects "Tax ID" or "Business Registration Number" (they may differ)
   - Some aggregators require EIN in format `XX-XXXXXXX`; others accept state business registration IDs
   - Check Azure form labels and help text for exact expectations

2. **Validate format and value**
   - Ensure `81-3112142` is entered exactly (no extra spaces, correct hyphen placement)
   - For US LLCs: EIN is typically acceptable; some applications also request state registration number (e.g., PA Bureau of Corporations)
   - Cross-reference with IRS EIN format and state filing documents

3. **Provide alternate proof if needed**
   - If aggregator rejects Tax ID, obtain and submit state business registration/certificate number
   - Keep documentation (EIN confirmation letter, state filing) ready for support escalation

**References:**
- [Toll-Free Verification Guidelines](https://learn.microsoft.com/en-us/azure/communication-services/concepts/sms/toll-free-verification-guidelines#opt-in)
- Company Details section in Azure portal application form

---

### Plan: Code 1413 - Opt-in Consent ✅ COMPLETE

**Issue:** Opt-in - consent for messaging is a requirement for service.

**Status:** ✅ **FIXED** (February 24, 2026)

**What was done:**

1. **Added explicit consent disclaimer** to both registration forms
   - EMS Registration (`/ems-register`): SMS opt-in section with full consent language, orange-tinted box to match branding
   - Healthcare Registration (`/healthcare-register`): SMS opt-in section with full consent language, green-tinted box to match branding
   - Agency Settings (`/ems-dashboard` → Settings): Strengthened SMS section with consent disclaimer

2. **Opt-in at point of phone collection** — both registration forms now show consent when users provide their phone number
   - Public pages (no login required): `/ems-register` and `/healthcare-register` — ideal for Azure verification

3. **Screenshots captured and uploaded to OneDrive** — verified accessible in private/incognito window
   - Healthcare: https://1drv.ms/i/c/817a4f10428e6e00/IQCgTl7dQFE_Q5MOyl2XR328AdvvC3JWFrdriC4ZqWCSpFs?e=HebuQx
   - EMS: https://1drv.ms/i/c/817a4f10428e6e00/IQAh_q86ujbZSYcfgr-MTkIVAdsWJG5uVa2PixQfhHcX4EA?e=tpJodN

4. **Backend persistence**
   - EMS: `smsOptIn` → `acceptsNotifications` on `ems_agencies`
   - Healthcare: `smsOptIn` → `smsNotifications` on `healthcare_users` (migration + schema)

**References:**
- [Toll-Free Verification Guidelines - Opt-in](https://learn.microsoft.com/en-us/azure/communication-services/concepts/sms/toll-free-verification-guidelines#opt-in)
- [Accepted Opt-in Proofs (TFV FAQs)](https://aka.ms/TFV-FAQs)

---

### Plan: Code 1203 - Website Accessibility

**Issue:** Website is password protected or requires login.

**Current Setup:** Main website `https://traccems.com` may redirect unauthenticated users to a login page.

**Root Cause:** Aggregators test URLs without credentials. If the main site or opt-in URL requires login, the application is rejected.

**Remediation Steps:**

1. **Make main website URL publicly accessible**
   - Ensure `https://traccems.com` serves a public landing/marketing page to unauthenticated visitors
   - Do not redirect the root URL to login; show company info, product overview, and links to privacy/terms
   - Test in incognito/private window: `https://traccems.com` should load without login

2. **Verify all application URLs**
   - Website URL: must be public
   - Privacy Policy (`/privacy-policy`): already public per docs
   - Terms (`/terms`): already public per docs
   - Opt-in URL: if it must point to a gated page, provide a public page that describes the opt-in process and links to it (see Code 1413)

3. **Optional: Use alternative website URL**
   - If the app is inherently gated, consider using a public marketing/landing page URL
   - Ensure that URL is part of the same domain and clearly represents the business

4. **Pre-resubmission verification**
   - Run `./scripts/verify-toll-free-urls.sh`
   - Manually test all URLs in incognito mode (no cookies/session)
   - Confirm no redirect to login for Website, Privacy Policy, or Terms URLs

**References:**
- [Toll-Free Verification Guidelines](https://learn.microsoft.com/en-us/azure/communication-services/concepts/sms/toll-free-verification-guidelines)
- [High-Quality Application Guide](https://learn.microsoft.com/en-us/azure/communication-services/concepts/sms/sms-faq#what-is-considered-a-high-quality-toll-free-verification-application)

---

### Pre-Resubmission Checklist

Before updating and resubmitting the application:

- [ ] **1112:** Business registration/Tax ID verified, correct format, correct field
- [x] **1413:** Consent disclaimer visible at opt-in; screenshot updated; application narrative updated ✅
- [ ] **1203:** `https://traccems.com` loads publicly (no login); all URLs tested in incognito
- [x] OneDrive opt-in screenshot links tested in incognito (both accessible) ✅
- [ ] Run `./scripts/verify-toll-free-urls.sh`
- [ ] Re-read rejection comments in Azure Portal before resubmitting

**Opt-in Screenshot Links (for Azure form):**
- Healthcare: https://1drv.ms/i/c/817a4f10428e6e00/IQCgTl7dQFE_Q5MOyl2XR328AdvvC3JWFrdriC4ZqWCSpFs?e=HebuQx
- EMS: https://1drv.ms/i/c/817a4f10428e6e00/IQAh_q86ujbZSYcfgr-MTkIVAdsWJG5uVa2PixQfhHcX4EA?e=tpJodN

---

### Reference Links (from rejection notice)

- [TFV FAQs / Accepted Opt-in Proofs](https://aka.ms/TFV-FAQs)
- [Toll-Free Verification Guidelines - Opt-in](https://learn.microsoft.com/en-us/azure/communication-services/concepts/sms/toll-free-verification-guidelines#opt-in)
- [High-Quality Toll-Free Verification Application](https://learn.microsoft.com/en-us/azure/communication-services/concepts/sms/sms-faq#what-is-considered-a-high-quality-toll-free-verification-application)
- [Azure Support](https://docs.microsoft.com/en-us/azure/communication-services/support)

---

**Last Updated:** February 24, 2026  
**Status:** Local files updated ✅ | Code 1413 (opt-in consent) complete ✅ | OneDrive screenshots uploaded and verified | Codes 1112 and 1203 pending
