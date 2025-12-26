# Pre-Implementation Checklist
**Created:** December 12, 2025  
**Purpose:** Information to gather before starting production deployment implementation

## Quick Reference

### Critical Information Needed

1. **Namecheap DNS Configuration**
   - Current DNS records for traccems.com
   - Any existing records to preserve
   - Access to modify DNS records

2. **Azure Resource Details**
   - Dev resource group name
   - Dev resource regions (to match for production)
   - Azure subscription access confirmed

3. **GitHub Access**
   - Repository access confirmed
   - Ability to create secrets
   - GitHub Actions enabled

---

## Detailed Checklist

### 1. Namecheap DNS Information

**Action Required:** Log into Namecheap and document current DNS setup

- [ ] **Access Namecheap:**
  - URL: https://ap.www.namecheap.com
  - Log in and navigate to Domain List → traccems.com → Advanced DNS

- [ ] **Document Current DNS Records:**
  - [ ] List all A records
  - [ ] List all CNAME records
  - [ ] List all MX records (if any)
  - [ ] List any TXT records (if any)
  - [ ] Note current TTL settings

- [ ] **Identify Records to Preserve:**
  - [ ] Email MX records (if using email hosting)
  - [ ] Any other critical records
  - [ ] Note which records can be replaced

- [ ] **Screenshot or Document:**
  - Take screenshot of current DNS configuration
  - Or create a text list of all records
  - Save for reference during implementation

**Example Format:**
```
Current DNS Records for traccems.com:
- A Record: @ → [IP Address] (TTL: 3600)
- CNAME: www → [target] (TTL: 3600)
- MX: @ → mail.[provider].com (Priority: 10)
```

A Record: @ → 216.198.79.1 (TTL: Automatic)
CNAME Record: api → 492395b7c4732f5e.vercel-dns-017.com (TTL: Automatic)
CNAME Record: autodiscover → autodiscover.outlook.com (TTL: 60 min)
CNAME Record: dev → jolly-plant-07b71a110.3.azurestaticapps.net (TTL: Automatic)
CNAME Record dev-api traccems-dev-backend-h4add2fpcegrc2bz.centralus-01.azurewebsites.net  (TTL: Automatic)
MX Record: @ → com.mail.protection.outlook.com 0 (TTL: 60 min)

---

### 2. Azure Portal Information

**Action Required:** Gather details about existing dev resources

- [x] **Azure Portal Access:**
  - [x] Confirm you can log into Azure Portal ✅
  - [x] Verify subscription access ✅
  - [x] Subscription ID: `fb5dde6b-779f-4ef5-b457-4b4d087a48ee`
  - [x] Subscription Name: `TraccEmsSubscription`

- [x] **Dev Resource Group:**
  - [x] Resource group name: `TraccEms-Dev-USCentral`
  - [x] Region: `Central US`
  - [ ] Decide: Use same resource group or create new for production?
  - [ ] **Recommendation:** Create new production resource group: `TraccEms-Prod-USCentral`

- [x] **Dev Frontend (Static Web App):**
  - [x] Resource name: `TraccEms-Dev-Frontend`
  - [x] Resource group: `TraccEms-Dev-USCentral`
  - [x] Region: `Central US`
  - [ ] SKU tier: _________________ (Check in Azure Portal)

- [x] **Dev Backend (App Service):**
  - [x] Resource name: `TraccEms-Dev-Backend`
  - [x] Resource group: `TraccEms-Dev-USCentral`
  - [x] Region: `Central US`
  - [x] App Service Plan: `ASP-TraccEmsDevUSCentral-aa72`
  - [x] Plan resource group: `TraccEms-Dev-USCentral`
  - [x] Plan region: `Central US`
  - [ ] Plan tier: _________________ (Check in Azure Portal)

- [x] **Dev Database:**
  - [x] Server name: `traccems-dev-pgsql`
  - [x] Resource group: `TraccEms-Dev-USCentral`
  - [x] Region: `Central US`
  - [x] Type: Azure Database for PostgreSQL flexible server
  - [ ] PostgreSQL version: _________________ (Check in Azure Portal)
  - [ ] Compute tier: _________________ (Check in Azure Portal)

- [x] **Communication Services:**
  - [x] Resource name: `TraccComms`
  - [x] Resource group: `DefaultResourceGroup-EUS2`
  - [x] Region: `Global`
  - [x] Connection string accessible: [ ] Yes [ ] No (Verify in Azure Portal)
  - [x] Phone number: `+18339675959` ✅

- [x] **Additional Resources:**
  - [x] Public IP: `71.58.90.33` (Resource group: `DefaultResourceGroup-EUS2`, Region: `Central US`)

