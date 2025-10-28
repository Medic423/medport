"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hospitalService = exports.HospitalService = void 0;
const databaseManager_1 = require("./databaseManager");
class HospitalService {
    async createHospital(data) {
        const centerDB = databaseManager_1.databaseManager.getPrismaClient();
        return await centerDB.hospital.create({
            data: {
                name: data.name,
                address: data.address,
                city: data.city,
                state: data.state,
                zipCode: data.zipCode,
                phone: data.phone,
                email: data.email,
                type: data.type,
                capabilities: data.capabilities,
                region: data.region,
                coordinates: data.coordinates,
                latitude: data.latitude,
                longitude: data.longitude,
                operatingHours: data.operatingHours,
                isActive: data.isActive ?? true,
                requiresReview: data.requiresReview ?? false
            }
        });
    }
    async getHospitals(filters = {}) {
        const centerDB = databaseManager_1.databaseManager.getPrismaClient();
        const { page = 1, limit = 50, ...whereFilters } = filters;
        const skip = (page - 1) * limit;
        const where = {};
        if (whereFilters.name) {
            where.name = { contains: whereFilters.name, mode: 'insensitive' };
        }
        if (whereFilters.city) {
            where.city = { contains: whereFilters.city, mode: 'insensitive' };
        }
        if (whereFilters.state) {
            where.state = whereFilters.state;
        }
        if (whereFilters.type) {
            where.type = whereFilters.type;
        }
        if (whereFilters.region) {
            where.region = whereFilters.region;
        }
        if (whereFilters.isActive !== undefined) {
            where.isActive = whereFilters.isActive;
        }
        const [hospitals, total] = await Promise.all([
            centerDB.hospital.findMany({
                where,
                orderBy: { name: 'asc' },
                skip,
                take: limit
            }),
            centerDB.hospital.count({ where })
        ]);
        return {
            hospitals,
            total,
            page,
            totalPages: Math.ceil(total / limit)
        };
    }
    async getHospitalById(id) {
        const centerDB = databaseManager_1.databaseManager.getPrismaClient();
        return await centerDB.hospital.findUnique({
            where: { id }
        });
    }
    async updateHospital(id, data) {
        const centerDB = databaseManager_1.databaseManager.getPrismaClient();
        return await centerDB.hospital.update({
            where: { id },
            data: {
                ...data,
                updatedAt: new Date()
            }
        });
    }
    async deleteHospital(id) {
        const centerDB = databaseManager_1.databaseManager.getPrismaClient();
        await centerDB.hospital.delete({
            where: { id }
        });
    }
    async searchHospitals(query) {
        const centerDB = databaseManager_1.databaseManager.getPrismaClient();
        return await centerDB.hospital.findMany({
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
    async approveHospital(id, approvedBy) {
        const centerDB = databaseManager_1.databaseManager.getPrismaClient();
        return await centerDB.hospital.update({
            where: { id },
            data: {
                isActive: true,
                requiresReview: false,
                approvedAt: new Date(),
                approvedBy: approvedBy,
                updatedAt: new Date()
            }
        });
    }
    async rejectHospital(id, approvedBy) {
        const centerDB = databaseManager_1.databaseManager.getPrismaClient();
        return await centerDB.hospital.update({
            where: { id },
            data: {
                isActive: false,
                requiresReview: false,
                approvedAt: new Date(),
                approvedBy: approvedBy,
                updatedAt: new Date()
            }
        });
    }
}
exports.HospitalService = HospitalService;
exports.hospitalService = new HospitalService();
exports.default = exports.hospitalService;
//# sourceMappingURL=hospitalService.js.map