"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.facilityService = exports.FacilityService = void 0;
const databaseManager_1 = require("./databaseManager");
class FacilityService {
    /**
     * Calculate distance between two coordinates using Haversine formula
     * Returns distance in miles
     */
    calculateDistance(lat1, lon1, lat2, lon2) {
        const R = 3959; // Earth's radius in miles
        const dLat = this.toRadians(lat2 - lat1);
        const dLon = this.toRadians(lon2 - lon1);
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
                Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }
    toRadians(degrees) {
        return degrees * (Math.PI / 180);
    }
    async createFacility(data) {
        const prisma = databaseManager_1.databaseManager.getPrismaClient();
        return await prisma.hospital.create({
            data: {
                name: data.name,
                type: data.type,
                address: data.address,
                city: data.city,
                state: data.state,
                zipCode: data.zipCode,
                phone: data.phone,
                email: data.email,
                region: data.state, // Use state as region for now
                isActive: data.isActive ?? true
            }
        });
    }
    async getFacilities(filters = {}) {
        const prisma = databaseManager_1.databaseManager.getPrismaClient();
        const { page = 1, limit = 50, ...whereFilters } = filters;
        const skip = (page - 1) * limit;
        const where = {};
        if (whereFilters.name) {
            where.name = { contains: whereFilters.name, mode: 'insensitive' };
        }
        if (whereFilters.type) {
            where.type = whereFilters.type;
        }
        if (whereFilters.city) {
            where.city = { contains: whereFilters.city, mode: 'insensitive' };
        }
        if (whereFilters.state) {
            where.state = whereFilters.state;
        }
        if (whereFilters.isActive !== undefined) {
            where.isActive = whereFilters.isActive;
        }
        // Phase A: Geographic filtering
        let facilities;
        let total;
        if (whereFilters.originLat && whereFilters.originLng && whereFilters.radius) {
            // Use geographic filtering with distance calculation
            console.log('PHASE_A: Using geographic filtering', {
                originLat: whereFilters.originLat,
                originLng: whereFilters.originLng,
                radius: whereFilters.radius
            });
            // Get all facilities first, then filter by distance in JavaScript
            // Note: For production, consider using PostGIS or similar for better performance
            const allFacilities = await prisma.facility.findMany({
                where: {
                    ...where,
                    latitude: { not: null },
                    longitude: { not: null }
                },
                orderBy: { name: 'asc' }
            });
            // Filter by distance
            const facilitiesInRadius = allFacilities.filter(facility => {
                if (!facility.latitude || !facility.longitude)
                    return false;
                const distance = this.calculateDistance(whereFilters.originLat, whereFilters.originLng, facility.latitude, facility.longitude);
                return distance <= whereFilters.radius;
            });
            // Sort by distance
            facilitiesInRadius.sort((a, b) => {
                const distanceA = this.calculateDistance(whereFilters.originLat, whereFilters.originLng, a.latitude, a.longitude);
                const distanceB = this.calculateDistance(whereFilters.originLat, whereFilters.originLng, b.latitude, b.longitude);
                return distanceA - distanceB;
            });
            total = facilitiesInRadius.length;
            facilities = facilitiesInRadius.slice(skip, skip + limit);
        }
        else {
            // Standard filtering without geographic constraints
            [facilities, total] = await Promise.all([
                prisma.facility.findMany({
                    where,
                    orderBy: { name: 'asc' },
                    skip,
                    take: limit
                }),
                prisma.facility.count({ where })
            ]);
        }
        return {
            facilities,
            total,
            page,
            totalPages: Math.ceil(total / limit)
        };
    }
    async getFacilityById(id) {
        const prisma = databaseManager_1.databaseManager.getPrismaClient();
        return await prisma.facility.findUnique({
            where: { id }
        });
    }
    async updateFacility(id, data) {
        const prisma = databaseManager_1.databaseManager.getPrismaClient();
        return await prisma.facility.update({
            where: { id },
            data: {
                ...data,
                updatedAt: new Date()
            }
        });
    }
    async deleteFacility(id) {
        const prisma = databaseManager_1.databaseManager.getPrismaClient();
        await prisma.facility.delete({
            where: { id }
        });
    }
    async searchFacilities(query) {
        const prisma = databaseManager_1.databaseManager.getPrismaClient();
        return await prisma.facility.findMany({
            where: {
                OR: [
                    { name: { contains: query, mode: 'insensitive' } },
                    { city: { contains: query, mode: 'insensitive' } },
                    { state: { contains: query, mode: 'insensitive' } }
                ],
                isActive: true
            },
            take: 10,
            orderBy: { name: 'asc' }
        });
    }
}
exports.FacilityService = FacilityService;
exports.facilityService = new FacilityService();
exports.default = exports.facilityService;
//# sourceMappingURL=facilityService.js.map