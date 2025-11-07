import React from 'react';

interface TransportRequestQRIntegrationProps {
  transportRequestId: string;
  patientId: string;
  className?: string;
}

const TransportRequestQRIntegration: React.FC<TransportRequestQRIntegrationProps> = ({
  transportRequestId,
  patientId,
  className = ''
}) => {
  // Generate QR code data URL
  const generateQRCode = (text: string): string => {
    // Simple QR code generation using a free service
    // In production, you might want to use a proper QR code library
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(text)}`;
    return qrUrl;
  };

  const qrData = `Transport Request: ${transportRequestId}\nPatient ID: ${patientId}\nURL: ${window.location.origin}/track/${transportRequestId}`;
  const qrCodeUrl = generateQRCode(qrData);

  return (
    <div className={`p-4 ${className}`}>
      <div className="text-center">
        <h4 className="text-lg font-medium text-gray-900 mb-3">
          Patient Tracking QR Code
        </h4>
        <div className="inline-block p-4 bg-white border-2 border-gray-200 rounded-lg">
          <img
            src={qrCodeUrl}
            alt="QR Code for Patient Tracking"
            className="mx-auto"
            style={{ width: '200px', height: '200px' }}
          />
        </div>
        <div className="mt-4 text-sm text-gray-600">
          <p><strong>Transport Request ID:</strong> {transportRequestId}</p>
          <p><strong>Patient ID:</strong> {patientId}</p>
          <p className="mt-2 text-xs text-gray-500">
            Scan this QR code to access patient transport information
          </p>
        </div>
        <div className="mt-4">
          <button
            onClick={() => {
              // Download QR code
              const link = document.createElement('a');
              link.href = qrCodeUrl;
              link.download = `qr-code-${patientId}-${transportRequestId}.png`;
              link.click();
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
          >
            Download QR Code
          </button>
        </div>
      </div>
    </div>
  );
};

export default TransportRequestQRIntegration;
