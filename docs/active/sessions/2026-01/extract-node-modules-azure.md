# Extract node_modules.tar.gz in Azure - Quick Fix

## Problem
- `node_modules.tar.gz` exists (50MB)
- `node_modules` folder doesn't exist
- Backend crashes because dependencies are missing

## Solution: Extract node_modules.tar.gz

### Option 1: Using Kudu Bash (Recommended)

1. In Kudu, click **"Bash"** tab (top navigation)
2. Run these commands:
   ```bash
   cd /home/site/wwwroot
   tar -xzf node_modules.tar.gz
   ls -la node_modules/@prisma/client 2>&1 | head -5
   ```
3. Verify `node_modules/@prisma/client` exists
4. Restart the App Service

### Option 2: Using Kudu CMD

1. In Kudu, click **"CMD"** tab (if available)
2. Navigate to: `site\wwwroot`
3. Extract: (Windows commands if CMD is Windows-based)
   - Or use Bash tab instead

### Option 3: Using Azure CLI

```bash
az webapp ssh --name TraccEms-Dev-Backend --resource-group TraccEms-Dev-USCentral
# Then run:
cd /home/site/wwwroot
tar -xzf node_modules.tar.gz
exit
```

## After Extraction

1. **Verify extraction:**
   ```bash
   ls -la node_modules/@prisma/client
   ```
   Should show the Prisma client folder

2. **Restart App Service:**
   ```bash
   az webapp restart --name TraccEms-Dev-Backend --resource-group TraccEms-Dev-USCentral
   ```

3. **Test backend:**
   ```bash
   curl https://dev-api.traccems.com/health --max-time 5
   ```

## Long-term Fix

After this works, we need to:
1. Remove `node_modules.tar.gz` from being deployed
2. Ensure GitHub Actions properly installs dependencies
3. Or configure Azure to extract tar.gz during deployment

---

**Last Updated:** January 5, 2026  
**Status:** Quick fix instructions

