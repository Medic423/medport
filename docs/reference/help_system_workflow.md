# Help System Workflow Guide

**Last Updated:** January 14, 2026  
**Status:** ✅ **ACTIVE** - Help system is scaffolded and ready for content

---

## Quick Summary

The Help System provides in-app documentation and help content for users. It renders markdown files with full support for images, code blocks, tables, and more.

### Where to Put Help Markdown Files

**Two locations (both are needed):**

1. **Source files (for editing):**
   ```
   frontend/src/help/{userType}/{filename}.md
   ```
   - `frontend/src/help/healthcare/` - Healthcare Dashboard help
   - `frontend/src/help/ems/` - EMS Dashboard help
   - `frontend/src/help/tcc-admin/` - TCC Admin Dashboard help

2. **Public files (served at runtime):**
   ```
   frontend/public/help/{userType}/{filename}.md
   ```
   - Same structure as above
   - Files are loaded from `/help/{userType}/{filename}.md` at runtime

---

## File Naming Conventions

- ✅ Use lowercase letters
- ✅ Separate words with hyphens (`-`)
- ✅ Be descriptive but concise
- ✅ Match the feature/tab name when possible

**Examples:**
- ✅ `create-request.md` (correct)
- ❌ `CreateRequest.md` (wrong - uppercase)
- ❌ `create_request.md` (wrong - underscores)

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

1. **Create the markdown file:**
   ```bash
   # Create in source directory
   frontend/src/help/healthcare/my-new-topic.md
   ```

2. **Copy to public directory:**
   ```bash
   # Copy to public directory (or add build step)
   frontend/public/help/healthcare/my-new-topic.md
   ```

3. **Add topic mapping (if needed):**
   - If your file name matches the topic exactly, no mapping needed
   - If you want a different topic name, add it to the `topicMap` in `HelpModal.tsx`:
   ```typescript
   const topicMap: Record<string, string> = {
     'my-topic': 'my-new-topic',  // Add your mapping here
     // ... existing mappings
   };
   ```

4. **Add images (if needed):**
   ```
   frontend/public/help/images/{userType}/image-name.png
   ```
   Reference in markdown: `![Description](/help/images/healthcare/image-name.png)`

5. **Add link to index.md:**
   Update the `index.md` file in that directory to include a link to your new help file.

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

### Current Structure

```
frontend/
├── src/
│   ├── help/
│   │   ├── healthcare/
│   │   │   ├── index.md
│   │   │   ├── create-request.md
│   │   │   └── helpfile01_create-request.md
│   │   ├── ems/
│   │   ├── tcc-admin/
│   │   ├── IMAGE_SIZING_GUIDE.md
│   │   └── README.md
│   └── components/
│       └── HelpSystem/
│           ├── HelpModal.tsx
│           ├── HelpViewer.tsx
│           └── index.ts
│
└── public/
    └── help/
        ├── healthcare/
        │   ├── index.md
        │   ├── create-request.md
        │   └── helpfile01_create-request.md
        ├── ems/
        ├── tcc-admin/
        └── images/
            ├── healthcare/
            │   └── 01d-create_request_dispatch_trip_to_agencies.png
            ├── ems/
            └── tcc-admin/
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

- **Storage:** `public/help/images/{userType}/image-name.png`
- **Reference:** `![Description](/help/images/healthcare/image-name.png)`
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

When adding a new help file:

- [ ] Create `.md` file in `frontend/src/help/{userType}/`
- [ ] Copy to `frontend/public/help/{userType}/`
- [ ] Use lowercase-hyphenated naming
- [ ] Add topic mapping in `HelpModal.tsx` if needed
- [ ] Add images to `public/help/images/{userType}/` if needed
- [ ] Reference images with `/help/images/{userType}/filename.png`
- [ ] Add link to `index.md` in that directory
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

## Troubleshooting

### Help File Not Loading

1. **Check file exists in both locations:**
   - `frontend/src/help/{userType}/filename.md`
   - `frontend/public/help/{userType}/filename.md`

2. **Verify topic mapping:**
   - Check if topic needs mapping in `HelpModal.tsx`
   - Try using the exact file name as the topic

3. **Check file path:**
   - Files are loaded from `/help/{userType}/{filename}.md`
   - Ensure the path matches exactly

4. **Check browser console:**
   - Look for 404 errors
   - Check network tab for failed requests

### Images Not Displaying

1. **Verify image path:**
   - Images must be in `public/help/images/{userType}/`
   - Reference with `/help/images/{userType}/filename.png`

2. **Check file extension:**
   - Use lowercase extensions (`.png`, not `.PNG`)

3. **Verify image exists:**
   - Check file exists in the correct directory
   - Ensure file name matches exactly (case-sensitive)

---

## Related Documentation

- `frontend/src/components/HelpSystem/README.md` - Component documentation
- `frontend/public/help/README.md` - Help file structure guide
- `frontend/src/help/README.md` - Source help files guide
- `frontend/src/help/IMAGE_SIZING_GUIDE.md` - Image sizing guidelines
- `docs/user-guides/help_system_implementation_plan.md` - Implementation plan

---

## Next Steps

1. ✅ Components created
2. ✅ Help files structure in place
3. ⏳ Integrate Help button into dashboards
4. ⏳ Test with actual help content
5. ⏳ Add build step to copy help files automatically (optional)

---

**Last Updated:** January 14, 2026  
**Location:** `docs/reference/help_system_workflow.md`
