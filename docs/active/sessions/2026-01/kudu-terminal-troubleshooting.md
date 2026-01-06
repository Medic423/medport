# Kudu Terminal Troubleshooting

## Issue: Commands Not Showing Output

If commands aren't showing output, try these steps:

### Step 1: Verify Terminal is Responsive
```bash
pwd
```
Should show: `/home/site/wwwroot`

### Step 2: Check if tar file exists
```bash
ls -lh node_modules.tar.gz
```
Should show the file size (50MB)

### Step 3: Check current directory
```bash
ls -la | grep node_modules
```
Should show `node_modules.tar.gz` if you're in the right place

### Step 4: Try extraction with verbose output
```bash
tar -xzvf node_modules.tar.gz 2>&1 | head -20
```
The `-v` flag shows what's being extracted

### Step 5: Check if extraction already happened
```bash
test -d node_modules && echo "node_modules exists" || echo "node_modules does NOT exist"
```

### Step 6: Check disk space (extraction might fail silently)
```bash
df -h /home
```

## Alternative: Try Different Approach

If terminal seems stuck, try:

1. **Refresh the Kudu page** and try again
2. **Use a different tab** (try "SSH" tab instead of "Bash")
3. **Check if extraction is happening in background** - wait 1-2 minutes, then check

## Manual Extraction via Azure Portal

If terminal isn't working:
1. Azure Portal → TraccEms-Dev-Backend
2. Advanced Tools (Kudu) → Go
3. Debug console → CMD (instead of Bash)
4. Try the same commands

---

**Last Updated:** January 5, 2026

