import React, { useState, useEffect } from 'react';
import QRCodeDisplay from './QRCodeDisplay';
import QRCodeScanner from './QRCodeScanner';
import { 
  QrCodeIcon,
  CameraIcon,
  DocumentTextIcon,
  ClockIcon,
  TrashIcon,
  PlusIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';

interface QRCodeHistoryItem {
  id: string;
  type: string;
  title: string;
  data: string;
  timestamp: string;
  expiresAt?: string;
}

const QRCodeDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'generate' | 'scan' | 'history'>('generate');
  const [qrCodeData, setQrCodeData] = useState<string>('');
  const [qrCodeTitle, setQrCodeTitle] = useState<string>('');
  const [qrCodeType, setQrCodeType] = useState<'custom' | 'transport_request' | 'patient' | 'facility'>('custom');
  const [customData, setCustomData] = useState<string>('');
  const [scannedData, setScannedData] = useState<string>('');
  const [qrCodeHistory, setQrCodeHistory] = useState<QRCodeHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Load QR code history from localStorage
    const savedHistory = localStorage.getItem('medport_qr_history');
    if (savedHistory) {
      try {
        setQrCodeHistory(JSON.parse(savedHistory));
      } catch (err) {
        console.error('Failed to load QR code history:', err);
      }
    }
  }, []);

  const saveToHistory = (item: Omit<QRCodeHistoryItem, 'id'>) => {
    const newItem: QRCodeHistoryItem = {
      ...item,
      id: Date.now().toString()
    };
    
    const updatedHistory = [newItem, ...qrCodeHistory].slice(0, 50); // Keep last 50 items
    setQrCodeHistory(updatedHistory);
    localStorage.setItem('medport_qr_history', JSON.stringify(updatedHistory));
  };

  const removeFromHistory = (id: string) => {
    const updatedHistory = qrCodeHistory.filter(item => item.id !== id);
    setQrCodeHistory(updatedHistory);
    localStorage.setItem('medport_qr_history', JSON.stringify(updatedHistory));
  };

  const generateCustomQR = () => {
    if (!customData.trim()) {
      setError('Please enter some data to encode');
      return;
    }

    setQrCodeData(customData);
    setQrCodeTitle('Custom QR Code');
    setError(null);
    
    saveToHistory({
      type: 'custom',
      title: 'Custom QR Code',
      data: customData,
      timestamp: new Date().toISOString()
    });
  };

  const handleScan = (result: string) => {
    setScannedData(result);
    
    try {
      const parsedData = JSON.parse(result);
      saveToHistory({
        type: parsedData.type || 'unknown',
        title: `${parsedData.type || 'Unknown'} QR Code`,
        data: result,
        timestamp: new Date().toISOString(),
        expiresAt: parsedData.metadata?.expiresAt
      });
    } catch (err) {
      saveToHistory({
        type: 'unknown',
        title: 'Scanned QR Code',
        data: result,
        timestamp: new Date().toISOString()
      });
    }
  };

  const handleScanError = (error: string) => {
    setError(error);
  };

  const clearData = () => {
    setQrCodeData('');
    setQrCodeTitle('');
    setScannedData('');
    setCustomData('');
    setError(null);
  };

  const isExpired = (expiresAt?: string) => {
    if (!expiresAt) return false;
    return new Date() > new Date(expiresAt);
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'TRANSPORT_REQUEST':
        return <DocumentTextIcon className="w-5 h-5 text-blue-500" />;
      case 'PATIENT_ID':
        return <DocumentTextIcon className="w-5 h-5 text-green-500" />;
      case 'FACILITY_INFO':
        return <DocumentTextIcon className="w-5 h-5 text-purple-500" />;
      case 'ROUTE_INFO':
        return <DocumentTextIcon className="w-5 h-5 text-orange-500" />;
      default:
        return <QrCodeIcon className="w-5 h-5 text-gray-500" />;
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">QR Code System</h1>
        <p className="text-gray-600">
          Generate, scan, and manage QR codes for transport requests, patient identification, and more.
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg mb-6">
        <button
          onClick={() => setActiveTab('generate')}
          className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
            activeTab === 'generate'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <QrCodeIcon className="w-5 h-5 inline mr-2" />
          Generate
        </button>
        <button
          onClick={() => setActiveTab('scan')}
          className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
            activeTab === 'scan'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <CameraIcon className="w-5 h-5 inline mr-2" />
          Scan
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
            activeTab === 'history'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-900'
          }`}
        >
          <ClockIcon className="w-5 h-5 inline mr-2" />
          History
        </button>
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {/* Generate Tab */}
        {activeTab === 'generate' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Generation Controls */}
            <div className="space-y-4">
              <div className="bg-white p-6 rounded-lg shadow border">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Generate QR Code</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      QR Code Type
                    </label>
                    <select
                      value={qrCodeType}
                      onChange={(e) => setQrCodeType(e.target.value as any)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="custom">Custom Data</option>
                      <option value="transport_request">Transport Request</option>
                      <option value="patient">Patient ID</option>
                      <option value="facility">Facility Info</option>
                    </select>
                  </div>

                  {qrCodeType === 'custom' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Custom Data
                      </label>
                      <textarea
                        value={customData}
                        onChange={(e) => setCustomData(e.target.value)}
                        placeholder="Enter the data you want to encode in the QR code..."
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  )}

                  <button
                    onClick={generateCustomQR}
                    disabled={qrCodeType === 'custom' && !customData.trim()}
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                  >
                    <PlusIcon className="w-5 h-5 inline mr-2" />
                    Generate QR Code
                  </button>

                  {error && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                      <p className="text-sm text-red-600">{error}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Generated QR Code Display */}
            <div>
              {qrCodeData ? (
                <QRCodeDisplay
                  qrCodeData={qrCodeData}
                  title={qrCodeTitle}
                  subtitle="Generated QR Code"
                  size={256}
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-64 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                  <QrCodeIcon className="w-16 h-16 text-gray-400 mb-4" />
                  <p className="text-gray-500 text-center">
                    Generate a QR code to see it displayed here
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Scan Tab */}
        {activeTab === 'scan' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <QRCodeScanner
              onScan={handleScan}
              onError={handleScanError}
              title="QR Code Scanner"
              subtitle="Position the QR code within the frame"
            />

            <div className="space-y-4">
              <div className="bg-white p-6 rounded-lg shadow border">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Scanned Data</h3>
                
                {scannedData ? (
                  <div className="space-y-4">
                    <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                      <p className="text-sm text-green-600 font-medium">
                        QR Code scanned successfully!
                      </p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Scanned Content
                      </label>
                      <textarea
                        value={scannedData}
                        readOnly
                        rows={8}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-sm font-mono"
                      />
                    </div>

                    <button
                      onClick={clearData}
                      className="w-full bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 transition-colors"
                    >
                      Clear Data
                    </button>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <MagnifyingGlassIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">
                      Scan a QR code to see its contents here
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* History Tab */}
        {activeTab === 'history' && (
          <div className="bg-white rounded-lg shadow border">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">QR Code History</h3>
              <p className="text-sm text-gray-600 mt-1">
                Recently generated and scanned QR codes
              </p>
            </div>

            <div className="p-6">
              {qrCodeHistory.length === 0 ? (
                <div className="text-center py-8">
                  <ClockIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No QR code history yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {qrCodeHistory.map((item) => (
                    <div
                      key={item.id}
                      className={`p-4 border rounded-lg ${
                        item.expiresAt && isExpired(item.expiresAt)
                          ? 'border-red-200 bg-red-50'
                          : 'border-gray-200 bg-gray-50'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3 flex-1">
                          {getTypeIcon(item.type)}
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-medium text-gray-900 truncate">
                              {item.title}
                            </h4>
                            <p className="text-xs text-gray-500 mt-1">
                              {formatTimestamp(item.timestamp)}
                            </p>
                            {item.expiresAt && (
                              <p className={`text-xs mt-1 ${
                                isExpired(item.expiresAt) ? 'text-red-600' : 'text-green-600'
                              }`}>
                                {isExpired(item.expiresAt) ? 'Expired' : 'Valid'} until{' '}
                                {formatTimestamp(item.expiresAt)}
                              </p>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => {
                              setQrCodeData(item.data);
                              setQrCodeTitle(item.title);
                              setActiveTab('generate');
                            }}
                            className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                            title="View QR Code"
                          >
                            <QrCodeIcon className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => removeFromHistory(item.id)}
                            className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                            title="Remove from history"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QRCodeDashboard;
