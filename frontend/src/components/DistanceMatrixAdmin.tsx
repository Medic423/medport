import React, { useState, useEffect } from 'react';
import { Facility } from '../types/transport';

interface DistanceMatrixAdminProps {
  facilities: Facility[];
}

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

interface OptimizationResult {
  entriesRemoved: number;
  entriesUpdated: number;
  inconsistencies: string[];
}

const DistanceMatrixAdmin: React.FC<DistanceMatrixAdminProps> = ({ facilities }) => {
  const [activeTab, setActiveTab] = useState<'validation' | 'optimization' | 'analytics' | 'settings'>('validation');
  const [loading, setLoading] = useState(false);
  const [validationData, setValidationData] = useState<string>('');
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [optimizationResult, setOptimizationResult] = useState<OptimizationResult | null>(null);
  const [systemStats, setSystemStats] = useState<any>(null);
  const [settings, setSettings] = useState({
    cacheEnabled: true,
    autoOptimization: false,
    validationStrictness: 'medium' as 'low' | 'medium' | 'high',
    maxDistanceThreshold: 1000,
    maxTimeThreshold: 1440
  });

  useEffect(() => {
    if (facilities.length > 0) {
      loadSystemStats();
    }
  }, [facilities]);

  const loadSystemStats = async () => {
    try {
      if (facilities.some(f => f.id.startsWith('demo-'))) {
        // Demo stats
        setSystemStats({
          totalEntries: 3,
          averageDistance: 50.4,
          averageTime: 58,
          distanceRange: { min: 38.7, max: 67.3 },
          timeRange: { min: 44, max: 78 },
          facilityCount: 5,
          lastUpdated: new Date().toISOString(),
          cacheSize: 0,
          cacheHitRate: 0.8
        });
        return;
      }

      const response = await fetch('/api/distance/stats', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setSystemStats(data.data);
      }
    } catch (error) {
      console.error('Error loading system stats:', error);
    }
  };

  const handleValidation = async () => {
    if (!validationData.trim()) {
      alert('Please enter data to validate');
      return;
    }

    try {
      setLoading(true);
      let dataToValidate;
      
      try {
        dataToValidate = JSON.parse(validationData);
      } catch (error) {
        alert('Invalid JSON format. Please check your data.');
        return;
      }

      if (facilities.some(f => f.id.startsWith('demo-'))) {
        // Demo validation
        const demoResult: ValidationResult = {
          isValid: true,
          errors: [],
          warnings: ['Demo mode: Validation is simulated']
        };
        setValidationResult(demoResult);
        return;
      }

      const response = await fetch('/api/distance/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ data: dataToValidate })
      });

      if (response.ok) {
        const result = await response.json();
        setValidationResult(result.data);
      } else {
        alert('Validation failed');
      }
    } catch (error) {
      console.error('Error during validation:', error);
      alert('Error during validation');
    } finally {
      setLoading(false);
    }
  };

  const handleOptimization = async () => {
    if (!confirm('This will analyze and optimize the entire distance matrix. This may take several minutes. Continue?')) {
      return;
    }

    try {
      setLoading(true);
      
      if (facilities.some(f => f.id.startsWith('demo-'))) {
        // Demo optimization
        const demoResult: OptimizationResult = {
          entriesRemoved: 0,
          entriesUpdated: 3,
          inconsistencies: ['Demo mode: Optimization is simulated']
        };
        setOptimizationResult(demoResult);
        return;
      }

      const response = await fetch('/api/distance/optimize', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const result = await response.json();
        setOptimizationResult(result.data);
        loadSystemStats(); // Refresh stats
      } else {
        alert('Optimization failed');
      }
    } catch (error) {
      console.error('Error during optimization:', error);
      alert('Error during optimization');
    } finally {
      setLoading(false);
    }
  };

  const handleClearCache = async () => {
    if (!confirm('This will clear the distance calculation cache. Continue?')) {
      return;
    }

    try {
      setLoading(true);
      
      if (facilities.some(f => f.id.startsWith('demo-'))) {
        alert('Demo mode: Cache cleared (simulated)');
        return;
      }

      const response = await fetch('/api/distance/cache', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        alert('Distance cache cleared successfully');
        loadSystemStats(); // Refresh stats
      } else {
        alert('Failed to clear cache');
      }
    } catch (error) {
      console.error('Error clearing cache:', error);
      alert('Error clearing cache');
    } finally {
      setLoading(false);
    }
  };

  const handleExportSystemData = async (format: 'json' | 'csv') => {
    try {
      setLoading(true);
      
      if (facilities.some(f => f.id.startsWith('demo-'))) {
        // Demo export
        const demoData = {
          facilities: facilities,
          distances: [
            { from: 'demo-1', to: 'demo-2', distance: 45.2, time: 52 },
            { from: 'demo-1', to: 'demo-3', distance: 38.7, time: 44 },
            { from: 'demo-2', to: 'demo-4', distance: 67.3, time: 78 }
          ],
          stats: systemStats
        };
        
        if (format === 'csv') {
          // Simple CSV export for demo
          const csvContent = 'Facility,Type,City,State\n' +
            facilities.map(f => `${f.name},${f.type},${f.city},${f.state}`).join('\n');
          
          const blob = new Blob([csvContent], { type: 'text/csv' });
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'demo-system-data.csv';
          a.click();
          window.URL.revokeObjectURL(url);
        } else {
          const blob = new Blob([JSON.stringify(demoData, null, 2)], { type: 'application/json' });
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'demo-system-data.json';
          a.click();
          window.URL.revokeObjectURL(url);
        }
        return;
      }

      const response = await fetch(`/api/distance/export?format=${format}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `system-data.${format}`;
        a.click();
        window.URL.revokeObjectURL(url);
      } else {
        alert('Export failed');
      }
    } catch (error) {
      console.error('Error during export:', error);
      alert('Error during export');
    } finally {
      setLoading(false);
    }
  };

  const renderValidationTab = () => (
    <div className="space-y-6">
      <div className="bg-blue-50 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-blue-800 mb-2">Data Validation</h3>
        <p className="text-blue-700 text-sm">
          Validate distance data before importing to ensure data integrity and consistency.
        </p>
      </div>

      <div className="bg-white rounded-lg border p-4">
        <h4 className="font-medium text-gray-800 mb-3">Input Data for Validation</h4>
        <textarea
          value={validationData}
          onChange={(e) => setValidationData(e.target.value)}
          placeholder="Paste JSON data to validate..."
          className="w-full h-32 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <div className="mt-3 flex space-x-2">
          <button
            onClick={handleValidation}
            disabled={!validationData.trim() || loading}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg transition-colors"
          >
            {loading ? 'Validating...' : 'Validate Data'}
          </button>
          <button
            onClick={() => setValidationData('')}
            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Clear
          </button>
        </div>
      </div>

      {validationResult && (
        <div className="bg-white rounded-lg border p-4">
          <h4 className="font-medium text-gray-800 mb-3">Validation Results</h4>
          <div className="space-y-3">
            <div className={`p-3 rounded-lg ${validationResult.isValid ? 'bg-green-50' : 'bg-red-50'}`}>
              <div className={`font-medium ${validationResult.isValid ? 'text-green-800' : 'text-red-800'}`}>
                {validationResult.isValid ? '✅ Data is Valid' : '❌ Data has Errors'}
              </div>
            </div>
            
            {validationResult.errors.length > 0 && (
              <div className="bg-red-50 p-3 rounded-lg">
                <h5 className="font-medium text-red-800 mb-2">Errors ({validationResult.errors.length})</h5>
                <ul className="text-red-700 text-sm space-y-1">
                  {validationResult.errors.map((error, index) => (
                    <li key={index}>• {error}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {validationResult.warnings.length > 0 && (
              <div className="bg-yellow-50 p-3 rounded-lg">
                <h5 className="font-medium text-yellow-800 mb-2">Warnings ({validationResult.warnings.length})</h5>
                <ul className="text-yellow-700 text-sm space-y-1">
                  {validationResult.warnings.map((warning, index) => (
                    <li key={index}>• {warning}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );

  const renderOptimizationTab = () => (
    <div className="space-y-6">
      <div className="bg-orange-50 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-orange-800 mb-2">System Optimization</h3>
        <p className="text-orange-700 text-sm">
          Optimize the distance matrix by removing redundant entries, validating consistency, and improving performance.
        </p>
      </div>

      <div className="bg-white rounded-lg border p-4">
        <h4 className="font-medium text-gray-800 mb-3">Matrix Optimization</h4>
        <div className="space-y-3">
          <p className="text-gray-600 text-sm">
            This process will:
          </p>
          <ul className="text-gray-600 text-sm space-y-1 ml-4">
            <li>• Remove self-referencing entries</li>
            <li>• Validate bidirectional consistency</li>
            <li>• Update timestamps for cache refresh</li>
            <li>• Identify data inconsistencies</li>
          </ul>
          <button
            onClick={handleOptimization}
            disabled={loading}
            className="bg-orange-600 hover:bg-orange-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg transition-colors"
          >
            {loading ? 'Optimizing...' : 'Run Optimization'}
          </button>
        </div>
      </div>

      {optimizationResult && (
        <div className="bg-white rounded-lg border p-4">
          <h4 className="font-medium text-gray-800 mb-3">Optimization Results</h4>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-green-50 p-3 rounded-lg">
                <div className="text-2xl font-bold text-green-800">{optimizationResult.entriesRemoved}</div>
                <div className="text-green-700 text-sm">Entries Removed</div>
              </div>
              <div className="bg-blue-50 p-3 rounded-lg">
                <div className="text-2xl font-bold text-blue-800">{optimizationResult.entriesUpdated}</div>
                <div className="text-blue-700 text-sm">Entries Updated</div>
              </div>
            </div>
            
            {optimizationResult.inconsistencies.length > 0 && (
              <div className="bg-yellow-50 p-3 rounded-lg">
                <h5 className="font-medium text-yellow-800 mb-2">
                  ⚠️ Inconsistencies Found ({optimizationResult.inconsistencies.length})
                </h5>
                <ul className="text-yellow-700 text-sm space-y-1">
                  {optimizationResult.inconsistencies.map((inconsistency, index) => (
                    <li key={index}>• {inconsistency}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg border p-4">
        <h4 className="font-medium text-gray-800 mb-3">Cache Management</h4>
        <div className="space-y-3">
          <p className="text-gray-600 text-sm">
            Clear the distance calculation cache to force fresh calculations.
          </p>
          <button
            onClick={handleClearCache}
            disabled={loading}
            className="bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Clear Distance Cache
          </button>
        </div>
      </div>
    </div>
  );

  const renderAnalyticsTab = () => (
    <div className="space-y-6">
      <div className="bg-purple-50 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-purple-800 mb-2">System Analytics</h3>
        <p className="text-purple-700 text-sm">
          View comprehensive statistics and performance metrics for the distance matrix system.
        </p>
      </div>

      {systemStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg border p-4">
            <div className="text-2xl font-bold text-blue-600">{systemStats.totalEntries}</div>
            <div className="text-gray-600 text-sm">Total Distance Entries</div>
          </div>
          <div className="bg-white rounded-lg border p-4">
            <div className="text-2xl font-bold text-green-600">{systemStats.averageDistance.toFixed(1)}</div>
            <div className="text-gray-600 text-sm">Average Distance (mi)</div>
          </div>
          <div className="bg-white rounded-lg border p-4">
            <div className="text-2xl font-bold text-purple-600">{systemStats.averageTime.toFixed(0)}</div>
            <div className="text-gray-600 text-sm">Average Time (min)</div>
          </div>
          <div className="bg-white rounded-lg border p-4">
            <div className="text-2xl font-bold text-orange-600">{systemStats.facilityCount}</div>
            <div className="text-gray-600 text-sm">Active Facilities</div>
          </div>
        </div>
      )}

      {systemStats && (
        <div className="bg-white rounded-lg border p-4">
          <h4 className="font-medium text-gray-800 mb-3">Distance Range Analysis</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h5 className="text-sm font-medium text-gray-600 mb-2">Distance Range (Miles)</h5>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Minimum:</span>
                  <span className="font-medium">{systemStats.distanceRange.min.toFixed(1)} mi</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Maximum:</span>
                  <span className="font-medium">{systemStats.distanceRange.max.toFixed(1)} mi</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Range:</span>
                  <span className="font-medium">{(systemStats.distanceRange.max - systemStats.distanceRange.min).toFixed(1)} mi</span>
                </div>
              </div>
            </div>
            <div>
              <h5 className="text-sm font-medium text-gray-600 mb-2">Time Range (Minutes)</h5>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Minimum:</span>
                  <span className="font-medium">{systemStats.timeRange.min} min</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Maximum:</span>
                  <span className="font-medium">{systemStats.timeRange.max} min</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Range:</span>
                  <span className="font-medium">{systemStats.timeRange.max - systemStats.timeRange.min} min</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg border p-4">
        <h4 className="font-medium text-gray-800 mb-3">Data Export</h4>
        <div className="space-y-3">
          <p className="text-gray-600 text-sm">
            Export system data for analysis or backup purposes.
          </p>
          <div className="flex space-x-2">
            <button
              onClick={() => handleExportSystemData('json')}
              disabled={loading}
              className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Export as JSON
            </button>
            <button
              onClick={() => handleExportSystemData('csv')}
              disabled={loading}
              className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Export as CSV
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSettingsTab = () => (
    <div className="space-y-6">
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">System Settings</h3>
        <p className="text-gray-600 text-sm">
          Configure system behavior and performance settings for the distance matrix.
        </p>
      </div>

      <div className="bg-white rounded-lg border p-4">
        <h4 className="font-medium text-gray-800 mb-4">Performance Settings</h4>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700">Enable Distance Caching</label>
              <p className="text-xs text-gray-500">Cache calculated distances for improved performance</p>
            </div>
            <input
              type="checkbox"
              checked={settings.cacheEnabled}
              onChange={(e) => setSettings({ ...settings, cacheEnabled: e.target.checked })}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700">Auto-Optimization</label>
              <p className="text-xs text-gray-500">Automatically optimize matrix during maintenance</p>
            </div>
            <input
              type="checkbox"
              checked={settings.autoOptimization}
              onChange={(e) => setSettings({ ...settings, autoOptimization: e.target.checked })}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border p-4">
        <h4 className="font-medium text-gray-800 mb-4">Validation Settings</h4>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Validation Strictness</label>
            <select
              value={settings.validationStrictness}
              onChange={(e) => setSettings({ ...settings, validationStrictness: e.target.value as any })}
              className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="low">Low - Basic validation only</option>
              <option value="medium">Medium - Standard validation</option>
              <option value="high">High - Strict validation</option>
            </select>
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-700">Maximum Distance Threshold (miles)</label>
            <input
              type="number"
              value={settings.maxDistanceThreshold}
              onChange={(e) => setSettings({ ...settings, maxDistanceThreshold: parseInt(e.target.value) })}
              className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-700">Maximum Time Threshold (minutes)</label>
            <input
              type="number"
              value={settings.maxTimeThreshold}
              onChange={(e) => setSettings({ ...settings, maxTimeThreshold: parseInt(e.target.value) })}
              className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border p-4">
        <h4 className="font-medium text-gray-800 mb-4">System Information</h4>
        <div className="space-y-2 text-sm text-gray-600">
          <div className="flex justify-between">
            <span>Total Facilities:</span>
            <span className="font-medium">{facilities.length}</span>
          </div>
          <div className="flex justify-between">
            <span>Distance Entries:</span>
            <span className="font-medium">{systemStats?.totalEntries || 0}</span>
          </div>
          <div className="flex justify-between">
            <span>Last Updated:</span>
            <span className="font-medium">
              {systemStats?.lastUpdated ? new Date(systemStats.lastUpdated).toLocaleString() : 'Never'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded-lg shadow-lg">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 px-6">
          {[
            { id: 'validation', label: 'Data Validation', icon: '🔍' },
            { id: 'optimization', label: 'System Optimization', icon: '⚡' },
            { id: 'analytics', label: 'Analytics', icon: '📊' },
            { id: 'settings', label: 'Settings', icon: '⚙️' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {activeTab === 'validation' && renderValidationTab()}
        {activeTab === 'optimization' && renderOptimizationTab()}
        {activeTab === 'analytics' && renderAnalyticsTab()}
        {activeTab === 'settings' && renderSettingsTab()}
      </div>
    </div>
  );
};

export default DistanceMatrixAdmin;
