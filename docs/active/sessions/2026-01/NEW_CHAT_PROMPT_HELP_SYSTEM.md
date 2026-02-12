# New Chat Prompt - Help System Automation Enhancements

**Copy and paste this entire message to start a new chat session:**

---

I need to implement automation enhancements for the help system workflow. The goal is to eliminate manual file copying and ensure help files are always synced.

## Current Situation

- **Source of Truth:** Help files are edited in `/Users/scooper/Documents/TraccEMS/Users Guide/`
- **Application Location:** Files need to be in `frontend/public/help/` to be served
- **Current Process:** Manual copying required after each edit
- **Problem:** Easy to forget, files get out of sync

## Requirements

1. **Build Script:** Copy help files during build process
2. **File Watcher:** Auto-copy on save during development
3. **Pre-commit Hook:** Ensure files are synced before commit (auto-sync)

## Key Decisions Made

1. **File Location:** Continue editing in external location (`/Users/scooper/Documents/TraccEMS/Users Guide/`)
2. **Images:** Copy automatically to `frontend/public/help/images/{userType}/`
3. **File Naming:** Standardize and auto-rename during sync (remove `healthcare_` and `ems_` prefixes)
4. **Build Integration:** Two-stage copy: External → `src/help/` → `public/help/`
5. **Pre-commit:** Auto-sync before commit (most fail-proof)

## Files Structure

**External (Source of Truth):**
```
/Users/scooper/Documents/TraccEMS/Users Guide/
├── Healthcare/
│   ├── healthcare_helpfile01_create-request.md ✅ (finished)
│   ├── healthcare_helpfile02_transport_requests.md
│   └── Screen shots/
│       └── *.png
└── EMS/
    ├── ems_helpfile01_available_trips.md
    └── Screen shots/ (to be created)
```

**Application (Target):**
```
frontend/
├── src/help/              # Synced from external (renamed)
│   ├── healthcare/
│   │   └── helpfile01_create-request.md
│   └── ems/
└── public/help/           # Copied during build
    ├── healthcare/
    └── images/
        ├── healthcare/
        └── ems/
```

## Implementation Plan

**Full plan document:** `docs/active/sessions/2026-01/help_system_enhancements.md`

The plan includes:
- Detailed sync script specification
- Build integration steps
- File watcher setup
- Pre-commit hook configuration
- Image handling logic
- File naming standardization rules

## Active Files

- `frontend/public/help/healthcare/index.md` ✅ (exists)
- `frontend/public/help/healthcare/helpfile01_create-request.md` ✅ (exists)

## Next Steps

Please implement the automation enhancements according to the plan:
1. Create sync script (`frontend/scripts/sync-help-files.sh`)
2. Create build copy script (`frontend/scripts/copy-help-to-public.sh`)
3. Set up file watcher
4. Configure pre-commit hook
5. Update package.json scripts
6. Test with existing Healthcare files

---
