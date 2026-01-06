# Azure Startup Script Issue
**Date:** January 6, 2026  
**Issue:** Azure startup script removes `/node_modules` and tries to re-extract tar.gz

---

## Problem Identified

Azure App Service has a startup script that:
1. Detects `node_modules.tar.gz` exists
2. **Removes `/node_modules`** (deletes our manually extracted modules!)
3. Tries to extract `node_modules.tar.gz` to `/node_modules`
4. Extraction likely fails due to permissions (we saw this earlier)
5. Then runs `npm start` with empty/missing node_modules

**From logs:**
```
Found tar.gz based node_modules.
Removing existing modules directory from root...
rm -fr /node_modules
mkdir -p /node_modules
Extracting modules...
tar -xzf node_modules.tar.gz -C /node_modules
# Log stops here - extraction probably failing/hanging
```

---

## Solution

### Option 1: Remove node_modules.tar.gz (RECOMMENDED)
Since we already have `/node_modules` populated, remove the tar.gz so Azure doesn't try to extract it:

```bash
# In Kudu SSH
cd /home/site/wwwroot
rm node_modules.tar.gz
```

Then restart the App Service. Azure will see no tar.gz and skip the extraction step.

### Option 2: Fix Extraction in Startup Script
Modify the startup script to handle permissions, but this is more complex.

### Option 3: Prevent tar.gz from Being Deployed
Fix the GitHub Actions workflow to not create/deploy `node_modules.tar.gz` in the first place.

---

## Immediate Action

**Remove the tar.gz file:**
```bash
cd /home/site/wwwroot
rm node_modules.tar.gz
ls -lh node_modules.tar.gz  # Should show "No such file"
```

**Then restart App Service:**
```bash
az webapp restart --name TraccEms-Dev-Backend --resource-group TraccEms-Dev-USCentral
```

**Expected result:**
- Azure startup script won't detect tar.gz
- Won't remove `/node_modules`
- Will skip extraction step
- Will run `npm start` with existing `/node_modules`
- Backend should start successfully

---

**Last Updated:** January 6, 2026

