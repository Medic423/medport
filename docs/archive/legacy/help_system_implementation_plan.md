# Help System Implementation Plan

**Date:** January 2025  
**Status:** Planning Phase  
**Goal:** Implement comprehensive help system with documentation and video tutorials for Healthcare, EMS, and TCC Admin users

---

## Overview

This document outlines the procedure for implementing a help system that includes:
1. Text-based help documentation
2. Video tutorials ("how-tos")
3. Integration into the application menu bars
4. Storage and organization strategy

---

## File Structure and Storage

### Recommended Directory Structure

```
frontend/
├── public/
│   └── help/
│       ├── healthcare/
│       │   ├── index.md (or .html)
│       │   ├── create-request.md
│       │   ├── transport-requests.md
│       │   ├── in-progress.md
│       │   ├── completed-trips.md
│       │   ├── hospital-settings.md
│       │   ├── ems-providers.md
│       │   ├── destinations.md
│       │   └── team-members.md
│       ├── ems/
│       │   ├── index.md
│       │   ├── available-trips.md
│       │   ├── my-trips.md
│       │   ├── completed-trips.md
│       │   ├── units.md
│       │   ├── users.md
│       │   ├── agency-info.md
│       │   └── trip-calculator.md
│       ├── tcc-admin/
│       │   ├── index.md
│       │   ├── trip-management.md
│       │   ├── healthcare-facilities.md
│       │   ├── ems-agencies.md
│       │   ├── route-optimization.md
│       │   ├── analytics.md
│       │   └── user-management.md
│       └── videos/
│           ├── healthcare/
│           ├── ems/
│           └── tcc-admin/
│
└── src/
    └── components/
        └── HelpSystem/
            ├── HelpModal.tsx
            ├── HelpViewer.tsx
            ├── VideoPlayer.tsx
            └── HelpMenu.tsx
```

### Alternative: Markdown Files in `src/help/`

If you prefer to keep help files as part of the source code (better for version control):

```
frontend/src/help/
├── healthcare/
├── ems/
└── tcc-admin/
```

**Recommendation:** Use `public/help/` for static files that don't need compilation, or `src/help/` if you want to import them as modules.

---

## File Format Options

### Option 1: Markdown Files (.md)
**Pros:**
- Easy to write and edit
- Version control friendly
- Can be rendered with markdown libraries (react-markdown, marked)
- Supports code blocks, images, links

**Cons:**
- Requires markdown parser library
- Limited styling options without custom CSS

**Implementation:**
- Use `react-markdown` or `marked` library
- Store files as `.md` in `public/help/` or `src/help/`
- Render in React component

### Option 2: HTML Files (.html)
**Pros:**
- Full HTML/CSS control
- Can include embedded videos directly
- No parsing needed

**Cons:**
- Less version-control friendly
- Harder to maintain consistency

### Option 3: React Components (.tsx)
**Pros:**
- Full React component capabilities
- Can include interactive elements
- Type-safe
- Can import other components

**Cons:**
- Requires compilation
- More complex to maintain

**Recommendation:** Use **Markdown (.md)** files for flexibility and ease of editing.

---

## Integration into Application

### 1. Add Help Menu Item to Menu Bars

#### For Healthcare Dashboard
**File:** `frontend/src/components/HealthcareDashboard.tsx`

Add Help button to the header section (around line 800-830):

```typescript
// Add Help icon import
import { HelpCircle } from 'lucide-react';

// Add state for help modal
const [showHelp, setShowHelp] = useState(false);
const [helpTopic, setHelpTopic] = useState<string | null>(null);

// Add Help button in header (near logout button)
<button
  onClick={() => {
    setHelpTopic(activeTab); // Set topic based on current tab
    setShowHelp(true);
  }}
  className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md transition-colors"
>
  <HelpCircle className="h-4 w-4" />
  <span>Help</span>
</button>
```

#### For EMS Dashboard
**File:** `frontend/src/components/EMSDashboard.tsx`

Similar implementation - add Help button in header section.

#### For TCC Admin Dashboard
**File:** `frontend/src/components/TopMenuBar.tsx`

Add Help menu item to the `menuItems` array:

```typescript
const menuItems = [
  // ... existing items ...
  {
    label: 'Help',
    icon: HelpCircle,
    hasDropdown: true,
    items: [
      { label: 'Trip Management Help', path: '/help/trip-management' },
      { label: 'Healthcare Facilities Help', path: '/help/healthcare-facilities' },
      { label: 'EMS Agencies Help', path: '/help/ems-agencies' },
      { label: 'Route Optimization Help', path: '/help/route-optimization' },
      { label: 'Analytics Help', path: '/help/analytics' },
      { label: 'User Management Help', path: '/help/user-management' },
    ]
  }
];
```

