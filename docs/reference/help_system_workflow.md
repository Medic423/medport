# Help System Workflow Guide

**Last Updated:** January 22, 2026  
**Status:** ✅ **ACTIVE** - Help system is automated and ready for content

---

## Quick Summary

The Help System provides in-app documentation and help content for users. It renders markdown files with full support for images, code blocks, tables, and more.

**✨ NEW: Automated Sync System**  
All help files are now automatically synced from an external location. No manual copying required!

---

## 📋 Quick Checklist: After Editing a Help File

**Simple 3-Step Process:**

1. ✅ **Edit** the file in `/Users/scooper/Documents/TraccEMS/Users Guide/{Healthcare|EMS}/`
   - Edit markdown files directly
   - Add images to `Screen shots/` folder
   - Reference images as: `![Description](./Screen shots/image-name.png)`

2. ✅ **Sync** files (choose one method):
   - **Manual:** `cd frontend && npm run sync-help`
   - **Auto-watch:** `cd frontend && npm run watch:help` (keeps running, auto-syncs on save)
   - **Auto-commit:** Just commit - pre-commit hook syncs automatically

3. ✅ **Test** your changes in the application
   - Refresh the browser
   - Open the Help modal
   - Verify changes appear correctly

**That's it!** The sync system automatically:
- ✅ Copies files to application
- ✅ Removes `healthcare_` and `ems_` prefixes from filenames
- ✅ Copies images to correct location
- ✅ Updates image paths in markdown files

---

## Where to Edit Help Files

### Source of Truth (Edit Here)

**Edit all help files in the external location:**

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

**This is your source of truth** - all editing happens here, and files are automatically synced to the application.

### Application Locations (Auto-Synced)

Files are automatically synced to:

1. **Intermediate location (synced from external):**
   ```
   frontend/src/help/{userType}/{filename}.md
   ```
   - Files are automatically synced here (with prefixes removed)
   - `frontend/src/help/healthcare/` - Healthcare Dashboard help
   - `frontend/src/help/ems/` - EMS Dashboard help

2. **Public location (served at runtime):**
   ```
   frontend/public/help/{userType}/{filename}.md
   ```
   - Files are automatically copied here during build
   - Files are loaded from `/help/{userType}/{filename}.md` at runtime
   - Images are in `frontend/public/help/images/{userType}/`

---

## File Naming Conventions

### External Location (Source of Truth)

Files in the external location use prefixes:
- **Healthcare files:** `healthcare_helpfile##_topic-name.md`
- **EMS files:** `ems_helpfile##_topic-name.md`

**Examples:**
- ✅ `healthcare_helpfile01_create-request.md`
- ✅ `ems_helpfile01_available-trips.md`

### Application Location (Auto-Renamed)

Files are automatically renamed when synced (prefixes removed):
- `healthcare_helpfile01_create-request.md` → `helpfile01_create-request.md`
- `ems_helpfile01_available-trips.md` → `helpfile01_available-trips.md`

**Naming rules:**
- ✅ Use lowercase letters
- ✅ Separate words with hyphens (`-`)
- ✅ Keep `helpfile##_` prefix for ordering
- ✅ Be descriptive but concise

---

## Topic Mapping

The `HelpModal` component automatically maps topics to file names:

```typescript
// Examples of topic → file mapping:
'create' or 'create-request' → 'helpfile01_create-request.md'
'trips' → 'transport-requests.md'
'in-progress' → 'in-progress.md'
'index' → 'index.md' (fallback)
```

**Special handling:**
- Files starting with `helpfile` are used as-is (e.g., `helpfile01_create-request.md`)
- If topic matches file name exactly, no mapping needed
- Fallback to `index.md` if file not found

---

## Adding a New Help File

### Step-by-Step Process

1. **Create the markdown file in external location:**
   ```bash
   # Create in external location
   /Users/scooper/Documents/TraccEMS/Users Guide/Healthcare/healthcare_helpfile09_new-topic.md
   ```

