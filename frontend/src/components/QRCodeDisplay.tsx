import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'react-qr-code';
import { 
  DocumentArrowDownIcon, 
  ShareIcon, 
  ClipboardDocumentIcon,
  CheckIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

interface QRCodeDisplayProps {
  qrCodeData: string;
  title?: string;
  subtitle?: string;
  size?: number;
  showDownload?: boolean;
  showShare?: boolean;
  showCopy?: boolean;
  className?: string;
}

const QRCodeDisplay: React.FC<QRCodeDisplayProps> = ({
  qrCodeData,
  title = 'QR Code',
  subtitle,
  size = 256,
  showDownload = true,
  showShare = true,
  showCopy = true,
  className = ''
}) => {
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (copied) {
      const timer = setTimeout(() => setCopied(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [copied]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(qrCodeData);
      setCopied(true);
      setError(null);
    } catch (err) {
      setError('Failed to copy to clipboard');
      console.error('Copy failed:', err);
    }
  };

  const handleDownload = () => {
    try {
      // Create a canvas element to convert SVG to PNG
      const svg = document.querySelector('svg');
      if (!svg) {
        setError('SVG element not found');
        return;
      }

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        setError('Canvas context not available');
        return;
      }

      // Set canvas size
      canvas.width = size;
      canvas.height = size;

      // Create an image from SVG
      const svgData = new XMLSerializer().serializeToString(svg);
      const img = new Image();
      
      img.onload = () => {
        ctx.drawImage(img, 0, 0, size, size);
        
        // Download the image
        const link = document.createElement('a');
        link.download = `${title.replace(/\s+/g, '_')}_QR_Code.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
        setError(null);
      };

      img.onerror = () => {
        setError('Failed to generate download image');
      };

      img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
    } catch (err) {
      setError('Download failed');
      console.error('Download failed:', err);
    }
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: `${title} QR Code`,
          text: `Scan this QR code for ${title}`,
          url: qrCodeData
        });
        setError(null);
      } else {
        // Fallback to copying
        await handleCopy();
      }
    } catch (err) {
      if (err instanceof Error && err.name !== 'AbortError') {
        setError('Share failed');
        console.error('Share failed:', err);
      }
    }
  };

  if (!qrCodeData) {
    return (
      <div className={`flex flex-col items-center justify-center p-6 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 ${className}`}>
        <ExclamationTriangleIcon className="w-12 h-12 text-gray-400 mb-4" />
        <p className="text-gray-500 text-center">No QR code data available</p>
      </div>
    );
  }

  return (
    <div className={`flex flex-col items-center p-6 bg-white rounded-lg shadow-lg border ${className}`}>
      {/* Header */}
      <div className="text-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        {subtitle && (
          <p className="text-sm text-gray-600 mt-1">{subtitle}</p>
        )}
      </div>

      {/* QR Code */}
      <div className="mb-4 p-4 bg-white rounded-lg border">
        <QRCodeSVG
          value={qrCodeData}
          size={size}
          level="M"
          fgColor="#000000"
          bgColor="#FFFFFF"
        />
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600 flex items-center">
            <ExclamationTriangleIcon className="w-4 h-4 mr-2" />
            {error}
          </p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2 justify-center">
        {showCopy && (
          <button
            onClick={handleCopy}
            className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
              copied
                ? 'bg-green-100 text-green-700 border border-green-200'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
            }`}
          >
            {copied ? (
              <>
                <CheckIcon className="w-4 h-4 mr-2" />
                Copied!
              </>
            ) : (
              <>
                <ClipboardDocumentIcon className="w-4 h-4 mr-2" />
                Copy Data
              </>
            )}
          </button>
        )}

        {showDownload && (
          <button
            onClick={handleDownload}
            className="flex items-center px-3 py-2 text-sm font-medium text-blue-700 bg-blue-100 hover:bg-blue-200 border border-blue-200 rounded-md transition-colors"
          >
            <DocumentArrowDownIcon className="w-4 h-4 mr-2" />
            Download
          </button>
        )}

        {showShare && (
          <button
            onClick={handleShare}
            className="flex items-center px-3 py-2 text-sm font-medium text-purple-700 bg-purple-100 hover:bg-purple-200 border border-purple-200 rounded-md transition-colors"
          >
            <ShareIcon className="w-4 h-4 mr-2" />
            Share
          </button>
        )}
      </div>

      {/* Data Preview */}
      <div className="mt-4 w-full">
        <details className="group">
          <summary className="cursor-pointer text-sm text-gray-600 hover:text-gray-800">
            <span className="group-open:hidden">Show QR Code Data</span>
            <span className="hidden group-open:inline">Hide QR Code Data</span>
          </summary>
          <div className="mt-2 p-3 bg-gray-50 rounded-md">
            <pre className="text-xs text-gray-700 break-all whitespace-pre-wrap">
              {qrCodeData}
            </pre>
          </div>
        </details>
      </div>
    </div>
  );
};

export default QRCodeDisplay;
