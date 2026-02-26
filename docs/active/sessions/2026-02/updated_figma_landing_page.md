# Updated Figma Landing Page – Analysis & Implementation Plan

**Date:** February 16, 2026  
**Status:** Phases 1–3 Implemented – Polish & Phases 4–7 Pending  
**Reference:** `landing_page_figma_settings.md`, designer images

---

## Session Log

| Date | Action |
|------|--------|
| 2026-02-16 | **Commit:** `0a4fbc9a` – Phase 1–3 Figma redesign (header, hero, Who TRACC is for section, connector assets) |
| 2026-02-16 | **Backup:** `tcc-backup-20260216_155344` to `/Volumes/Acasis/tcc-backups/` and iCloud Drive |
| 2026-02-16 | **Branch:** `feature/landing-page-redesign` (ahead of origin by 1 commit – push when ready) |

---

## Executive Summary

The `landing_page_figma_settings.md` document provides **sufficient information** to implement the design updates, including the connector geometry. The document contains explicit coordinates, dimensions, colors, and typography for all major sections. The primary gaps are: (1) responsive scaling strategy for absolute pixel values, and (2) confirmation of asset paths for referenced images (e.g., `Asset 12@4x-0 1`, `Asset 7@4x-0 1`).

---

## Connector Analysis

### Current vs. Designer Intent

| Aspect | Current Implementation | Designer (Image 1) | Figma Settings |
|--------|------------------------|--------------------|----------------|
| **Shape** | Straight horizontal line with 3 nodes | L-shaped brackets: left vertical → horizontal line with nodes → right vertical | Full coordinates provided |
| **Line style** | `h-1.5` (~6px), `rounded-full` | 20px stroke (`border-width: 20px`), `#006AC6` | `border: 20px solid #006AC6` |
| **Nodes** | ~40×40px circles, `#001872` | ~45.5×49px ellipses, `#006AC6` | Ellipse dimensions + color specified |
| **Color** | `#001872` (tracc-primary) | `#006AC6` (tracc-primary-light) | `#006AC6` for connectors |

### Connector Geometry (Information Section – "Who TRACC is for")

The figma document provides explicit coordinates. All values are in pixels relative to a 1942px-wide canvas.

**Left vertical (Vector 3):**
- `width: 89`, `height: 373`, `top: 1411`, `left: 88`
- `border: 20px solid #006AC6`

**Ellipses 1–3 (nodes):**
- Ellipse 1: `45.5 × 49`, `top: 1758`, `left: 154`
- Ellipse 2: `45.5 × 49`, `top: 1758`, `left: 677.94`
- Ellipse 3: `45.5 × 49`, `top: 1759`, `left: 1212`

**Horizontal segments:**
- Vector 5: `182 × 0`, `top: 1781`, `left: 521` (between Ellipse 1 and 2)
- Vector 6: `182 × 0`, `top: 1784`, `left: 1060` (between Ellipse 2 and 3)

**Right vertical (Vector 4):**
- `width: 101`, `height: 385`, `top: 1784`, `left: 1527`
- `border: 20px solid #006AC6`

### Connector Geometry (How TRACC works)

Same pattern, different Y positions:
- Vector 8 (left vertical): `533 × 254`, `top: 2169`, `left: 89`
- Ellipses 4–6: `top: 2398`, `left: 163.01`, 681.2, 1202.17
- Vectors 9–10 (horizontal): `top: 2421`, `left: 529`, 1048.94
- Right vertical: implied (not fully specified but follows same pattern)

### Sufficiency Assessment

