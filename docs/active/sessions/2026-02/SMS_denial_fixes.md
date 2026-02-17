# Azure Toll-Free Verification Denial – Fix Plan

**Created:** February 17, 2026  
**Application ID:** 35e65296-1dee-4d7d-970b-43d4dac831e3  
**Status:** Resubmitted — Awaiting review  
**Resubmitted:** February 17, 2026

---

## Denial Reasons

- **website is password protected or requires login**
- **opt-in url not accessible**

---

## Root Cause Analysis

The Opt-in URL submitted was `https://traccems.com/ems-dashboard` (Settings tab), which requires authentication. Azure reviewers cannot access it, so they cannot verify the opt-in flow.

Microsoft requires:
- Opt-in URL must be **publicly accessible** (no login required)
- Explicit consent disclaimer must appear **at the time of phone number collection**
- Screenshot must show the form where customer adds phone number and agrees to receive SMS

---

## Current State

| Location | URL | Access | SMS Opt-In? |
|----------|-----|--------|-------------|
| EMS Registration | `/ems-register` | Public | ✅ Checkbox + consent (Phase 1 Step 1 complete) |
| Healthcare Registration | `/healthcare-register` | Public | ✅ Checkbox + consent (Phase 1 Step 1 complete) |
| Agency Settings | `/ems-dashboard` → Settings | Requires login | ✅ Has SMS toggle (behind auth) |

EMS and Healthcare registration forms now have opt-in checkbox with consent language at phone number collection.

---

## Phase 1: Add Opt-In to EMS Registration (Primary Fix) ✅ Complete

### Step 1: Add SMS opt-in checkbox to registration forms
- [x] Add checkbox near the phone number field (where number is collected)
- [x] Include explicit consent disclaimer: "I consent to receive SMS notifications for new trip requests. Message and data rates may apply. Reply STOP to opt out."
- [x] Make it optional (opt-in, not required)

**Technical notes:**
- Files: `frontend/src/components/EMSRegistration.tsx`, `frontend/src/components/HealthcareRegistration.tsx`
- Placed after phone number field, before Street Address
- Added to formData state: `smsOptIn: false` (default unchecked)
- EMS uses orange accent; Healthcare uses green accent

### Step 2: Update backend EMS registration
- [x] Accept `smsOptIn` from registration payload
- [x] Persist to agency record (`acceptsNotifications` on `ems_agencies`)
- [x] Default to `false` when user does not opt in

**Technical notes:**
- File: `backend/src/routes/auth.ts` (EMS register endpoint ~line 977)
- Add `smsOptIn` to destructured req.body; map to `acceptsNotifications` for agency
- Add `acceptsNotifications` to raw SQL INSERT for agency creation

### Step 3: Update Azure application
- [ ] Opt-in URL: `https://traccems.com/ems-register`
- [ ] Opt-in method: Website
- [x] Take screenshot showing phone field, checkbox, consent text, Create Account button
- [x] Upload to cloud storage, get public link, paste in Azure form

**Opt-in screenshot links (OneDrive):**
- **EMS account opt-in:** https://1drv.ms/i/c/817a4f10428e6e00/IQD8mC7VgstBSZhl15kJ7P7iATXAMPubP2tj7yVriFAk-JM?e=uidFmO
- **Healthcare account opt-in:** https://1drv.ms/i/c/817a4f10428e6e00/IQDnJ4DlmH9mQqwin6y_oR_5AeVVBfxJUp8JP2MoYrZOl4Q?e=07AQVw

---

## Phase 2: Strengthen Agency Info / Settings (Secondary) ✅ Complete

### Step 1: Review Agency Settings SMS section
- [x] Ensure checkbox is clearly framed as opt-in when checked
- [x] Add consent language if missing
- [x] Ensure opt-out instructions are visible

**Technical notes:**
- File: `frontend/src/components/AgencySettings.tsx`
- Reframed as "Opt in to receive SMS notifications for new trip requests"
- Added consent text and opt-out instructions (uncheck box or reply STOP)

---

## Phase 3: Azure Resubmission

### Pre-submission verification (complete)
- [x] Run `./scripts/verify-toll-free-urls.sh` — **All URLs passed** (2026-02-17)
- [x] Verify `https://traccems.com/ems-register` returns HTTP 200 — **Verified**

### Azure Portal steps (manual)

1. **Open the toll-free verification application** in Azure Portal  
   - Communication Services → TraccComms → Regulatory Documents  
   - Application ID: `35e65296-1dee-4d7d-970b-43d4dac831e3`

2. **Update Program Details section:**
   - **Opt-in URL:** `https://traccems.com/ems-register`
   - **Opt-in method:** Website
   - **Opt-in screenshot link:** https://1drv.ms/i/c/817a4f10428e6e00/IQD8mC7VgstBSZhl15kJ7P7iATXAMPubP2tj7yVriFAk-JM?e=uidFmO

3. **Verify other URLs** (should already be correct):
   - Website: `https://traccems.com`
   - Privacy Policy: `https://traccems.com/privacy-policy`
   - Terms: `https://traccems.com/terms`

4. **Resubmit** the application

### Resubmission complete
- **Resubmitted:** February 17, 2026
- **Status:** Awaiting Azure review (typically 1–3 business days)

---

## Database Notes

- **EMS:** `acceptsNotifications` already exists on `ems_agencies` table. No schema change.
- **Healthcare:** Added `smsNotifications` to `healthcare_users` table. **Migration required:** `20260217140000_add_sms_notifications_to_healthcare_users/migration.sql`

**To apply database changes:** Run `npx prisma migrate deploy` (or `prisma db push` for dev) in the backend directory.

---

## Progress Log

| Date | Step | Status | Notes |
|------|------|--------|-------|
| 2026-02-17 | Phase 1 Step 1 | Done | Added opt-in checkbox to EMS and Healthcare registration forms |
| 2026-02-17 | Phase 1 Step 2 | Done | Backend EMS registration - persist smsOptIn to acceptsNotifications |
| 2026-02-17 | Healthcare backend | Done | Persist smsOptIn to smsNotifications on healthcare_users; migration added |
| 2026-02-17 | Phase 2 Step 1 | Done | Agency Settings SMS section - opt-in framing, consent, opt-out instructions |
| 2026-02-17 | Phase 3 | Done | URL verification passed; added ems-register to verify script; Azure Portal checklist added |
| 2026-02-17 | Resubmission | Done | Application resubmitted to Azure; awaiting review |
