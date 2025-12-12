# Category Options Restoration Plan

**Date:** December 9, 2025  
**Issue:** The ability to configure what appears in the "Select Category" dropdown in Healthcare -> Hospital Settings -> Dropdown Options is missing.

## Current State Analysis

### Problem
- Categories are **hardcoded** in both frontend and backend
- Users can manage options WITHIN categories, but cannot add/edit/delete categories themselves
- No database table exists specifically for categories (categories are just strings in `DropdownOption.category`)

### Current Implementation

#### Frontend (`frontend/src/components/HospitalSettings.tsx`)
- **Line 77:** Tab state: `'dropdowns' | 'pickup-locations' | 'main-contact'`
- **Line 170:** Categories hardcoded: `['transport-level', 'urgency', 'diagnosis', 'mobility', 'insurance', 'special-needs']`
- **Line 523-533:** `getCategoryDisplayName()` function maps category slugs to display names
- **Line 629-641:** "Select Category" dropdown populated from hardcoded `categories` array

#### Backend (`backend/src/routes/dropdownOptions.ts`)
- **Line 8-15:** `ALLOWED_CATEGORIES` Set with hardcoded categories
- **Line 22-24:** Validation rejects any category not in `ALLOWED_CATEGORIES`
- **Line 255-269:** GET `/api/dropdown-options` endpoint returns hardcoded categories

#### Database (`backend/prisma/schema.prisma`)
- **Line 518-529:** `DropdownOption` model has `category` field (String)
- **Line 527:** Unique constraint on `[category, value]`
- **No separate Category model exists**

## Proposed Solution

### Overview
Add a new "Category Options" tab as the **first tab** in Hospital Settings that allows users to:
1. View all categories
2. Add new categories
3. Edit category display names
4. Delete categories (with validation to prevent deletion if options exist)
5. Set category display order

### Implementation Plan

#### Phase 1: Database Schema Changes

**1.1 Create Category Model** (New Prisma Model)
```prisma
model DropdownCategory {
  id          String          @id @default(cuid())
  slug        String          @unique  // e.g., 'transport-level'
  displayName String          // e.g., 'Transport Levels'
  displayOrder Int            @default(0)  // For sorting
  isActive    Boolean         @default(true)
  createdAt   DateTime        @default(now())
  updatedAt   DateTime        @updatedAt
  options     DropdownOption[] // Relation to options
  
  @@map("dropdown_categories")
}
```

**1.2 Update DropdownOption Model**
- Add relation to `DropdownCategory`
- Keep `category` field for backward compatibility during migration
- Add foreign key constraint

**1.3 Migration Strategy**
- Create migration to:
  1. Create `dropdown_categories` table
  2. Seed with existing 6 categories
  3. Add `categoryId` to `dropdown_options` (nullable initially)
  4. Populate `categoryId` based on `category` string
  5. Make `categoryId` required
  6. Optionally remove `category` field later (or keep for compatibility)

#### Phase 2: Backend API Changes

**2.1 New Category Management Endpoints** (`backend/src/routes/dropdownCategories.ts`)
```
GET    /api/dropdown-categories           - Get all categories
GET    /api/dropdown-categories/:id       - Get single category
POST   /api/dropdown-categories           - Create new category
PUT    /api/dropdown-categories/:id       - Update category
DELETE /api/dropdown-categories/:id       - Delete category (with validation)
```

**2.2 Update Existing Dropdown Options Routes**
- Replace `ALLOWED_CATEGORIES` Set with database query
- Validate categories exist in database
- Update validation logic to check `DropdownCategory` table

**2.3 Category Validation Rules**
- Prevent deletion if category has active options
- Prevent duplicate slugs
- Require display name
- Validate slug format (lowercase, hyphens only)

#### Phase 3: Frontend Component Changes

**3.1 Update HospitalSettings Component**

**3.1.1 Tab State Update**
```typescript
// Change from:
const [activeTab, setActiveTab] = useState<'dropdowns' | 'pickup-locations' | 'main-contact'>('dropdowns');

// To:
const [activeTab, setActiveTab] = useState<'categories' | 'dropdowns' | 'pickup-locations' | 'main-contact'>('categories');
```

**3.1.2 Add Category Management State**
```typescript
interface DropdownCategory {
  id: string;
  slug: string;
  displayName: string;
  displayOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const [categories, setCategories] = useState<DropdownCategory[]>([]);
const [selectedCategoryForEdit, setSelectedCategoryForEdit] = useState<DropdownCategory | null>(null);
const [categoryFormData, setCategoryFormData] = useState({
  slug: '',
  displayName: '',
  displayOrder: 0
});
```

**3.1.3 Add Category Management Functions**
- `loadCategories()` - Fetch from API
- `handleAddCategory()` - Create new category
- `handleEditCategory()` - Update category
- `handleDeleteCategory()` - Delete with validation
- `handleReorderCategories()` - Update display order