### 2. Create Help System Components

#### HelpModal Component
**File:** `frontend/src/components/HelpSystem/HelpModal.tsx`

```typescript
interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
  userType: 'HEALTHCARE' | 'EMS' | 'ADMIN';
  topic?: string; // Current page/topic
}
```

**Features:**
- Modal overlay
- Table of contents sidebar
- Main content area
- Search functionality
- Video player integration
- Close button

#### HelpViewer Component
**File:** `frontend/src/components/HelpSystem/HelpViewer.tsx`

**Features:**
- Markdown renderer
- Syntax highlighting for code blocks
- Image support
- Link handling
- Video embedding

#### VideoPlayer Component
**File:** `frontend/src/components/HelpSystem/VideoPlayer.tsx`

**Features:**
- Support for YouTube/Vimeo embeds
- Support for local video files
- Playback controls
- Fullscreen support

### 3. Create Help Routes (Optional)

If you want dedicated help pages:

**File:** `frontend/src/App.tsx` or routing file

```typescript
<Route path="/help/:userType/:topic" element={<HelpPage />} />
```

---

## Video Storage Options

### Option 1: External Video Hosting (Recommended)

#### YouTube
**Pros:**
- Free hosting
- Built-in player with controls
- Analytics available
- Easy sharing
- No storage costs
- CDN delivery (fast worldwide)

**Cons:**
- Public by default (can use unlisted/private)
- YouTube branding (can be minimized)
- Requires internet connection

**Implementation:**
```typescript
// Embed YouTube video
<iframe
  width="560"
  height="315"
  src={`https://www.youtube.com/embed/${videoId}`}
  frameBorder="0"
  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
  allowFullScreen
/>
```

#### Vimeo
**Pros:**
- More professional appearance
- Better privacy controls
- No ads
- Password protection available
- Customizable player

**Cons:**
- Free tier has limitations
- Paid plans for advanced features

**Implementation:**
```typescript
// Embed Vimeo video
<iframe
  src={`https://player.vimeo.com/video/${videoId}`}
  width="640"
  height="360"
  frameBorder="0"
  allow="autoplay; fullscreen; picture-in-picture"
  allowFullScreen
/>
```

**Recommendation:** Use **YouTube** for free hosting with unlisted videos, or **Vimeo** for more professional appearance.

### Option 2: Azure Blob Storage / CDN

**Pros:**
- Full control
- No branding
- Can be private
- Integrates with Azure infrastructure
- CDN for fast delivery

**Cons:**
- Storage costs
- Bandwidth costs
- Need to build player UI
- More complex setup

**Implementation:**
- Upload videos to Azure Blob Storage
- Use Azure CDN for delivery
- Use HTML5 `<video>` tag or video.js library

### Option 3: Local Storage (Not Recommended)

**Pros:**
- No external dependencies
- Works offline

**Cons:**
- Increases bundle size significantly
- Slow initial load
- Not scalable
- Version control issues

**Recommendation:** **DO NOT** store videos locally in the app bundle.

---

## Recommended Approach: Hybrid

### Text Documentation
- Store as Markdown files in `public/help/` or `src/help/`
- Version controlled in Git
- Easy to update and maintain

### Video Tutorials
- Host on **YouTube** (unlisted videos) or **Vimeo**
- Store video IDs/metadata in JSON config file
- Embed videos in help documentation

### Video Metadata Structure

**File:** `public/help/videos.json` or `src/help/videoIndex.ts`

```json
{
  "healthcare": {
    "create-request": {
      "title": "How to Create a Transport Request",
      "description": "Step-by-step guide to creating a new transport request",
      "videoId": "youtube-video-id-here",
      "provider": "youtube", // or "vimeo"
      "duration": "3:45",
      "thumbnail": "https://img.youtube.com/vi/videoId/maxresdefault.jpg"
    },
    "dispatch-trip": {
      "title": "How to Dispatch a Trip to EMS Agencies",
      "videoId": "another-video-id",
      "provider": "youtube",
      "duration": "5:20"
    }
  },
  "ems": {
    "accept-trip": {
      "title": "How to Accept a Trip",
      "videoId": "ems-video-id",
      "provider": "youtube",
      "duration": "2:30"
    }
  },
  "tcc-admin": {
    "manage-users": {
      "title": "User Management Guide",
      "videoId": "admin-video-id",
      "provider": "youtube",
      "duration": "4:15"
    }
  }
}
```

---

## Implementation Steps

### Phase 1: Setup File Structure
1. Create directory structure in `public/help/` or `src/help/`
2. Create subdirectories for each user type
3. Create `videos/` subdirectory (for metadata, not actual videos)

### Phase 2: Create Help Components
1. Create `HelpSystem/` directory in `src/components/`
2. Implement `HelpModal.tsx`
3. Implement `HelpViewer.tsx` (with markdown support)
4. Implement `VideoPlayer.tsx`
5. Install required dependencies:
   ```bash
   npm install react-markdown remark-gfm
   # Optional: for syntax highlighting
   npm install react-syntax-highlighter
   ```

### Phase 3: Integrate Help Menu
1. Add Help button to Healthcare Dashboard header
2. Add Help button to EMS Dashboard header
3. Add Help menu item to TCC Admin TopMenuBar
4. Implement context-aware help (show relevant topic based on current page)

### Phase 4: Create Help Content
1. Write markdown files for each module (use outlines provided)
2. Create video tutorials
3. Upload videos to YouTube/Vimeo
4. Create video metadata file

### Phase 5: Testing
1. Test help modal opening/closing
2. Test markdown rendering
3. Test video playback
4. Test responsive design
5. Test search functionality (if implemented)

---

## Dependencies to Install

```bash
# Markdown rendering
npm install react-markdown remark-gfm

