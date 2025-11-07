import express from 'express';
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { authenticateAdmin } from '../middleware/authenticateAdmin';

const router = express.Router();
const prisma = new PrismaClient();

// Get backup history
router.get('/history', authenticateAdmin, async (req, res) => {
  try {
    const backupDir = path.join(process.cwd(), 'database-backups');
    
    // Ensure backup directory exists
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    // Read backup files
    const files = fs.readdirSync(backupDir)
      .filter(file => file.endsWith('.json'))
      .map(file => {
        const filePath = path.join(backupDir, file);
        const stats = fs.statSync(filePath);
        return {
          filename: file,
          size: stats.size,
          created: stats.birthtime,
          modified: stats.mtime
        };
      })
      .sort((a, b) => b.created.getTime() - a.created.getTime());

    res.json({
      success: true,
      data: files
    });
  } catch (error) {
    console.error('Error getting backup history:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get backup history'
    });
  }
});

// Create full database backup
router.post('/create', authenticateAdmin, async (req, res) => {
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `tcc-database-backup-${timestamp}.json`;
    const backupDir = path.join(process.cwd(), 'database-backups');
    
    // Ensure backup directory exists
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    // Export all data from consolidated database
    const backupData = {
      timestamp: new Date().toISOString(),
      version: '2.0',
      backupType: 'full_database_export',
      description: 'Complete TCC system backup from consolidated medport_ems database',
      systemInfo: {
        nodeVersion: process.version,
        platform: process.platform,
        arch: process.arch,
        uptime: process.uptime()
      },
      database: {}
    };

    // Export consolidated medport_ems database (all tables)
    try {
      console.log('TCC_DEBUG: Exporting consolidated medport_ems database...');
      
      // Get all tables from the consolidated database
      const trips = await prisma.$queryRaw`SELECT * FROM trips` as any[];
      const hospitals = await prisma.$queryRaw`SELECT * FROM hospitals` as any[];
      const facilities = await prisma.$queryRaw`SELECT * FROM facilities` as any[];
      const centerUsers = await prisma.$queryRaw`SELECT * FROM center_users` as any[];
      const healthcareUsers = await prisma.$queryRaw`SELECT * FROM healthcare_users` as any[];
      const emsUsers = await prisma.$queryRaw`SELECT * FROM ems_users` as any[];
      const agencies = await prisma.$queryRaw`SELECT * FROM agencies` as any[];
      const units = await prisma.$queryRaw`SELECT * FROM units` as any[];
      const healthcareLocations = await prisma.$queryRaw`SELECT * FROM healthcare_locations` as any[];
      const pickupLocations = await prisma.$queryRaw`SELECT * FROM pickup_locations` as any[];
      
      // Optional tables (may not exist in all environments)
      let systemAnalytics: any[] = [];
      let dropdownOptions: any[] = [];
      let agencyResponses: any[] = [];
      let notifications: any[] = [];
      
      try {
        systemAnalytics = await prisma.$queryRaw`SELECT * FROM system_analytics` as any[];
      } catch (error) {
        console.log('TCC_DEBUG: system_analytics table does not exist, skipping...');
      }
      
      try {
        dropdownOptions = await prisma.$queryRaw`SELECT * FROM dropdown_options` as any[];
      } catch (error) {
        console.log('TCC_DEBUG: dropdown_options table does not exist, skipping...');
      }
      
      try {
        agencyResponses = await prisma.$queryRaw`SELECT * FROM agency_responses` as any[];
      } catch (error) {
        console.log('TCC_DEBUG: agency_responses table does not exist, skipping...');
      }
      
      try {
        notifications = await prisma.$queryRaw`SELECT * FROM notification_logs` as any[];
      } catch (error) {
        console.log('TCC_DEBUG: notification_logs table does not exist, skipping...');
      }
      
      backupData.database = {
        // User tables
        centerUsers,
        healthcareUsers,
        emsUsers,
        
        // Healthcare tables
        hospitals,
        facilities,
        healthcareLocations,
        pickupLocations,
        
        // EMS tables
        agencies,
        units,
        
        // Trip tables
        trips,
        agencyResponses,
        
        // System tables
        systemAnalytics,
        dropdownOptions,
        notifications
      };
      
      console.log('TCC_DEBUG: Consolidated database exported successfully');
      console.log('TCC_DEBUG: Exported counts:', {
        trips: trips.length,
        hospitals: hospitals.length,
        facilities: facilities.length,
        agencies: agencies.length,
        centerUsers: centerUsers.length,
        healthcareUsers: healthcareUsers.length,
        emsUsers: emsUsers.length,
        units: units.length,
        healthcareLocations: healthcareLocations.length
      });
    } catch (error) {
      console.error('Error exporting consolidated database data:', error);
    }


    // Write backup file
    const filePath = path.join(backupDir, filename);
    fs.writeFileSync(filePath, JSON.stringify(backupData, null, 2));

    // Copy to external drive if available
    const externalDrivePath = '/Volumes/Acasis/tcc-database-backups';
    if (fs.existsSync('/Volumes/Acasis')) {
      try {
        if (!fs.existsSync(externalDrivePath)) {
          fs.mkdirSync(externalDrivePath, { recursive: true });
        }
        const externalFilePath = path.join(externalDrivePath, filename);
        fs.copyFileSync(filePath, externalFilePath);
        console.log(`Database backup copied to external drive: ${externalFilePath}`);
      } catch (error) {
        console.error('Error copying to external drive:', error);
      }
    }

    res.json({
      success: true,
      data: {
        filename,
        size: fs.statSync(filePath).size,
        created: new Date(),
        message: 'Backup created successfully'
      }
    });
  } catch (error) {
    console.error('Error creating backup:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create backup'
    });
  }
});

// Download backup file
router.get('/download/:filename', authenticateAdmin, async (req, res) => {
  try {
    const { filename } = req.params;
    const backupDir = path.join(process.cwd(), 'database-backups');
    const filePath = path.join(backupDir, filename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        error: 'Backup file not found'
      });
    }

    res.download(filePath, filename);
  } catch (error) {
    console.error('Error downloading backup:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to download backup'
    });
  }
});

// Delete backup file
router.delete('/:filename', authenticateAdmin, async (req, res) => {
  try {
    const { filename } = req.params;
    const backupDir = path.join(process.cwd(), 'database-backups');
    const filePath = path.join(backupDir, filename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        error: 'Backup file not found'
      });
    }

    fs.unlinkSync(filePath);

    // Also delete from external drive if it exists
    const externalDrivePath = '/Volumes/Acasis/tcc-database-backups';
    const externalFilePath = path.join(externalDrivePath, filename);
    if (fs.existsSync(externalFilePath)) {
      try {
        fs.unlinkSync(externalFilePath);
      } catch (error) {
        console.error('Error deleting from external drive:', error);
      }
    }

    res.json({
      success: true,
      message: 'Backup file deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting backup:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete backup'
    });
  }
});

export default router;
