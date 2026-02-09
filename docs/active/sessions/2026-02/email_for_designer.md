# Email Instructions for Designer - Landing Page Assets

**Subject:** Landing Page Implementation - Assets & Specifications Needed

---

Hi Sophia,

We've built the complete structure for the TraccEMS landing page and now need the design assets and specifications from Figma to match your design exactly. 

Here's exactly what we need:

---

## 1. Screenshots (10 minutes)

Please take 3 full-page screenshots:

1. **Desktop View** - Full landing page as it appears on desktop
   - File name: `landing-desktop.png`
   - How: Use browser screenshot or Figma's export feature

2. **Mobile View** - Full landing page as it appears on mobile
   - File name: `landing-mobile.png`
   - How: Switch to mobile frame in Figma, then screenshot

3. **Process Section Close-up** - The "How TRACC works" 3-step process section (Request, Match, Transport)
   - File name: `process-section.png`
   - How: Zoom in on that section, screenshot

4. **"Who TRACC is for" Section** - The 3-column section (Hospitals, EMS, Coordinators)
   - File name: `who-trac-is-for.png`
   - How: Screenshot of that section

**Why:** These help us verify the final implementation matches your design exactly.

---

## 2. Design Specifications (15 minutes)

Please create a simple text document with the following:

### Colors (Hex Codes)
For each color used in the design, please provide:
- Primary color: #XXXXXX
- Secondary color: #XXXXXX
- Text color (headings): #XXXXXX
- Text color (body): #XXXXXX
- Link color: #XXXXXX
- Background colors: #XXXXXX
- Any accent colors: #XXXXXX

