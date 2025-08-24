import React, { useState, useEffect } from 'react';
import { WifiIcon, SignalSlashIcon, ArrowPathIcon, ExclamationTriangleIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { offlineStorageService, OfflineStatus } from '../services/offlineStorageService';

interface OfflineIndicatorProps {
  className?: string;
  showDetails?: boolean;
}

const OfflineIndicator: React.FC<OfflineIndicatorProps> = ({ 
  className = '', 
  showDetails = false 
}) => {
  const [status, setStatus] = useState<OfflineStatus>({
    isOnline: navigator.onLine,
    lastSync: null,
    pendingSyncs: 0,
    storageUsage: 0,
    cacheSize: 0
  });
  const [isExpanded, setIsExpanded] = useState(false);
  const [syncProgress, setSyncProgress] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    const updateStatus = async () => {
      try {
        const currentStatus = await offlineStorageService.getOfflineStatus();
        setStatus(currentStatus);
      } catch (error) {
        console.error('[OfflineIndicator] Failed to get status:', error);
      }
    };

    // Initial status update
    updateStatus();

    // Update status every 5 seconds
    const interval = setInterval(updateStatus, 5000);

    // Listen for online/offline events
    const handleOnline = () => {
      setStatus(prev => ({ ...prev, isOnline: true }));
      handleConnectionRestored();
    };

    const handleOffline = () => {
      setStatus(prev => ({ ...prev, isOnline: false }));
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Listen for service worker messages
    const handleServiceWorkerMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === 'SYNC_STATUS') {
        if (event.data.status === 'started') {
          setIsSyncing(true);
          setSyncProgress(0);
        } else if (event.data.status === 'completed') {
          setIsSyncing(false);
          setSyncProgress(100);
          setTimeout(() => setSyncProgress(0), 2000);
          updateStatus();
        } else if (event.data.status === 'failed') {
          setIsSyncing(false);
          setSyncProgress(0);
          updateStatus();
        }
      }
    };

    navigator.serviceWorker?.addEventListener('message', handleServiceWorkerMessage);

    return () => {
      clearInterval(interval);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      navigator.serviceWorker?.removeEventListener('message', handleServiceWorkerMessage);
    };
  }, []);

  const handleConnectionRestored = async () => {
    try {
      setIsSyncing(true);
      setSyncProgress(0);
      
      // Trigger sync process
      await offlineStorageService.processSyncQueue();
      
      // Update status
      const currentStatus = await offlineStorageService.getOfflineStatus();
      setStatus(currentStatus);
      
      setIsSyncing(false);
      setSyncProgress(100);
      setTimeout(() => setSyncProgress(0), 2000);
    } catch (error) {
      console.error('[OfflineIndicator] Sync failed:', error);
      setIsSyncing(false);
      setSyncProgress(0);
    }
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatTimestamp = (timestamp: number | null): string => {
    if (!timestamp) return 'Never';
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return date.toLocaleDateString();
  };

  const getStatusColor = (): string => {
    if (!status.isOnline) return 'text-red-500';
    if (status.pendingSyncs > 0) return 'text-yellow-500';
    return 'text-green-500';
  };

  const getStatusIcon = () => {
    if (!status.isOnline) return <SignalSlashIcon className="w-5 h-5" />;
    if (isSyncing) return <ArrowPathIcon className="w-5 h-5 animate-spin" />;
    if (status.pendingSyncs > 0) return <ExclamationTriangleIcon className="w-5 h-5" />;
    return <WifiIcon className="w-5 h-5" />;
  };

  const getStatusText = (): string => {
    if (!status.isOnline) return 'Offline';
    if (isSyncing) return 'Syncing...';
    if (status.pendingSyncs > 0) return `${status.pendingSyncs} pending`;
    return 'Online';
  };

  return (
    <div className={`relative ${className}`}>
      {/* Main Indicator */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`flex items-center space-x-2 px-3 py-2 rounded-lg border transition-all duration-200 ${
          status.isOnline 
            ? 'bg-green-50 border-green-200 hover:bg-green-100' 
            : 'bg-red-50 border-red-200 hover:bg-red-100'
        }`}
        title={`Connection Status: ${getStatusText()}`}
      >
        <div className={`${getStatusColor()}`}>
          {getStatusIcon()}
        </div>
        <span className={`text-sm font-medium ${getStatusColor()}`}>
          {getStatusText()}
        </span>
        
        {/* Sync Progress Bar */}
        {isSyncing && (
          <div className="w-16 h-1 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-blue-500 transition-all duration-300 ease-out"
              style={{ width: `${syncProgress}%` }}
            />
          </div>
        )}
      </button>

      {/* Expanded Details */}
      {isExpanded && showDetails && (
        <div className="absolute top-full right-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Offline Status</h3>
              <button
                onClick={() => setIsExpanded(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>

            {/* Connection Status */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Connection:</span>
                <div className="flex items-center space-x-2">
                  {getStatusIcon()}
                  <span className={`text-sm font-medium ${getStatusColor()}`}>
                    {status.isOnline ? 'Online' : 'Offline'}
                  </span>
                </div>
              </div>

              {/* Last Sync */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Last Sync:</span>
                <span className="text-sm text-gray-900">
                  {formatTimestamp(status.lastSync)}
                </span>
              </div>

              {/* Pending Syncs */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Pending Syncs:</span>
                <span className={`text-sm font-medium ${
                  status.pendingSyncs > 0 ? 'text-yellow-600' : 'text-green-600'
                }`}>
                  {status.pendingSyncs}
                </span>
              </div>

              {/* Storage Usage */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Storage:</span>
                <span className="text-sm text-gray-900">
                  {formatBytes(status.storageUsage)}
                </span>
              </div>

              {/* Cache Size */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Cache:</span>
                <span className="text-sm text-gray-900">
                  {formatBytes(status.cacheSize)}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-4 pt-4 border-t border-gray-200 space-y-2">
              {status.isOnline && status.pendingSyncs > 0 && (
                <button
                  onClick={handleConnectionRestored}
                  disabled={isSyncing}
                  className="w-full flex items-center justify-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ArrowPathIcon className="w-4 h-4" />
                  <span>Sync Now</span>
                </button>
              )}
              
              <button
                onClick={() => offlineStorageService.clearAllData()}
                className="w-full px-3 py-2 text-sm text-red-600 border border-red-200 rounded-md hover:bg-red-50"
              >
                Clear Offline Data
              </button>
            </div>

            {/* Offline Capabilities Info */}
            <div className="mt-4 p-3 bg-blue-50 rounded-md">
              <h4 className="text-sm font-medium text-blue-900 mb-2">Offline Capabilities</h4>
              <ul className="text-xs text-blue-800 space-y-1">
                <li>• View cached transport requests</li>
                <li>• Access offline analytics data</li>
                <li>• Queue operations for later sync</li>
                <li>• Continue working without internet</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OfflineIndicator;