**3.1.4 Update Tab Navigation**
Add "Category Options" as first tab:
```tsx
<button onClick={() => setActiveTab('categories')}>
  Category Options
</button>
<button onClick={() => setActiveTab('dropdowns')}>
  Dropdown Options
</button>
<button onClick={() => setActiveTab('pickup-locations')}>
  Pickup Locations
</button>
<button onClick={() => setActiveTab('main-contact')}>
  Main Contact
</button>
```

**3.1.5 Add Category Options Tab Content**
- List of all categories with:
  - Display name
  - Slug
  - Number of options
  - Display order
  - Active status
- Add/Edit form
- Delete button (with confirmation)
- Reorder functionality (drag-and-drop or up/down arrows)

**3.1.6 Update Dropdown Options Tab**
- Change `loadCategories()` to fetch from API instead of hardcoded array
- Use `categories` from state instead of hardcoded list
- Update "Select Category" dropdown to use API-loaded categories

**3.2 Update API Service** (`frontend/src/services/api.ts`)
Add category management methods:
```typescript
export const dropdownCategoriesAPI = {
  getAll: () => api.get('/api/dropdown-categories'),
  getById: (id: string) => api.get(`/api/dropdown-categories/${id}`),
  create: (data: { slug: string; displayName: string; displayOrder?: number }) => 
    api.post('/api/dropdown-categories', data),
  update: (id: string, data: Partial<{ displayName: string; displayOrder: number; isActive: boolean }>) => 
    api.put(`/api/dropdown-categories/${id}`, data),
  delete: (id: string) => api.delete(`/api/dropdown-categories/${id}`),
};
```

#### Phase 4: Backward Compatibility & Migration

**4.1 Seed Existing Categories**
Create seed script to populate `dropdown_categories` with:
- transport-level → "Transport Levels"
- urgency → "Urgency Levels"
- diagnosis → "Primary Diagnosis"
- mobility → "Mobility Levels"
- insurance → "Insurance Companies"
- special-needs → "Secondary Insurance"

**4.2 Migration Path**
1. Deploy database migration
2. Run seed script
3. Deploy backend changes
4. Deploy frontend changes
5. Existing data remains functional

**4.3 Fallback Strategy**
- Keep `category` string field in `DropdownOption` during transition
- If category not found in database, fall back to string-based lookup
- Log warnings for orphaned categories

#### Phase 5: Validation & Error Handling

**5.1 Category Deletion Validation**
- Check if category has any `DropdownOption` records
- If yes, prevent deletion and show error message
- Option: Allow soft delete (set `isActive: false`) instead

**5.2 Slug Validation**
- Must be lowercase
- Must contain only letters, numbers, and hyphens
- Must be unique
- Must not conflict with reserved slugs

**5.3 Display Name Validation**
- Required
- Max length: 100 characters
- Must be unique (or allow duplicates?)

**5.4 Error Messages**
- "Cannot delete category with existing options"
- "Category slug already exists"
- "Invalid category slug format"
- "Display name is required"

## File Changes Summary

### New Files
1. `backend/src/routes/dropdownCategories.ts` - Category management routes
2. `backend/src/services/dropdownCategoryService.ts` - Category business logic (optional)
3. `backend/prisma/migrations/YYYYMMDDHHMMSS_add_dropdown_categories/migration.sql` - Database migration

### Modified Files
1. `backend/prisma/schema.prisma` - Add `DropdownCategory` model
2. `backend/src/routes/dropdownOptions.ts` - Update to use database categories
3. `frontend/src/components/HospitalSettings.tsx` - Add category management tab
4. `frontend/src/services/api.ts` - Add category API methods

### Database Changes
1. New table: `dropdown_categories`
2. New field: `dropdown_options.categoryId` (foreign key)
3. Seed data: 6 initial categories

## Testing Checklist

- [ ] Can create new category
- [ ] Can edit category display name
- [ ] Can reorder categories
- [ ] Cannot delete category with options
- [ ] Can delete category without options
- [ ] Category appears in "Select Category" dropdown
- [ ] Options can be added to new category
- [ ] Existing categories still work
- [ ] Display names show correctly
- [ ] Slug validation works
- [ ] Error messages display correctly

## Implementation Order

1. **Database Migration** - Create schema and seed data
2. **Backend API** - Category management endpoints
3. **Backend Update** - Update dropdown options routes
4. **Frontend API Service** - Add category methods
5. **Frontend Component** - Add category management tab
6. **Frontend Update** - Update dropdown options tab to use API
7. **Testing** - End-to-end testing
8. **Deployment** - Deploy to production

## Notes

- Consider keeping `category` string field for backward compatibility
- Display order allows custom sorting of categories
- Soft delete (`isActive: false`) might be better than hard delete
- Consider adding category descriptions/help text
- May want to add category icons in the future

