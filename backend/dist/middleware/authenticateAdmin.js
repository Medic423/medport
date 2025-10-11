"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateToken = exports.authenticateAdmin = void 0;
const authService_1 = require("../services/authService");
const authenticateAdmin = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        let token;
        console.log('TCC_DEBUG: authenticateAdmin - authHeader:', authHeader);
        console.log('TCC_DEBUG: authenticateAdmin - cookies:', req.cookies);
        if (authHeader && authHeader.startsWith('Bearer ')) {
            token = authHeader.substring(7);
            console.log('TCC_DEBUG: authenticateAdmin - token from header:', token ? token.substring(0, 20) + '...' : 'none');
        }
        else if (req.cookies && req.cookies.tcc_token) {
            token = req.cookies.tcc_token;
            console.log('TCC_DEBUG: authenticateAdmin - token from cookie:', token ? token.substring(0, 20) + '...' : 'none');
        }
        if (!token) {
            console.log('TCC_DEBUG: authenticateAdmin - no token found');
            return res.status(401).json({
                success: false,
                error: 'Access token required'
            });
        }
        const user = await authService_1.authService.verifyToken(token);
        if (!user) {
            return res.status(401).json({
                success: false,
                error: 'Invalid or expired token'
            });
        }
        req.user = user;
        next();
    }
    catch (error) {
        console.error('Authentication error:', error);
        return res.status(401).json({
            success: false,
            error: 'Authentication failed'
        });
    }
};
exports.authenticateAdmin = authenticateAdmin;
// Alias for EMS users
exports.authenticateToken = exports.authenticateAdmin;
//# sourceMappingURL=authenticateAdmin.js.map