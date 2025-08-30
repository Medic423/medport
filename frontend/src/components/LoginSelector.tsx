import React, { useState } from 'react';
import CenterLogin from './CenterLogin';
import HospitalLogin from './HospitalLogin';
import EMSLogin from './EMSLogin';

interface LoginSelectorProps {
  onLoginSuccess: (userData: any) => void;
}

type LoginType = 'selector' | 'center' | 'hospital' | 'ems';

const LoginSelector: React.FC<LoginSelectorProps> = ({ onLoginSuccess }) => {
  const [selectedLogin, setSelectedLogin] = useState<LoginType>('selector');

  const renderLoginComponent = () => {
    switch (selectedLogin) {
      case 'center':
        return <CenterLogin onLoginSuccess={onLoginSuccess} />;
      case 'hospital':
        return <HospitalLogin onLoginSuccess={onLoginSuccess} />;
      case 'ems':
        return <EMSLogin onLoginSuccess={onLoginSuccess} />;
      default:
        return (
          <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
              <div>
                <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                  Welcome to MedPort
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600">
                  Select your login type to continue
                </p>
              </div>
              
              <div className="space-y-4">
                <button
                  onClick={() => setSelectedLogin('center')}
                  className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Transport Center Login
                </button>
                
                <button
                  onClick={() => setSelectedLogin('hospital')}
                  className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  Hospital Login
                </button>
                
                <button
                  onClick={() => setSelectedLogin('ems')}
                  className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                >
                  EMS Login
                </button>
              </div>
              
              <div className="text-center">
                <button
                  onClick={() => setSelectedLogin('selector')}
                  className="text-gray-600 hover:text-gray-500 text-sm"
                >
                  ← Back to Selection
                </button>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div>
      {renderLoginComponent()}
      
      {/* Back button for specific login types */}
      {selectedLogin !== 'selector' && (
        <div className="fixed top-4 left-4">
          <button
            onClick={() => setSelectedLogin('selector')}
            className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 bg-white rounded-md shadow-sm border border-gray-300 hover:bg-gray-50"
          >
            ← Back to Selection
          </button>
        </div>
      )}
    </div>
  );
};

export default LoginSelector;
