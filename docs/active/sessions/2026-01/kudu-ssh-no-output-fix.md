# Kudu SSH Terminal Not Showing Output - Fix

## Problem
- SSH connection established ✅
- Commands run but no output shown ❌
- Terminal appears frozen

## Solutions

### Solution 1: Try Different Commands with Explicit Output

```bash
pwd && echo "Current directory shown above"
```

```bash
ls -la | cat
```

```bash
test -d node_modules && echo "node_modules EXISTS" || echo "node_modules NOT FOUND"
```

### Solution 2: Check if Extraction Already Worked

Try checking via file browser instead:
1. Click "Environment" tab (or any other tab)
2. Go back to file browser
3. Navigate to "Site wwwroot"
4. Check if `node_modules` folder now exists

### Solution 3: Restart Terminal Session

1. Close the SSH tab/window
2. Click "SSH" tab again to start fresh session
3. Try commands again

### Solution 4: Use Azure CLI Instead

If Kudu terminal isn't working, use Azure CLI from your local machine:

```bash
az webapp ssh --name TraccEms-Dev-Backend --resource-group TraccEms-Dev-USCentral
```

Then run the extraction commands.

### Solution 5: Check File Browser

The extraction might have worked but terminal isn't showing output:
1. Go to file browser in Kudu
2. Navigate to "Site wwwroot"
3. Check if `node_modules` folder exists
4. If it exists, extraction worked!

---

**Last Updated:** January 5, 2026

