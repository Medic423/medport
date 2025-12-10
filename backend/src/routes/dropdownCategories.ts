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

// Create new category
router.post('/', authenticateAdmin, async (req: AuthenticatedRequest, res) => {
  try {
    const { slug, displayName, displayOrder } = req.body;

    // Validation
    if (!slug || !displayName) {
      return res.status(400).json({
        success: false,
        error: 'Slug and displayName are required'
      });
    }

    // Validate slug format
    if (!isValidSlug(slug)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid slug format. Slug must be lowercase, contain only letters, numbers, and hyphens, and start/end with alphanumeric characters.'
      });
    }

    const prisma = databaseManager.getPrismaClient();

    // Check if slug already exists
    const existingCategory = await prisma.dropdownCategory.findUnique({
      where: { slug }
    });

    if (existingCategory) {
      return res.status(400).json({
        success: false,
        error: 'Category with this slug already exists'
      });
    }

    // Get max displayOrder if not provided
    let order = displayOrder;
    if (order === undefined || order === null) {
      const maxOrder = await prisma.dropdownCategory.findFirst({
        orderBy: { displayOrder: 'desc' },
        select: { displayOrder: true }
      });
      order = (maxOrder?.displayOrder || 0) + 1;
    }

    const newCategory = await prisma.dropdownCategory.create({
      data: {
        slug,
        displayName,
        displayOrder: order,
        isActive: true
      }
    });

    res.json({
      success: true,
      data: newCategory,
      message: 'Category created successfully'
    });
  } catch (error: any) {
    console.error('TCC_DEBUG: Create category error:', error);
    
    // Handle unique constraint violation
    if (error.code === 'P2002') {
      return res.status(400).json({
        success: false,
        error: 'Category with this slug already exists'
      });
    }

    res.status(500).json({
      success: false,
      error: 'Failed to create category'
    });
  }
});

// Update category
router.put('/:id', authenticateAdmin, async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    const { displayName, displayOrder, isActive } = req.body;

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

    // Prevent deactivating category with active options
    if (isActive === false && existingCategory._count.options > 0) {
      return res.status(400).json({
        success: false,
        error: `Cannot deactivate category with ${existingCategory._count.options} active option(s). Please remove or deactivate all options first.`
      });
    }

    // Build update data
    const updateData: any = {};
    if (displayName !== undefined) updateData.displayName = displayName;
    if (displayOrder !== undefined) updateData.displayOrder = displayOrder;
    if (isActive !== undefined) updateData.isActive = isActive;

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

