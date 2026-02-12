import express from 'express';
import { databaseManager } from '../services/databaseManager';
import { authenticateAdmin } from '../middleware/authenticateAdmin';
import { AuthenticatedRequest } from '../middleware/authenticateAdmin';

const router = express.Router();

// Helper function to validate slug format
function isValidSlug(slug: string): boolean {
  // Slug must be lowercase, contain only letters, numbers, and hyphens
  // Must start and end with alphanumeric character
  const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  return slugRegex.test(slug);
}

// Get all categories (including inactive for management purposes)
router.get('/', authenticateAdmin, async (req: AuthenticatedRequest, res) => {
  try {
    const prisma = databaseManager.getPrismaClient();
    const categories = await prisma.dropdownCategory.findMany({
      orderBy: { displayOrder: 'asc' },
      include: {
        _count: {
          select: { options: { where: { isActive: true } } }
        }
      }
    });

    res.json({
      success: true,
      data: categories.map(cat => ({
        id: cat.id,
        slug: cat.slug,
        displayName: cat.displayName,
        displayOrder: cat.displayOrder,
        isActive: cat.isActive,
        createdAt: cat.createdAt,
        updatedAt: cat.updatedAt,
        optionCount: cat._count.options
      })),
      message: 'Categories retrieved successfully'
    });
  } catch (error) {
    console.error('TCC_DEBUG: Get categories error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get categories'
    });
  }
});

// Get single category by ID
router.get('/:id', authenticateAdmin, async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    const prisma = databaseManager.getPrismaClient();
    
    const category = await prisma.dropdownCategory.findUnique({
      where: { id },
      include: {
        _count: {
          select: { options: { where: { isActive: true } } }
        }
      }
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        error: 'Category not found'
      });
    }

    res.json({
      success: true,
      data: {
        id: category.id,
        slug: category.slug,
        displayName: category.displayName,
        displayOrder: category.displayOrder,
        isActive: category.isActive,
        createdAt: category.createdAt,
        updatedAt: category.updatedAt,
        optionCount: category._count.options
      },
      message: 'Category retrieved successfully'
    });
  } catch (error) {
    console.error('TCC_DEBUG: Get category error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get category'
    });
  }
});

// Create new category - DISABLED
// Categories are locked to exactly 7 fixed slugs (dropdown-1 through dropdown-7)
// Users cannot add new categories, only edit display names and order
router.post('/', authenticateAdmin, async (req: AuthenticatedRequest, res) => {
  return res.status(403).json({
    success: false,
    error: 'Category creation is disabled. Categories are locked to exactly 7 fixed slugs (dropdown-1 through dropdown-7). You can only edit display names and display order.'
  });
});

// Update category
// Categories are locked - only displayName, displayOrder, and isActive can be updated
// Slug cannot be changed (categories are fixed to dropdown-1 through dropdown-7)
router.put('/:id', authenticateAdmin, async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    const { displayName, displayOrder, isActive, slug } = req.body;

    const prisma = databaseManager.getPrismaClient();

    // Check if category exists
    const existingCategory = await prisma.dropdownCategory.findUnique({
      where: { id },
      include: {
        _count: {
          select: { options: { where: { isActive: true } } }
        }
      }
    });

    if (!existingCategory) {
      return res.status(404).json({
        success: false,
        error: 'Category not found'
      });
    }

    // Prevent slug changes - slugs are locked to dropdown-1 through dropdown-7
    if (slug !== undefined && slug !== existingCategory.slug) {
      return res.status(400).json({
        success: false,
        error: 'Cannot change category slug. Categories are locked to fixed slugs (dropdown-1 through dropdown-7). Only display name and order can be modified.'
      });
    }

    // Prevent deactivating category with active options
    if (isActive === false && existingCategory._count.options > 0) {
      return res.status(400).json({
        success: false,
        error: `Cannot deactivate category with ${existingCategory._count.options} active option(s). Please remove or deactivate all options first.`
      });
    }

    // Build update data - only allow displayName, displayOrder, and isActive
    const updateData: any = {};
    if (displayName !== undefined) updateData.displayName = displayName;
    if (displayOrder !== undefined) updateData.displayOrder = displayOrder;
    if (isActive !== undefined) updateData.isActive = isActive;
    // Explicitly ignore slug if provided

    const updatedCategory = await prisma.dropdownCategory.update({
      where: { id },
      data: updateData
    });

    res.json({
      success: true,
      data: updatedCategory,
      message: 'Category updated successfully'
    });
  } catch (error) {
    console.error('TCC_DEBUG: Update category error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update category'
    });
  }
});

// Delete category (soft delete - sets isActive to false)
router.delete('/:id', authenticateAdmin, async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    const prisma = databaseManager.getPrismaClient();

    // Check if category exists and get option count
    const category = await prisma.dropdownCategory.findUnique({
      where: { id },
      include: {
        _count: {
          select: { options: { where: { isActive: true } } }
        }
      }
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        error: 'Category not found'
      });
    }

    // Prevent deletion if category has active options
    if (category._count.options > 0) {
      return res.status(400).json({
        success: false,
        error: `Cannot delete category with ${category._count.options} active option(s). Please remove or deactivate all options first.`
      });
    }

    // Soft delete (set isActive to false)
    await prisma.dropdownCategory.update({
      where: { id },
      data: { isActive: false }
    });

    res.json({
      success: true,
      message: 'Category deleted successfully'
    });
  } catch (error) {
    console.error('TCC_DEBUG: Delete category error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete category'
    });
  }
});

export default router;

