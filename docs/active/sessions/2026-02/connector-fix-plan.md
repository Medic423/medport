# Connector Lines Fix Plan

**Date:** February 11, 2026  
**Status:** Deferred  
**Related:** landing_implementation_checklst.md, Phase 4.3 (Who TRACC is for), Phase 5.3 (How TRACC works)

---

## Summary

The connector lines in the **Who TRACC is for** and **How TRACC works** sections do not match the design. Current implementation uses inline SVG approximations. Fixing these connectors may require designer input or updated assets.

---

## Affected Sections

### 1. Who TRACC is for (WhoTracIsForSection.tsx)

- **Current:** Inline SVG with L-shaped brackets, horizontal line, and 3 circular nodes (#006ac6)
- **Issue:** Pattern doesn't match design; spacing may need adjustment
- **Reference:** TRACC_Logo_FullColor.png may have connector-like elements that could be extracted
- **Design ask:** Would a grid SVG that includes the connector elements help?

### 2. How TRACC works (ProcessSection.tsx)

- **Current:** Horizontal blue line with three circular nodes (numbers removed per user request)
- **Issue:** Connector style may need to match Who section; spacing may need refinement
- **Related:** Once Who section connectors are correct, apply similar treatment here

---

## Options to Fix

| Option | Description | Effort |
|--------|-------------|--------|
| A. Designer-provided asset | Designer updates TRACC_Grid_Cerulean.svg (or creates new asset) to include connector elements from design | Low (if designer does it) |
| B. Extract from logo | Extract connector paths from TRACC_Logo_FullColor.png – may not be suitable (PNG, embedded in logo) | Medium |
| C. Rebuild from design image | Manually trace connector shapes from high-res design image and create matching SVG | High |
| D. Refine inline SVG | Iterate on current inline SVG (paths, curvature, node positions) until it visually matches | Medium–High |

---

## Recommended Next Steps

1. **Ask designer** whether they can supply a grid+connector SVG or the connector artwork as a separate asset.
2. If designer cannot supply: **trace from design image** (`Landing_Page-7ceba82e-24fa-4c44-8fb9-0de51440ed27.png`) to capture exact connector shape, paths, and spacing.
3. **Apply spacing fixes** to Who and How sections once connector visuals are correct – connector layout will inform column/step spacing.

---

## Files to Update When Fixing

- `frontend/src/components/landing/WhoTracIsForSection.tsx` – connector SVG, spacing
- `frontend/src/components/landing/ProcessSection.tsx` – connector SVG, spacing (aligned with Who section)