**How to get hex codes in Figma:**
- Click on any element with the color
- In the right panel, click the color fill/stroke
- Copy the hex code (e.g., #2563EB)

### Typography
For each text style, please provide:
- **Hero headline:** Font family, size (px), weight, line height
- **Hero subheadline:** Font family, size (px), weight, line height
- **Section headings (h2):** Font family, size (px), weight, line height
- **Body text:** Font family, size (px), weight, line height
- **Button text:** Font family, size (px), weight
- **Navigation links:** Font family, size (px), weight

**How to get typography in Figma:**
- Select text element
- Right panel shows: Font name, Size, Weight, Line height
- Just copy those values

### Spacing
Please note:
- **Section padding:** Top and bottom padding for each section (e.g., 80px, 120px)
- **Container max-width:** Maximum width of content (e.g., 1280px)
- **Grid gaps:** Spacing between cards/elements (e.g., 32px, 24px)
- **Card padding:** Internal padding for cards (e.g., 24px, 32px)

**How to get spacing in Figma:**
- Select a section/card
- Right panel shows padding values
- Note the values

---

## 3. Assets Export (10 minutes)

### Hero Image
- Select the hero image/illustration
- Right-click → Export → Choose PNG → Select "2x" → Export
- File name: `hero-image.png`

### Logo (if different from existing)
- Select logo
- Right-click → Export → PNG or SVG → Export
- File name: `logo.png` or `logo.svg`

### Process Section Icons ("How TRACC works" - if custom icons)
- If you used custom icons (not standard icon library), export each:
  - Request icon → `icon-request.svg` (or PNG)
  - Match icon → `icon-match.svg`
  - Transport icon → `icon-transport.svg`
- If you used standard icons (Font Awesome, Material, etc.), just tell us which library and icon names

### "Who TRACC is for" Section Icons (if custom icons)
- Hospital/building icon → `icon-hospital.svg` (or PNG)
- Ambulance icon → `icon-ambulance.svg` (or PNG)
- Coordination/dispatch icon (three circles with arrows) → `icon-coordinator.svg` (or PNG)
- If you used standard icons, just tell us which library and icon names

### Any Background Images/Patterns
- If there are background images or patterns, export those too
- File names: Descriptive (e.g., `background-pattern.png`)

---

## 4. Content Text (5 minutes)

Please copy all text exactly as it appears in the design:

### Hero Section (Top section with dark blue background)
- Headline: 
  ```
  Smarter Planning,
  Optimized Routes,
  Better Outcomes.
  ```
  (Note: Line breaks are helpful - I'll use them to create proper HTML structure)
  
- Subheadline: 
  ```
  TRACC connects healthcare and transport
  providers to streamline patient transfers
  and improve outcomes.
  ```
  (Note: Line breaks help with responsive text wrapping)
  
- Primary button text: `Download Quick Start Guide`
- Primary button description/subtitle: `Step-by-step guide to create your TRACC account`
  (Note: This appears to be helper text below the button)

**Login Form (Right side of hero section):**
- Form title: `Login to TRACC`
- Email field label: `Email`
- Password field label: `Password`
- Remember me checkbox: `Remember me`
- Forgot password link: `Forgot password?`
- Login button text: `Login`

### "Who TRACC is for" Section (White background with blue grid)
- Section title: `Who TRACC is for`
- **Column 1 (Left):**
  - Icon: Building/hospital icon
  - Title: `Hospitals & Health Systems`
  - Description: `We help optimize ER facilities and spaces for a better workflow.`
- **Column 2 (Middle):**
  - Icon: Ambulance icon
  - Title: `EMS & Transport Providers`
  - Description: `There are no roundabouts here, just straightforward routes for your team.`
- **Column 3 (Right):**
  - Icon: Coordination/dispatch icon (three circles with arrows converging)
  - Title: `Coordinators & Dispatch`
  - Description: `We reduce transfer delays and coordinate transports in real time.`

### "How TRACC works" Section (Process Section - White background with blue grid)
**Note:** This is the 3-step process section, NOT the login section. The login form is separate in the hero section.

- Section title: `How TRACC works`
- **Step 1:**
  - Title: `1. Request`
  - Description: `Clinicians or coordinators submit a transport request within the TRACC portal.`
- **Step 2:**
  - Title: `2. Match`
  - Description: `TRACC identifies the best available transport provider based on location and needs.`
- **Step 3:**
  - Title: `3. Transport`
  - Description: `Your teams receive clear instructions and updates for the patient move.`

### "Ready to Get Started?" Section (CTA Section - Middle-blue background)
- Heading: `Ready to Get Started?`
- Subtext/Description: `Create your account or explore the Quick Start guide.`
- Primary button text: `Create Account`
- Secondary button text: `Download Quick Start Guide`

### Footer (Bottom section with light blue/grey background)
- **Left side:**
  - Logo: TRACC logo (stylized "tracc" text)
  - Tagline: `Connecting healthcare and transport providers.`
- **Right side - Navigation Links:**
  - `About`
  - `Contact`
  - `Privacy Policy`
  - `Terms`
- Copyright text: [exact text if visible]

---

## File Organization

Please organize everything like this:

```
landing-page-assets/
├── screenshots/
│   ├── landing-desktop.png
│   ├── landing-mobile.png
│   └── process-section.png
├── images/
│   ├── hero-image.png
│   └── logo.png (if different)
├── icons/
│   ├── icon-request.svg (if custom)
│   ├── icon-match.svg (if custom)
│   └── icon-transport.svg (if custom)
└── specs/
    └── design-specs.txt (colors, typography, spacing)
```

---

## Delivery

You can send everything via:
- **Google Drive/Dropbox:** Share a folder with all files
- **Email:** Attach files (if total size is reasonable)
- **ZIP file:** Compress everything and share

---

## Questions?

If anything is unclear or you need help exporting, just let me know! 

**Timeline:** We're ready to integrate as soon as we receive these assets, so the sooner you can provide them, the faster we can complete the implementation.

Thank you!

---

**Note:** We've already implemented the structure and content based on what we could see in the design. We just need the visual specifications and assets to match your design exactly.
