import React, { useState, useRef, useEffect } from 'react';
import QrScanner from 'qr-scanner';
import { 
  CameraIcon, 
  PlayIcon, 
  PauseIcon, 
  ArrowPathIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

interface QRCodeScannerProps {
  onScan: (result: string) => void;
  onError?: (error: string) => void;
  title?: string;
  subtitle?: string;
  className?: string;
  autoStart?: boolean;
}

const QRCodeScanner: React.FC<QRCodeScannerProps> = ({
  onScan,
  onError,
  title = 'QR Code Scanner',
  subtitle = 'Position the QR code within the frame',
  className = '',
  autoStart = false
}) => {
  const [isScanning, setIsScanning] = useState(autoStart);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastScanned, setLastScanned] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(true);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const scannerRef = useRef<QrScanner | null>(null);

  useEffect(() => {
    // Check if QR Scanner is supported
    if (!QrScanner) {
      setIsSupported(false);
      setError('QR Scanner is not supported in this browser');
      return;
    }

    // Check camera permissions
    checkCameraPermission();

    return () => {
      if (scannerRef.current) {
        scannerRef.current.destroy();
      }
    };
  }, []);

  useEffect(() => {
    if (isScanning && hasPermission && videoRef.current) {
      startScanner();
    } else if (!isScanning && scannerRef.current) {
      stopScanner();
    }
  }, [isScanning, hasPermission]);

  const checkCameraPermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      stream.getTracks().forEach(track => track.stop());
      setHasPermission(true);
      setError(null);
    } catch (err) {
      setHasPermission(false);
      setError('Camera permission denied. Please enable camera access.');
      onError?.('Camera permission denied');
    }
  };

  const startScanner = () => {
    if (!videoRef.current || scannerRef.current) return;

    try {
      scannerRef.current = new QrScanner(
        videoRef.current,
        (result) => {
          if (result.data && result.data !== lastScanned) {
            setLastScanned(result.data);
            onScan(result.data);
            
            // Optional: Auto-pause after successful scan
            // setIsScanning(false);
          }
        },
        {
          returnDetailedScanResult: true,
          highlightScanRegion: true,
          highlightCodeOutline: true,
          overlay: null
        }
      );

      scannerRef.current.start();
      setError(null);
    } catch (err) {
      console.error('Scanner start error:', err);
      setError('Failed to start scanner');
      onError?.('Scanner start failed');
    }
  };

  const stopScanner = () => {
    if (scannerRef.current) {
      scannerRef.current.stop();
      scannerRef.current.destroy();
      scannerRef.current = null;
    }
  };

  const toggleScanner = () => {
    setIsScanning(!isScanning);
  };

  const resetScanner = () => {
    setLastScanned(null);
    setError(null);
    if (scannerRef.current) {
      scannerRef.current.destroy();
      scannerRef.current = null;
    }
    if (isScanning) {
      startScanner();
    }
  };

  const requestCameraPermission = async () => {
    try {
      await checkCameraPermission();
    } catch (err) {
      setError('Failed to request camera permission');
      onError?.('Camera permission request failed');
    }
  };

  if (!isSupported) {
    return (
      <div className={`flex flex-col items-center justify-center p-8 bg-red-50 border-2 border-red-200 rounded-lg ${className}`}>
        <ExclamationTriangleIcon className="w-16 h-16 text-red-400 mb-4" />
        <h3 className="text-lg font-semibold text-red-800 mb-2">Not Supported</h3>
        <p className="text-red-600 text-center">
          QR code scanning is not supported in this browser. Please use a modern browser with camera support.
        </p>
      </div>
    );
  }

  if (hasPermission === false) {
    return (
      <div className={`flex flex-col items-center justify-center p-8 bg-yellow-50 border-2 border-yellow-200 rounded-lg ${className}`}>
        <ExclamationTriangleIcon className="w-16 h-16 text-yellow-400 mb-4" />
        <h3 className="text-lg font-semibold text-yellow-800 mb-2">Camera Access Required</h3>
        <p className="text-yellow-600 text-center mb-4">
          Camera permission is required to scan QR codes. Please enable camera access in your browser.
        </p>
        <button
          onClick={requestCameraPermission}
          className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 transition-colors"
        >
          Grant Camera Permission
        </button>
      </div>
    );
  }

  return (
    <div className={`flex flex-col ${className}`}>
      {/* Header */}
      <div className="text-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        {subtitle && (
          <p className="text-sm text-gray-600 mt-1">{subtitle}</p>
        )}
      </div>

      {/* Scanner Container */}
      <div className="relative bg-black rounded-lg overflow-hidden">
        <video
          ref={videoRef}
          className="w-full h-64 object-cover"
          muted
          playsInline
        />
        
        {/* Scanner Overlay */}
        {isScanning && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-48 h-48 border-2 border-white rounded-lg relative">
              {/* Corner indicators */}
              <div className="absolute top-0 left-0 w-6 h-6 border-l-4 border-t-4 border-blue-500"></div>
              <div className="absolute top-0 right-0 w-6 h-6 border-r-4 border-t-4 border-blue-500"></div>
              <div className="absolute bottom-0 left-0 w-6 h-6 border-l-4 border-b-4 border-blue-500"></div>
              <div className="absolute bottom-0 right-0 w-6 h-6 border-r-4 border-b-4 border-blue-500"></div>
            </div>
          </div>
        )}

        {/* Scanner Status */}
        {isScanning && (
          <div className="absolute top-2 left-2 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-xs">
            Scanning...
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex justify-center gap-2 mt-4">
        <button
          onClick={toggleScanner}
          className={`flex items-center px-4 py-2 rounded-md font-medium transition-colors ${
            isScanning
              ? 'bg-red-600 text-white hover:bg-red-700'
              : 'bg-green-600 text-white hover:bg-green-700'
          }`}
        >
          {isScanning ? (
            <>
              <PauseIcon className="w-4 h-4 mr-2" />
              Stop
            </>
          ) : (
            <>
              <PlayIcon className="w-4 h-4 mr-2" />
              Start
            </>
          )}
        </button>

        <button
          onClick={resetScanner}
          className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
        >
          <ArrowPathIcon className="w-4 h-4 mr-2" />
          Reset
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600 flex items-center">
            <ExclamationTriangleIcon className="w-4 h-4 mr-2" />
            {error}
          </p>
        </div>
      )}

      {/* Success Display */}
      {lastScanned && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
          <p className="text-sm text-green-600 flex items-center">
            <CheckCircleIcon className="w-4 h-4 mr-2" />
            QR Code scanned successfully!
          </p>
          <details className="mt-2">
            <summary className="cursor-pointer text-sm text-green-700 font-medium">
              View scanned data
            </summary>
            <pre className="mt-2 text-xs text-green-700 bg-green-100 p-2 rounded break-all whitespace-pre-wrap">
              {lastScanned}
            </pre>
          </details>
        </div>
      )}

      {/* Instructions */}
      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
        <p className="text-sm text-blue-700">
          <strong>Instructions:</strong> Position the QR code within the scanning frame. 
          The scanner will automatically detect and process the code.
        </p>
      </div>
    </div>
  );
};

export default QRCodeScanner;
