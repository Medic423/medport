import QRCode from 'qrcode';
import { PrismaClient, TransportRequest, Facility, User } from '@prisma/client';

const prisma = new PrismaClient();

export interface QRCodeData {
  type: 'TRANSPORT_REQUEST' | 'PATIENT_ID' | 'ROUTE_INFO' | 'FACILITY_INFO';
  id: string;
  timestamp: string;
  data: any;
  metadata?: {
    version: string;
    generatedBy: string;
    expiresAt?: string;
  };
}

export interface TransportRequestQRData {
  requestId: string;
  patientId: string;
  originFacility: {
    id: string;
    name: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
  };
  destinationFacility: {
    id: string;
    name: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
  };
  transportLevel: string;
  priority: string;
  status: string;
  specialRequirements?: string;
  requestTimestamp: string;
  assignedAgency?: {
    id: string;
    name: string;
    contactName?: string;
    phone?: string;
  };
  assignedUnit?: {
    id: string;
    unitNumber: string;
    type: string;
  };
}

export class QRCodeService {
  private readonly VERSION = '1.0';
  private readonly QR_CODE_OPTIONS = {
    errorCorrectionLevel: 'M' as const,
    type: 'image/png' as const,
    quality: 0.92,
    margin: 1,
    color: {
      dark: '#000000',
      light: '#FFFFFF'
    }
  };

