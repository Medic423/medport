import React, { useState, useEffect } from 'react';
import { useFreemium } from '../hooks/useFreemium';

interface FreemiumManagementProps {
  onNavigate?: (page: string) => void;
}

const FreemiumManagement: React.FC<FreemiumManagementProps> = ({ onNavigate }) => {
  const { settings, updateSettings, getAvailableFeatures } = useFreemium();
  const [features, setFeatures] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updateMessage, setUpdateMessage] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Get user type from localStorage
  const userType = localStorage.getItem('userType');
  const isCenterUser = userType === 'center';

  useEffect(() => {
    loadFeatures();
  }, []);

  const loadFeatures = async () => {
    try {
      const availableFeatures = await getAvailableFeatures();
      setFeatures(availableFeatures);
    } catch (error) {
      console.error('Failed to load features:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFeatureToggle = async (featureId: string, enabled: boolean) => {
    if (!isCenterUser) {
      setUpdateMessage({ type: 'error', message: 'Only center users can manage freemium features' });
      setTimeout(() => setUpdateMessage(null), 3000);
      return;
    }

    try {
      const updates = {
        features: {
          ...settings?.features,
          [featureId]: enabled
        }
      };

      const success = await updateSettings(updates);
      if (success) {
        setUpdateMessage({ type: 'success', message: `${featureId} ${enabled ? 'enabled' : 'disabled'} successfully!` });
        setTimeout(() => setUpdateMessage(null), 3000);
      } else {
        setUpdateMessage({ type: 'error', message: 'Failed to update feature settings' });
        setTimeout(() => setUpdateMessage(null), 3000);
      }
    } catch (error) {
      console.error('Failed to update feature:', error);
      setUpdateMessage({ type: 'error', message: 'Failed to update feature settings' });
      setTimeout(() => setUpdateMessage(null), 3000);
    }
  };

  if (!isCenterUser) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">Freemium Management</h1>
              <p className="text-gray-600 mb-6">Only center users can manage freemium features.</p>
              <button
                onClick={() => onNavigate?.('overview')}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                ← Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">Freemium Management</h1>
              <p className="text-gray-600">Loading features...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Freemium Management</h1>
              <p className="text-gray-600 mt-1">Manage feature access for all users</p>
            </div>
            <button
              onClick={() => onNavigate?.('overview')}
              className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              ← Back to Dashboard
            </button>
          </div>
        </div>

        {/* Update Message */}
        {updateMessage && (
          <div className={`mb-6 p-4 rounded-lg ${
            updateMessage.type === 'success' 
              ? 'bg-green-50 text-green-800 border border-green-200' 
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}>
            {updateMessage.message}
          </div>
        )}

        {/* Current Plan Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-medium text-blue-900 mb-2">System Plan</h3>
          <p className="text-blue-700">
            Current plan: <strong>{settings?.planType || 'Unknown'}</strong>
          </p>
          <p className="text-blue-600 text-sm mt-2">
            Center users have full control over all freemium features for the entire system.
          </p>
        </div>

        {/* Feature Management */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Feature Toggles</h2>
            <p className="text-gray-600 mt-1">Enable or disable features for all users</p>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {features.map((feature) => {
                const isEnabled = settings?.features?.[feature.id] || false;
                return (
                  <div key={feature.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-medium text-gray-900 capitalize">
                        {feature.name}
                      </h3>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isEnabled}
                          onChange={(e) => handleFeatureToggle(feature.id, e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                    <p className="text-sm text-gray-600">
                      {feature.description}
                    </p>
                    <div className="mt-3">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        isEnabled 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {isEnabled ? '✓ Enabled' : '✗ Disabled'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Usage Instructions */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mt-6">
          <h3 className="text-lg font-medium text-yellow-900 mb-2">Usage Instructions</h3>
          <ul className="text-yellow-800 text-sm space-y-1">
            <li>• <strong>Enable features</strong> to make them available to all users</li>
            <li>• <strong>Disable features</strong> to restrict access system-wide</li>
            <li>• Changes take effect immediately for all users</li>
            <li>• Individual user plans can be managed through user settings</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default FreemiumManagement;
