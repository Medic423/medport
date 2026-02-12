-- Category Options Fix: Document Current State
-- Date: 2026-01-16
-- Purpose: Query and document current category slugs and their mappings before migration
-- Run this in pgAdmin to document the current state before making changes

-- Step 1: Query all categories with their current slugs
SELECT 
    id,
    slug,
    "displayName",
    "displayOrder",
    "isActive",
    "createdAt",
    "updatedAt"
FROM dropdown_categories
ORDER BY "displayOrder";

-- Step 2: Count options per category
SELECT 
    dc.slug as category_slug,
    dc."displayName" as category_name,
    COUNT(opt.id) as option_count
FROM dropdown_categories dc
LEFT JOIN dropdown_options opt ON opt.category = dc.slug OR opt."categoryId" = dc.id
GROUP BY dc.id, dc.slug, dc."displayName"
ORDER BY dc."displayOrder";

-- Step 3: Verify no orphaned options (options without matching category)
SELECT 
    opt.id,
    opt.category,
    opt.value,
    opt."categoryId",
    CASE 
        WHEN dc.id IS NULL THEN 'ORPHANED - No matching category'
        ELSE 'OK'
    END as status
FROM dropdown_options opt
LEFT JOIN dropdown_categories dc ON opt.category = dc.slug OR opt."categoryId" = dc.id
WHERE dc.id IS NULL
ORDER BY opt.category, opt.value;

-- Step 4: Expected category mappings (for reference)
-- transport-level → Form Field: Transport Level → Will become dropdown-1
-- urgency → Form Field: Urgency Level → Will become dropdown-2
-- diagnosis → Form Field: Diagnosis → Will become dropdown-3
-- mobility → Form Field: Mobility Level → Will become dropdown-4
-- insurance → Form Field: Insurance Company → Will become dropdown-5
-- secondary-insurance → Form Field: Secondary Insurance (in notes) → Will become dropdown-6
-- special-needs → Form Field: Special Needs (checkboxes) → Will become dropdown-7

-- Step 5: List all options for each category (detailed view)
SELECT 
    dc.slug as category_slug,
    dc."displayName" as category_name,
    opt.value as option_value,
    opt."isActive" as option_active,
    opt.id as option_id
FROM dropdown_categories dc
LEFT JOIN dropdown_options opt ON opt.category = dc.slug OR opt."categoryId" = dc.id
ORDER BY dc."displayOrder", opt.value;
