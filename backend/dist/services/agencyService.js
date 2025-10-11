"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.agencyService = exports.AgencyService = void 0;
const databaseManager_1 = require("./databaseManager");
class AgencyService {
    async createAgency(data) {
        const prisma = databaseManager_1.databaseManager.getEMSDB();
        return await prisma.eMSAgency.create({
            data: {
                name: data.name,
                contactName: data.contactName,
                phone: data.phone,
                email: data.email,
                address: data.address,
                city: data.city,
                state: data.state,
                zipCode: data.zipCode,
                serviceArea: data.serviceArea || [],
                operatingHours: data.operatingHours,
                capabilities: data.capabilities,
                pricingStructure: data.pricingStructure,
                status: data.status ?? 'ACTIVE',
                isActive: data.isActive ?? true,
            }
        });
    }
    async getAgencies(filters = {}) {
        const prisma = databaseManager_1.databaseManager.getEMSDB();
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
            where.state = { contains: whereFilters.state, mode: 'insensitive' };
        }
        if (whereFilters.capabilities && whereFilters.capabilities.length > 0) {
            where.capabilities = { hasSome: whereFilters.capabilities };
        }
        if (whereFilters.isActive !== undefined) {
            where.isActive = whereFilters.isActive;
        }
        const [agencies, total] = await Promise.all([
            prisma.eMSAgency.findMany({
                where,
                orderBy: { name: 'asc' },
                skip,
                take: limit,
            }),
            prisma.eMSAgency.count({ where })
        ]);
        return {
            agencies,
            total,
            page,
            totalPages: Math.ceil(total / limit)
        };
    }
    async getAgencyById(id) {
        const prisma = databaseManager_1.databaseManager.getEMSDB();
        return await prisma.eMSAgency.findUnique({
            where: { id },
        });
    }
    async updateAgency(id, data) {
        const prisma = databaseManager_1.databaseManager.getEMSDB();
        return await prisma.eMSAgency.update({
            where: { id },
            data: {
                name: data.name,
                contactName: data.contactName,
                phone: data.phone,
                email: data.email,
                address: data.address,
                city: data.city,
                state: data.state,
                zipCode: data.zipCode,
                serviceArea: data.serviceArea || [],
                operatingHours: data.operatingHours,
                capabilities: data.capabilities,
                pricingStructure: data.pricingStructure,
                status: data.status ?? 'ACTIVE',
                isActive: data.isActive,
                updatedAt: new Date()
            },
        });
    }
    async deleteAgency(id) {
        const prisma = databaseManager_1.databaseManager.getEMSDB();
        await prisma.eMSAgency.delete({
            where: { id }
        });
    }
    async searchAgencies(query) {
        const prisma = databaseManager_1.databaseManager.getEMSDB();
        return await prisma.eMSAgency.findMany({
            where: {
                OR: [
                    { name: { contains: query, mode: 'insensitive' } },
                    { contactName: { contains: query, mode: 'insensitive' } },
                    { city: { contains: query, mode: 'insensitive' } }
                ],
                isActive: true
            },
            take: 10,
            orderBy: { name: 'asc' }
        });
    }
}
exports.AgencyService = AgencyService;
exports.agencyService = new AgencyService();
exports.default = exports.agencyService;
//# sourceMappingURL=agencyService.js.map