import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { databaseManager } from '../services/databaseManager';

const router = Router();

// Helper function to generate JWT token
const generateToken = (user: any, userType: string) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      userType: userType,
      role: userType // Maintain backward compatibility
    },
    process.env.JWT_SECRET || 'fallback-secret',
    { expiresIn: '24h' }
  );
};

// Transport Center Login - maps to COORDINATOR role
router.post('/center-login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // Find user with coordinator role (maps to center)
    const centerDB = databaseManager.getCenterDB();
    const user = await centerDB.user.findFirst({
      where: {
        email: email,
        role: 'COORDINATOR'
      }
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Generate token
    const token = generateToken(user, 'center');

    res.json({
      success: true,
      message: 'Login successful',
      token: token,
      user: {
        id: user.id,
        email: user.email,
        userType: 'center'
      }
    });
  } catch (error) {
    console.error('Center login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Hospital Login - maps to ADMIN role
router.post('/hospital-login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // Find user with admin role (maps to hospital)
    const centerDB = databaseManager.getCenterDB();
    const user = await centerDB.user.findFirst({
      where: {
        email: email,
        role: 'ADMIN'
      }
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Generate token
    const token = generateToken(user, 'hospital');

    res.json({
      success: true,
      message: 'Login successful',
      token: token,
      user: {
        id: user.id,
        email: user.email,
        userType: 'hospital'
      }
    });
  } catch (error) {
    console.error('Hospital login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// EMS Login - maps to TRANSPORT_AGENCY role
router.post('/ems-login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // Find user with transport agency role (maps to ems)
    const centerDB = databaseManager.getCenterDB();
    const user = await centerDB.user.findFirst({
      where: {
        email: email,
        role: 'TRANSPORT_AGENCY'
      }
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Generate token
    const token = generateToken(user, 'ems');

    res.json({
      success: true,
      message: 'Login successful',
      token: token,
      user: {
        id: user.id,
        email: user.email,
        userType: 'ems'
      }
    });
  } catch (error) {
    console.error('EMS login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

export default router;
