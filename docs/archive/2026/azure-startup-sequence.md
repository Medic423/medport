# Azure App Service Startup Sequence - January 6, 2026

## Normal Startup Sequence

Understanding the Azure App Service startup sequence helps set expectations:

### Phase 1: Initialization (0-30 seconds)
```
A P P   S E R V I C E   O N   L I N U X
NodeJS Version: v24.11.0
Note: Any data outside '/home' is not persisted
```

### Phase 2: Services Start (30-60 seconds)
```
* Starting OpenBSD Secure Shell server sshd
...done.
WEBSITES_INCLUDE_CLOUD_CERTS is not set to true.
Updating certificates in /etc/ssl/certs...
```

**⚠️ This step can take 1-2 minutes!** This is normal and expected.

### Phase 3: Azure Startup Script (After certificates)
```
Writing output script to '/opt/startup/startup.sh'
Running #!/bin/sh
cd "/home/site/wwwroot"
PATH="$PATH:/home/site/wwwroot" ./startup.sh
```

### Phase 4: Our Custom Startup Script
```
==========================================
STARTUP SCRIPT STARTING - [timestamp]
==========================================
=== Azure App Service Startup Script ===
Found deps.tar.gz archive. Extracting...
Extracting to /tmp first (more reliable in Azure)...
```

### Phase 5: Archive Extraction
```
✅ Extraction to /tmp completed in XX seconds
✅ Move completed. Total time: XX seconds
✅ Successfully extracted node_modules from archive.
```

### Phase 6: Application Start
```
=== Starting Application ===
🚀 TCC Backend server running on port...
```

---

## Timeline Expectations

- **0-30 seconds:** App Service initialization
- **30-90 seconds:** SSH server, certificate updates (can take 1-2 minutes)
- **90-120 seconds:** Azure startup script runs
- **120-180 seconds:** Our startup script extracts archive
- **180-240 seconds:** Backend starts

**Total:** 3-4 minutes from restart to backend running

---

## What You're Seeing Now

You're currently at **Phase 2** - certificate updates. This is normal and can take 1-2 minutes. After this completes, you should see:

1. Azure's startup script running
2. Our custom startup script starting
3. Archive extraction
4. Backend starting

---

## Patience is Key

The "No new trace" messages during certificate updates are normal. Wait for:
- Certificate update to complete
- Then you'll see the startup script messages
- Then extraction
- Then backend start

---

**Last Updated:** January 6, 2026  
**Status:** Waiting for certificate updates to complete (normal, takes 1-2 minutes)

