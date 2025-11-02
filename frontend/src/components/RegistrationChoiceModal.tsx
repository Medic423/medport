import React from 'react';
import { Building2, Truck, X } from 'lucide-react';

interface RegistrationChoiceModalProps {
  onClose: () => void;
  onSelectHealthcare: () => void;
  onSelectEMS: () => void;
}

const RegistrationChoiceModal: React.FC<RegistrationChoiceModalProps> = ({ 
  onClose, 
  onSelectHealthcare, 
  onSelectEMS 
}) => {
  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Create Account</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <p className="text-sm text-gray-600 mb-4">
            Choose the type of account you want to create:
          </p>

          <div className="space-y-3">
            <button
              onClick={onSelectHealthcare}
              className="w-full flex items-center justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200"
            >
              <Building2 className="h-5 w-5 mr-2" />
              Healthcare Facility Account
            </button>

            <button
              onClick={onSelectEMS}
              className="w-full flex items-center justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-colors duration-200"
            >
              <Truck className="h-5 w-5 mr-2" />
              EMS Agency Account
            </button>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-200 text-center">
            <p className="text-xs text-gray-500">
              TCC Admin accounts are created by system administrators
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegistrationChoiceModal;

