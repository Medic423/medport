import React, { useState, useEffect } from 'react';
import { useRoleBasedAccess } from '../hooks/useRoleBasedAccess';

interface ModuleVisibilitySettings {
  [moduleId: string]: {
    visible: boolean;
    roles: string[];
  };
}

interface OperationalSettings {
  systemName: string;
  demoMode: boolean;
  theme: string;
  language: string;
  apiRateLimit: number;
  sessionTimeout: number;
  notifications: {
    email: boolean;
    sms: boolean;
    push: boolean;
  };
  transport: {
    autoAssignment: boolean;
    conflictResolution: string;
    revenueOptimization: boolean;
  };
}

interface SettingsProps {
  onNavigate?: (page: 'home' | 'transport-requests' | 'status-board' | 'distance-matrix' | 'resource-management' | 'advanced-transport' | 'air-medical' | 'emergency-department' | 'agency-registration' | 'agency-login' | 'agency-dashboard' | 'route-optimization' | 'unit-assignment' | 'notifications' | 'qr-code-system' | 'real-time-tracking' | 'analytics' | 'offline-capabilities' | 'login' | 'transport-center-dashboard' | 'hospital-dashboard' | 'settings') => void;
}

const Settings: React.FC<SettingsProps> = ({ onNavigate }) => {
  const { navigation, modules, loading, canAccessModule } = useRoleBasedAccess();
  const [settings, setSettings] = useState<ModuleVisibilitySettings>({});
  const [operationalSettings, setOperationalSettings] = useState<OperationalSettings | null>(null);
  const [availableRoles] = useState(['ADMIN', 'COORDINATOR', 'BILLING_STAFF', 'TRANSPORT_AGENCY', 'HOSPITAL_COORDINATOR']);
  const [selectedTab, setSelectedTab] = useState<'overview' | 'module-visibility' | 'role-permissions' | 'system-config' | 'debug-testing'>('overview');
  const [updateMessage, setUpdateMessage] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Check if user has full settings access (ADMIN)
  const hasFullAccess = navigation?.role === 'ADMIN';
  // Check if user has limited settings access (COORDINATOR)
  const hasLimitedAccess = navigation?.role === 'COORDINATOR';

  useEffect(() => {
    if (hasFullAccess) {
      fetchSettings();
    }
    if (hasLimitedAccess) {
      fetchOperationalSettings();
    }
  }, [hasFullAccess, hasLimitedAccess]);

  const fetchSettings = async () => {
    try {
      // Use demo endpoint for demo mode
      const response = await fetch('/api/role-based-access/demo/settings', {
        headers: {
          'Authorization': 'Bearer demo-token' // Demo mode
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setSettings(data.data.settings);
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error);
    }
  };

  const fetchOperationalSettings = async () => {
    try {
      // Use demo endpoint for demo mode
      const response = await fetch('/api/role-based-access/demo/operational-settings', {
        headers: {
          'Authorization': 'Bearer demo-token' // Demo mode
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setOperationalSettings(data.data.settings);
      }
    } catch (error) {
      console.error('Failed to fetch operational settings:', error);
    }
  };

  const updateModuleVisibility = async (moduleId: string, visible: boolean, roles: string[]) => {
    try {
      const response = await fetch(`/api/role-based-access/settings/${moduleId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer demo-token' // Demo mode
        },
        body: JSON.stringify({ visible, roles })
      });

      if (response.ok) {
        setSettings(prev => ({
          ...prev,
          [moduleId]: { visible, roles }
        }));
        setUpdateMessage({ type: 'success', message: 'Module visibility updated successfully' });
        setTimeout(() => setUpdateMessage(null), 3000);
      } else {
        setUpdateMessage({ type: 'error', message: 'Failed to update module visibility' });
        setTimeout(() => setUpdateMessage(null), 3000);
      }
    } catch (error) {
      console.error('Failed to update module visibility:', error);
      setUpdateMessage({ type: 'error', message: 'Error updating module visibility' });
      setTimeout(() => setUpdateMessage(null), 3000);
    }
  };

  const handleRoleToggle = (moduleId: string, role: string) => {
    const currentSettings = settings[moduleId];
    if (!currentSettings) return;

    const newRoles = currentSettings.roles.includes(role)
      ? currentSettings.roles.filter(r => r !== role)
      : [...currentSettings.roles, role];

    updateModuleVisibility(moduleId, currentSettings.visible, newRoles);
  };

  const handleVisibilityToggle = (moduleId: string) => {
    const currentSettings = settings[moduleId];
    if (!currentSettings) return;

    updateModuleVisibility(moduleId, !currentSettings.visible, currentSettings.roles);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading settings...</p>
        </div>
      </div>
    );
  }

  if (!hasFullAccess && !hasLimitedAccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600 mb-4">You don't have permission to access the Settings module.</p>
          <button
            onClick={() => onNavigate?.('home')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
              <p className="text-gray-600 mt-1">
                {hasFullAccess 
                  ? 'System configuration and module visibility controls for Transport Command'
                  : 'Operational configuration for Transport Center Coordinators'
                }
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <div className="bg-blue-100 px-3 py-1 rounded-full">
                <span className="text-blue-800 text-sm font-medium">
                  {navigation?.role === 'ADMIN' ? 'Transport Command' : 'Transport Center Coordinator'}
                </span>
              </div>
              <button
                onClick={() => onNavigate?.('home')}
                className="px-4 py-2 text-gray-600 hover:text-gray-900"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Update Message */}
      {updateMessage && (
        <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4`}>
          <div className={`p-4 rounded-lg ${
            updateMessage.type === 'success' 
              ? 'bg-green-100 text-green-800 border border-green-200' 
              : 'bg-red-100 text-red-800 border border-red-200'
          }`}>
            {updateMessage.message}
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab Navigation */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setSelectedTab('overview')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                selectedTab === 'overview'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Overview
            </button>
            {hasFullAccess && (
              <button
                onClick={() => setSelectedTab('module-visibility')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  selectedTab === 'module-visibility'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Module Visibility
              </button>
            )}
            {hasFullAccess && (
              <button
                onClick={() => setSelectedTab('role-permissions')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  selectedTab === 'role-permissions'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Role Permissions
              </button>
            )}
            {hasFullAccess && (
              <button
                onClick={() => setSelectedTab('debug-testing')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  selectedTab === 'debug-testing'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Debug & Testing
              </button>
            )}
            <button
              onClick={() => setSelectedTab('system-config')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                selectedTab === 'system-config'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              System Configuration
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        {selectedTab === 'overview' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Access Level Summary</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Your Role: {navigation?.role}</h3>
                  <div className="space-y-2">
                    {hasFullAccess && (
                      <div className="flex items-center text-green-600">
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Full system configuration access
                      </div>
                    )}
                    {hasLimitedAccess && (
                      <div className="flex items-center text-blue-600">
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Limited operational configuration access
                      </div>
                    )}
                    <div className="flex items-center text-gray-600">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {modules?.length || 0} accessible modules
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Quick Actions</h3>
                  <div className="space-y-2">
                    {hasFullAccess && (
                      <button
                        onClick={() => setSelectedTab('module-visibility')}
                        className="w-full text-left px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-md"
                      >
                        Configure module visibility
                      </button>
                    )}
                    <button
                      onClick={() => setSelectedTab('system-config')}
                      className="w-full text-left px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-md"
                    >
                      View system configuration
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Module Access Summary</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {modules?.map((module) => (
                  <div key={module.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium text-gray-900">{module.name}</h3>
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                        Accessible
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{module.description}</p>
                    <div className="text-xs text-gray-500">
                      Category: {module.category}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {selectedTab === 'module-visibility' && hasFullAccess && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Module Visibility Controls</h2>
              <p className="text-gray-600 mb-6">
                Control which modules are visible to different user roles. Changes affect all users immediately.
              </p>
              
              <div className="space-y-4">
                {Object.entries(settings).map(([moduleId, moduleSettings]) => {
                  const module = modules?.find(m => m.id === moduleId);
                  if (!module) return null;

                  return (
                    <div key={moduleId} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="font-medium text-gray-900">{module.name}</h3>
                          <p className="text-sm text-gray-600">{module.description}</p>
                          <p className="text-xs text-gray-500">Category: {module.category}</p>
                        </div>
                        <div className="flex items-center space-x-3">
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              checked={moduleSettings.visible}
                              onChange={() => handleVisibilityToggle(moduleId)}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="ml-2 text-sm text-gray-700">Visible</span>
                          </label>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 mb-2">Visible to Roles:</h4>
                        <div className="flex flex-wrap gap-2">
                          {availableRoles.map((role) => (
                            <label key={role} className="flex items-center">
                              <input
                                type="checkbox"
                                checked={moduleSettings.roles.includes(role)}
                                onChange={() => handleRoleToggle(moduleId, role)}
                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                              />
                              <span className="ml-2 text-sm text-gray-700">{role}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {selectedTab === 'role-permissions' && hasFullAccess && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Role Permission Management</h2>
              <p className="text-gray-600 mb-6">
                Manage permissions for different user roles. This affects what actions users can perform.
              </p>
              
              <div className="space-y-4">
                {availableRoles.map((role) => (
                  <div key={role} className="border rounded-lg p-4">
                    <h3 className="font-medium text-gray-900 mb-3">{role}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                      {['transport:create', 'transport:read', 'transport:update', 'unit:assign', 'route:optimize', 'analytics:view', 'settings:full', 'settings:limited'].map((permission) => (
                        <label key={permission} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={navigation?.permissions?.includes(permission) || false}
                            disabled
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="ml-2 text-sm text-gray-700">{permission}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {selectedTab === 'system-config' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">System Configuration</h2>
              <p className="text-gray-600 mb-6">
                View and configure system-wide settings and preferences.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">General Settings</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        System Name
                      </label>
                      <input
                        type="text"
                        value={operationalSettings?.systemName || 'MedPort'}
                        disabled
                        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Demo Mode
                      </label>
                      <div className="flex items-center">
                        <span className={`px-3 py-2 rounded-md text-sm ${
                          operationalSettings?.demoMode 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {operationalSettings?.demoMode ? 'Enabled' : 'Disabled'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">User Interface</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Theme
                      </label>
                      <select
                        defaultValue={operationalSettings?.theme || 'light'}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
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
                        defaultValue={operationalSettings?.language || 'en'}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="en">English</option>
                        <option value="es">Spanish</option>
                        <option value="fr">French</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Transport Operations Configuration - Available to both ADMIN and COORDINATOR */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 mb-3">Transport Operations</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Auto Assignment
                    </label>
                    <div className="flex items-center">
                      <span className={`px-3 py-2 rounded-md text-sm ${
                        operationalSettings?.transport?.autoAssignment 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                      {operationalSettings?.transport?.autoAssignment ? 'Enabled' : 'Disabled'}
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Conflict Resolution
                    </label>
                    <div className="flex items-center">
                      <span className="px-3 py-2 bg-blue-100 text-blue-800 rounded-md text-sm">
                        {operationalSettings?.transport?.conflictResolution || 'Automatic'}
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Revenue Optimization
                    </label>
                    <div className="flex items-center">
                      <span className={`px-3 py-2 rounded-md text-sm ${
                        operationalSettings?.transport?.revenueOptimization 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                      {operationalSettings?.transport?.revenueOptimization ? 'Enabled' : 'Disabled'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              {hasFullAccess && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Advanced Configuration</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        API Rate Limiting
                      </label>
                      <input
                        type="number"
                        defaultValue={operationalSettings?.apiRateLimit || 100}
                        min="10"
                        max="1000"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      />
                      <p className="text-xs text-gray-500 mt-1">Requests per minute</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Session Timeout
                      </label>
                      <input
                        type="number"
                        defaultValue={operationalSettings?.sessionTimeout || 30}
                        min="5"
                        max="120"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      />
                      <p className="text-xs text-gray-500 mt-1">Minutes of inactivity</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {selectedTab === 'debug-testing' && hasFullAccess && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Debug & Testing Information</h2>
              <p className="text-gray-600 mb-6">
                Detailed debugging information for role-based access control system. This tab provides comprehensive insights into permissions, navigation structure, and module access.
              </p>
              
              {/* Current Role & Permissions Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-blue-900">Current Role</h3>
                  <p className="text-blue-700">{navigation?.role}</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-green-900">Total Permissions</h3>
                  <p className="text-green-700">{navigation?.permissions?.length || 0} permissions</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-purple-900">Available Modules</h3>
                  <p className="text-purple-700">{modules?.length || 0} modules</p>
                </div>
              </div>

              {/* Permissions List */}
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-3">User Permissions</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {navigation?.permissions?.map((permission, index) => (
                    <div key={index} className="bg-gray-100 px-3 py-2 rounded text-sm font-mono">
                      {permission}
                    </div>
                  ))}
                </div>
              </div>

              {/* Navigation Structure */}
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-3">Navigation Structure</h3>
                <div className="space-y-4">
                  {navigation?.navigation?.map((category) => (
                    <div key={category.id} className="border border-gray-200 rounded-lg p-4">
                      <h4 className="text-md font-semibold text-gray-900 mb-3">
                        {category.name}
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {category.children?.map((item) => (
                          <div key={item.id} className="bg-gray-50 p-3 rounded border">
                            <h5 className="font-medium text-gray-900 mb-2">{item.name}</h5>
                            <p className="text-sm text-gray-600 mb-2">Path: {item.path}</p>
                            <div className="text-xs text-gray-500">
                              <p>Required: {item.requiredPermissions.join(', ')}</p>
                              <p>Visible to: {item.visibleToRoles.join(', ')}</p>
                              <p>Access: {canAccessModule(item.id) ? '✅ Yes' : '❌ No'}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Module Access Test */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Module Access Test</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {modules?.map((module) => (
                    <div key={module.id} className="border border-gray-200 rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-2">{module.name}</h4>
                      <p className="text-sm text-gray-600 mb-3">{module.description}</p>
                      <div className="text-xs text-gray-500 space-y-1">
                        <p><strong>Category:</strong> {module.category}</p>
                        <p><strong>Required:</strong> {module.requiredPermissions.join(', ')}</p>
                        <p><strong>Visible to:</strong> {module.visibleToRoles.join(', ')}</p>
                        <p><strong>Active:</strong> {module.isActive ? '✅ Yes' : '❌ No'}</p>
                        <p><strong>Access:</strong> {canAccessModule(module.id) ? '✅ Yes' : '❌ No'}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Settings;
