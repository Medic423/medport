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

**Last Updated:** February 3, 2026  
**Status:** Local files updated ✅ | Manual updates required for GitHub Secrets and Azure App Services