2. **Add images (if needed):**
   ```
   /Users/scooper/Documents/TraccEMS/Users Guide/Healthcare/Screen shots/image-name.png
   ```
   Reference in markdown: `![Description](./Screen shots/image-name.png)`
   (Image paths are automatically updated during sync)

3. **Sync files (automatic options):**
   - **Option A:** Run sync manually: `cd frontend && npm run sync-help`
   - **Option B:** Use file watcher: `cd frontend && npm run watch:help` (auto-syncs on save)
   - **Option C:** Just commit - pre-commit hook will sync automatically

4. **Add topic mapping (if needed):**
   - If your file name matches the topic exactly, no mapping needed
   - If you want a different topic name, add it to the `topicMap` in `HelpModal.tsx`:
   ```typescript
   const topicMap: Record<string, string> = {
     'my-topic': 'helpfile09_new-topic',  // Add your mapping here
     // ... existing mappings
   };
   ```

5. **Add link to index.md:**
   Update the `index.md` file in `frontend/src/help/{userType}/` to include a link to your new help file.

---

## Updating Existing Help Files

### ✅ Automated Workflow - No Manual Copying Required!

**The sync system handles everything automatically. Just edit and sync!**

### Workflow for Editing Help Files

1. **Edit the file in external location:**
   ```
   /Users/scooper/Documents/TraccEMS/Users Guide/Healthcare/healthcare_helpfile01_create-request.md
   ```
   - This is your source of truth
   - Make all changes here
   - Add images to `Screen shots/` folder

2. **Sync files (choose one method):**
   
   **Method A: Manual Sync (Recommended for immediate testing)**
   ```bash
   cd frontend
   npm run sync-help
   ```
   
   **Method B: File Watcher (Auto-sync on save)**
   ```bash
   cd frontend
   npm run watch:help
   # Keep this running - it will auto-sync whenever you save a file
   ```
   
   **Method C: Automatic on Commit (No action needed)**
   - Just commit your code changes
   - Pre-commit hook automatically syncs help files before commit

3. **Build (if needed for production):**
   ```bash
   cd frontend
   npm run build
   ```
   Build automatically syncs and copies files to `public/help/`

4. **Test your changes:**
   - Refresh the application
   - Open the Help modal
   - Verify your changes appear

### What Happens During Sync

