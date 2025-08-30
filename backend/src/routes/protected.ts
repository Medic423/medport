import { Router, Request, Response } from 'express';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Example protected route that requires authentication
router.get('/dashboard', authenticateToken, (req: any, res: Response) => {
  res.json({
    message: 'Welcome to your dashboard',
    user: req.user,
    timestamp: new Date().toISOString()
  });
});

// Route that requires specific roles - simplified to use user type
router.get('/admin', authenticateToken, (req: any, res: Response) => {
  res.json({
    message: 'Admin access granted',
    user: req.user,
    timestamp: new Date().toISOString()
  });
});

// Route for medical staff - simplified to use user type
router.get('/medical', authenticateToken, (req: any, res: Response) => {
  res.json({
    message: 'Medical staff access granted',
    user: req.user,
    timestamp: new Date().toISOString()
  });
});

export default router;
