import React, { useState, useEffect } from 'react';
import { useFreemium } from '../hooks/useFreemium';
import FacilityManagement from './FacilityManagement';
import PreferredAgencyManagement from './PreferredAgencyManagement';

interface FreemiumSettings {
  systemName: string;
  theme: string;
  language: string;
  notifications: {
    email: boolean;
    sms: boolean;
    push: boolean;
  };
  transport: {
    autoAssignment: boolean;
    revenueOptimization: boolean;
  };
}

interface SettingsProps {
  onNavigate?: (page: string) => void;
}

const SimpleSettings: React.FC<SettingsProps> = ({ onNavigate }) => {
  const { settings: freemiumSettings, hasFeatureAccess, updateSettings } = useFreemium();
  const [settings, setSettings] = useState<FreemiumSettings>({
    systemName: 'MedPort',
    theme: 'light',
    language: 'en',
    notifications: {
      email: true,
      sms: false,
      push: true
    },
    transport: {
      autoAssignment: true,
      revenueOptimization: false
    }
  });
  const [selectedTab, setSelectedTab] = useState<'general' | 'notifications' | 'transport' | 'freemium' | 'facilities' | 'ems-agencies'>('general');
  const [updateMessage, setUpdateMessage] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Get user type from localStorage
  const userType = localStorage.getItem('userType');
  const isCenterUser = userType === 'center';

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('/api/settings', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setSettings(data.data || settings);
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error);
    }
  };

  // updateSettings function removed - using the one from useFreemium hook

  const handleInputChange = (section: keyof FreemiumSettings, field: string, value: any) => {
    const newSettings = {
      ...settings,
      [section]: {
        ...settings[section],
        [field]: value
      }
    };
    setSettings(newSettings);
    updateSettings(newSettings);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
              <p className="text-gray-600 mt-1">Manage your system preferences</p>
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

        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'general', name: 'General', icon: '⚙️' },
                { id: 'notifications', name: 'Notifications', icon: '🔔' },
                { id: 'transport', name: 'Transport', icon: '🚑' },
                { id: 'facilities', name: 'Facilities', icon: '🏥' },
                { id: 'ems-agencies', name: 'EMS Agencies', icon: '🚑' },
                { id: 'freemium', name: 'Features', icon: '⭐' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedTab(tab.id as any)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    selectedTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {selectedTab === 'general' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    System Name
                  </label>
                  <input
                    type="text"
                    value={settings.systemName}
                    onChange={(e) => handleInputChange('systemName', 'systemName', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Theme
                  </label>
                  <select
                    value={settings.theme}
                    onChange={(e) => handleInputChange('theme', 'theme', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                    <option value="auto">Auto</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Language
                  </label>
                  <select
                    value={settings.language}
                    onChange={(e) => handleInputChange('language', 'language', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="en">English</option>
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                  </select>
                </div>
              </div>
            )}

            {selectedTab === 'notifications' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">Email Notifications</h3>
                    <p className="text-sm text-gray-500">Receive notifications via email</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.notifications.email}
                      onChange={(e) => handleInputChange('notifications', 'email', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">SMS Notifications</h3>
                    <p className="text-sm text-gray-500">Receive notifications via SMS</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.notifications.sms}
                      onChange={(e) => handleInputChange('notifications', 'sms', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">Push Notifications</h3>
                    <p className="text-sm text-gray-500">Receive push notifications in browser</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.notifications.push}
                      onChange={(e) => handleInputChange('notifications', 'push', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>
            )}

            {selectedTab === 'transport' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">Auto Assignment</h3>
                    <p className="text-sm text-gray-500">Automatically assign transport requests to available units</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.transport.autoAssignment}
                      onChange={(e) => handleInputChange('transport', 'autoAssignment', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">Revenue Optimization</h3>
                    <p className="text-sm text-gray-500">Enable advanced revenue optimization features</p>
                    {!isCenterUser && (
                      <p className="text-xs text-orange-600 mt-1">💡 Premium feature - Contact admin to enable</p>
                    )}
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.transport.revenueOptimization}
                      onChange={(e) => handleInputChange('transport', 'revenueOptimization', e.target.checked)}
                      disabled={!isCenterUser}
                      className="sr-only peer"
                    />
                    <div className={`w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 ${!isCenterUser ? 'opacity-50 cursor-not-allowed' : ''}`}></div>
                  </label>
                </div>
              </div>
            )}

            {selectedTab === 'freemium' && (
              <div className="space-y-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-blue-900 mb-2">Feature Access</h3>
                  <p className="text-blue-700 text-sm">
                    {freemiumSettings ? (
                      <>You are currently on the <strong>{freemiumSettings.planType}</strong> plan.</>
                    ) : (
                      'Loading your plan information...'
                    )}
                  </p>
                </div>

                {freemiumSettings && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(freemiumSettings.features).map(([feature, enabled]) => (
                      <div key={feature} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div>
                          <h4 className="font-medium text-gray-900 capitalize">
                            {feature.replace(/([A-Z])/g, ' $1').trim()}
                          </h4>
                          <p className="text-sm text-gray-500">
                            {feature === 'revenueOptimization' && 'Advanced algorithms to maximize revenue'}
                            {feature === 'advancedAnalytics' && 'Detailed performance metrics and trends'}
                            {feature === 'customReporting' && 'Create custom reports and exports'}
                            {feature === 'prioritySupport' && '24/7 priority customer support'}
                            {feature === 'apiAccess' && 'Full API access for integrations'}
                            {feature === 'multiAgencyCoordination' && 'Coordinate across multiple agencies'}
                          </p>
                        </div>
                        <div className="flex items-center">
                          {enabled ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              ✓ Enabled
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              ✗ Disabled
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {isCenterUser && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-medium text-blue-900 mb-2">Manage Features</h4>
                    <p className="text-blue-700 text-sm mb-3">
                      As a center user, you can manage freemium features for all users from the EMS module.
                    </p>
                    <button 
                      onClick={() => onNavigate?.('features')}
                      className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
                    >
                      Go to Feature Management
                    </button>
                  </div>
                )}

                {!isCenterUser && (
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                    <h4 className="font-medium text-orange-900 mb-2">Upgrade Available</h4>
                    <p className="text-orange-700 text-sm mb-3">
                      Contact your system administrator to enable premium features for your organization.
                    </p>
                    <button className="px-4 py-2 bg-orange-600 text-white text-sm font-medium rounded-md hover:bg-orange-700 transition-colors">
                      Contact Admin
                    </button>
                  </div>
                )}
              </div>
            )}

            {selectedTab === 'facilities' && (
              <FacilityManagement onNavigate={onNavigate} />
            )}

            {selectedTab === 'ems-agencies' && (
              <PreferredAgencyManagement onNavigate={onNavigate} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimpleSettings;