The sync script automatically:
- ✅ Copies markdown files from external → `frontend/src/help/`
- ✅ Removes `healthcare_` and `ems_` prefixes from filenames
- ✅ Copies images from `Screen shots/` → `frontend/public/help/images/{userType}/`
- ✅ Updates image paths in markdown (from `./Screen shots/` to `/help/images/{userType}/`)
- ✅ Preserves `index.md` files (doesn't overwrite manual ones)

### File Locations Explained

- **External Location** (`/Users/scooper/Documents/TraccEMS/Users Guide/`) - Source of truth, edit here
- **`frontend/src/help/`** - Intermediate location, auto-synced from external
- **`frontend/public/help/`** - Runtime location, auto-copied during build

The help system loads files from `/help/{userType}/{filename}.md` at runtime, which maps to the `public/help/` directory.

---

## Using Help in Components

### Basic Example

```typescript
import { HelpModal } from '../components/HelpSystem';
import { useState } from 'react';

const MyComponent = () => {
  const [showHelp, setShowHelp] = useState(false);
  
  return (
    <>
      <button onClick={() => setShowHelp(true)}>Help</button>
      <HelpModal
        isOpen={showHelp}
        onClose={() => setShowHelp(false)}
        userType="HEALTHCARE"  // or "EMS" or "ADMIN"
        topic="create-request"  // Maps to helpfile01_create-request.md
      />
    </>
  );
};
```

### Context-Aware Help

```typescript
// In HealthcareDashboard.tsx
const [showHelp, setShowHelp] = useState(false);
const [helpTopic, setHelpTopic] = useState<string | null>(null);

// Map current tab to help topic
const topicMap: Record<string, string> = {
  'create': 'helpfile01_create-request',
  'trips': 'transport-requests',
  'in-progress': 'in-progress',
  // ... etc
};

const handleHelpClick = () => {
  setHelpTopic(topicMap[activeTab] || 'index');
  setShowHelp(true);
};

<HelpModal
  isOpen={showHelp}
  onClose={() => setShowHelp(false)}
  userType="HEALTHCARE"
  topic={helpTopic || undefined}
/>
```

---

## Directory Structure

### External Location (Source of Truth - Edit Here)

```
/Users/scooper/Documents/TraccEMS/Users Guide/
├── Healthcare/
│   ├── healthcare_helpfile01_create-request.md  ← Edit here
│   ├── healthcare_helpfile02_transport_requests.md
│   ├── healthcare_helpfile03_in_progress.md
│   └── Screen shots/
│       ├── 01a-create_request_patient_info.png
│       └── *.png  ← Images here
└── EMS/
    ├── ems_helpfile01_available_trips.md  ← Edit here
    └── Screen shots/
        └── *.png  ← Images here
```

### Application Structure (Auto-Synced)

```
frontend/
├── scripts/
│   ├── sync-help-files.sh          ← Syncs external → src/help
│   └── copy-help-to-public.sh      ← Copies src/help → public/help
│
├── src/
│   ├── help/                       ← Auto-synced from external (renamed)
│   │   ├── healthcare/
│   │   │   ├── index.md
│   │   │   ├── helpfile01_create-request.md  ← Renamed (prefix removed)
│   │   │   └── helpfile02_transport-requests.md
│   │   └── ems/
│   │       └── helpfile01_available-trips.md
│   └── components/
│       └── HelpSystem/
│           ├── HelpModal.tsx
│           ├── HelpViewer.tsx
│           └── index.ts
│
└── public/
    └── help/                       ← Auto-copied during build
        ├── healthcare/
        │   ├── index.md
        │   └── helpfile01_create-request.md
        ├── ems/
        └── images/
            ├── healthcare/
            │   └── *.png  ← Auto-copied from external
            └── ems/
                └── *.png
```

### Recommended Structure (from README)

```
help/
├── healthcare/          # Healthcare Dashboard help files
│   ├── index.md        # Main index/table of contents
│   ├── create-request.md
│   ├── transport-requests.md
│   ├── in-progress.md
│   ├── completed-trips.md
│   ├── hospital-settings.md
│   ├── ems-providers.md
│   ├── destinations.md
│   └── team-members.md
│
├── ems/                # EMS Dashboard help files
│   ├── index.md
│   ├── available-trips.md
│   ├── my-trips.md
│   ├── completed-trips.md
│   ├── units.md
│   ├── users.md
│   ├── agency-info.md
│   └── trip-calculator.md
│
└── tcc-admin/         # TCC Admin Dashboard help files
    ├── index.md
    ├── trip-management.md
    ├── healthcare-facilities.md
    ├── ems-agencies.md
    ├── route-optimization.md
    ├── analytics.md
    └── user-management.md
```

---

## File Format Guidelines

### Content Structure

Each help file should follow this structure:

1. **Title** - H1 heading with feature name
2. **Overview** - Brief description of what the feature does
3. **Quick Start** - Simple steps to get started
4. **Detailed Sections** - Step-by-step guides
5. **Tips and Best Practices** - Helpful hints
6. **Troubleshooting** - Common issues and solutions
7. **Related Topics** - Links to related help files
8. **Video Tutorial** - Link to video (when available)

### Writing Style

- Use clear, concise language
- Write in second person ("you") or imperative mood
- Use bullet points and numbered lists for steps
- Include examples and scenarios
- Add screenshots references where helpful

### Markdown Features Supported

The Help System supports:
- ✅ Images (`![alt text](/path/to/image.png)`)
- ✅ Code blocks with syntax highlighting
- ✅ Tables (via remark-gfm)
- ✅ Links (internal and external)
- ✅ Headings, lists, blockquotes
- ✅ Custom styling to match app theme

### Links

- **Internal links:** Use relative paths: `./transport-requests.md`
- **External links:** Use absolute URLs: `https://example.com`
- Link to related topics at the end of each file

**Best Practice for Internal Links:**
- ✅ **Store all linked files in the same directory** - All help files for each userType are stored together in the same directory (e.g., all `healthcare/` files together)
- ✅ **Use relative paths** - Since all files are in the same directory, simple relative paths like `./transport-requests.md` work perfectly
- ✅ **Benefits:**
  - Simple, clean paths (no complex directory navigation)
  - Easy to maintain (all related files in one place)
  - Prevents broken links (files move together)
  - Works seamlessly with the help system's directory structure

**Example:**
```
frontend/src/help/healthcare/
├── index.md                    # Links to: ./create-request.md
├── create-request.md           # Links to: ./transport-requests.md
├── transport-requests.md       # Links to: ./in-progress.md
└── in-progress.md              # Links to: ./completed-trips.md
```

All files in the same directory, all using `./filename.md` relative paths.

### Images

**In External Location:**
- **Storage:** `/Users/scooper/Documents/TraccEMS/Users Guide/{Healthcare|EMS}/Screen shots/image-name.png`
- **Reference in markdown:** `![Description](./Screen shots/image-name.png)`
- Image paths are automatically updated during sync

**In Application (After Sync):**
- **Storage:** `frontend/public/help/images/{userType}/image-name.png`
- **Reference:** `![Description](/help/images/healthcare/image-name.png)` (auto-updated)
- **Sizing:** See `frontend/src/help/IMAGE_SIZING_GUIDE.md` for guidelines

---

## User Type Mapping

The Help System maps user types to directories:

```typescript
const userTypeDir: Record<string, string> = {
  HEALTHCARE: 'healthcare',
  EMS: 'ems',
  ADMIN: 'tcc-admin',
};
```

**Usage:**
- `userType="HEALTHCARE"` → loads from `/help/healthcare/`
- `userType="EMS"` → loads from `/help/ems/`
- `userType="ADMIN"` → loads from `/help/tcc-admin/`

---

## Quick Checklist

### After Editing a Help File

**Simple 3-Step Process:**

- [ ] **Edit** the file in `/Users/scooper/Documents/TraccEMS/Users Guide/{Healthcare|EMS}/`
- [ ] **Sync** files: `cd frontend && npm run sync-help` (or use file watcher, or just commit)
- [ ] **Test** your changes in the application

**That's it!** The sync system handles:
- ✅ Copying files to application
- ✅ Renaming files (removing prefixes)
- ✅ Copying images
- ✅ Updating image paths in markdown

### When Adding a New Help File

- [ ] Create `.md` file in external location: `/Users/scooper/Documents/TraccEMS/Users Guide/{Healthcare|EMS}/`
- [ ] Use naming convention: `{userType}_helpfile##_topic-name.md`
- [ ] Add images to `Screen shots/` folder if needed
- [ ] Reference images as: `![Description](./Screen shots/image-name.png)` (auto-updated during sync)
- [ ] Run sync: `cd frontend && npm run sync-help`
- [ ] Add topic mapping in `HelpModal.tsx` if needed
- [ ] Add link to `index.md` in `frontend/src/help/{userType}/`
- [ ] Test the help modal loads correctly

---

## Components Reference

### HelpModal.tsx

Modal wrapper that:
- Loads help files from `/help/{userType}/{topic}.md`
- Provides search functionality
- Handles loading states and errors
- Maps topics to file names automatically

**Props:**
- `isOpen: boolean` - Controls modal visibility
- `onClose: () => void` - Callback when modal closes
- `userType: 'HEALTHCARE' | 'EMS' | 'ADMIN'` - User type for directory selection
- `topic?: string` - Current page/topic (e.g., 'create-request', 'transport-requests')

### HelpViewer.tsx

Renders markdown content with styling and support for:
- Images
- Code blocks with syntax highlighting
- Tables (via remark-gfm)
- Links (internal and external)
- Headings, lists, blockquotes
- Custom styling to match app theme

---

## Automation Scripts

### Available Commands

**Manual Sync:**
```bash
cd frontend
npm run sync-help
```
Syncs files from external location to `frontend/src/help/` and copies images.

**File Watcher (Development):**
```bash
cd frontend
npm run watch:help
```
Watches external location and auto-syncs whenever you save a file. Keep this running during development.

**Copy to Public (Build):**
```bash
cd frontend
npm run copy-help
```
Copies files from `src/help/` to `public/help/`. Usually run automatically during build.

**Build (Includes Sync):**
```bash
cd frontend
npm run build
```
Automatically runs sync-help and copy-help before building.

### Pre-Commit Hook

A git pre-commit hook automatically syncs help files before each commit. No action needed - it just works!

---

## Troubleshooting

### Help File Not Loading

1. **Check file exists in external location:**
   - `/Users/scooper/Documents/TraccEMS/Users Guide/{Healthcare|EMS}/filename.md`

2. **Run sync manually:**
   ```bash
   cd frontend
   npm run sync-help
   ```

3. **Check file exists in application:**
   - `frontend/src/help/{userType}/filename.md` (after sync)
   - `frontend/public/help/{userType}/filename.md` (after build)

4. **Verify topic mapping:**
   - Check if topic needs mapping in `HelpModal.tsx`
   - Try using the exact file name as the topic

5. **Check browser console:**
   - Look for 404 errors
   - Check network tab for failed requests

### Images Not Displaying

1. **Verify image exists in external location:**
   - `/Users/scooper/Documents/TraccEMS/Users Guide/{Healthcare|EMS}/Screen shots/image-name.png`

2. **Run sync to copy images:**
   ```bash
   cd frontend
   npm run sync-help
   ```

3. **Check image path in markdown:**
   - In external location: `![Description](./Screen shots/image-name.png)`
   - After sync: `![Description](/help/images/{userType}/image-name.png)` (auto-updated)

4. **Verify image copied to application:**
   - `frontend/public/help/images/{userType}/image-name.png`

5. **Check file extension:**
   - Use lowercase extensions (`.png`, not `.PNG`)

### Sync Not Working

1. **Check external location path:**
   - Verify `/Users/scooper/Documents/TraccEMS/Users Guide/` exists
   - Check file permissions

2. **Check script permissions:**
   ```bash
   ls -la frontend/scripts/*.sh
   # Should show executable permissions (-rwxr-xr-x)
   ```

3. **Run sync with verbose output:**
   ```bash
   cd frontend
   bash scripts/sync-help-files.sh
   ```
   Check for error messages.

---

## Related Documentation

- `frontend/src/components/HelpSystem/README.md` - Component documentation
- `frontend/public/help/README.md` - Help file structure guide
- `frontend/src/help/README.md` - Source help files guide
- `frontend/src/help/IMAGE_SIZING_GUIDE.md` - Image sizing guidelines
- `docs/user-guides/help_system_implementation_plan.md` - Implementation plan

---

## Summary

### What's Automated

✅ **File Sync** - External files automatically synced to application  
✅ **File Renaming** - Prefixes automatically removed (`healthcare_` → removed)  
✅ **Image Copying** - Images automatically copied to correct location  
✅ **Image Path Updates** - Image paths automatically updated in markdown  
✅ **Build Integration** - Files automatically synced and copied during build  
✅ **Pre-Commit Hook** - Files automatically synced before git commit  
✅ **File Watcher** - Optional auto-sync on save during development  

### What You Need to Do

1. **Edit files** in `/Users/scooper/Documents/TraccEMS/Users Guide/`
2. **Sync files** (manual, watcher, or automatic on commit)
3. **Test** your changes

That's it! The automation handles everything else.

---

**Last Updated:** January 22, 2026  
**Location:** `docs/reference/help_system_workflow.md`
