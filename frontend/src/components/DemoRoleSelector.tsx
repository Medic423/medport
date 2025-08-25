import React, { useState } from 'react';

interface DemoRoleSelectorProps {
  onRoleChange: (role: string) => void;
  currentRole?: string;
}

const DemoRoleSelector: React.FC<DemoRoleSelectorProps> = ({ onRoleChange, currentRole = 'ADMIN' }) => {
  const [selectedRole, setSelectedRole] = useState(currentRole);

  const roles = [
    {
      id: 'ADMIN',
      name: 'Transport Command (ADMIN)',
      description: 'Full system access with module visibility controls',
      color: 'bg-purple-100 text-purple-800'
    },
    {
      id: 'COORDINATOR',
      name: 'Transport Center Coordinator',
      description: 'Limited operational configuration access',
      color: 'bg-blue-100 text-blue-800'
    },
    {
      id: 'BILLING_STAFF',
      name: 'Billing Staff',
      description: 'Financial and billing operations access',
      color: 'bg-green-100 text-green-800'
    },
    {
      id: 'TRANSPORT_AGENCY',
      name: 'Transport Agency',
      description: 'Agency operations and unit management',
      color: 'bg-orange-100 text-orange-800'
    },
    {
      id: 'HOSPITAL_COORDINATOR',
      name: 'Hospital Coordinator',
      description: 'Hospital-specific transport coordination',
      color: 'bg-indigo-100 text-indigo-800'
    }
  ];

  const handleRoleChange = (role: string) => {
    setSelectedRole(role);
    onRoleChange(role);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="mb-4">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Demo Role Selector</h3>
        <p className="text-sm text-gray-600">
          Select a different demo role to test role-based access controls and see how the interface changes.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {roles.map((role) => (
          <button
            key={role.id}
            onClick={() => handleRoleChange(role.id)}
            className={`p-4 rounded-lg border-2 text-left transition-all duration-200 hover:shadow-md ${
              selectedRole === role.id
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-start justify-between mb-2">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${role.color}`}>
                {role.id}
              </span>
              {selectedRole === role.id && (
                <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
            </div>
            <h4 className="font-medium text-gray-900 mb-1">{role.name}</h4>
            <p className="text-sm text-gray-600">{role.description}</p>
          </button>
        ))}
      </div>
      
      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
        <div className="flex items-center">
          <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-sm text-blue-800">
            <strong>Current Role:</strong> {roles.find(r => r.id === selectedRole)?.name}
          </p>
        </div>
      </div>
    </div>
  );
};

export default DemoRoleSelector;