# Optional: Syntax highlighting for code blocks
npm install react-syntax-highlighter @types/react-syntax-highlighter

# Optional: Search functionality
npm install fuse.js
```

---

## Help Content Organization

### Context-Aware Help
- When user clicks Help, show help for current page/tab
- Provide navigation to other help topics
- Include "Related Topics" section

### Help Topics Mapping

#### Healthcare Dashboard
- `create` → `create-request.md`
- `trips` → `transport-requests.md`
- `in-progress` → `in-progress.md`
- `completed` → `completed-trips.md`
- `hospital-settings` → `hospital-settings.md`
- `ems-providers` → `ems-providers.md`
- `destinations` → `destinations.md`
- `users` → `team-members.md`

#### EMS Dashboard
- `available` → `available-trips.md`
- `accepted` → `my-trips.md`
- `completed` → `completed-trips.md`
- `units` → `units.md`
- `users` → `users.md`
- `agency-info` → `agency-info.md`
- `trip-calculator` → `trip-calculator.md`

#### TCC Admin Dashboard
- Trip Management → `trip-management.md`
- Healthcare Facilities → `healthcare-facilities.md`
- EMS Agencies → `ems-agencies.md`
- Route Optimization → `route-optimization.md`
- Analytics → `analytics.md`
- User Management → `user-management.md`

---

## Video Tutorial Best Practices

### Video Length
- Keep videos under 5 minutes when possible
- Break complex topics into multiple short videos
- Use timestamps/chapters for longer videos

### Video Content
- Start with overview of what will be covered
- Show actual UI, not just narration
- Use cursor highlighting/annotations
- Include on-screen text for key points
- End with summary/key takeaways

### Video Organization
- One video per major feature/task
- Consistent naming: "How to [Action]"
- Include video in relevant help document
- Add video links to table of contents

---

## Search Functionality (Optional Enhancement)

### Implementation Options

#### Option 1: Client-Side Search
- Load all help content into memory
- Use Fuse.js or similar for fuzzy search
- Fast, no server needed
- Good for small help systems

#### Option 2: Full-Text Search
- Index help content
- Use search service (Algolia, Elasticsearch)
- Better for large help systems
- More complex setup

**Recommendation:** Start with client-side search using Fuse.js.

---

## Accessibility Considerations

- Ensure help modal is keyboard navigable
- Add ARIA labels for screen readers
- Provide text transcripts for videos
- Ensure sufficient color contrast
- Support screen reader navigation

---

## Maintenance Strategy

### Content Updates
- Help files should be version controlled
- Update help when features change
- Review help content quarterly
- Collect user feedback on help usefulness

### Video Updates
- Keep video links updated
- Re-record videos when UI changes significantly
- Archive old videos rather than deleting
- Update video metadata when videos change

---

## Next Steps

1. **Review and approve this plan**
2. **Create directory structure**
3. **Install dependencies**
4. **Create help components**
5. **Write help content** (use outlines provided)
6. **Create video tutorials**
7. **Integrate into application**
8. **Test and refine**

---

**Document Status:** Ready for Implementation