---

### 3. GitHub Repository Information

**Action Required:** Verify GitHub access and capabilities

- [ ] **Repository Access:**
  - [ ] Repository URL: _________________
  - [ ] Can access repository: [ ] Yes [ ] No
  - [ ] Can create branches: [ ] Yes [ ] No
  - [ ] Can create workflows: [ ] Yes [ ] No

- [ ] **GitHub Secrets:**
  - [ ] Can access Settings → Secrets and variables → Actions: [ ] Yes [ ] No
  - [ ] Can create new secrets: [ ] Yes [ ] No
  - [ ] Current secrets list (for reference):
    - `DATABASE_URL` ✅
    - `AZURE_WEBAPP_PUBLISH_PROFILE` ✅
    - `AZURE_FRONTEND_API_TOKEN` ✅
    - `PAT_TOKEN` ✅

- [ ] **GitHub Actions:**
  - [ ] Actions enabled: [ ] Yes [ ] No
  - [ ] Can view workflow runs: [ ] Yes [ ] No
  - [ ] Can trigger workflows manually: [ ] Yes [ ] No

---

### 4. Production Requirements (Optional - Can Determine Later)

- [ ] **Expected Traffic:**
  - [ ] Low (< 100 users/day)
  - [ ] Medium (100-1000 users/day)
  - [ ] High (> 1000 users/day)
  - [ ] Unknown (start with standard tier)

- [ ] **Database Sizing:**
  - [ ] Start with same tier as dev
  - [ ] Start with higher tier
  - [ ] Let Azure recommend

- [ ] **Backup Requirements:**
  - [ ] Use Azure defaults (7 days)
  - [ ] Custom retention period: _____ days
  - [ ] Geo-redundant backups needed: [ ] Yes [ ] No

- [ ] **High Availability:**
  - [ ] Standard availability (single region)
  - [ ] High availability (multi-region)
  - [ ] Start standard, upgrade later

---

### 5. Decision Points

- [x] **Resource Group:**
  - [x] Dev resource group: `TraccEms-Dev-USCentral` ✅
  - [x] Create new production resource group: `TraccEms-Prod-USCentral` (recommended) ✅
  - [x] Decision: Create separate production resource group

- [x] **Region Selection:**
  - [x] Dev region: `Central US` ✅
  - [x] Match dev region exactly: `Central US` (recommended for consistency) ✅
  - [x] Decision: Use `Central US` for all production resources

- [x] **App Service Plan:**
  - [x] Dev plan: `ASP-TraccEmsDevUSCentral-aa72` ✅
  - [x] Create new plan for production (recommended) ✅
  - [x] Decision: Create new production App Service Plan

---

## Information Gathering Commands

### Check Current DNS (from terminal)
```bash
# Check current DNS records
dig traccems.com ANY
# Or
nslookup traccems.com

# Check specific record types
dig traccems.com A
dig traccems.com MX
dig traccems.com CNAME
```

### Azure CLI (if available)
```bash
# List resource groups
az group list --output table

# List resources in dev resource group
az resource list --resource-group [dev-resource-group] --output table

# Get dev database details
az postgres flexible-server show --name traccems-dev-pgsql --resource-group [resource-group]
```

---

## Notes Section

Use this space to document any findings or decisions:

```
DNS Notes:
✅ All DNS records documented (December 12, 2025)
✅ Email records identified for preservation (MX, autodiscover)
✅ Dev records identified for preservation (dev, dev-api)
✅ Records to update identified (@ root domain, api subdomain)

Azure Notes:
✅ Subscription: TraccEmsSubscription (fb5dde6b-779f-4ef5-b457-4b4d087a48ee)
✅ Dev Resource Group: TraccEms-Dev-USCentral (Central US)
✅ Production Resource Group: TraccEms-Prod-USCentral (to be created, Central US)
✅ Dev Frontend: TraccEms-Dev-Frontend (Static Web App, Central US)
✅ Dev Backend: TraccEms-Dev-Backend (App Service, Central US)
✅ Dev Database: traccems-dev-pgsql (PostgreSQL Flexible Server, Central US)
✅ Dev App Service Plan: ASP-TraccEmsDevUSCentral-aa72 (Central US)
✅ Communication Services: TraccComms (Global, DefaultResourceGroup-EUS2)
✅ All production resources will be created in Central US region (matching dev)

GitHub Notes:
________________________________________________________
________________________________________________________

Other Notes:
________________________________________________________
________________________________________________________
```

---

## Ready to Proceed?

Once you've gathered the information above, review the main plan and give the OK to start implementation.

**Next Step:** Review `production-deployment-plan.md` and provide approval to begin Phase 1.

