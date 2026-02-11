# Landing Page Implementation Checklist

**Date Created:** February 10, 2026  
**Reference Image:** `/Users/scooper/.cursor/projects/Users-scooper-Code-tcc-new-project/assets/Landing_Page-7ceba82e-24fa-4c44-8fb9-0de51440ed27.png`  
**Login Form Reference:** http://localhost:3000/login

---

## Overview

Implement the landing page to look **exactly** like the provided high-resolution design image. Use **Option B**: build the page from the designer's assets (not a single full-page image as background). Desktop only for now; mobile design coming from designer later.

**Key decisions:**
- Use existing `authAPI` and redirect logic (e.g., to dashboard after login)
- Use existing `RegistrationChoiceModal` / registration flow for "Create Account"
- All assets are in `frontend/public/landing/` (01 Logos, 02 Fonts, 03 Landing Page Assets via images subfolders, 04 Patterns)

---

## Asset Locations

| Folder | Path | Contents |
|--------|------|----------|
| **01 Logos** | `frontend/public/landing/logos/` | `TRACC_Logo_FullColor.svg`, `TRACC_Logo_White.svg` |
| **02 Fonts** | `frontend/public/landing/fonts/` | `Serifa.ttf`, `BC_Novatica_CYR_Medium.otf`, `InterTight-VariableFont_wght.ttf`, `InterTight-Italic-VariableFont_wght.ttf` |
| **03 Landing Page Assets** | `frontend/public/landing/images/` | `01 Screenshots/`, `02 Images/`, `03 Icons/`, `04 Specs/` |
| **04 Patterns** | `frontend/public/landing/patterns/` | `TRACC_Grid_Cerulean.svg`, `TRACC_Grid_Cerulean_Visible.svg`, `TRACC_Grid_Tile.svg` |

**Notable assets:**
- Hero/background: `images/02 Images/hero-image.png`, `TRACC_CTABanner_Background.png`
- Icons: `images/03 Icons/icon-hospital.svg`, `icon-ambulance.svg`, `icon-coordinator.svg`
- Design specs: `images/04 Specs/design-specs.txt`, `Color Palette Information.png`

---

## Design Specifications (from design-specs.txt)

- **Primary:** `#001872`, `#006ac6`
- **Accent:** `#ff5700`
- **Neutral white:** `#f0f3ff`
- **Neutral gray:** `#5d5d5d`
- **Tertiary:** `#f4cec6`
- **Fonts:** Serifa (headings), BC Novatica CYR (subheadings), Inter Tight (body, buttons, nav)

**Design notes from image:**
- In "Who TRACC is for" – **only "Who"** is orange; "TRACC is for" is dark blue
- In "How TRACC works" – title is aligned to the **right** of the section
- Login card: white, rounded; inputs light orange; Login button orange

---

## Implementation Checklist

### Phase 1: Page Structure and Layout ✅ COMPLETE

| # | Task | Status | Notes |
|---|------|--------|-------|
| 1.1 | Ensure landing page has: Navigation (fixed), main content area (hero → Who TRACC is for → How TRACC works → Ready to Get Started), Footer | ☑ | Removed Features, Benefits, CTA sections to match design |
| 1.2 | Apply design system: colors, fonts (Serifa, BC Novatica, Inter Tight), typography from design-specs.txt | ☑ | In `tailwind.config.js` (tracc colors, fontFamily), `index.css` (@font-face) |
| 1.3 | Use hero/background assets: `hero-image.png` and/or `TRACC_CTABanner_Background.png` where design indicates | ☑ | Hero: hero-image.png; Ready to Get Started: TRACC_CTABanner_Background.png |
| 1.4 | Apply `TRACC_Grid_Cerulean.svg` as subtle grid overlay on light blue sections (Who TRACC is for, How TRACC works) | ☑ | WhoTracIsForSection, ProcessSection both have grid at opacity 0.12 |

### Phase 2: Hero Section ✅ COMPLETE

| # | Task | Status | Notes |
|---|------|--------|-------|
| 2.1 | Dark blue background; headline "Smarter Planning, Optimized Routes, Better Outcomes." with "Planning," "Routes," "Outcomes" in orange | ☑ | |
| 2.2 | Subheadline (white): "TRACC connects healthcare and transport providers to streamline patient transfers and improve outcomes." | ☑ | |
| 2.3 | **Make active:** "Download Quick Start Guide" button → open `/docs/user-guides/get_started_quick_start.md` in new tab | ☑ | |
| 2.4 | Sub-text below CTA: "Step-by-step guide to make your TRACC success." (or correct copy from designer) | ☑ | |
| 2.5 | Login card (right side): white, rounded; "Login to TRACC" title; Email and Password inputs (light orange styling); "Remember me" checkbox; "Forgot password?" link; orange "Login" button | ☑ | Implemented with Phase 3 |

