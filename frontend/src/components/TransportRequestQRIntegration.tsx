import React, { useState, useEffect } from 'react';
import QRCodeDisplay from './QRCodeDisplay';
import { 
  QrCodeIcon, 
  DocumentTextIcon, 
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

interface TransportRequestQRIntegrationProps {
  transportRequestId: string;
  patientId: string;
  className?: string;
}

interface TransportRequestData {
  id: string;
  patientId: string;
  originFacility: {
    name: string;
    address: string;
    city: string;
    state: string;
  };
  destinationFacility: {
    name: string;
    address: string;
    city: string;
    state: string;
  };
  transportLevel: string;
  priority: string;
  status: string;
  specialRequirements?: string;
  requestTimestamp: string;
  assignedAgency?: {
    name: string;
    contactName?: string;
    phone?: string;
  };
  assignedUnit?: {
    unitNumber: string;
    type: string;
  };
}

const TransportRequestQRIntegration: React.FC<TransportRequestQRIntegrationProps> = ({
  transportRequestId,
  patientId,
  className = ''
}) => {
  const [qrCodeData, setQrCodeData] = useState<string>('');
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [transportRequestData, setTransportRequestData] = useState<TransportRequestData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    if (transportRequestId) {
      generateTransportRequestQR();
    }
  }, [transportRequestId]);

  const generateTransportRequestQR = async () => {
    if (!transportRequestId) return;

    setIsLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch(
        `http://localhost:5001/api/qr/transport-request/${transportRequestId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to generate QR code: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (result.success) {
        setQrCodeDataUrl(result.data.qrCodeDataUrl);
        setQrCodeData(JSON.stringify(result.data.qrCodeData, null, 2));
        setTransportRequestData(result.data.qrCodeData.data);
      } else {
        throw new Error(result.message || 'Failed to generate QR code');
      }
    } catch (err) {
      console.error('[MedPort:TransportRequestQR] Error generating QR code:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate QR code');
    } finally {
      setIsLoading(false);
    }
  };

  const refreshQRCode = () => {
    generateTransportRequestQR();
  };

  const isExpired = (expiresAt?: string) => {
    if (!expiresAt) return false;
    return new Date() > new Date(expiresAt);
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  if (!transportRequestId) {
    return null;
  }

  return (
    <div className={`bg-white rounded-lg border shadow-sm ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <QrCodeIcon className="w-6 h-6 text-blue-600" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Transport Request QR Code</h3>
              <p className="text-sm text-gray-600">
                Patient ID: {patientId} • Request ID: {transportRequestId.substring(0, 8)}...
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={refreshQRCode}
              disabled={isLoading}
              className="p-2 text-gray-400 hover:text-blue-600 disabled:text-gray-300 transition-colors"
              title="Refresh QR Code"
            >
              <ClockIcon className="w-5 h-5" />
            </button>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              title={isExpanded ? 'Collapse' : 'Expand'}
            >
              <DocumentTextIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600">Generating QR Code...</span>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <ExclamationTriangleIcon className="w-12 h-12 text-red-400 mx-auto mb-3" />
              <p className="text-red-600 mb-3">{error}</p>
              <button
                onClick={refreshQRCode}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
        ) : qrCodeDataUrl ? (
          <div className="space-y-4">
            {/* QR Code Display */}
            <div className="flex justify-center">
              <QRCodeDisplay
                qrCodeData={qrCodeData}
                title="Transport Request QR Code"
                subtitle={`Patient: ${patientId} • ${transportRequestData?.transportLevel || ''} Transport`}
                size={200}
                showDownload={true}
                showShare={true}
                showCopy={true}
              />
            </div>

            {/* Transport Request Details */}
            {isExpanded && transportRequestData && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-3">Transport Request Details</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <h5 className="font-medium text-gray-700 mb-2">Origin Facility</h5>
                    <p className="text-gray-900">{transportRequestData.originFacility.name}</p>
                    <p className="text-gray-600 text-xs">
                      {transportRequestData.originFacility.address}, {transportRequestData.originFacility.city}, {transportRequestData.originFacility.state}
                    </p>
                  </div>
                  
                  <div>
                    <h5 className="font-medium text-gray-700 mb-2">Destination Facility</h5>
                    <p className="text-gray-900">{transportRequestData.destinationFacility.name}</p>
                    <p className="text-gray-600 text-xs">
                      {transportRequestData.destinationFacility.address}, {transportRequestData.destinationFacility.city}, {transportRequestData.destinationFacility.state}
                    </p>
                  </div>
                  
                  <div>
                    <h5 className="font-medium text-gray-700 mb-2">Transport Details</h5>
                    <p className="text-gray-900">
                      Level: {transportRequestData.transportLevel} • Priority: {transportRequestData.priority}
                    </p>
                    <p className="text-gray-600 text-xs">
                      Status: {transportRequestData.status} • Requested: {formatTimestamp(transportRequestData.requestTimestamp)}
                    </p>
                  </div>
                  
                  <div>
                    <h5 className="font-medium text-gray-700 mb-2">Assignment</h5>
                    {transportRequestData.assignedAgency ? (
                      <div>
                        <p className="text-gray-900">{transportRequestData.assignedAgency.name}</p>
                        {transportRequestData.assignedAgency.contactName && (
                          <p className="text-gray-600 text-xs">Contact: {transportRequestData.assignedAgency.contactName}</p>
                        )}
                        {transportRequestData.assignedAgency.phone && (
                          <p className="text-gray-600 text-xs">Phone: {transportRequestData.assignedAgency.phone}</p>
                        )}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-xs">No agency assigned</p>
                    )}
                    
                    {transportRequestData.assignedUnit && (
                      <div className="mt-1">
                        <p className="text-gray-900">Unit {transportRequestData.assignedUnit.unitNumber}</p>
                        <p className="text-gray-600 text-xs">Type: {transportRequestData.assignedUnit.type}</p>
                      </div>
                    )}
                  </div>
                </div>
                
                {transportRequestData.specialRequirements && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <h5 className="font-medium text-gray-700 mb-2">Special Requirements</h5>
                    <p className="text-gray-900 text-sm">{transportRequestData.specialRequirements}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8">
            <QrCodeIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No QR code data available</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TransportRequestQRIntegration;
