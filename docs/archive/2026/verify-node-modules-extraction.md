# Verify node_modules Extraction - Commands to Run

## Check if Extraction Worked

Run these commands in Kudu Bash to verify:

### 1. Check if node_modules folder exists
```bash
ls -la node_modules | head -10
```

**Expected:** Should show folders like `@prisma`, `express`, `cors`, etc.

### 2. Check Prisma client specifically
```bash
ls -la node_modules/@prisma/client
```

**Expected:** Should show Prisma client files

### 3. Check folder size (to verify it's not empty)
```bash
du -sh node_modules
```

**Expected:** Should show size like "50M" or similar (not 0)

### 4. If node_modules doesn't exist, try extraction with verbose output
```bash
tar -xzvf node_modules.tar.gz 2>&1 | head -20
```

The `-v` flag shows verbose output so you can see what's being extracted.

## Troubleshooting

### If tar command seems stuck:
- It might be extracting (50MB can take 30-60 seconds)
- Wait a bit longer, then check if `node_modules` folder exists
- Or cancel (Ctrl+C) and try with verbose flag

### If extraction fails:
- Check disk space: `df -h`
- Check file permissions: `ls -la node_modules.tar.gz`
- Try extracting to a different location first

---

**Last Updated:** January 5, 2026

