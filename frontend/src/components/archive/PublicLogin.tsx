import React, { useState } from 'react';
import { 
  Building2, 
  Truck, 
  Shield, 
  ArrowLeft,
  UserPlus
} from 'lucide-react';

interface PublicLoginProps {
  onRoleSelect: (role: 'healthcare' | 'ems' | 'tcc') => void;
  onShowRegistration: (role: 'healthcare' | 'ems') => void;
  onClearSession?: () => void;
}

const PublicLogin: React.FC<PublicLoginProps> = ({ onRoleSelect, onShowRegistration, onClearSession }) => {
  const [showBackButton, setShowBackButton] = useState(false);

  const handleRoleClick = (role: 'healthcare' | 'ems' | 'tcc') => {
    setShowBackButton(true);
    onRoleSelect(role);
  };

  const handleBackToSelection = () => {
    setShowBackButton(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-primary-600 rounded-full flex items-center justify-center">
            <Building2 className="h-8 w-8 text-white" />
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Welcome to TCC
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Select your login type to continue
          </p>
        </div>

        <div className="space-y-4">
          {/* Healthcare Facility Login */}
          <button
            onClick={() => handleRoleClick('healthcare')}
            className="group relative w-full flex justify-center py-4 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200"
          >
            <Building2 className="h-5 w-5 mr-2" />
            Healthcare Facility Login
          </button>

          {/* EMS Agency Login */}
          <button
            onClick={() => handleRoleClick('ems')}
            className="group relative w-full flex justify-center py-4 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-colors duration-200"
          >
            <Truck className="h-5 w-5 mr-2" />
            EMS Agency Login
          </button>

          {/* Transport Center Login */}
          <button
            onClick={() => handleRoleClick('tcc')}
            className="group relative w-full flex justify-center py-4 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
          >
            <Shield className="h-5 w-5 mr-2" />
            Transport Center Login
          </button>
        </div>

        {/* Account Creation Links */}
        <div className="mt-8 border-t border-gray-200 pt-6">
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-4">
              Don't have an account? Create one for your organization:
            </p>
            <div className="space-y-3">
              <button
                onClick={() => onShowRegistration('healthcare')}
                className="w-full flex items-center justify-center px-4 py-2 border border-green-300 text-sm font-medium rounded-md text-green-700 bg-green-50 hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200"
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Create Healthcare Facility Account
              </button>
              <button
                onClick={() => onShowRegistration('ems')}
                className="w-full flex items-center justify-center px-4 py-2 border border-orange-300 text-sm font-medium rounded-md text-orange-700 bg-orange-50 hover:bg-orange-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-colors duration-200"
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Create EMS Agency Account
              </button>
            </div>
            
            {/* Clear Session Button */}
            {onClearSession && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <button
                  onClick={onClearSession}
                  className="w-full text-xs text-gray-500 hover:text-gray-700 underline"
                >
                  Clear Session & Start Fresh
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Back to Selection Button */}
        {showBackButton && (
          <div className="text-center">
            <button
              onClick={handleBackToSelection}
              className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors duration-200"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Selection
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PublicLogin;