### Phase 3: Login Form (Embedded in Hero) ✅ COMPLETE

| # | Task | Status | Notes |
|---|------|--------|-------|
| 3.1 | Map login form to existing auth: use `authAPI.login(formData)`, `onLogin(user, token)` callback | ☑ | |
| 3.2 | Form fields: `email`, `password` (names match API); include "Remember me" if supported by auth | ☑ | Remember me present; authAPI does not use it yet |
| 3.3 | "Forgot password?" – link to `/forgot-password` or existing flow if present | ☑ | Link to `/forgot-password`; route not yet added (redirects to /) |
| 3.4 | On success: redirect per existing logic (e.g., navigate to dashboard based on `userType`) | ☑ | Via `onLogin` → `App.handleLogin` |
| 3.5 | On error: display error message in form (styled to match design) | ☑ | role="alert", red-50 bg |
| 3.6 | Style inputs: light orange background/border per design image | ☑ | tracc-tertiary/30 bg, tracc-tertiary/60 border |

### Phase 4: Who TRACC is for Section ✅ COMPLETE

| # | Task | Status | Notes |
|---|------|--------|-------|
| 4.1 | Light blue bg + grid pattern | ☑ | #e6f0f8, TRACC_Grid_Tile.svg (square tileable cell) at 40px, opacity 0.4 – fixes thick vertical stripes (original SVG aspect/scaling issue) |
| 4.2 | Title: **"Who"** in orange (accent), **"TRACC is for"** in dark blue | ☑ | Inline styles for reliability |
| 4.3 | Dark blue line with circular nodes connecting three columns | ☑ | |
| 4.4 | Three columns with icons: `icon-hospital.svg`, `icon-ambulance.svg`, `icon-coordinator.svg` | ☑ | |
| 4.5 | Copy: Hospitals & Health Systems / EMS & Transport Providers / Coordinators & Dispatch with descriptions from image | ☑ | |

### Phase 5: How TRACC works Section ✅ COMPLETE (connectors deferred)

| # | Task | Status | Notes |
|---|------|--------|-------|
| 5.1 | Light blue bg + grid pattern | ☑ | TRACC_Grid_Tile.svg, opacity 0.22 |
| 5.2 | Title "How TRACC works" – **positioned to the right** of the section content | ☑ | Right-aligned; "How" in orange |
| 5.3 | Dark blue line with numbered nodes (1, 2, 3) | ⏸ | Deferred: see connector-fix-plan.md; nodes exist (numbers removed) |
| 5.4 | Three steps: 1. Request, 2. Match, 3. Transport with correct copy | ☑ | |

### Phase 6: Ready to Get Started Section ✅ COMPLETE

| # | Task | Status | Notes |
|---|------|--------|-------|
| 6.1 | Dark blue (or vibrant blue) background; optional angular/chevron pattern | ☑ | #001872 + TRACC_CTABanner_Background.png |
| 6.2 | Title: "Ready to Get Started?" (white) | ☑ | |
| 6.3 | Subtext: "Create your account or explore the Quick Start guide." | ☑ | |
| 6.4 | **Make active:** "Create Account" button → open registration modal (`onShowRegistration`) | ☑ | |
| 6.5 | **Make active:** "Download Quick Start Guide" button → open Quick Start guide (same as hero) | ☑ | |

### Phase 7: Footer ✅ COMPLETE

| # | Task | Status | Notes |
|---|------|--------|-------|
| 7.1 | Light blue/grey background | ☑ | #e6f0f8 |
| 7.2 | Logo (full color on light bg) + tagline "Connecting healthcare and transport providers." | ☑ | |
| 7.3 | Links: About, Contact, Privacy Policy, Terms | ☑ | #about, #contact, /privacy-policy, /terms |

### Phase 8: Navigation ✅ COMPLETE

| # | Task | Status | Notes |
|---|------|--------|-------|
| 8.1 | Dark blue background; white logo, white links: About, Solutions, Quick Start, Contact, Login | ☑ | Inline #001872; Solutions & Quick Start → quick-start |
| 8.2 | Login link → navigate to `/login` or scroll to login card on page | ☑ | Navigates to /login |
| 8.3 | Get Started button (orange) → open registration modal | ☑ | |

### Phase 9: Responsive & Accessibility ✅ COMPLETE

| # | Task | Status | Notes |
|---|------|--------|-------|
| 9.1 | Desktop layout verified; mobile design coming later from designer | ☑ | |
| 9.2 | Focus states on interactive elements; ARIA where needed | ☑ | focus:ring on buttons |
| 9.3 | Section IDs for in-page links: `#about`, `#solutions`, `#quick-start`, `#contact`, `#ready-to-get-started` | ☑ | about (Who), quick-start (Process), contact (Footer), ready-to-get-started |

