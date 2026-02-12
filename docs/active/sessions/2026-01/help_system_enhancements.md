# Help System Automation Enhancements Plan
**Date:** January 21, 2026  
**Status:** 📋 **PLAN - READY FOR IMPLEMENTATION**  
**Goal:** Automate help file synchronization and eliminate manual copying

---

## Executive Summary

This plan outlines enhancements to automate the help system workflow, eliminating the need for manual file copying. The system will:

1. **Keep external location as source of truth** - Continue editing in `/Users/scooper/Documents/TraccEMS/Users Guide`
2. **Auto-sync files** - Automatically copy and rename files from external location to application
3. **Auto-sync images** - Copy screenshots from external location to application
4. **Build integration** - Copy files during build process
5. **File watcher** - Auto-copy on save during development
6. **Pre-commit hook** - Ensure files are synced before committing

---

## Current State Analysis

### Source Files Location (Source of Truth)
```
/Users/scooper/Documents/TraccEMS/Users Guide/
├── Healthcare/
│   ├── healthcare_helpfile01_create-request.md ✅ (finished)
│   ├── healthcare_helpfile02_transport_requests.md
│   ├── healthcare_helpfile03_in_progress.md
│   ├── healthcare_helpfile04_completed_trips.md
│   ├── healthcare_helpfile05_hospital_settings.md
│   ├── healthcare_helpfile06_ems_providers.md
│   ├── healthcare_helpfile07_destinations.md
│   ├── healthcare_helpfile08_team_members.md
│   └── Screen shots/
│       ├── 01a-create_request_patient_info.png
│       ├── 01b-create_request_trip_details.png
│       ├── 01c-create_request_clinical_details.png
│       ├── 01d-create_request_dispatch_trip_to_agencies.png
│       └── 01e-create_request_dispatch_trip_to_agencies.png
│
└── EMS/
    ├── ems_helpfile01_available_trips.md
    ├── ems_helpfile02_my_trips.md
    ├── ems_helpfile03_completed_trips copy.md
    ├── ems_helpfile04_units.md
    ├── ems_helpfile05_users.md
    ├── ems_helpfile06_agency.md
    ├── ems_helpfile07_trip_calculator.md
    └── Screen shots/ (to be created)
```

### Application Structure (Target)
```
frontend/
├── src/
│   └── help/                    # Source files (synced from external)
│       ├── healthcare/
│       │   ├── index.md
│       │   ├── helpfile01_create-request.md  (renamed from healthcare_helpfile01_)
│       │   └── ...
│       ├── ems/
│       │   └── ...
│       └── tcc-admin/
│           └── ...
│
└── public/
    └── help/                    # Runtime files (copied during build)
        ├── healthcare/
        │   ├── index.md
        │   ├── helpfile01_create-request.md
        │   └── ...
        └── images/
            ├── healthcare/
            │   └── *.png       (copied from external Screen shots/)
            └── ems/
                └── *.png       (copied from external Screen shots/)
```

### Current Active Files
- `frontend/public/help/healthcare/index.md` ✅ (exists)
- `frontend/public/help/healthcare/helpfile01_create-request.md` ✅ (exists)

---

## Design Decisions

### 1. Source of Truth: External Location ✅ CONFIRMED
**Decision:** Continue editing files in `/Users/scooper/Documents/TraccEMS/Users Guide/`

**Rationale:**
- Files are already being edited there
- Keeps documentation separate from codebase
- Easier for non-developers to contribute
- Can use external tools/editors without affecting repo

**Workflow:**
1. Edit files in external location
2. Automation syncs to `frontend/src/help/` (intermediate location)
3. Build process copies from `frontend/src/help/` → `frontend/public/help/`

### 2. File Naming Standardization ✅ CONFIRMED
**Decision:** Auto-rename during sync to standardize naming

**Naming Rules:**
- Remove `healthcare_` prefix: `healthcare_helpfile01_create-request.md` → `helpfile01_create-request.md`
- Remove `ems_` prefix: `ems_helpfile01_available_trips.md` → `helpfile01_available_trips.md`
- Keep `helpfile##_` prefix for consistency
- Use lowercase with hyphens

