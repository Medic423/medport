# Node Modules Deployment Strategy
**Last Updated:** January 9, 2026  
**Status:** ✅ **CURRENT APPROACH - DO NOT CHANGE**

---

## ⚠️ CRITICAL: Do Not Use Archive Approach

**DO NOT** attempt to use `node_modules.tar.gz` archive extraction for Azure deployments. This approach has been tried multiple times and consistently fails.

---

## Current Strategy: Direct Deployment

### Approach
- **Deploy `node_modules` directory directly** in the deployment package
- No compression, no extraction, no archive creation
- Package size: ~184MB (uncompressed)
- Deployment time: Standard (no extraction delays)

### Why This Works
- ✅ **Reliable** - No extraction step that can hang/timeout
- ✅ **Fast startup** - Backend starts immediately
- ✅ **Simple** - No complex extraction logic needed
- ✅ **Proven** - This approach was successful in the past (January 6, 2026)

### Implementation
- GitHub Actions workflow installs dependencies with `npm install`
- `node_modules` directory is **included** in deployment package
- Azure App Service receives complete package with dependencies
- Backend starts with `npm start` → `node dist/index.js`
- No extraction scripts or startup delays

---

## Failed Approaches (DO NOT USE)

### ❌ Archive Extraction Approach
**What was tried:**
- Create `node_modules.tar.gz` archive (~50MB compressed)
- Remove `node_modules` before deployment
- Extract archive on Azure startup

**Why it failed:**
- Archive extraction consistently hangs/times out
- Extraction takes 4+ minutes and often fails
- Backend crashes with "Cannot find module 'express'"
- Multiple attempts (January 6, 2026 and January 9, 2026) both failed

**Commits that implemented this (REVERTED):**
- `8ccd155f` - Archive creation
- `46f4b1b0` - Production workflow archive
- `97f18594` - Archive timeout/logging
- `9ca138ed` - Prestart hook extraction
- `7b239df5` - Inline extraction in start script

**Final revert commit:**
- `174c97ea` - Deploy node_modules directly instead of using archive

---

## Workflow Configuration

### Dev-SWA Workflow (`.github/workflows/dev-be.yaml`)
```yaml
- name: Install dependencies
  run: npm install
  working-directory: './backend'

- name: Build application
  run: npm run build
  working-directory: './backend'

# NO archive creation step
# NO node_modules removal step

- name: Deploy to Azure Web App
  uses: azure/webapps-deploy@v2
  with:
    package: './backend'  # Includes node_modules directory
```

### Production Workflow (`.github/workflows/prod-be.yaml`)
Same approach - deploy `node_modules` directly.

---

## Package.json Start Scripts

### Current (Simple)
```json
{
  "scripts": {
    "start": "node dist/index.js",
    "start:prod": "node dist/production-index.js"
  }
}
```

### ❌ Do NOT Use (Archive Extraction)
```json
{
  "scripts": {
    "prestart": "extract archive...",
    "start": "extract && node dist/index.js"
  }
}
```

---

## Historical Context

### January 6, 2026
- Archive approach attempted
- Extraction failed/hung
- Reverted to direct deployment
- **Direct deployment was successful**

### January 9, 2026
- Archive approach attempted again (forgot previous failure)
- Multiple extraction attempts:
  - Prestart hook (didn't execute)
  - Inline extraction in start script (hung)
- Reverted to direct deployment again
- **Direct deployment is current approach**

---

## Key Takeaways

1. **Archive extraction is unreliable** - Don't try to optimize this way
2. **Direct deployment works** - Accept the larger package size
3. **Check documentation first** - This decision was made before
4. **Update docs when reverting** - Document why we're reverting

---

## Future Considerations

If package size becomes a critical issue:
1. **Consider Azure Build Service** - Let Azure handle npm install
2. **Use Azure DevOps** - Different deployment pipeline
3. **Optimize dependencies** - Remove unused packages
4. **Do NOT use archive extraction** - It doesn't work reliably

---

**Status:** ✅ Current approach is working  
**Do Not Change:** Archive extraction approach  
**Last Verified:** January 9, 2026