**Yes, there is enough information** to implement the connectors. The document provides:
- Exact positions for all vectors and ellipses
- Stroke width (20px)
- Color (#006AC6)
- Relative layout (left vertical → nodes → right vertical)

**Implementation approach:** Build an SVG or div-based connector using these coordinates. For responsiveness, scale the connector as a unit or use `transform: scale()` based on container width, or convert to percentage-based layout.

---

## Fonts & Colors Gap Analysis

### Fonts

| Element | Figma Spec | Current | Gap |
|---------|------------|---------|-----|
| Hero headline | Serifa, 80px, Medium, line-height 94px | `text-4xl`–`text-6xl` (~36–60px) | Size too small |
| Hero subheadline | BC Novatica CYR, 32px, Medium, 38px | `text-xl` (~20px) | Size + font family |
| Section titles (Who/How) | Serifa, 80px, Medium, line-height 131px | `text-[2.5rem]`–`text-[3.5rem]` | Size + line-height |
| Body text (descriptions) | Inter Tight, 24px, Regular, line-height 32px | `text-base`–`text-lg` (~16–18px) | Size + line-height |
| Button text | Inter Tight, 20px, Medium | `text-base` (~16px) | Size |
| Login title | BC Novatica CYR, 42px, Medium | `text-xl` | Font + size |
| Footer tagline | Serifa, 48px, Medium, 58px | `font-inter-tight text-xl` | Font + size |

### Colors

| Element | Figma Spec | Current | Gap |
|---------|------------|---------|-----|
| Section background (Who/How) | `#F0F3FF` | `#e6f0f8` | Different |
| Connector lines/nodes | `#006AC6` | `#001872` | Different |
| Hero sub-text | `#F0F3FF` | `rgba(255,255,255,0.85)` | Different |
| Quick Start button text | `#F0F3FF` | `text-white` | Explicit hex vs. white |
| Login container | `#F0F3FF` | `bg-white` | Different |
| Email/Password inputs | `#F4CEC6` | `bg-tracc-tertiary/30` | Similar (tertiary is #f4cec6) |
| Remember me / labels | `#5D5D5D` | `text-tracc-gray` | Same |
| CTA secondary button | `border: 1.5px solid #F0F3FF`, `#F4CEC600` bg | `border-2 border-tracc-primary-light` | Different |
| Footer links | `#001872FC` (99%, 92%) | `text-tracc-primary` | Opacity variants |

---

## Implementation Plan (Todo-Style Phases)

### Phase 1: Header / Navigation ✅ COMPLETE

- [x] **1.1** Verify nav background `#001872` (already correct)
- [x] **1.2** Ensure nav links use Inter Tight, 24px (updated from text-sm to text-2xl)
- [x] **1.3** Logo: white variant on dark blue (already in use)

---

### Phase 2: Hero Section ✅ COMPLETE

- [x] **2.1** Hero dimensions: min-h responsive (50vh, 70vh lg)
- [x] **2.2** Headline: Serifa, 80px (clamp), Medium, line-height 94px; "Planning," "Routes," "Outcomes" in `#FF5700`
- [x] **2.3** Subheadline: BC Novatica CYR, 32px (clamp), Medium, line-height 38px, `#FFFFFF`
- [x] **2.4** Quick Start button: 335×62, border-radius 15px, `#FF5700`, text Inter Tight 20px Medium `#F0F3FF`
- [x] **2.5** Sub-text: "Step-by-step guide to create your TRACC account" – Inter Tight 18px Light `#F0F3FF`
- [x] **2.6** Hero shows both "Download Quick Start Guide" and "Create Account" buttons
- [x] **2.7** Login card: 571×517, border-radius 26px, background `#F0F3FF`
- [x] **2.8** Login title: BC Novatica CYR, 42px, Medium, `#001872`
- [x] **2.9** Email/Password inputs: `#F4CEC6` background; Inter Tight 20px, placeholder `#001872B2` (70%)
- [x] **2.10** Remember me: checkbox styling per figma; text Inter Tight 16px `#5D5D5D`
- [x] **2.11** Login button: ~120×55, border-radius 15px, `#FF5700`, text Inter Tight 20px `#F0F3FF`

---

### Phase 3: Information Section ("Who TRACC is for") ✅ COMPLETE

- [x] **3.1** Section background: `#F0F3FF` (replace `#e6f0f8`)
- [x] **3.2** Section border: Skip – figma `20px solid #006AC6` is a layout guide, not a visible border
- [x] **3.3** Grid pattern: opacity 0.38 (current 0.22)
- [x] **3.4** Section title: "Who" `#FF5700`, "TRACC is for" `#001872`; Serifa 80px (clamp), line-height 131px
- [x] **3.5** **Connectors:** L-shaped bracket (desktop): left vertical, 3 ellipses + horizontal segments, right vertical; straight-line on mobile
- [x] **3.6** Icons: `/landing/images/03%20Icons/icon-hospital.svg`, `icon-ambulance.svg`, `icon-coordinator.svg`
- [x] **3.7** Column titles: BC Novatica CYR, 32px, Medium, `#001872`
- [x] **3.8** Descriptions: Inter Tight, 24px, Regular, line-height 32px, `#001872FC` (95% opacity)

---

### Phase 4: How TRACC Works Section ✅ COMPLETE

- [x] **4.1** Section background: `#F0F3FF`
- [x] **4.2** Grid pattern: opacity 0.38
- [x] **4.3** Section title: "How" `#FF5700`, "TRACC works" `#001872`; Serifa 80px (clamp), line-height 131px
- [x] **4.4** **Connectors:** Same straight connector bar as Who TRACC is for (#006AC6)
- [x] **4.5** Step titles (1. Request, 2. Match, 3. Transport): BC Novatica CYR, 36px, Medium, `#001872`
- [x] **4.6** Step descriptions: Inter Tight, 24px, line-height 31px, `#001872FC` (99%)
- [x] **4.7** Step titles use "2. Match" format

---

### Phase 5: CTA Section ("Ready to Get Started?")

- [ ] **5.1** Background: blue with Asset 7@4x pattern (opacity 0.69, mix-blend-mode Multiply)
- [ ] **5.2** Headline: Serifa, 78px, line-height 131px, white
- [ ] **5.3** Sub-headline: BC Novatica CYR, 30px, Medium, white
- [ ] **5.4** Create Account button: 251×74, border-radius 15px, `#FF5700`, text Inter Tight 23px `#F0F3FF`
- [ ] **5.5** Download Quick Start button: 349×73.6, border-radius 15px, `border: 1.5px solid #F0F3FF`, transparent/`#F4CEC600` bg, text Inter Tight 23px `#F0F3FF`
- [ ] **5.6** CTA background: `/landing/images/02%20Images/TRACC_CTABanner_Background.png`

---

### Phase 6: Footer Section

- [ ] **6.1** Section dimensions: 1887×420 (reference)
- [ ] **6.2** Tagline: "Connecting healthcare and transport providers." – Serifa 48px, line-height 58px; trailing period in accent (e.g. `#FF5700`) if in design
- [ ] **6.3** Footer background: `#F0F3FF` (light)
- [ ] **6.4** Links: About, Contact, Pricing (Privacy Policy, Terms – confirm full list); Inter Tight 24px Medium, `#001872FC` (92–99%)
- [ ] **6.5** Copyright: retain current styling

---

### Phase 7: Global / Design System

- [ ] **7.1** Add/verify Serifa, BC Novatica CYR, Inter Tight in `index.css` and `tailwind.config.js`
- [ ] **7.2** Update `tracc.section-bg` to `#F0F3FF` if used globally
- [ ] **7.3** Add utility classes for figma line-heights (94px, 131px, 38px, etc.) if needed
- [ ] **7.4** Responsive: define breakpoints and scaling rules for absolute pixel values (e.g., 80px headline → smaller on mobile)

---

## Resolved Questions (February 16, 2026)

1. **Asset paths** (from `landing_page_redesign_plan_53c7334a.plan.md`):
   - **Icons (Information section):** `/landing/images/03%20Icons/icon-hospital.svg`, `icon-ambulance.svg`, `icon-coordinator.svg` (map to Asset 12, 15, 14)
   - **CTA background:** `/landing/images/02%20Images/TRACC_CTABanner_Background.png` (Asset 7)
   - **Nav logo:** `/landing/logos/TRACC_Logo_FullColor.svg` (or White for dark bg)
   - **Hero image:** `/landing/images/02%20Images/hero-image.png`
   - **Grid pattern:** `/landing/patterns/TRACC_Grid_Tile.svg` (or `TRACC_Grid_Cerulean.svg`)

2. **Hero CTAs:** Show both "Download Quick Start Guide" and "Create Account."

3. **Footer background:** Light – use `#F0F3FF`.

4. **Responsive connectors:** On small screens, use simplified straight-line layout; L-shaped brackets on desktop only.

5. **Copy:** Use "2. Match" (with period).

6. **Section border:** The `border: 20px solid #006AC6` on the Information section is a layout guide – do not render as visible border.

---

## Conclusion

The `landing_page_figma_settings.md` document provides **enough information** to implement the design, including the connector geometry. The main work is:

1. **Connectors:** Rebuild from straight lines to L-shaped brackets using the provided coordinates.
2. **Fonts:** Increase sizes and apply correct families (Serifa, BC Novatica CYR, Inter Tight) per spec.
3. **Colors:** Align section backgrounds, connector color, and UI elements with figma values.

Resolving the open questions above will allow implementation to proceed without guesswork.
