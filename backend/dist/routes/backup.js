"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const client_1 = require("@prisma/client");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const authenticateAdmin_1 = require("../middleware/authenticateAdmin");
const router = express_1.default.Router();
const prisma = new client_1.PrismaClient();
// Get backup history
router.get('/history', authenticateAdmin_1.authenticateAdmin, async (req, res) => {
    try {
        const backupDir = path_1.default.join(process.cwd(), 'database-backups');
        // Ensure backup directory exists
        if (!fs_1.default.existsSync(backupDir)) {
            fs_1.default.mkdirSync(backupDir, { recursive: true });
        }
        // Read backup files
        const files = fs_1.default.readdirSync(backupDir)
            .filter(file => file.endsWith('.json'))
            .map(file => {
            const filePath = path_1.default.join(backupDir, file);
            const stats = fs_1.default.statSync(filePath);
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
    }
    catch (error) {
        console.error('Error getting backup history:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get backup history'
        });
    }
});
// Create full database backup
router.post('/create', authenticateAdmin_1.authenticateAdmin, async (req, res) => {
    try {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `tcc-database-backup-${timestamp}.json`;
        const backupDir = path_1.default.join(process.cwd(), 'database-backups');
        // Ensure backup directory exists
        if (!fs_1.default.existsSync(backupDir)) {
            fs_1.default.mkdirSync(backupDir, { recursive: true });
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
            const trips = await prisma.$queryRaw `SELECT * FROM trips`;
            const hospitals = await prisma.$queryRaw `SELECT * FROM hospitals`;
            const facilities = await prisma.$queryRaw `SELECT * FROM facilities`;
            const centerUsers = await prisma.$queryRaw `SELECT * FROM center_users`;
            const healthcareUsers = await prisma.$queryRaw `SELECT * FROM healthcare_users`;
            const emsUsers = await prisma.$queryRaw `SELECT * FROM ems_users`;
            const agencies = await prisma.$queryRaw `SELECT * FROM agencies`;
            const units = await prisma.$queryRaw `SELECT * FROM units`;
            const healthcareLocations = await prisma.$queryRaw `SELECT * FROM healthcare_locations`;
            const pickupLocations = await prisma.$queryRaw `SELECT * FROM pickup_locations`;
            // Optional tables (may not exist in all environments)
            let systemAnalytics = [];
            let dropdownOptions = [];
            let agencyResponses = [];
            let notifications = [];
            try {
                systemAnalytics = await prisma.$queryRaw `SELECT * FROM system_analytics`;
            }
            catch (error) {
                console.log('TCC_DEBUG: system_analytics table does not exist, skipping...');
            }
            try {
                dropdownOptions = await prisma.$queryRaw `SELECT * FROM dropdown_options`;
            }
            catch (error) {
                console.log('TCC_DEBUG: dropdown_options table does not exist, skipping...');
            }
            try {
                agencyResponses = await prisma.$queryRaw `SELECT * FROM agency_responses`;
            }
            catch (error) {
                console.log('TCC_DEBUG: agency_responses table does not exist, skipping...');
            }
            try {
                notifications = await prisma.$queryRaw `SELECT * FROM notification_logs`;
            }
            catch (error) {
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
        }
        catch (error) {
            console.error('Error exporting consolidated database data:', error);
        }
        // Write backup file
        const filePath = path_1.default.join(backupDir, filename);
        fs_1.default.writeFileSync(filePath, JSON.stringify(backupData, null, 2));
        // Copy to external drive if available
        const externalDrivePath = '/Volumes/Acasis/tcc-database-backups';
        if (fs_1.default.existsSync('/Volumes/Acasis')) {
            try {
                if (!fs_1.default.existsSync(externalDrivePath)) {
                    fs_1.default.mkdirSync(externalDrivePath, { recursive: true });
                }
                const externalFilePath = path_1.default.join(externalDrivePath, filename);
                fs_1.default.copyFileSync(filePath, externalFilePath);
                console.log(`Database backup copied to external drive: ${externalFilePath}`);
            }
            catch (error) {
                console.error('Error copying to external drive:', error);
            }
        }
        res.json({
            success: true,
            data: {
                filename,
                size: fs_1.default.statSync(filePath).size,
                created: new Date(),
                message: 'Backup created successfully'
            }
        });
    }
    catch (error) {
        console.error('Error creating backup:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create backup'
        });
    }
});
// Download backup file
router.get('/download/:filename', authenticateAdmin_1.authenticateAdmin, async (req, res) => {
    try {
        const { filename } = req.params;
        const backupDir = path_1.default.join(process.cwd(), 'database-backups');
        const filePath = path_1.default.join(backupDir, filename);
        if (!fs_1.default.existsSync(filePath)) {
            return res.status(404).json({
                success: false,
                error: 'Backup file not found'
            });
        }
        res.download(filePath, filename);
    }
    catch (error) {
        console.error('Error downloading backup:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to download backup'
        });
    }
});
// Delete backup file
router.delete('/:filename', authenticateAdmin_1.authenticateAdmin, async (req, res) => {
    try {
        const { filename } = req.params;
        const backupDir = path_1.default.join(process.cwd(), 'database-backups');
        const filePath = path_1.default.join(backupDir, filename);
        if (!fs_1.default.existsSync(filePath)) {
            return res.status(404).json({
                success: false,
                error: 'Backup file not found'
            });
        }
        fs_1.default.unlinkSync(filePath);
        // Also delete from external drive if it exists
        const externalDrivePath = '/Volumes/Acasis/tcc-database-backups';
        const externalFilePath = path_1.default.join(externalDrivePath, filename);
        if (fs_1.default.existsSync(externalFilePath)) {
            try {
                fs_1.default.unlinkSync(externalFilePath);
            }
            catch (error) {
                console.error('Error deleting from external drive:', error);
            }
        }
        res.json({
            success: true,
            message: 'Backup file deleted successfully'
        });
    }
    catch (error) {
        console.error('Error deleting backup:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to delete backup'
        });
    }
});
exports.default = router;
//# sourceMappingURL=backup.js.map