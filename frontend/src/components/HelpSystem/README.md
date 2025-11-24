# Help System Components

## Overview

The Help System provides in-app documentation and help content for users. It renders markdown files with full support for images, code blocks, tables, and more.

## Components

### HelpViewer.tsx
Renders markdown content with styling and support for:
- ✅ Images (`![alt text](/path/to/image.png)`)
- ✅ Code blocks with syntax highlighting
- ✅ Tables (via remark-gfm)
- ✅ Links (internal and external)
- ✅ Headings, lists, blockquotes
- ✅ Custom styling to match app theme

### HelpModal.tsx
Modal wrapper that:
- Loads help files from `/help/{userType}/{topic}.md`
- Provides search functionality
- Handles loading states and errors
- Maps topics to file names automatically

## File Structure

```
frontend/
├── public/
│   └── help/
│       ├── healthcare/
│       │   ├── helpfile01_create-request.md
│       │   ├── index.md
│       │   └── ...
│       ├── ems/
│       ├── tcc-admin/
│       └── images/
│           ├── healthcare/
│           │   └── 01d-create_request_dispatch_trip_to_agencies.png
│           ├── ems/
│           └── tcc-admin/
└── src/
    ├── help/ (source files - copied to public during build)
    └── components/
        └── HelpSystem/
            ├── HelpModal.tsx
            ├── HelpViewer.tsx
            └── index.ts
```

## Usage

### Basic Example

```typescript
import { HelpModal } from '../components/HelpSystem';

const MyComponent = () => {
  const [showHelp, setShowHelp] = useState(false);
  
  return (
    <>
      <button onClick={() => setShowHelp(true)}>Help</button>
      <HelpModal
        isOpen={showHelp}
        onClose={() => setShowHelp(false)}
        userType="HEALTHCARE"
        topic="create-request"
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

## Topic Mapping

The HelpModal automatically maps topics to file names:

- `create` or `create-request` → `helpfile01_create-request.md`
- `trips` → `transport-requests.md`
- `index` → `index.md` (fallback)

If a file starts with `helpfile`, it's used as-is.

## Image Support

Images should be placed in `public/help/images/{userType}/` and referenced in markdown as:

```markdown
![Image Description](/help/images/healthcare/image-name.png)
```

## Adding New Help Files

1. Create markdown file in `src/help/{userType}/`
2. Copy to `public/help/{userType}/` (or add build step)
3. Add topic mapping in HelpModal if needed
4. Reference images from `public/help/images/{userType}/`

## Next Steps

1. ✅ Components created
2. ✅ Help files in place
3. ⏳ Integrate Help button into dashboards
4. ⏳ Test with actual help content
5. ⏳ Add build step to copy help files automatically