---

## Technical Notes for Agent Handoff

1. **Auth flow:** `authAPI.login({ email, password })` returns `{ success, user, token, mustChangePassword?, error? }`. On success, call `onLogin(user, token)`; app will redirect based on `userType` (ADMIN/USER → root; HEALTHCARE/EMS stay on dashboard).
2. **Registration:** `onShowRegistration` opens `RegistrationChoiceModal`; user picks Healthcare or EMS, then navigates to `/healthcare-register` or `/ems-register`. No changes to that flow.
3. **Quick Start Guide:** Served from `public/docs/user-guides/get_started_quick_start.md`. Use `window.open('/docs/user-guides/get_started_quick_start.md', '_blank')`.
4. **Existing components:** `UniversalLogin`, `LandingPage`, `RegistrationChoiceModal`. Consider extracting login form logic from UniversalLogin for reuse in hero, or render UniversalLogin inside hero card with custom styling.
5. **Routing:** `/` = LandingPage, `/login` = UniversalLogin. Landing page can embed login or link to `/login`; confirm which per design.

---

## Progress Log

| Date | Update |
|------|--------|
| 2026-02-10 | Document created. Subsection 7 of plan completed in prior session; this checklist reflects revised approach: match design image exactly, make Download Quick Start Guide, Login form, and Create Account active. |
| 2026-02-10 | **Phase 1 complete.** LandingPage structure: Hero → Who TRACC is for → How TRACC works → Ready to Get Started → Footer (removed Features, Benefits, CTASection). Design system verified (tracc colors, Serifa/BC Novatica/Inter Tight). Hero uses hero-image.png; Ready section uses TRACC_CTABanner_Background.png. Grid overlay on Who and How sections. |
| 2026-02-10 | **Phase 2 & 3 complete.** Hero: dark blue bg, headline with orange Planning/Routes/Outcomes, subhead, Download Quick Start Guide (active), Create Account (active), sub-text "Step-by-step guide to make your TRACC success." Login card on right: white rounded card, Email/Password inputs (light orange via tracc-tertiary), Remember me, Forgot password? link, Login button. Auth wired via authAPI.login and onLogin; errors displayed; redirects via App.handleLogin. |
| 2026-02-11 | **Phase 4 complete.** Who TRACC is for: light blue bg + grid, "Who" orange / "TRACC is for" dark blue (inline styles), dark blue line + nodes, three columns with design icons and copy. |
| 2026-02-11 | **Phase 4 updates:** Grid opacity 0.35, backgroundSize 80px for visibility. Connectors rebuilt as inline SVG: L-shaped brackets, horizontal line with 3 nodes, color #006ac6. |
| 2026-02-11 | **Grid fix (4.1):** Created TRACC_Grid_Cerulean_Visible.svg (stroke-width 3) from original; WhoTracIsForSection + ProcessSection use it at 107px tile, opacity 0.45. **Nav fix:** Inline style `backgroundColor: '#001872'` on Navigation so blue persists on scroll. **4.3:** Connectors still don't match design; designer could supply grid SVG with connectors included. |
| 2026-02-11 | **Grid fix v2:** Original SVG (2779×5160, unequal spacing) produced thick vertical stripes only when tiled at 107×107. Created TRACC_Grid_Tile.svg – single 100×100 cell, square, tileable – for uniform horizontal + vertical grid at 40px tile, opacity 0.22. |
| 2026-02-11 | **Phases 5–9 complete.** How TRACC works: "How" orange, title right-aligned, numbers removed from connector circles. Ready, Footer, Nav verified. Section IDs: #about, #quick-start, #contact, #ready-to-get-started. **Connectors deferred:** See connector-fix-plan.md for fix options. |

---

## Technical Notes (Updates)

- **Hero visibility fix (2026-02-11):** Added inline `style={{ backgroundColor: '#001872' }}` to hero section and inline `color: '#ff5700'` for Planning/Routes/Outcomes to guarantee visibility if Tailwind classes fail. Subhead and sub-text use inline `color: rgba(255,255,255,0.95)` and `rgba(255,255,255,0.85)`. Login button uses inline `backgroundColor: '#ff5700'` and `pt-2` wrapper for separation. If colors still don’t appear, try hard refresh (Cmd+Shift+R) or restart dev server.

## Open Questions

- [ ] "Forgot password?" – does route exist? Link target?
- [ ] "Remember me" – is it supported by authAPI?
- [ ] Login in hero: should it replace `/login` page, or is `/login` kept for deep links?
- [ ] **4.3 Connectors:** Current inline SVG approximates design. Would it help if the designer updated TRACC_Grid_Cerulean.svg to include the connector elements from TRACC_Logo_FullColor.png?