**Mapping:**
```
External → Application
healthcare_helpfile01_create-request.md → helpfile01_create-request.md
healthcare_helpfile02_transport_requests.md → helpfile02_transport-requests.md
ems_helpfile01_available_trips.md → helpfile01_available-trips.md
```

### 3. Image Handling ✅ CONFIRMED
**Decision:** Copy images automatically to `frontend/public/help/images/{userType}/`

**Structure:**
- Source: `/Users/scooper/Documents/TraccEMS/Users Guide/Healthcare/Screen shots/`
- Target: `frontend/public/help/images/healthcare/`
- Source: `/Users/scooper/Documents/TraccEMS/Users Guide/EMS/Screen shots/` (to be created)
- Target: `frontend/public/help/images/ems/`

**Image References in Markdown:**
- Update image paths in markdown files during sync
- External: `![Description](./Screen shots/01a-create_request_patient_info.png)`
- Application: `![Description](/help/images/healthcare/01a-create_request_patient_info.png)`

### 4. Build Integration ✅ CONFIRMED
**Decision:** Two-stage copy process

**Stage 1: External → src/help** (Sync script)
- Copies from external location to `frontend/src/help/`
- Renames files (removes prefixes)
- Updates image paths in markdown
- Runs: On save (file watcher), before commit (pre-commit), manually

**Stage 2: src/help → public/help** (Build script)
- Copies from `frontend/src/help/` to `frontend/public/help/`
- Runs: During `npm run build`

### 5. Pre-commit Hook ✅ CONFIRMED
**Decision:** Auto-sync before commit (most fail-proof)

**Behavior:**
- Runs sync script automatically before commit
- Ensures `frontend/src/help/` is always up-to-date
- Commits synced files along with code changes
- No manual intervention needed

---

## Implementation Plan

### Phase 1: Sync Script (Core Functionality)

#### 1.1 Create Sync Script
**File:** `frontend/scripts/sync-help-files.sh`

