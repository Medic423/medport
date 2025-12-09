# End-to-End Testing Guide - Category Options Feature

**Date:** December 9, 2025  
**Migration Status:** ✅ Complete (6 categories, 58 options linked)

## Migration Verification

✅ **Migration Applied Successfully**
- 6 categories created
- 58 existing options linked to categories
- Foreign key constraints created
- All indexes created

## Backend Endpoint Testing

### Prerequisites
- Backend server running on port 5001
- Database migration applied
- Valid admin credentials

### Test Script
```bash
node backend/test-category-endpoints.js
```

### Manual Testing

**1. Get All Categories**
```bash
curl -X GET http://localhost:5001/api/dropdown-categories \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json"
```

**Expected:** Returns array of 6 categories with option counts

**2. Get Single Category**
```bash
curl -X GET http://localhost:5001/api/dropdown-categories/CATEGORY_ID \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Expected:** Returns single category object

**3. Create Category**
```bash
curl -X POST http://localhost:5001/api/dropdown-categories \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "slug": "test-category",
    "displayName": "Test Category",
    "displayOrder": 10
  }'
```

**Expected:** Returns created category object

**4. Update Category**
```bash
curl -X PUT http://localhost:5001/api/dropdown-categories/CATEGORY_ID \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "displayName": "Updated Name",
    "displayOrder": 11
  }'
```

**Expected:** Returns updated category object

**5. Delete Category (without options)**
```bash
curl -X DELETE http://localhost:5001/api/dropdown-categories/CATEGORY_ID \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Expected:** Success message (only if category has no options)

**6. Get Categories List (for Dropdown Options tab)**
```bash
curl -X GET http://localhost:5001/api/dropdown-options \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Expected:** Returns array of category slugs: `["transport-level", "urgency", ...]`

## Frontend UI Testing

### Test Scenarios

**1. Category Options Tab**
- [ ] Navigate to Healthcare -> Hospital Settings
- [ ] Verify "Category Options" tab appears **first** (before Dropdown Options)
- [ ] Verify table shows 6 categories
- [ ] Verify each category shows:
  - Display Name
  - Slug (code formatted)
  - Option Count (should show 58 total across categories)
  - Display Order
  - Status (Active)
  - Edit/Delete buttons

**2. Create Category**
- [ ] Click "Add Category" button
- [ ] Fill in form:
  - Slug: `test-category` (auto-lowercase)
  - Display Name: `Test Category`
  - Display Order: `10` (optional)
- [ ] Click "Create Category"
- [ ] Verify success message
- [ ] Verify category appears in table
- [ ] Verify category appears in "Dropdown Options" tab's category dropdown

**3. Edit Category**
- [ ] Click Edit icon on a category
- [ ] Change Display Name
- [ ] Change Display Order
- [ ] Click "Update Category"
- [ ] Verify changes saved
- [ ] Verify table updated

**4. Delete Category (without options)**
- [ ] Create a test category (no options)
- [ ] Click Delete icon
- [ ] Confirm deletion
- [ ] Verify category removed from table
- [ ] Verify category removed from "Dropdown Options" dropdown

**5. Delete Category (with options) - Should Fail**
- [ ] Try to delete a category that has options (e.g., "transport-level")
- [ ] Verify error message: "Cannot delete category with X active option(s)"
- [ ] Verify delete button is disabled (visual check)

**6. Dropdown Options Tab**
- [ ] Switch to "Dropdown Options" tab
- [ ] Verify "Select Category" dropdown shows all 6 categories
- [ ] Select a category
- [ ] Verify options load for that category
- [ ] Verify can add/edit/delete options
- [ ] Verify new category appears in dropdown after creation

**7. Slug Validation**
- [ ] Try creating category with invalid slug (uppercase, spaces, special chars)
- [ ] Verify slug auto-corrects or shows validation error
- [ ] Verify slug cannot be changed after creation (disabled in edit mode)

**8. Display Order**
- [ ] Create categories with different display orders
- [ ] Verify categories appear in correct order
- [ ] Verify order persists after page refresh

## Expected Results

### Backend
- ✅ All endpoints return 200 status
- ✅ Categories returned with correct structure
- ✅ Option counts accurate
- ✅ Validation works (slug format, duplicate prevention)
- ✅ Delete prevention works (category with options)

### Frontend
- ✅ Category Options tab appears first
- ✅ Table displays all categories correctly
- ✅ Create/Edit/Delete functions work
- ✅ Validation messages display correctly
- ✅ Dropdown Options tab loads categories from API
- ✅ Categories appear in "Select Category" dropdown

## Troubleshooting

### Backend Errors

**Error: "Table dropdown_categories does not exist"**
- **Solution:** Migration not applied. Re-run migration SQL.

**Error: "Invalid category"**
- **Solution:** Category doesn't exist in database. Check slug matches.

**Error: "Category with this slug already exists"**
- **Solution:** Slug must be unique. Use different slug.

### Frontend Errors

**Error: "Failed to load categories"**
- **Solution:** Check backend is running, check network tab for API errors.

**Categories not appearing**
- **Solution:** Check browser console for errors, verify API response.

**Delete button not working**
- **Solution:** Check if category has options. Delete should be disabled.

## Success Criteria

✅ All 6 categories visible in Category Options tab  
✅ Can create new category  
✅ Can edit category (display name, order)  
✅ Cannot delete category with options  
✅ Can delete category without options  
✅ Categories appear in Dropdown Options tab  
✅ Options can be managed per category  
✅ Validation works correctly  

## Next Steps After Testing

1. ✅ Verify all tests pass
2. ✅ Document any issues found
3. ✅ Fix any bugs discovered
4. ✅ Commit changes to git
5. ✅ Deploy to Azure (if all tests pass)

