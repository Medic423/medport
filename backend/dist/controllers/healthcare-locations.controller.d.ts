import { Request, Response } from 'express';
export declare class HealthcareLocationsController {
    /**
     * POST /api/healthcare/locations
     * Create a new location
     */
    createLocation(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    /**
     * GET /api/healthcare/locations
     * Get all locations for the logged-in user
     */
    getLocations(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    /**
     * GET /api/healthcare/locations/active
     * Get only active locations for dropdowns
     */
    getActiveLocations(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    /**
     * GET /api/healthcare/locations/statistics
     * Get location statistics for analytics
     */
    getLocationStatistics(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    /**
     * GET /api/healthcare/locations/:id
     * Get a specific location
     */
    getLocationById(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    /**
     * PUT /api/healthcare/locations/:id
     * Update a location
     */
    updateLocation(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    /**
     * DELETE /api/healthcare/locations/:id
     * Delete a location
     */
    deleteLocation(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    /**
     * PUT /api/healthcare/locations/:id/set-primary
     * Set a location as primary
     */
    setPrimaryLocation(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
}
export declare const healthcareLocationsController: HealthcareLocationsController;
//# sourceMappingURL=healthcare-locations.controller.d.ts.map