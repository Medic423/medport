import React, { useState, useEffect } from 'react';
import { 
  WifiIcon, 
  SignalSlashIcon, 
  ArrowPathIcon, 
  ExclamationTriangleIcon, 
  CheckCircleIcon,
  CloudArrowUpIcon,
  CloudArrowDownIcon,
  TrashIcon,
  EyeIcon,
  PlusIcon,
  DocumentTextIcon,
  ChartBarIcon,
  TruckIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';
import { offlineStorageService, OfflineData, SyncQueueItem } from '../services/offlineStorageService';

const OfflineCapabilitiesDashboard: React.FC = () => {
  const [offlineData, setOfflineData] = useState<OfflineData[]>([]);
  const [syncQueue, setSyncQueue] = useState<SyncQueueItem[]>([]);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSyncing, setIsSyncing] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'data' | 'sync' | 'testing'>('overview');
  const [testData, setTestData] = useState<any>(null);

  useEffect(() => {
    loadData();
    setupEventListeners();
    
    const interval = setInterval(loadData, 10000); // Refresh every 10 seconds
    
    return () => clearInterval(interval);
  }, []);

  const setupEventListeners = () => {
    window.addEventListener('online', () => setIsOnline(true));
    window.addEventListener('offline', () => setIsOnline(false));
  };

  const loadData = async () => {
    try {
      const [data, queue] = await Promise.all([
        offlineStorageService.getOfflineData(),
        offlineStorageService.getOfflineData() // This will be replaced with actual sync queue method
      ]);
      setOfflineData(data);
      // setSyncQueue(queue); // Uncomment when sync queue method is available
    } catch (error) {
      console.error('[OfflineCapabilitiesDashboard] Failed to load data:', error);
    }
  };

  const createTestData = async () => {
    try {
      const testTransportRequest = {
        patientName: 'John Doe',
        fromFacility: 'UPMC Altoona',
        toFacility: 'Penn State Health',
        priority: 'Urgent',
        status: 'Pending',
        timestamp: new Date().toISOString()
      };

      const testAnalytics = {
        transportEfficiency: 85.5,
        averageResponseTime: '12.3 minutes',
        totalTransports: 156,
        revenueGenerated: 45230.50
      };

      const testUnitAssignment = {
        unitId: 'EMS-001',
        driver: 'Sarah Johnson',
        status: 'Available',
        currentLocation: 'Altoona, PA',
        lastUpdate: new Date().toISOString()
      };

      // Store test data offline
      await Promise.all([
        offlineStorageService.storeOfflineData('transport-request', testTransportRequest),
        offlineStorageService.storeOfflineData('analytics', testAnalytics),
        offlineStorageService.storeOfflineData('unit-assignment', testUnitAssignment)
      ]);

      setTestData({ transportRequest: testTransportRequest, analytics: testAnalytics, unitAssignment: testUnitAssignment });
      await loadData();
    } catch (error) {
      console.error('[OfflineCapabilitiesDashboard] Failed to create test data:', error);
    }
  };

  const clearAllData = async () => {
    try {
      await offlineStorageService.clearAllData();
      setOfflineData([]);
      setSyncQueue([]);
      setTestData(null);
    } catch (error) {
      console.error('[OfflineCapabilitiesDashboard] Failed to clear data:', error);
    }
  };

  const triggerSync = async () => {
    try {
      setIsSyncing(true);
      await offlineStorageService.processSyncQueue();
      await loadData();
    } catch (error) {
      console.error('[OfflineCapabilitiesDashboard] Sync failed:', error);
    } finally {
      setIsSyncing(false);
    }
  };

  const getDataTypeIcon = (type: string) => {
    switch (type) {
      case 'transport-request': return <TruckIcon className="w-5 h-5" />;
      case 'analytics': return <ChartBarIcon className="w-5 h-5" />;
      case 'unit-assignment': return <UserGroupIcon className="w-5 h-5" />;
      case 'gps-tracking': return <DocumentTextIcon className="w-5 h-5" />;
      default: return <DocumentTextIcon className="w-5 h-5" />;
    }
  };

  const getSyncStatusIcon = (status: string) => {
    switch (status) {
      case 'synced': return <CheckCircleIcon className="w-4 h-4 text-green-500" />;
      case 'pending': return <ArrowPathIcon className="w-4 h-4 text-yellow-500" />;
      case 'failed': return <ExclamationTriangleIcon className="w-4 h-4 text-red-500" />;
      default: return <ExclamationTriangleIcon className="w-4 h-4 text-gray-400" />;
    }
  };

  const formatTimestamp = (timestamp: number): string => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  const formatDataSize = (data: any): string => {
    const size = JSON.stringify(data).length;
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Offline Capabilities Dashboard</h1>
        <p className="text-gray-600">
          Manage offline data, monitor synchronization, and test offline functionality
        </p>
      </div>

      {/* Connection Status Banner */}
      <div className={`mb-6 p-4 rounded-lg border ${
        isOnline 
          ? 'bg-green-50 border-green-200 text-green-800' 
          : 'bg-red-50 border-red-200 text-red-800'
      }`}>
        <div className="flex items-center space-x-3">
          {isOnline ? <WifiIcon className="w-6 h-6" /> : <SignalSlashIcon className="w-6 h-6" />}
          <div>
            <h3 className="font-semibold">
              {isOnline ? 'Online' : 'Offline Mode'}
            </h3>
            <p className="text-sm">
              {isOnline 
                ? 'All features available. Data will sync automatically.' 
                : 'Working offline. Changes will be queued for sync when connection is restored.'
              }
            </p>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'overview', label: 'Overview', icon: <ChartBarIcon className="w-5 h-5" /> },
            { id: 'data', label: 'Offline Data', icon: <DocumentTextIcon className="w-5 h-5" /> },
            { id: 'sync', label: 'Sync Status', icon: <CloudArrowUpIcon className="w-5 h-5" /> },
            { id: 'testing', label: 'Testing', icon: <PlusIcon className="w-5 h-5" /> }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="min-h-96">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <DocumentTextIcon className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Offline Data</p>
                  <p className="text-2xl font-semibold text-gray-900">{offlineData.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <ArrowPathIcon className="w-6 h-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Pending Sync</p>
                  <p className="text-2xl font-semibold text-gray-900">{syncQueue.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircleIcon className="w-6 h-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Connection</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {isOnline ? 'Online' : 'Offline'}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <CloudArrowDownIcon className="w-6 h-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Last Sync</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {offlineData.length > 0 ? 'Recent' : 'Never'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Offline Data Tab */}
        {activeTab === 'data' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">Offline Data Management</h3>
              <button
                onClick={createTestData}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                <PlusIcon className="w-4 h-4" />
                <span>Create Test Data</span>
              </button>
            </div>

            {offlineData.length === 0 ? (
              <div className="text-center py-12">
                <DocumentTextIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No offline data</h3>
                <p className="text-gray-500">Create some test data to see offline capabilities in action.</p>
              </div>
            ) : (
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h4 className="text-sm font-medium text-gray-900">Stored Offline Data</h4>
                </div>
                <div className="divide-y divide-gray-200">
                  {offlineData.map((item) => (
                    <div key={item.id} className="px-6 py-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          {getDataTypeIcon(item.type)}
                          <div>
                            <p className="text-sm font-medium text-gray-900 capitalize">
                              {item.type.replace('-', ' ')}
                            </p>
                            <p className="text-xs text-gray-500">
                              {formatTimestamp(item.timestamp)} • {formatDataSize(item.data)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {getSyncStatusIcon(item.syncStatus)}
                          <span className="text-xs text-gray-500 capitalize">
                            {item.syncStatus}
                          </span>
                        </div>
                      </div>
                      <div className="mt-3 p-3 bg-gray-50 rounded-md">
                        <pre className="text-xs text-gray-700 overflow-x-auto">
                          {JSON.stringify(item.data, null, 2)}
                        </pre>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Sync Status Tab */}
        {activeTab === 'sync' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">Synchronization Status</h3>
              <button
                onClick={triggerSync}
                disabled={!isOnline || isSyncing}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ArrowPathIcon className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>{isSyncing ? 'Syncing...' : 'Sync Now'}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <h4 className="text-lg font-medium text-gray-900 mb-4">Sync Queue</h4>
                {syncQueue.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No pending syncs</p>
                ) : (
                  <div className="space-y-3">
                    {syncQueue.map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{item.type}</p>
                          <p className="text-xs text-gray-500">{item.action}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-500">
                            {formatTimestamp(item.timestamp)}
                          </p>
                          <p className="text-xs text-gray-500">
                            Retries: {item.retryCount}/3
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <h4 className="text-lg font-medium text-gray-900 mb-4">Connection Status</h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Status:</span>
                    <span className={`text-sm font-medium ${
                      isOnline ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {isOnline ? 'Online' : 'Offline'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Sync Status:</span>
                    <span className={`text-sm font-medium ${
                      isSyncing ? 'text-yellow-600' : 'text-green-600'
                    }`}>
                      {isSyncing ? 'In Progress' : 'Idle'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Pending Items:</span>
                    <span className="text-sm font-medium text-gray-900">{syncQueue.length}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Testing Tab */}
        {activeTab === 'testing' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">Offline Functionality Testing</h3>
              <button
                onClick={clearAllData}
                className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                <TrashIcon className="w-4 h-4" />
                <span>Clear All Data</span>
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <h4 className="text-lg font-medium text-gray-900 mb-4">Test Data Creation</h4>
                <p className="text-sm text-gray-600 mb-4">
                  Create sample offline data to test the offline capabilities system.
                </p>
                <button
                  onClick={createTestData}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  <PlusIcon className="w-4 h-4" />
                  <span>Generate Test Data</span>
                </button>
              </div>

              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <h4 className="text-lg font-medium text-gray-900 mb-4">Test Results</h4>
                {testData ? (
                  <div className="space-y-3">
                    <div className="p-3 bg-green-50 rounded-md">
                      <p className="text-sm text-green-800">✓ Test data created successfully</p>
                    </div>
                    <div className="text-sm text-gray-600">
                      <p>• Transport Request: {testData.transportRequest.patientName}</p>
                      <p>• Analytics: {testData.analytics.totalTransports} transports</p>
                      <p>• Unit Assignment: {testData.unitAssignment.unitId}</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">No test data generated yet</p>
                )}
              </div>
            </div>

            <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
              <h4 className="text-lg font-medium text-blue-900 mb-4">Testing Instructions</h4>
              <div className="space-y-3 text-sm text-blue-800">
                <p>1. <strong>Create Test Data:</strong> Generate sample offline data to test storage</p>
                <p>2. <strong>Go Offline:</strong> Disconnect from internet to test offline mode</p>
                <p>3. <strong>View Data:</strong> Navigate to Offline Data tab to see stored information</p>
                <p>4. <strong>Go Online:</strong> Reconnect to test automatic synchronization</p>
                <p>5. <strong>Monitor Sync:</strong> Check Sync Status tab for synchronization progress</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OfflineCapabilitiesDashboard;
