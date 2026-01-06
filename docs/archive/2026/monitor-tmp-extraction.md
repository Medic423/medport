# Monitor /tmp Extraction - January 6, 2026

## ✅ Deployment Complete

- New extraction method deployed (commit `256d99a5`)
- Extracts to `/tmp` first, then moves to `wwwroot`
- App Service restarted

---

## What to Look For in Logs

### Expected Sequence (If Working):

```
Found deps.tar.gz archive. Extracting...
Archive size: 49M
Extracting to /tmp first (more reliable in Azure)...
Starting extraction at [timestamp]
✅ Extraction to /tmp completed in XX seconds
Moving node_modules to current directory...
✅ Move completed. Total time: XX seconds
✅ Successfully extracted node_modules from archive.
node_modules size: 184M
Removing archive...
=== Starting Application ===
🚀 TCC Backend server running on port...
```

### If Extraction Still Hangs:

```
Extracting to /tmp first (more reliable in Azure)...
Starting extraction at [timestamp]
[No output for 2+ minutes]
```

### If Extraction Fails:

```
❌ Extraction failed or timed out after XX seconds
⚠️ Extraction failed or incomplete. Falling back to npm install...
```

---

## Why This Should Work

1. **/tmp is optimized** for temporary file operations
2. **Avoids I/O contention** with web server files
3. **Faster filesystem** operations in containerized environments
4. **Move operation** is atomic and fast

---

## Timeline Expectations

- **0-30 seconds:** Extract to /tmp
- **30-60 seconds:** Move to wwwroot
- **60-90 seconds:** Backend starts
- **Total:** 1-2 minutes

---

## If This Still Doesn't Work

If extraction to /tmp also hangs, we may need to consider:

1. **Pre-extract in GitHub Actions** - Extract archive before deployment
2. **Use different compression** - Try `.zip` instead of `.tar.gz`
3. **Deploy node_modules directly** - If we can optimize size
4. **Use Azure's build system** - Let Azure handle dependency installation differently

---

**Last Updated:** January 6, 2026  
**Status:** Monitoring /tmp extraction method