**Functionality:**
- Copy markdown files from external location to `frontend/src/help/`
- Rename files (remove `healthcare_` and `ems_` prefixes)
- Copy images from external `Screen shots/` to `frontend/public/help/images/{userType}/`
- Update image paths in markdown files
- Preserve `index.md` files (don't overwrite if they exist, or merge content)

**Script Structure:**
```bash
#!/bin/bash
# Sync help files from external location to application

EXTERNAL_DOCS="/Users/scooper/Documents/TraccEMS/Users Guide"
FRONTEND_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SRC_HELP="${FRONTEND_ROOT}/src/help"
PUBLIC_HELP="${FRONTEND_ROOT}/public/help"

# Sync Healthcare files
# Sync EMS files
# Sync images
# Update image paths in markdown
```

#### 1.2 File Naming Logic
**Rules:**
- `healthcare_helpfile01_create-request.md` → `helpfile01_create-request.md`
- `healthcare_helpfile02_transport_requests.md` → `helpfile02_transport-requests.md`
- `ems_helpfile01_available_trips.md` → `helpfile01_available-trips.md`
- Handle both `_` and `-` in filenames consistently

#### 1.3 Image Path Updates
**Pattern Matching:**
- Find: `![.*](./Screen shots/.*\.png)`
- Replace: `![Description](/help/images/{userType}/filename.png)`
- Preserve alt text
- Update relative paths to absolute paths

### Phase 2: Build Script Integration

#### 2.1 Update package.json
**Add script:**
```json
{
  "scripts": {
    "sync-help": "bash scripts/sync-help-files.sh",
    "build": "npm run sync-help && vite build --mode production",
    "build:check": "npm run sync-help && tsc && vite build"
  }
}
```

#### 2.2 Create Build Copy Script
**File:** `frontend/scripts/copy-help-to-public.sh`

**Functionality:**
- Copy all `.md` files from `src/help/` to `public/help/`
- Preserve directory structure
- Run as part of build process

**Integration:**
- Called automatically during `npm run build`
- Ensures `public/help/` is always in sync with `src/help/`

### Phase 3: File Watcher (Development)

#### 3.1 Install File Watcher Tool
**Options:**
- **chokidar-cli** (Node.js based, cross-platform)
- **fswatch** (macOS native)
- **nodemon** (already in use, can be extended)

**Recommendation:** Use `chokidar-cli` for cross-platform compatibility

#### 3.2 Create Watch Script
**File:** `frontend/scripts/watch-help-files.sh`

**Functionality:**
- Watch external location for changes
- Auto-run sync script on file save
- Provide feedback in terminal

**Usage:**
```bash
npm run watch:help
```

#### 3.3 Update package.json
**Add script:**
```json
{
  "scripts": {
    "watch:help": "chokidar \"$HOME/Documents/TraccEMS/Users Guide/**/*.md\" -c \"npm run sync-help\""
  }
}
```

### Phase 4: Pre-commit Hook

#### 4.1 Install Husky (Git Hooks Manager)
**Installation:**
```bash
cd frontend
npm install --save-dev husky
npx husky init
```

#### 4.2 Create Pre-commit Hook
**File:** `.husky/pre-commit`

**Functionality:**
- Run sync script before commit
- Stage synced files automatically
- Continue with commit

**Script:**
```bash
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

cd frontend
npm run sync-help
git add src/help/ public/help/images/
```

#### 4.3 Update package.json
**Add prepare script:**
```json
{
  "scripts": {
    "prepare": "husky install"
  }
}
```

### Phase 5: Image Handling

#### 5.1 Create Image Sync Logic
**In sync script:**
- Copy from `Healthcare/Screen shots/` → `public/help/images/healthcare/`
- Copy from `EMS/Screen shots/` → `public/help/images/ems/`
- Preserve filenames
- Create directories if they don't exist

#### 5.2 Image Path Updates in Markdown
**Pattern Replacement:**
```bash
# Find patterns like:
![Description](./Screen shots/01a-create_request_patient_info.png)
![Description](../Screen shots/01a-create_request_patient_info.png)

# Replace with:
![Description](/help/images/healthcare/01a-create_request_patient_info.png)
```

**Considerations:**
- Handle both relative (`./`) and parent (`../`) paths
- Preserve alt text
- Update paths for both Healthcare and EMS files

---

## File Structure After Implementation

### External Location (Source of Truth)
```
/Users/scooper/Documents/TraccEMS/Users Guide/
├── Healthcare/
│   ├── healthcare_helpfile01_create-request.md  ← Edit here
│   ├── healthcare_helpfile02_transport_requests.md
│   └── Screen shots/
│       └── *.png  ← Images here
└── EMS/
    ├── ems_helpfile01_available_trips.md  ← Edit here
    └── Screen shots/
        └── *.png  ← Images here
```

### Application Structure (Synced)
```
frontend/
├── scripts/
│   ├── sync-help-files.sh          ← Syncs external → src/help
│   ├── copy-help-to-public.sh      ← Copies src/help → public/help
│   └── watch-help-files.sh         ← File watcher
│
├── src/
│   └── help/                       ← Synced from external (renamed)
│       ├── healthcare/
│       │   ├── index.md
│       │   ├── helpfile01_create-request.md  ← Renamed
│       │   └── ...
│       └── ems/
│           └── ...
│
└── public/
    └── help/                       ← Copied during build
        ├── healthcare/
        │   └── *.md
        └── images/
            ├── healthcare/
            │   └── *.png           ← Copied from external
            └── ems/
                └── *.png
```

---

## Scripts to Create

### 1. `frontend/scripts/sync-help-files.sh`
**Purpose:** Sync files from external location to `frontend/src/help/`

**Key Features:**
- Copy markdown files
- Rename files (remove prefixes)
- Copy images
- Update image paths in markdown
- Preserve directory structure
- Handle both Healthcare and EMS files

### 2. `frontend/scripts/copy-help-to-public.sh`
**Purpose:** Copy files from `src/help/` to `public/help/` during build

**Key Features:**
- Copy all `.md` files
- Preserve directory structure
- Run silently during build

### 3. `frontend/scripts/watch-help-files.sh`
**Purpose:** Watch external location and auto-sync on save

**Key Features:**
- Watch for `.md` file changes
- Run sync script automatically
- Provide terminal feedback

---

## Package.json Updates

### New Scripts
```json
{
  "scripts": {
    "sync-help": "bash scripts/sync-help-files.sh",
    "copy-help": "bash scripts/copy-help-to-public.sh",
    "watch:help": "chokidar \"$HOME/Documents/TraccEMS/Users Guide/**/*.md\" -c \"npm run sync-help\"",
    "build": "npm run sync-help && npm run copy-help && vite build --mode production",
    "build:check": "npm run sync-help && npm run copy-help && tsc && vite build",
    "prepare": "husky install"
  },
  "devDependencies": {
    "chokidar-cli": "^3.0.0",
    "husky": "^8.0.3"
  }
}
```

---

## Pre-commit Hook Configuration

### `.husky/pre-commit`
```bash
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

echo "🔄 Syncing help files before commit..."
cd frontend
npm run sync-help

# Stage synced files
git add src/help/ public/help/images/

echo "✅ Help files synced and staged"
```

---

## Workflow After Implementation

### Daily Editing Workflow
1. **Edit files** in `/Users/scooper/Documents/TraccEMS/Users Guide/`
2. **File watcher** (if running) auto-syncs to `frontend/src/help/`
3. **Or manually run:** `npm run sync-help`
4. **Test changes** in development environment
5. **Commit changes** - pre-commit hook ensures sync

### Build Workflow
1. **Run build:** `npm run build`
2. **Build script automatically:**
   - Syncs external → `src/help/`
   - Copies `src/help/` → `public/help/`
   - Builds application
3. **Deploy** - help files are included

### Commit Workflow
1. **Make code changes**
2. **Stage files:** `git add ...`
3. **Commit:** `git commit -m "..."`
4. **Pre-commit hook automatically:**
   - Runs sync script
   - Stages synced help files
   - Continues with commit
5. **Result:** Both code and help files committed together

---

## Image Handling Details

### Image Directory Structure
```
External:
/Users/scooper/Documents/TraccEMS/Users Guide/Healthcare/Screen shots/
├── 01a-create_request_patient_info.png
├── 01b-create_request_trip_details.png
└── ...

Application:
frontend/public/help/images/healthcare/
├── 01a-create_request_patient_info.png
├── 01b-create_request_trip_details.png
└── ...
```

### Image Path Updates in Markdown

**Before (External):**
```markdown
![Patient Info](./Screen shots/01a-create_request_patient_info.png)
```

**After (Application):**
```markdown
![Patient Info](/help/images/healthcare/01a-create_request_patient_info.png)
```

**Pattern Matching:**
- Find: `![.*](\.\.?/Screen shots/(.*\.png))`
- Replace: `![$1](/help/images/{userType}/$2)`
- Handle both `./` and `../` relative paths

---

## File Naming Standardization

### Naming Rules
1. **Remove prefixes:**
   - `healthcare_helpfile01_` → `helpfile01_`
   - `ems_helpfile01_` → `helpfile01_`

2. **Standardize separators:**
   - Keep hyphens in filenames
   - Convert underscores to hyphens if needed

3. **Preserve numbering:**
   - Keep `helpfile##_` prefix for ordering

### Examples
```
External → Application
healthcare_helpfile01_create-request.md → helpfile01_create-request.md
healthcare_helpfile02_transport_requests.md → helpfile02_transport-requests.md
ems_helpfile01_available_trips.md → helpfile01_available-trips.md
ems_helpfile02_my_trips.md → helpfile02_my-trips.md
```

---

## Special Cases

### Index Files
**Handling:**
- `index.md` files may need manual curation
- Options:
  1. **Preserve existing:** Don't overwrite if exists in `src/help/`
  2. **Merge content:** Combine external and existing
  3. **Manual management:** Keep `index.md` files manual

**Recommendation:** Keep `index.md` files manual (don't auto-sync)

### Incomplete Files
**Handling:**
- Files with "basic text" should still be synced
- Sync script copies all `.md` files regardless of content completeness
- Editor can continue working on files in external location

### Duplicate Files
**Current State:**
- `helpfile01_create-request.md` exists in both `src/help/` and `public/help/`
- `healthcare_helpfile02_transport_requests.md` exists in both locations

**After Sync:**
- External files take precedence
- Sync script overwrites existing files
- Ensures external location is always source of truth

---

## Testing Plan

### Test Cases

1. **File Sync**
   - ✅ Copy markdown file from external → `src/help/`
   - ✅ Rename file correctly (remove prefix)
   - ✅ Preserve file content

2. **Image Sync**
   - ✅ Copy image from external → `public/help/images/`
   - ✅ Create directory if doesn't exist
   - ✅ Preserve filename

3. **Image Path Updates**
   - ✅ Update relative paths in markdown
   - ✅ Preserve alt text
   - ✅ Handle both `./` and `../` paths

4. **Build Integration**
   - ✅ Sync runs before build
   - ✅ Files copied to `public/help/` during build
   - ✅ Help files available at runtime

5. **File Watcher**
   - ✅ Detects file changes
   - ✅ Runs sync automatically
   - ✅ Provides feedback

6. **Pre-commit Hook**
   - ✅ Runs sync before commit
   - ✅ Stages synced files
   - ✅ Commit succeeds

---

## Implementation Checklist

### Phase 1: Core Sync Script
- [ ] Create `frontend/scripts/sync-help-files.sh`
- [ ] Implement file copying logic
- [ ] Implement file renaming logic
- [ ] Implement image copying logic
- [ ] Implement image path updates in markdown
- [ ] Test with Healthcare files
- [ ] Test with EMS files
- [ ] Handle edge cases (missing directories, etc.)

### Phase 2: Build Integration
- [ ] Create `frontend/scripts/copy-help-to-public.sh`
- [ ] Update `package.json` scripts
- [ ] Test build process
- [ ] Verify files in `public/help/` after build

### Phase 3: File Watcher
- [ ] Install `chokidar-cli`
- [ ] Create watch script
- [ ] Update `package.json` scripts
- [ ] Test file watcher functionality

### Phase 4: Pre-commit Hook
- [ ] Install Husky
- [ ] Create pre-commit hook
- [ ] Test pre-commit behavior
- [ ] Verify files are staged automatically

### Phase 5: Documentation
- [ ] Update `help_system_workflow.md`
- [ ] Add usage instructions
- [ ] Document troubleshooting steps

---

## Questions Resolved

### ✅ Q1: Where to edit files?
**Answer:** Continue editing in `/Users/scooper/Documents/TraccEMS/Users Guide/` (Option A)

### ✅ Q2: Image handling?
**Answer:** Copy images automatically to `frontend/public/help/images/{userType}/`

### ✅ Q3: File naming?
**Answer:** Standardize naming and auto-rename during sync

### ✅ Q4: Build integration?
**Answer:** Sync external → `src/help/`, then `src/help/` → `public/help/` during build

### ✅ Q5: Pre-commit hook?
**Answer:** Auto-sync before commit (most fail-proof)

---

## Next Steps

1. **Review this plan** - Ensure all requirements are captured
2. **Create sync script** - Implement core functionality
3. **Test with existing files** - Verify Healthcare files sync correctly
4. **Add build integration** - Update build process
5. **Set up file watcher** - Enable auto-sync during development
6. **Configure pre-commit hook** - Ensure files always synced
7. **Update documentation** - Reflect new workflow

---

## Benefits

### Before (Manual)
- ❌ Manual copying required after each edit
- ❌ Easy to forget to copy files
- ❌ Files can get out of sync
- ❌ No automation

### After (Automated)
- ✅ Automatic syncing on save (file watcher)
- ✅ Automatic syncing before commit (pre-commit hook)
- ✅ Automatic syncing during build
- ✅ Files always in sync
- ✅ No manual steps required
- ✅ Can continue editing in external location

---

**Status:** Ready for implementation  
**Priority:** Medium (improves workflow but not blocking)  
**Estimated Time:** 2-3 hours for full implementation