  /**
   * Generate QR code for a transport request
   */
  async generateTransportRequestQR(requestId: string): Promise<{ qrCodeDataUrl: string; qrCodeData: QRCodeData }> {
    try {
      // Fetch transport request with full details
      const transportRequest = await prisma.transportRequest.findUnique({
        where: { id: requestId },
        include: {
          originFacility: true,
          destinationFacility: true,
          assignedAgency: true,
          assignedUnit: true,
          createdBy: true
        }
      });

      if (!transportRequest) {
        throw new Error(`Transport request ${requestId} not found`);
      }

      // Prepare QR code data
      const qrCodeData: QRCodeData = {
        type: 'TRANSPORT_REQUEST',
        id: requestId,
        timestamp: new Date().toISOString(),
        data: this.prepareTransportRequestData(transportRequest),
        metadata: {
          version: this.VERSION,
          generatedBy: transportRequest.createdBy.email,
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
        }
      };

      // Generate QR code as data URL
      const qrCodeDataUrl = await QRCode.toDataURL(
        JSON.stringify(qrCodeData),
        this.QR_CODE_OPTIONS
      );

      return { qrCodeDataUrl, qrCodeData };
    } catch (error) {
      console.error('[MedPort:QRCode] Error generating transport request QR code:', error);
      throw new Error(`Failed to generate QR code: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Generate QR code for patient identification
   */
  async generatePatientQR(patientId: string): Promise<{ qrCodeDataUrl: string; qrCodeData: QRCodeData }> {
    try {
      // Find transport requests for this patient
      const transportRequests = await prisma.transportRequest.findMany({
        where: { patientId },
        include: {
          originFacility: true,
          destinationFacility: true,
          assignedAgency: true,
          assignedUnit: true
        },
        orderBy: { requestTimestamp: 'desc' },
        take: 1
      });

      if (transportRequests.length === 0) {
        throw new Error(`No transport requests found for patient ${patientId}`);
      }

      const latestRequest = transportRequests[0];

      const qrCodeData: QRCodeData = {
        type: 'PATIENT_ID',
        id: patientId,
        timestamp: new Date().toISOString(),
        data: {
          patientId,
          latestTransportRequest: this.prepareTransportRequestData(latestRequest),
          totalRequests: transportRequests.length
        },
        metadata: {
          version: this.VERSION,
          generatedBy: 'MedPort System',
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
        }
      };

      const qrCodeDataUrl = await QRCode.toDataURL(
        JSON.stringify(qrCodeData),
        this.QR_CODE_OPTIONS
      );

      return { qrCodeDataUrl, qrCodeData };
    } catch (error) {
      console.error('[MedPort:QRCode] Error generating patient QR code:', error);
      throw new Error(`Failed to generate patient QR code: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Generate QR code for route information
   */
  async generateRouteQR(routeId: string): Promise<{ qrCodeDataUrl: string; qrCodeData: QRCodeData }> {
    try {
      // This would integrate with the route optimization system
      // For now, we'll create a placeholder structure
      const qrCodeData: QRCodeData = {
        type: 'ROUTE_INFO',
        id: routeId,
        timestamp: new Date().toISOString(),
        data: {
          routeId,
          status: 'PLANNED',
          estimatedDuration: '45 minutes',
          totalDistance: '12.5 miles',
          waypoints: []
        },
        metadata: {
          version: this.VERSION,
          generatedBy: 'MedPort Route System',
          expiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString() // 2 hours
        }
      };

      const qrCodeDataUrl = await QRCode.toDataURL(
        JSON.stringify(qrCodeData),
        this.QR_CODE_OPTIONS
      );

      return { qrCodeDataUrl, qrCodeData };
    } catch (error) {
      console.error('[MedPort:QRCode] Error generating route QR code:', error);
      throw new Error(`Failed to generate route QR code: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Generate QR code for facility information
   */
  async generateFacilityQR(facilityId: string): Promise<{ qrCodeDataUrl: string; qrCodeData: QRCodeData }> {
    try {
      const facility = await prisma.facility.findUnique({
        where: { id: facilityId }
      });

      if (!facility) {
        throw new Error(`Facility ${facilityId} not found`);
      }

      const qrCodeData: QRCodeData = {
        type: 'FACILITY_INFO',
        id: facilityId,
        timestamp: new Date().toISOString(),
        data: {
          facilityId: facility.id,
          name: facility.name,
          type: facility.type,
          address: facility.address,
          city: facility.city,
          state: facility.state,
          zipCode: facility.zipCode,
          phone: facility.phone,
          email: facility.email,
          coordinates: facility.coordinates,
          capabilities: facility.capabilities
        },
        metadata: {
          version: this.VERSION,
          generatedBy: 'MedPort System',
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days
        }
      };

      const qrCodeDataUrl = await QRCode.toDataURL(
        JSON.stringify(qrCodeData),
        this.QR_CODE_OPTIONS
      );

      return { qrCodeDataUrl, qrCodeData };
    } catch (error) {
      console.error('[MedPort:QRCode] Error generating facility QR code:', error);
      throw new Error(`Failed to generate facility QR code: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Validate and decode QR code data
   */
  validateQRCode(qrCodeString: string): QRCodeData {
    try {
      const qrCodeData: QRCodeData = JSON.parse(qrCodeString);
      
      // Basic validation
      if (!qrCodeData.type || !qrCodeData.id || !qrCodeData.timestamp) {
        throw new Error('Invalid QR code data structure');
      }

      // Check expiration
      if (qrCodeData.metadata?.expiresAt) {
        const expirationDate = new Date(qrCodeData.metadata.expiresAt);
        if (new Date() > expirationDate) {
          throw new Error('QR code has expired');
        }
      }

      return qrCodeData;
    } catch (error) {
      console.error('[MedPort:QRCode] Error validating QR code:', error);
      throw new Error(`Invalid QR code: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Generate bulk QR codes for multiple transport requests
   */
  async generateBulkTransportRequestQRs(requestIds: string[]): Promise<Array<{ requestId: string; qrCodeDataUrl: string; qrCodeData: QRCodeData | null; error?: string }>> {
    try {
      const results = await Promise.all(
        requestIds.map(async (requestId) => {
          try {
            const result = await this.generateTransportRequestQR(requestId);
            return {
              requestId,
              qrCodeDataUrl: result.qrCodeDataUrl,
              qrCodeData: result.qrCodeData
            };
          } catch (error) {
            console.error(`[MedPort:QRCode] Error generating QR for request ${requestId}:`, error);
            return {
              requestId,
              qrCodeDataUrl: '',
              qrCodeData: null,
              error: error instanceof Error ? error.message : 'Unknown error'
            };
          }
        })
      );

      return results;
    } catch (error) {
      console.error('[MedPort:QRCode] Error generating bulk QR codes:', error);
      throw new Error(`Failed to generate bulk QR codes: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Prepare transport request data for QR code
   */
  private prepareTransportRequestData(transportRequest: any): TransportRequestQRData {
    return {
      requestId: transportRequest.id,
      patientId: transportRequest.patientId,
      originFacility: {
        id: transportRequest.originFacility.id,
        name: transportRequest.originFacility.name,
        address: transportRequest.originFacility.address,
        city: transportRequest.originFacility.city,
        state: transportRequest.originFacility.state,
        zipCode: transportRequest.originFacility.zipCode
      },
      destinationFacility: {
        id: transportRequest.destinationFacility.id,
        name: transportRequest.destinationFacility.name,
        address: transportRequest.destinationFacility.address,
        city: transportRequest.destinationFacility.city,
        state: transportRequest.destinationFacility.state,
        zipCode: transportRequest.destinationFacility.zipCode
      },
      transportLevel: transportRequest.transportLevel,
      priority: transportRequest.priority,
      status: transportRequest.status,
      specialRequirements: transportRequest.specialRequirements,
      requestTimestamp: transportRequest.requestTimestamp.toISOString(),
      assignedAgency: transportRequest.assignedAgency ? {
        id: transportRequest.assignedAgency.id,
        name: transportRequest.assignedAgency.name,
        contactName: transportRequest.assignedAgency.contactName,
        phone: transportRequest.assignedAgency.phone
      } : undefined,
      assignedUnit: transportRequest.assignedUnit ? {
        id: transportRequest.assignedUnit.id,
        unitNumber: transportRequest.assignedUnit.unitNumber,
        type: transportRequest.assignedUnit.type
      } : undefined
    };
  }
}

export default new QRCodeService();
