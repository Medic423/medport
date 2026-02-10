import React, { useState } from 'react';
import { Settings, MapPin, Building2 } from 'lucide-react';
import HospitalSettings from './HospitalSettings';
import HealthcareLocationSettings from './HealthcareLocationSettings';
import SubscriptionInfoCard from './SubscriptionInfoCard';

interface User {
  id: string;
  email: string;
  name: string;
  facilityName?: string;
  manageMultipleLocations?: boolean;
}

interface HealthcareSettingsPanelProps {
  user: User;
}

const HealthcareSettingsPanel: React.FC<HealthcareSettingsPanelProps> = ({ user }) => {
  const [activeSettingsTab, setActiveSettingsTab] = useState<'system' | 'locations'>('system');

  return (
    <div className="space-y-6">
      {/* Settings Tab Navigation - Always show both tabs */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            <button
              onClick={() => setActiveSettingsTab('system')}
              className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                activeSettingsTab === 'system'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Settings className="h-4 w-4" />
              System Settings
            </button>
            <button
              onClick={() => setActiveSettingsTab('locations')}
              className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                activeSettingsTab === 'locations'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <MapPin className="h-4 w-4" />
              Manage Locations
              {!user.manageMultipleLocations && (
                <span className="ml-1 text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                  Upgrade
                </span>
              )}
            </button>
          </nav>
        </div>
      </div>

      {/* System Settings Tab */}
      {activeSettingsTab === 'system' && (
        <div className="space-y-6">
          <SubscriptionInfoCard userId={user.id} userType={user.userType || 'HEALTHCARE'} />
          <HospitalSettings user={user} />
        </div>
      )}

      {/* Locations Tab */}
      {activeSettingsTab === 'locations' && (
        <HealthcareLocationSettings user={user} />
      )}
    </div>
  );
};

export default HealthcareSettingsPanel;

