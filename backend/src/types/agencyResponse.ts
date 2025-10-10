/**
 * TypeScript interfaces for Agency Response functionality
 * Part of Phase 1C: Basic API Endpoints implementation
 */

export interface AgencyResponse {
  id: string;
  tripId: string;
  agencyId: string;
  response: 'ACCEPTED' | 'DECLINED' | 'PENDING';
  responseTimestamp: Date;
  responseNotes?: string;
  estimatedArrival?: Date;
  isSelected: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateAgencyResponseRequest {
  tripId: string;
  agencyId: string;
  response: 'ACCEPTED' | 'DECLINED';
  responseNotes?: string;
  estimatedArrival?: string; // ISO string
}

export interface UpdateAgencyResponseRequest {
  response?: 'ACCEPTED' | 'DECLINED';
  responseNotes?: string;
  estimatedArrival?: string; // ISO string
}

export interface AgencyResponseWithDetails extends AgencyResponse {
  agency: {
    id: string;
    name: string;
    contactName: string;
    phone: string;
    email: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    capabilities: string[];
    serviceArea: string[];
  };
}

export interface TripWithResponses {
  id: string;
  tripNumber: string;
  patientId: string;
  fromLocation: string;
  toLocation: string;
  scheduledTime: Date;
  transportLevel: string;
  urgencyLevel: string;
  status: string;
  priority: string;
  responseDeadline?: Date;
  maxResponses: number;
  responseStatus: 'PENDING' | 'RESPONSES_RECEIVED' | 'AGENCY_SELECTED';
  selectionMode: 'BROADCAST' | 'SPECIFIC_AGENCIES';
  agencyResponses: AgencyResponseWithDetails[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ResponseSummary {
  totalResponses: number;
  acceptedResponses: number;
  declinedResponses: number;
  pendingResponses: number;
  selectedAgency?: {
    id: string;
    name: string;
    responseTime: number; // in minutes
  };
}

export interface SelectAgencyRequest {
  agencyResponseId: string;
  selectionNotes?: string;
}

export interface TripResponseFilters {
  tripId?: string;
  agencyId?: string;
  response?: 'ACCEPTED' | 'DECLINED' | 'PENDING';
  isSelected?: boolean;
  dateFrom?: string;
  dateTo?: string;
}

export interface CreateTripWithResponsesRequest {
  // All existing trip fields
  patientId?: string;
  patientWeight?: string;
  specialNeeds?: string;
  insuranceCompany?: string;
  fromLocation: string;
  pickupLocationId?: string;
  toLocation: string;
  scheduledTime: string; // ISO string
  transportLevel: 'BLS' | 'ALS' | 'CCT' | 'Other';
  urgencyLevel: 'Routine' | 'Urgent' | 'Emergent';
  diagnosis?: string;
  mobilityLevel?: 'Ambulatory' | 'Wheelchair' | 'Stretcher' | 'Bed';
  oxygenRequired?: boolean;
  monitoringRequired?: boolean;
  generateQRCode?: boolean;
  selectedAgencies?: string[];
  notificationRadius?: number;
  notes?: string;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  
  // New response handling fields
  responseDeadline?: string; // ISO string
  maxResponses?: number;
  selectionMode?: 'BROADCAST' | 'SPECIFIC_AGENCIES';
}

export interface UpdateTripResponseFieldsRequest {
  responseDeadline?: string; // ISO string
  maxResponses?: number;
  responseStatus?: 'PENDING' | 'RESPONSES_RECEIVED' | 'AGENCY_SELECTED';
  selectionMode?: 'BROADCAST' | 'SPECIFIC_AGENCIES';
}